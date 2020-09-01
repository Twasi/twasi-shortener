import {RestController} from "../include";
import {Router} from "express";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";

async function findRedirection(short: string, tag: string): Promise<string | null> {
    const result = await DBShortenedUrlModel.findOne({short, tag});
    if (result) return result.redirection;
    return null;
}

const router = Router();
router.get('/:short/:tag', async (req, res, next) => {
    const redirection = await findRedirection(req.params.short, req.params.tag);
    if (redirection)
        res.redirect(redirection);
    else next();
});

export const RedirectionController: RestController = {router, url: "/"};
