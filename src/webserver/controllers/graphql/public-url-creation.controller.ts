import {gql} from "apollo-server-express";
import {GraphQLController} from "../include";

export const PublicUrlCreationController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            createPublicUrl(tag: String, url: String): ShortenedUrl
        }`
    ],
    resolvers: []
};
