import {gql, PubSub, withFilter} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";
import {ShortsConfig} from "../../../../config/app-config";
import {ApolloContext} from "../../../webserver";
import {canAnonymousQueryShort, canUserQueryShort} from "../../../../routines/urls/checks/url-permission-checks.routine";
import {getTotalUrlHitsByShorts, getUrlHits} from "../../../../routines/stats/hit-stats.routine";
import {getCreatedUrlAmountByShorts} from "../../../../routines/stats/url-count-stats.routine";
import {manipulateAsyncIterator} from "../../../../routines/pubsub/pubsub-manipulation.routine";
import {DBShortenedUrl} from "../../../../models/urls/shortened-url.model";

export const urlUpdatePubSub = new PubSub();
export const URL_UPDATED = 'URL_UPDATED';

export const publishUrlUpdate = async (shortenedUrl: DBShortenedUrl) => {
    return urlUpdatePubSub.publish(URL_UPDATED, shortenedUrl);
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
                if (!context.authorization && shorts.some(short => !canAnonymousQueryShort(short)))
                    throw new Error("You can only query the public and user-short unauthenticated.");

                if (context.authorization)
                    for (let short of shorts)
                        if (!await canUserQueryShort(context.authorization, short))
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
                        () => manipulateAsyncIterator(urlUpdatePubSub.asyncIterator(URL_UPDATED), (input: DBShortenedUrl) => {
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
