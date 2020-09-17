import {gql} from "apollo-server-express";
import {GraphQLController} from "../include";

export const RootTypeController: GraphQLController = {
    resolvers: [
        {Query: {_root: () => "root"}},
        {Mutation: {_root: () => "root"}},
        {Subscription: {_root: () => "root"}}
    ],
    typeDefs: [
        gql`type Query { _root: String! }`,
        gql`type Mutation { _root: String! }`,
        gql`type Subscription { _root: String! }`,
        gql`type User {
            "The internal user id"
            _id: String!,
            "The Twitch username"
            userName: String!,
            "The Twitch display name"
            displayName: String!,
            "The Twitch id"
            twitchId: String!,
            "The Twitch avatar"
            avatar: String!
            "The email that is set up on Twitch"
            email: String!
        }`,
        gql`type ShortenedUrlCreator {
            "Either 'PUBLIC', 'USER' or 'TEAM'"
            type: String!,
            "The internal user id of the creating user"
            id: String,
            "The IP address of the creating user"
            ip: String
        }`,
        gql`type ShortenedUrl {
            "The internal ID of the created shortlink"
            _id: String!,
            "The URL's short"
            short: String!,
            "Thus URL's tag"
            tag: String!,
            "A creation timestamp"
            created: String!,
            "The redirect-URL"
            redirection: String!,
            "Information about the creating user"
            createdBy: ShortenedUrlCreator,
            "How often the URL was clicked"
            hits: Int!
        }`,
        gql`interface Pagination {
            page: Int!,
            pages: Int!,
            total: Int!
        }`
    ]
}
