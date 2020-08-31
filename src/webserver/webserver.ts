import express from 'express';
import {DefaultWebserverConfig} from "./webserver.config";
import {ApolloServer, IResolvers} from "apollo-server-express";
import {DocumentNode, GraphQLControllers, RestControllers} from "./controllers/include";
import {AppConfig} from "../config/AppConfig";

const config = AppConfig.configSection('WEBSERVER', DefaultWebserverConfig);

const App = express();
App.listen(config.port);

RestControllers.forEach(ctrl => App.use(ctrl.url, ctrl.router));
App.use('/*', (req, res) => res.redirect(config.fallback))

const typeDefs: Array<DocumentNode> = [];
const resolvers: Array<IResolvers> = [];
GraphQLControllers.forEach(x => {
    x.typeDefs.forEach(y => typeDefs.push(y));
    x.resolvers.forEach(y => resolvers.push(y));
});

const Apollo = new ApolloServer({
    mocks: config.graphql.mock,
    mockEntireSchema: config.graphql.mock,
    playground: config.graphql.playground,
    typeDefs,
    resolvers
});

Apollo.applyMiddleware({app: App, path: config.graphql.url});
export const WebServer = App;
