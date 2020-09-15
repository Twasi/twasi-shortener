import {RestController} from "../include";
import {Router, static as serveStatic} from "express";

const router = Router();
router.use('/static', serveStatic("static"));

export const StaticController: RestController = {
    router,
    url: "/"
};
