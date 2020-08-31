import {IResolvers} from "apollo-server-express";
import {Router} from "express";
import {DefinitionNode, Location} from "graphql/language/ast";
import {RedirectionController} from "./rest/RedirectionController";
import {RootTypeController} from "./graphql/RootTypeController";

export type DocumentNode = {
    readonly kind: 'Document';
    readonly loc?: Location;
    readonly definitions: ReadonlyArray<DefinitionNode>;
}
export type RestController = { url: string, router: Router };
export type GraphQLController = { typeDefs: Array<DocumentNode>, resolvers: Array<IResolvers> }

export const RestControllers: Array<RestController> = [RedirectionController];
export const GraphQLControllers: Array<GraphQLController> = [RootTypeController];
