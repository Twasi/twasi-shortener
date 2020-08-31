import {RestController} from "../include";
import {Router} from "express";

function findRedirection(short: string, tag: string): string {
    return 'https://twasi.net';
}

const router = Router();
router.get('/:short/:tag', (req, res) => {
    const redirection = findRedirection(req.params.short, req.params.tag);
    res.redirect(redirection);
});

export const RedirectionController: RestController = {router, url: "/"};
