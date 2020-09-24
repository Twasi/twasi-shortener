import {Document} from "mongoose";
import {IURLTestResult} from "./tests/URLTestResult";

export enum ShortenedUrlCreatorType {
    PUBLIC = "PUBLIC",
    USER = "USER",
    ADMIN = "ADMIN"
}

export interface ShortenedUrlModel {
    short: string,
    tag: string | null,
    created?: Date,
    redirection: string,
    createdBy: {
        type: ShortenedUrlCreatorType,
        id?: string,
        ip?: string
    },
    hits?: number,
    urlNumber?: number,
    classification?: boolean,
    latestTest?: {
        MESSAGE: string
    } & IURLTestResult
}

export interface DBShortenedUrl extends ShortenedUrlModel, Document {
}

