import {gql} from "apollo-server-express";
import {GraphQLController} from "../include";

export const RootTypeController: GraphQLController = {
    resolvers: [
        {Query: {_root: () => "root"}},
        {Mutation: {_root: () => "root"}},
        {Subscription: {_root: () => "root"}},
    ],
    typeDefs: [
        gql`type Query { _root: String }`,
        gql`type Mutation { _root: String }`,
        gql`type Subscription { _root: String }`,
    ]
}
