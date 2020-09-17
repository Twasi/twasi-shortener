import {RestController} from "../include";
import {Router, text} from "express";
import {YourlsRequestModel} from "../../../models/yourls/yourls-request.model";
import {createPublicUrl} from "../../../routines/urls/create-url.routine";
import {canIpCreatePublicUrl} from "../../../routines/urls/url-creation-permission-checks.routine";

const router = Router();
router.use(text());

router.get('/', async (req, res) => {
    if (!(await canIpCreatePublicUrl(req.ip))) res.send('');

    const request: YourlsRequestModel = req.query as any;

    try {
        const result = await createPublicUrl(request.url, req.ip);
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
