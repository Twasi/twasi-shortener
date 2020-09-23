import {RestController} from "../include";
import {Router} from "express";
import path from "path";
import {ExtensionConfig} from "../../../config/app-config";
import cors from 'cors';

const router = Router();

const getExtensionUrls = () => {
    const extensions: Array<string> = [];
    if (ExtensionConfig.ids.chrome)
        extensions.push("chrome-extension://" + ExtensionConfig.ids.chrome);
    return extensions;
}

router.get('/get-jwt', cors({origin: getExtensionUrls()}), (req, res) => (
    res.sendFile(path.join(process.env.WORKING_DIR as string, 'static', 'html', 'get-jwt.html'))
));

router.get('/permitted-extensions', (req, res) => {
    res.json(getExtensionUrls());
});

export const ExtensionAuthController: RestController = {
    router,
    url: "/extension-authentication"
}
