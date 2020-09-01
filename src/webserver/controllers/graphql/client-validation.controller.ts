import {GraphQLController} from "../include";
import {gql} from "apollo-server-express";
import {RedirectsConfig, TagsConfig} from "../../../config/app-config";

export const ClientValidationController: GraphQLController = {
    typeDefs: [
        gql`type Regex {
            regex: String!,
            flags: String!
        }`,
        gql`type ClientValidationRegexes {
            validateRedirectUrl: Regex!,
            validateTag: Regex!
        }`,
        gql`extend type Query {
            clientValidation: ClientValidationRegexes!
        }`
    ],
    resolvers: [{
        Query: {
            clientValidation: () => {
                return {
                    validateRedirectUrl: () => {
                        return RedirectsConfig.allowedUrls;
                    },
                    validateTag: () => {
                        return TagsConfig.allowedChars
                    }
                }
            }
        }
    }]
}
