import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ApolloContext} from "../../../webserver";
import {ShortenedUrlModel} from "../../../../models/shortened-url.model";
import {tagExistsPublic} from "../../../../routines/urls/url-existence-checks.routine";
import {createPublicUrl} from "../../../../routines/urls/create-url.routine";

export const PublicUrlCreationController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            createPublicUrl(tag: String, redirection: String!): ShortenedUrl,
        }`,
        gql`extend type Query {
            existsPublic(tag: String!): Boolean!
        }`
    ],
    resolvers: [
        {
            Mutation: {
                createPublicUrl: (source, args: { tag: string, redirection: string }, context: ApolloContext): Promise<ShortenedUrlModel | null> =>
                    createPublicUrl(args.redirection, context.ip, args.tag)
            },
            Query: {
                existsPublic: (source, args: { tag: string }): Promise<boolean> => tagExistsPublic(args.tag)
            }
        }
    ]
};
