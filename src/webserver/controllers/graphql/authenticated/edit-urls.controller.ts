import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {canUserEditOrDeleteUrl} from "../../../../routines/urls/url-permission-checks.routine";
import {editUrl} from "../../../../routines/urls/edit-url.routine";
import {deleteUrl} from "../../../../routines/urls/delete-url.routine";

export const EditUrlsController: GraphQLController = {
    typeDefs: [
        gql`extend type Mutation {
            editUrl(id: String!, newRedirection: String!): ShortenedUrl,
            deleteUrl(id: String!): Boolean
        }`
    ],
    resolvers: [
        {
            Mutation: {
                editUrl: async (source, args: { id: string, newRedirection: string }, context) => {
                    // Check authorization
                    if (!context.authorization)
                        throw new Error("Unauthenticated.");

                    if (!await canUserEditOrDeleteUrl(context.authorization, args.id))
                        throw new Error("You do not have permission to edit this url.");

                    return await editUrl(args.id, args.newRedirection);
                },
                deleteUrl: async (source, args: { id: string }, context) => {
                    // Check authorization
                    if (!context.authorization)
                        throw new Error("Unauthenticated.");

                    if (!await canUserEditOrDeleteUrl(context.authorization, args.id))
                        throw new Error("You do not have permission to edit this url.");

                    return await deleteUrl(args.id) !== false;
                }
            }
        }
    ]
}
