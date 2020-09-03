import express from 'express';
import {ApolloServer, IResolvers, makeExecutableSchema} from "apollo-server-express";
import {DocumentNode, GraphQLControllers, RestControllers} from "./controllers/include";
import {WebserverConfig as config} from "../config/app-config";

const App = express();
App.set('trust proxy', config.trustProxy);

const typeDefs: Array<DocumentNode> = [];
const resolvers: Array<IResolvers> = [];
GraphQLControllers.forEach(x => {
    x.typeDefs.forEach(y => typeDefs.push(y));
    x.resolvers.forEach(y => resolvers.push(y));
});

export type ApolloContext = {
    ip: string,
    authorization?: string
}

export const schema = makeExecutableSchema({typeDefs, resolvers});

export const Apollo = new ApolloServer({
    mocks: config.graphql.mock,
    mockEntireSchema: config.graphql.mock,
    playground: config.graphql.playground,
    context: (context): ApolloContext => {
        return {
            authorization: context.req.headers.authorization,
            ip: context.req.ip
        }
    },
    debug: config.graphql.debug,
    subscriptions: {
        path: config.graphql.wsUrl
    },
    schema
});

Apollo.applyMiddleware({app: App, path: config.graphql.url});

RestControllers.forEach(ctrl => App.use(ctrl.url, ctrl.router));

App.use('*', (req, res) => res.redirect(config.fallback));

export const WebServer = App;
export const startWebServer = () => App.listen(config.port);

