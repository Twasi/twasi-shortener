import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ApolloContext} from "../../../webserver";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";
import {RestrictionsConfig, ShortsConfig, ShortsConfig as config, TagsConfig} from "../../../../config/app-config";
import {DBShortenedUrl, ShortenedUrlCreatorType, ShortenedUrlModel} from "../../../../models/shortened-url.model";
import {createRandomTag} from "../../../../helpers/RandomTagGenerator";
import {publishPublicUrlCount} from "./public-stats.controller";

export const tagExistsPublic = async (tag: string): Promise<boolean> => {
    return DBShortenedUrlModel.exists({short: config.public, tag});
}

export const ipCanCreatePublic = async (ip: string): Promise<boolean> => {
    const restriction = RestrictionsConfig.public;
    const createdRecently = (await DBShortenedUrlModel.countDocuments(
        {
            "createdBy.type": ShortenedUrlCreatorType.PUBLIC,
            "createdBy.ip": ip,
            created: {$gt: new Date(Date.now() - restriction.periodInMs)}
        }));
    return createdRecently < restriction.maxUrls;
}

export const createPublic = async (url: string, ip: string, tag: string | null = null): Promise<DBShortenedUrl> => {
    if (!tag) {
        do {
            tag = createRandomTag();
            if (tag.length > TagsConfig.maxLength) tag = tag.substr(0, TagsConfig.maxLength);
        } while (await DBShortenedUrlModel.exists({short: ShortsConfig.public, tag}));
    }

    // Create new redirection
    const newRedirection: ShortenedUrlModel = {
        short: config.public,
        tag,
        redirection: url,
        createdBy: {
            type: ShortenedUrlCreatorType.PUBLIC,
            ip
        }
    };
    const dbNewRedirection = new DBShortenedUrlModel(newRedirection);

    // Validate new redirection
    await dbNewRedirection.validate();

    // Trigger subscription
    publishPublicUrlCount(dbNewRedirection.urlNumber as number).then();

    // Save new redirection
    return dbNewRedirection.save();
}

export const PublicUrlCreationController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            createPublicUrl(tag: String, url: String!): ShortenedUrl,
        }`,
        gql`extend type Query {
            existsPublic(tag: String!): Boolean!
        }`
    ],
    resolvers: [
        {
            Mutation: {
                async createPublicUrl(source, args: { tag: string, url: string }, context: ApolloContext): Promise<ShortenedUrlModel | null> {
                    // Check if tag already exists and if user has reached his public limit
                    if (await tagExistsPublic(args.tag)) throw new Error("That tag is already in use.");
                    if (!(await ipCanCreatePublic(context.ip))) throw new Error("You are creating too many redirections. Please cool it down.")

                    const result = createPublic(args.url, context.ip, args.tag);

                    if (result) return result;
                    else return null;
                }
            },
            Query: {
                async existsPublic(source, args: { tag: string }): Promise<boolean> {
                    return tagExistsPublic(args.tag);
                }
            }
        }
    ]
};
