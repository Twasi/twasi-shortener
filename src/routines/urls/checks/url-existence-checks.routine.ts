import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {ShortsConfig} from "../../../config/app-config";

export const tagExists = async (short: string, tag: string): Promise<boolean> => {
    return DBShortenedUrlModel.exists({tag, short});
}

export const tagExistsPublic = async (tag: string): Promise<boolean> => {
    return DBShortenedUrlModel.exists({short: ShortsConfig.public, tag});
}
