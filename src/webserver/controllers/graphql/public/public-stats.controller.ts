import {gql, PubSub} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";
import {ShortsConfig} from "../../../../config/app-config";
import {ApolloContext} from "../../../webserver";
import {canUserUseShort} from "../../../../routines/url-creation.routines";

const pubsub = new PubSub();
const URL_CREATED = 'URL_CREATED';

export const publishPublicUrlCount = async (urlsCreated: number) => {
    return pubsub.publish(URL_CREATED, {publicStats: {urlsCreated}});
}

export const PublicStatsController: GraphQLController = {
    typeDefs: [
        // PublicStats
        gql`type HitStats {
            total: Int!,
            ofTag(tag: String!): Int
        }`,
        gql`type Stats {
            urlsCreated: Int!,
            urlHits: HitStats!
        }`,
        gql`extend type Query {
            publicStats: Stats!,
            globalStats(shorts: [String]!): Stats!
        }`,
        // UrlStats
        gql`extend type ShortenedUrl {
            urlNumber: Int!
        }`,
        // Subscriptions
        gql`type SubPublicStats {
            urlsCreated: Int!
        }`,
        gql`extend type Subscription {
            publicStats: SubPublicStats!
        }`,
    ],
    resolvers: [{
        Query: {
            publicStats() {
                return {
                    async urlsCreated() {
                        return DBShortenedUrlModel.countDocuments({short: ShortsConfig.public});
                    },
                    urlHits: () => {
                        return {
                            async total() {
                                (await DBShortenedUrlModel.aggregate([
                                    {$match: {short: 'r'}},
                                    {
                                        $group: {
                                            _id: null,
                                            hits: {$sum: '$hits'}
                                        }
                                    }]))[0].hits;
                            },
                            async ofTag(args: { tag: string }) {
                                return (await DBShortenedUrlModel.findOne({
                                    tag: args.tag,
                                    short: ShortsConfig.public
                                }))?.hits;
                            }
                        }
                    }
                }
            },
            globalStats: (source, {shorts}: { shorts: Array<string> }, context: ApolloContext) => {
                if (!context.authorization && !shorts.every(x => [ShortsConfig.public, ShortsConfig.panel].includes(x)))
                    throw new Error("You can only query the public and user-short unauthenticated.");

                if (context.authorization)
                    for (let short of shorts)
                        if (!canUserUseShort(context.authorization, short))
                            throw new Error(`You have no permission for the '${short}'-short and therefore can not query stats for it.`);

                return {
                    async urlsCreated() {
                        if (!shorts.length) return 0;
                        return DBShortenedUrlModel.countDocuments({short: {$in: shorts}});
                    },
                    urlHits() {
                        return {
                            async total() {
                                const result = (await DBShortenedUrlModel.aggregate([{$match: {short: {$in: shorts}}}, {
                                    $group: {
                                        _id: null,
                                        hits: {$sum: '$hits'}
                                    }
                                }]))[0].hits;
                                return result;
                            },
                            ofTag: async (source: any, {tag}: { tag: string }, context: ApolloContext) => {
                                if (shorts.length > 1)
                                    throw new Error("Please specify only one short when querying url-hits of tag.");

                                const result = (await DBShortenedUrlModel.findOne({tag, short: shorts[0]}))?.hits;
                                return result;
                            }
                        }
                    }
                }
            }
        },
        Subscription: {
            publicStats: {
                subscribe: () => pubsub.asyncIterator([URL_CREATED])
            }
        }
    }]
}
