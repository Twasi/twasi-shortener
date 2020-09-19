import {gql, withFilter} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {urlUpdatePubSub, URL_UPDATED} from "../public/public-stats.controller";
import {manipulateAsyncIterator} from "../../../../routines/pubsub/pubsub-manipulation.routine";
import {ApolloContext, checkAuthToken} from "../../../webserver";
import {DBShortenedUrl} from "../../../../models/shortened-url.model";

export const OwnUrlCountsController: GraphQLController = {
    typeDefs: [
        gql`type MyUrlHitsSub {
            id: String!,
            hits: Int!
        }`,
        gql`extend type Subscription {
            myUrlHits(jwt: String!): MyUrlHitsSub!
        }`
    ],
    resolvers: [
        {
            Subscription: {
                myUrlHits: {
                    subscribe: async (source, args, context: ApolloContext) => {
                        context.authorization = await checkAuthToken(args.jwt);

                        return withFilter(
                            () => manipulateAsyncIterator(urlUpdatePubSub.asyncIterator(URL_UPDATED), (input: DBShortenedUrl) => {
                                const userId = context.authorization?._id?.toString();
                                const creatorId = input.createdBy.id?.toString()
                                const update = !!userId && !!creatorId && userId === creatorId;
                                return {
                                    update,
                                    myUrlHits: update ? {
                                        id: input._id.toString(),
                                        hits: input.hits || 0
                                    } : null
                                }
                            }),
                            (payload) => payload.update
                        )(source, args, context)
                    }
                }
            }
        }
    ]
}
