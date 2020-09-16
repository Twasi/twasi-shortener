import {DBUser, UserRank} from "../../models/user.model";
import {DBShortenedUrl, ShortenedUrlCreatorType, ShortenedUrlModel} from "../../models/shortened-url.model";
import {createRandomTag} from "../random-tag-generator.routines";
import {ShortsConfig, TagsConfig} from "../../config/app-config";
import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";
import {publishPublicUrlCount} from "../../webserver/controllers/graphql/public/public-stats.controller";
import {ipCanCreatePublic, tagExists} from "../url-creation.routines";
import {userCanCreate} from "./url-creation-permission-checks.routines";

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

    if ((user && !await userCanCreate(user, short)) || (ip && !await ipCanCreatePublic(ip)))
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
    return await dbNewRedirection.save();
}

export const createPublicUrl = async (redirection: string, ip: string, tag?: string): Promise<DBShortenedUrl> => {
    const dbNewRedirection = await createUrl(ShortsConfig.public, redirection, {ip}, tag);

    // Trigger subscription
    publishPublicUrlCount(dbNewRedirection.urlNumber as number).then();

    return dbNewRedirection;
}
