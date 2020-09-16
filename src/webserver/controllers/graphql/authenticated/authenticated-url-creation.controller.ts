import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ApolloContext} from "../../../webserver";
import {ShortsConfig} from "../../../../config/app-config";
import {canUserUseShort, createUrl} from "../../../../routines/url-creation.routines";

export const AuthenticatedUrlCreationController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            createUrl(short: String, tag: String, redirection: String!): ShortenedUrl
        }`
    ],
    resolvers: [
        {
            Mutation: {
                createUrl: async (parent, args: { short?: string, tag?: string, redirection: string }, context: ApolloContext, info) => {
                    // Check authorization
                    if (!context.authorization)
                        throw new Error("Unauthenticated.");

                    // Check and probably set short
                    if (!args.short) args.short = ShortsConfig.panel;
                    if (args.short === ShortsConfig.public)
                        throw new Error("Please use 'createPublicUrl' for this short.");

                    // Check if user can use short
                    if (!(await canUserUseShort(context.authorization, args.short)))
                        throw new Error('Sorry, you cannot use this short.');

                    return await createUrl(args.short, args.redirection, {
                        ip: context.ip,
                        user: context.authorization
                    }, args.tag);
                }
            }
        }
    ]
}