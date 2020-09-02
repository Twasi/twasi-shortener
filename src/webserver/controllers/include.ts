import {IResolvers} from "apollo-server-express";
import {Router} from "express";
import {DefinitionNode, Location} from "graphql/language/ast";
import {RedirectionController} from "./rest/RedirectionController";
import {RootTypeController} from "./graphql/root-type.controller";
import {PublicUrlCreationController} from "./graphql/public-url-creation.controller";
import {ClientValidationController} from "./graphql/client-validation.controller";
import {FrontendController} from "./rest/FrontendController";
import {YourlsController} from "./rest/YourlsController";

export type DocumentNode = {
    readonly kind: 'Document';
    readonly loc?: Location;
    readonly definitions: ReadonlyArray<DefinitionNode>;
}
export type RestController = { url: string, router: Router };
export type GraphQLController = { typeDefs: Array<DocumentNode>, resolvers: Array<IResolvers> }

export const RestControllers: Array<RestController> = [
    YourlsController,
    RedirectionController,
    FrontendController
];
export const GraphQLControllers: Array<GraphQLController> = [
    RootTypeController,
    PublicUrlCreationController,
    ClientValidationController,
];
