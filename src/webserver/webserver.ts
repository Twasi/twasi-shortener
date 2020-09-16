import express from 'express';
import {ApolloServer, IResolvers, makeExecutableSchema} from "apollo-server-express";
import {DocumentNode, GraphQLControllers, RestControllers} from "./controllers/include";
import {WebserverConfig as config} from "../config/app-config";
import {SubscriptionServer} from "subscriptions-transport-ws";
import {createServer} from "http";
import {execute, subscribe} from 'graphql';
import {DBUser} from "../models/user.model";
import JWT from 'jsonwebtoken';
import {DBUserModel} from "../database/schemas/user.schema";

// Create express app
const App = express();
App.set('trust proxy', config.trustProxy);

// Collect GraphQL controllers
const typeDefs: Array<DocumentNode> = [];
const resolvers: Array<IResolvers> = [];
GraphQLControllers.forEach(x => {
    x.typeDefs.forEach(y => typeDefs.push(y));
    x.resolvers.forEach(y => resolvers.push(y));
});

// Declare Apollo context
export type ApolloContext = {
    ip: string,
    authorization?: DBUser
}

// Create schema from GraphQL controllers
export const schema = makeExecutableSchema({typeDefs, resolvers});

// Create Apollo GraphQL-server
export const Apollo = new ApolloServer({
    mocks: config.graphql.mock,
    mockEntireSchema: config.graphql.mock,
    playground: config.graphql.playground,
    context: async (context): Promise<ApolloContext> => {

        // Check for authorization header
        let authorization = undefined;
        if (context.req.headers.authorization) {
            try {
                // Find user by authorization header
                const {twitchId}: { twitchId: string } = JWT.decode(context.req.headers.authorization) as any;
                const user = await DBUserModel.findOne({'twitchAccount.twitchId': twitchId}).exec();
                if (!user) throw new Error();

                // Validate JWT against JWT-secret
                JWT.verify(context.req.headers.authorization, user.jwtSecret);

                // Finally set authorization
                authorization = user;
            } catch (e) {
                throw new Error("Wrong authorization header.");
            }
        }

        return {
            authorization,
            ip: context.req.ip
        }
    },
    debug: config.graphql.debug,
    subscriptions: {
        path: config.graphql.wsUrl
    },
    schema,
    typeDefs,
    resolvers
});

// Create http server but let express handle requests
const server = createServer(App);

// Register GraphQL endpoint
Apollo.applyMiddleware({app: App, path: config.graphql.url});

// Register REST controllers
RestControllers.forEach(ctrl => App.use(ctrl.url, ctrl.router));

// Redirect everything else to fallback
App.use('*', (req, res) => res.redirect(config.fallback));

// Export WebServer for usage in other files
export const WebServer = App;
export const startWebServer = () => server.listen(config.port, () => {
    new SubscriptionServer({schema, subscribe, execute}, {path: config.graphql.wsUrl, server});
});
