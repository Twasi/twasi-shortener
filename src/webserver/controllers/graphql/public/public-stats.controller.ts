import {gql, PubSub, withFilter} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";
import {ShortsConfig} from "../../../../config/app-config";
import {ApolloContext} from "../../../webserver";
import {canUserUseShort} from "../../../../routines/urls/url-permission-checks.routine";
import {getTotalUrlHitsByShorts, getUrlHits} from "../../../../routines/stats/hit-stats.routine";
import {getCreatedUrlAmountByShorts} from "../../../../routines/stats/url-count-stats.routine";
import {manipulateAsyncIterator} from "../../../../routines/pubsub/pubsub-manipulation.routine";

const pubsub = new PubSub();
const URL_CREATED = 'URL_CREATED';

export const publishUrlCountAndHits = async (short: string) => {
    return pubsub.publish(URL_CREATED, {short});
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
        gql`type SubStats {
            urlsCreated: Int!,
            urlHits: Int!
        }`,
        gql`extend type Subscription {
            globalStats(shorts: [String]!): SubStats!
        }`,
    ],
    resolvers: [{
        Query: {
            publicStats: () => ({
                urlsCreated: () => DBShortenedUrlModel.countDocuments({short: ShortsConfig.public}),

                urlHits: {
                    total: () => getUrlHits(ShortsConfig.public),
                    ofTag: ({tag}: { tag: string }) => getUrlHits(ShortsConfig.public, tag)
                }
            }),
            globalStats: async (source, {shorts}: { shorts: Array<string> }, context: ApolloContext) => {
                if (!context.authorization && !shorts.every(x => [ShortsConfig.public, ShortsConfig.panel].includes(x)))
                    throw new Error("You can only query the public and user-short unauthenticated.");

                if (context.authorization)
                    for (let short of shorts)
                        if (!await canUserUseShort(context.authorization, short))
                            throw new Error(`You have no permission for the '${short}'-short and therefore can not query stats for it.`);

                return {
                    urlsCreated: () => getCreatedUrlAmountByShorts(shorts),
                    urlHits: {
                        total: () => getTotalUrlHitsByShorts(shorts),
                        ofTag: ({tag}: { tag: string }) => {
                            if (shorts.length > 1)
                                throw new Error("Please specify only one short when querying url-hits of tag.");

                            return getUrlHits(shorts[0], tag);
                        }
                    }
                }
            }
        },
        Subscription: {
            globalStats: {
                subscribe: (parent, args: { shorts: Array<string> }, context: ApolloContext, operation) => {
                    return withFilter(
                        () => manipulateAsyncIterator(pubsub.asyncIterator(URL_CREATED), input => {
                            const update = args.shorts.includes(input.short);
                            return {
                                update,
                                globalStats: update ? {
                                    urlsCreated: getCreatedUrlAmountByShorts(args.shorts),
                                    urlHits: getTotalUrlHitsByShorts(args.shorts)
                                } : null,
                            };
                        }),
                        (payload) => payload.update
                    )(parent, args, context, operation);
                }
            }
        }
    }]
}
