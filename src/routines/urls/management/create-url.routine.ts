import {DBUser, UserRank} from "../../../models/users/user.model";
import {DBShortenedUrl, ShortenedUrlCreatorType, ShortenedUrlModel} from "../../../models/urls/shortened-url.model";
import {createRandomTag} from "../helpers/generate-random-tag.routine";
import {ShortsConfig, TagsConfig} from "../../../config/app-config";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {canIpCreatePublicUrl, canUserCreateUrl} from "../checks/url-permission-checks.routine";
import {tagExists} from "../checks/url-existence-checks.routine";
import {publishUrlUpdate} from "../../../webserver/controllers/graphql/public/public-stats.controller";
import {Extension} from "../../../config/templates/extension.config";
import {autoClassify} from "../../classification/auto-classify.routine";
import {testUrl} from "../tests/test-url.routine";
import {URLTestResultCodes} from "../../../models/urls/tests/URLTestResults";
import {URLTestResult} from "../../../models/urls/tests/URLTestResult";

export const createUrl = async (
    forceCheck: boolean,
    short: string,
    redirection: string,
    {user, ip}: { user?: DBUser, ip: string } | { user: DBUser, ip?: string },
    tag?: string,
    host?: string
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

    let result: URLTestResult | undefined;
    if (forceCheck) {
        result = (await testUrl(redirection, host ? {hostname: host} : undefined)).result;
        if ([
            URLTestResultCodes.NOT_EXISTING,
            URLTestResultCodes.SAME_HOST,
            URLTestResultCodes.UNKNOWN,
            URLTestResultCodes.TOO_MANY_REDIRECTIONS,
            URLTestResultCodes.BAD_URL
        ].includes(result.STATUS))
            throw new Error(result.MESSAGE);
    }

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
        },
        latestTest: result
    };
    const dbNewRedirection = new DBShortenedUrlModel(newRedirection);

    // Validate new redirection
    await dbNewRedirection.validate();

    // Save new redirection
    const dbRedirection = await dbNewRedirection.save();

    // Publish URL-counts asynchronously
    publishUrlUpdate(dbNewRedirection).then();

    // auto-classify
    autoClassify(dbRedirection).then(value => {
        if (value === null) return;
        dbRedirection.classification = value;
        dbRedirection.save();
    });

    console.log(`[New redirection] /${dbRedirection.short}/${dbRedirection.tag} => ${dbRedirection.redirection}`);

    return dbRedirection;
}

export const createPublicUrl = async (redirection: string, ip: string, extension: Extension, host: string, tag?: string): Promise<DBShortenedUrl> => {
    return await createUrl(true,
        extension !== false ? ShortsConfig.extension : ShortsConfig.public, redirection, {ip}, tag, host);
}
