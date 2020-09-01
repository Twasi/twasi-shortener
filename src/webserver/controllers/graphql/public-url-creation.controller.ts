import {gql} from "apollo-server-express";
import {GraphQLController} from "../include";
import {ApolloContext} from "../../webserver";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {RestrictionsConfig, ShortsConfig as config} from "../../../config/app-config";
import {ShortenedUrlCreatorType, ShortenedUrlModel} from "../../../models/shortened-url.model";

const existsPublic = async (tag: string): Promise<boolean> => {
    return DBShortenedUrlModel.exists({short: config.public, tag});
}

const canCreate = async (ip: string): Promise<boolean> => {
    const restriction = RestrictionsConfig.public;
    const createdRecently = (await DBShortenedUrlModel.countDocuments(
        {
            "createdBy.type": ShortenedUrlCreatorType.PUBLIC,
            "createdBy.ip": ip,
            created: {$gt: new Date(Date.now() - restriction.periodInMs)}
        }));
    return createdRecently < restriction.maxUrls;
}

export const PublicUrlCreationController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            createPublicUrl(tag: String!, url: String!): ShortenedUrl,
        }`,
        gql`extend type Query {
            existsPublic(tag: String!): Boolean!
        }`
    ],
    resolvers: [
        {
            Mutation: {
                createPublicUrl: async (source, args: { tag: string, url: string }, context: ApolloContext): Promise<ShortenedUrlModel | null> => {
                    if (await existsPublic(args.tag)) throw new Error("That tag is already in use.");
                    if (!(await canCreate(context.ip))) throw new Error("You are creating too many redirections. Please cool it down.")
                    const newRedirection: ShortenedUrlModel = {
                        short: config.public,
                        tag: args.tag,
                        redirection: args.url,
                        createdBy: {
                            type: ShortenedUrlCreatorType.PUBLIC,
                            ip: context.ip
                        }
                    };
                    const dbNewRedirection = new DBShortenedUrlModel(newRedirection);
                    await dbNewRedirection.validate();
                    const result = dbNewRedirection.save();
                    if (result) return result;
                    else return null;
                }
            },
            Query: {
                existsPublic: async (source, args: { tag: string }): Promise<boolean> => {
                    return existsPublic(args.tag);
                }
            }
        }
    ]
};
