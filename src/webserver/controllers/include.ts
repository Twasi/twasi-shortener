import {IResolvers} from "apollo-server-express";
import {Router} from "express";
import {DefinitionNode, Location} from "graphql/language/ast";
import {RedirectionController} from "./rest/RedirectionController";
import {RootTypeController} from "./graphql/root-type.controller";
import {PublicUrlCreationController} from "./graphql/public/public-url-creation.controller";
import {ClientValidationController} from "./graphql/client-validation.controller";
import {FrontendController} from "./rest/FrontendController";
import {YourlsController} from "./rest/YourlsController";
import {PublicStatsController} from "./graphql/public/public-stats.controller";
import {TwitchAuthController} from "./rest/TwitchAuthController";
import {StaticController} from "./rest/StaticController";

export type DocumentNode = {
    readonly kind: 'Document';
    readonly loc?: Location;
    readonly definitions: ReadonlyArray<DefinitionNode>;
}
export type RestController = { url: string, router: Router };
export type GraphQLController = { typeDefs: Array<DocumentNode>, resolvers: Array<IResolvers> }

export const RestControllers: Array<RestController> = [
    StaticController,
    TwitchAuthController,
    YourlsController,
    RedirectionController,
    FrontendController
];
export const GraphQLControllers: Array<GraphQLController> = [
    RootTypeController,
    PublicUrlCreationController,
    ClientValidationController,
    PublicStatsController
];
