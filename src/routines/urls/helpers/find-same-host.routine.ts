import {DBShortenedUrl} from "../../../models/urls/shortened-url.model";
import regexEscape from "escape-string-regexp";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {FilterQuery} from "mongoose";

export const findRedirectionsToSameHost = async (url: string): Promise<Array<DBShortenedUrl>> => {
    return DBShortenedUrlModel.find(redirectionToSameHostQuery(url));
}

export const redirectionToSameHostQuery = (url: string): FilterQuery<DBShortenedUrl> => {
    const host = new URL(url).hostname;
    return {redirection: {$regex: new RegExp(`^(http|https)://${regexEscape(host)}`, 'i')}};
}
