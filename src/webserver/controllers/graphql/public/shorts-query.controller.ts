import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ShortsConfig} from "../../../../config/app-config";
import {ApolloContext} from "../../../webserver";

export const ShortsQueryController: GraphQLController = {
    typeDefs: [
        gql`extend type Query {
            myShorts: [String]!,
            defaultPublicShort: String!,
            defaultAuthenticatedShort: String!
        }`
    ],
    resolvers: [
        {
            Query: {
                myShorts: (source, args, context: ApolloContext) => {
                    if (!context.authorization) return [ShortsConfig.public];
                    const shorts = [ShortsConfig.public, ShortsConfig.panel];
                    // TODO add mappings
                    return shorts;
                },
                defaultPublicShort: () => ShortsConfig.public,
                defaultAuthenticatedShort: () => ShortsConfig.panel,
            }
        }
    ]
}
