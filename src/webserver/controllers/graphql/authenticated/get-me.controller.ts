import {gql} from "apollo-server-express";
import {GraphQLController} from "../../include";
import {ApolloContext} from "../../../webserver";
import {TwitchAccountModel} from "../../../../models/user.model";

export const GetMeController: GraphQLController = {
    typeDefs: [
        gql`extend type Query {
            me: User
        }`
    ],
    resolvers: [{
        Query: {
            me: (source, args, context: ApolloContext): TwitchAccountModel | null => {
                if (!context.authorization) return null;
                return context.authorization.twitchAccount;
            }
        }
    }]
}
