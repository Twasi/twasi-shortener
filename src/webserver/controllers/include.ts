import {IResolvers} from "apollo-server-express";
import {Router} from "express";
import {DefinitionNode, Location} from "graphql/language/ast";
import {RedirectionController} from "./rest/redirection.controller";
import {RootTypeController} from "./graphql/root-type.controller";
import {PublicUrlCreationController} from "./graphql/public/public-url-creation.controller";
import {ClientValidationController} from "./graphql/client-validation.controller";
import {FrontendController} from "./rest/frontend.controller";
import {YourlsController} from "./rest/yourls.controller";
import {PublicStatsController} from "./graphql/public/public-stats.controller";
import {TwitchAuthController} from "./rest/twitch-auth.controller";
import {StaticController} from "./rest/static.controller";
import {AuthenticatedUrlCreationController} from "./graphql/authenticated/authenticated-url-creation.controller";

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
    AuthenticatedUrlCreationController,
    ClientValidationController,
    PublicStatsController
];
