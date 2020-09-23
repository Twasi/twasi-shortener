import {RestController} from "../include";
import {Router, static as serveStatic} from "express";
import {existsSync} from "fs";
import {join} from "path";

const router = Router();

router.use(serveStatic('frontend/build/'));
router.get('/', ((req, res) => {
    const path = join(process.env.WORKING_DIR as string, 'frontend', 'build', 'index.html');
    if (!existsSync(path))
        res.send("The frontend could not be loaded.");
    else
        res.sendFile(path);
}));

export const FrontendController: RestController = {
    router,
    url: "/"
}
