import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ApolloContext} from "../../../webserver";
import {ShortenedUrlModel} from "../../../../models/shortened-url.model";
import {createPublicUrl, tagExistsPublic} from "../../../../routines/url-creation.routines";

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
                async createPublicUrl(source, args: { tag: string, redirection: string }, context: ApolloContext): Promise<ShortenedUrlModel | null> {
                    return await createPublicUrl(args.redirection, context.ip, args.tag);
                }
            },
            Query: {
                async existsPublic(source, args: { tag: string }): Promise<boolean> {
                    return await tagExistsPublic(args.tag);
                }
            }
        }
    ]
};
