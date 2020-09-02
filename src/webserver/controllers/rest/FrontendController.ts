import {RestController} from "../include";
import {Router, static as serveStatic} from "express";

const router = Router();

router.use('/', serveStatic('frontend/build/'));
router.use('/*', (req, res) => res.redirect('/index.html?404'));

export const FrontendController: RestController = {
    router,
    url: "/"
}
