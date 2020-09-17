import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {paginationFrom} from "../../../../routines/pagination/pagination.routines";
import {DBShortenedUrlModel} from "../../../../database/schemas/shortened-url.schema";

export const UrlQueryController: GraphQLController = {
    typeDefs: [
        gql`type ShortenedUrlPagination implements Pagination {
            page: Int!,
            pages: Int!,
            total: Int!,
            items: [ShortenedUrl]!
        }`,
        gql`extend type Query {
            myUrls(page: Int, pageSize: Int): ShortenedUrlPagination
        }`
    ],
    resolvers: [
        {
            Query: {
                myUrls: (source, args: { pageSize?: number, page?: number }, context) => {
                    // Check authorization
                    if (!context.authorization)
                        throw new Error("Unauthenticated.");

                    return paginationFrom(DBShortenedUrlModel.find({"createdBy.id": context.authorization._id}), args);
                }
            }
        }
    ]
}
