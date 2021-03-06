import {RestController} from "../include";
import {Router} from "express";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {publishUrlUpdate} from "../graphql/public/public-stats.controller";
import {DBShortenedUrl} from "../../../models/urls/shortened-url.model";
import {testUrl} from "../../../routines/urls/tests/test-url.routine";

async function findRedirection(short: string, tag: string): Promise<DBShortenedUrl | null> {
    const result = await DBShortenedUrlModel.findOne({short, tag});
    if (result) {
        (async () => {
            typeof result.hits === "number" ? result.hits++ : result.hits = 1;
            publishUrlUpdate(result).then();

            // TODO Don't test every time
            const {result: testResult} = await testUrl(result.redirection);
            result.latestTest = Object.assign(result.latestTest || {}, testResult);
            result.markModified('latestTest');
            await result.save();
        })().then();

        return result;
    }
    return null;
}

const router = Router();
router.get('/:short/:tag', async (req, res) => {
    const redirection = await findRedirection(req.params.short, req.params.tag);
    if (redirection) {
        res.redirect(
            redirection.classification === false || redirection.latestTest?.CRITICAL ?
                '/?confirmRedirection=' + encodeURIComponent(redirection.redirection) :
                redirection.redirection
        );
    } else res.redirect('/?404');
});

export const RedirectionController: RestController = {router, url: "/"};
