import {DBUser, UserRank} from "../../models/user.model";
import {DBShortenedUrl, ShortenedUrlCreatorType, ShortenedUrlModel} from "../../models/shortened-url.model";
import {createRandomTag} from "./generate-random-tag.routine";
import {ShortsConfig, TagsConfig} from "../../config/app-config";
import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";
import {canIpCreatePublicUrl, canUserCreateUrl} from "./url-creation-permission-checks.routine";
import {tagExists} from "./url-existence-checks.routine";
import {publishUrlCountAndHits} from "../../webserver/controllers/graphql/public/public-stats.controller";

export const createUrl = async (
    short: string,
    redirection: string,
    {user, ip}: { user?: DBUser, ip: string } | { user: DBUser, ip?: string },
    tag?: string,
): Promise<DBShortenedUrl> => {

    if (!tag) {
        do {
            tag = createRandomTag();
            if (tag.length > TagsConfig.maxLength) tag = tag.substr(0, TagsConfig.maxLength);
        } while (await DBShortenedUrlModel.exists({short, tag}));
    } else if (await tagExists(short, tag))
        throw new Error("That tag is already in use.");

    if ((user && !await canUserCreateUrl(user, short)) || (ip && !await canIpCreatePublicUrl(ip)))
        throw new Error("You are creating too many redirections. Please cool it down.");

    // Create new redirection
    const newRedirection: ShortenedUrlModel = {
        short,
        tag,
        redirection,
        createdBy: {
            type: !user ? ShortenedUrlCreatorType.PUBLIC : (
                user.rank === UserRank.TEAM ?
                    ShortenedUrlCreatorType.ADMIN :
                    ShortenedUrlCreatorType.USER
            ),
            id: user?._id,
            ip
        }
    };
    const dbNewRedirection = new DBShortenedUrlModel(newRedirection);

    // Validate new redirection
    await dbNewRedirection.validate();

    // Save new redirection
    const dbRedirection = await dbNewRedirection.save();

    // Publish URL-counts asynchronously
    publishUrlCountAndHits(short).then();

    return dbRedirection;
}

export const createPublicUrl = async (redirection: string, ip: string, tag?: string): Promise<DBShortenedUrl> => {
    return await createUrl(ShortsConfig.public, redirection, {ip}, tag);
}
