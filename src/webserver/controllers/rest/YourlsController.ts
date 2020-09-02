import {RestController} from "../include";
import {Router, text} from "express";
import {YourlsRequestModel} from "../../../models/yourls/yourls-request.model";
import {createPublic, ipCanCreatePublic} from "../graphql/public-url-creation.controller";

const router = Router();
router.use(text());

router.get('/', async (req, res) => {
    if (!(await ipCanCreatePublic(req.ip))) res.send('');

    const request: YourlsRequestModel = req.query as any;

    try {
        const result = await createPublic(request.url, req.ip);
        if (result) res.send(req.protocol + '://' + req.hostname + '/' + result.short + '/' + result.tag);
        else res.send('');
    } catch (e) {
        res.send('');
    }
});

export const YourlsController: RestController = {
    router,
    url: "/yourls"
}
