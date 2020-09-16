import {RestController} from "../include";
import {Router} from "express";
import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";

async function findRedirection(short: string, tag: string): Promise<string | null> {
    const result = await DBShortenedUrlModel.findOne({short, tag});
    if (result) {
        typeof result.hits === "number" ? result.hits++ : result.hits = 0;
        result.save();
        return result.redirection;
    }
    return null;
}

const router = Router();
router.get('/:short/:tag', async (req, res) => {
    const redirection = await findRedirection(req.params.short, req.params.tag);
    if (redirection) res.redirect(redirection);
    else res.redirect('/?404');
});

export const RedirectionController: RestController = {router, url: "/"};
