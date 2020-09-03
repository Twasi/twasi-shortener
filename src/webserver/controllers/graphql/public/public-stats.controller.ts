import {gql, PubSub} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";
import {ShortsConfig} from "../../../../config/app-config";

const pubsub = new PubSub();
const URL_CREATED = 'URL_CREATED';

export const publishPublicUrlCount = async (count: number) => {
    return pubsub.publish(URL_CREATED, {urlsCreated: count});
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
            publicStats: Stats!
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
                            total() {
                                return new Promise<number>(resolve => {
                                    DBShortenedUrlModel.aggregate([{
                                        $group: {
                                            _id: null,
                                            hits: {$sum: '$hits'}
                                        }
                                    }]).exec((err, res) => resolve(res[0].hits));
                                });
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
            }
        },
        Subscription: {
            publicStats() {
                return {
                    urlsCreated() {
                        return {
                            subscription: () => pubsub.asyncIterator([URL_CREATED])
                        }
                    }
                }
            }
        }
    }]
}
