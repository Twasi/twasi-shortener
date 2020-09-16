import {DBUser, UserRank} from "../../models/user.model";
import {RestrictionsConfig, ShortsConfig} from "../../config/app-config";
import {ShortenedUrlCreatorType} from "../../models/shortened-url.model";
import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";

export const canUserUseShort = async (user: DBUser, short: string): Promise<boolean> => {
    return user.rank === UserRank.TEAM || short === ShortsConfig.panel; // TODO add mappings
}

export const canIpCreatePublicUrl = async (ip: string): Promise<boolean> => {
    const restriction = RestrictionsConfig.public;
    const createdRecently = (await DBShortenedUrlModel.countDocuments(
        {
            "createdBy.type": ShortenedUrlCreatorType.PUBLIC,
            "createdBy.ip": ip,
            created: {$gt: new Date(Date.now() - restriction.periodInMs)}
        }));

    return createdRecently < restriction.maxUrls;
}

export const canUserCreateUrl = async (user: DBUser, short: string): Promise<boolean> => {
    if (user.rank === UserRank.TEAM) return true;

    const restriction = user.rank === UserRank.PARTNER ? RestrictionsConfig.partners : RestrictionsConfig.users;
    const createdRecently = (await DBShortenedUrlModel.countDocuments({
        short,
        "createdBy.type": ShortenedUrlCreatorType.USER,
        "createdBy.id": user._id,
        created: {$gt: new Date(Date.now() - restriction.periodInMs)}
    }));

    return createdRecently < restriction.maxUrls;
}
