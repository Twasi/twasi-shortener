import {Document} from "mongoose";

export interface TwitchAccountModel {
    userName: string,
    displayName: string,
    token: {
        accessToken: string,
        refreshToken: string
    },
    twitchId: string,
    avatar: string,
    email: string
}

export enum UserRank {
    "STREAMER" = "STREAMER",
    "TEAM" = "TEAM",
    "PARTNER" = "PARTNER"
}

export interface UserModel {
    twitchAccount: TwitchAccountModel,
    rank: UserRank,
    jwtSecret: string
}

export interface DBUser extends UserModel, Document {
    makeJwt: string
}
