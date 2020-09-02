import {RestController} from "../include";
import {Router, static as serveStatic} from "express";

const router = Router();

router.use(serveStatic('frontend/build/'));
router.get('/', ((req, res) => res.sendFile('frontend/build/index.html')));

export const FrontendController: RestController = {
    router,
    url: "/"
}
