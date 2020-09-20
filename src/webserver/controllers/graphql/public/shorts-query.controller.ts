import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ShortsConfig} from "../../../../config/app-config";
import {ApolloContext} from "../../../webserver";
import {canUserUseShort} from "../../../../routines/urls/url-permission-checks.routine";

export const ShortsQueryController: GraphQLController = {
    typeDefs: [
        gql`extend type Query {
            myShorts(includeDefaults: Boolean): [String]!,
            myDefaultShort: String!,
            canUseShort(short: String!): Boolean!,
            defaultPublicShort: String!,
            defaultAuthenticatedShort: String!,
            defaultExtensionShort: String!
        }`
    ],
    resolvers: [
        {
            Query: {
                myShorts: (source, args, context: ApolloContext) => {
                    if (context.extension) return [ShortsConfig.extension];
                    if (!context.authorization) return [ShortsConfig.public];
                    const shorts = args.includeDefaults !== false ? [ShortsConfig.public, ShortsConfig.panel] : [];
                    // TODO add mappings
                    return shorts;
                },
                myDefaultShort: (source, args, context: ApolloContext) => {
                    return context.extension ? ShortsConfig.extension :
                        context.authorization ? ShortsConfig.panel :
                            ShortsConfig.public;
                },
                canUseShort: async (source, args, context: ApolloContext) => {
                    if (context.extension) return args.short === ShortsConfig.extension;
                    if (!context.authorization) return args.short === ShortsConfig.public;
                    return canUserUseShort(context.authorization, args.short);
                },
                defaultPublicShort: () => ShortsConfig.public,
                defaultAuthenticatedShort: () => ShortsConfig.panel,
                defaultExtensionShort: () => ShortsConfig.extension,
            }
        }
    ]
}
