import {RestController} from "../include";
import {Router} from "express";
import {StaticAuthProvider} from "twitch-auth";
import {TwitchConfig} from "../../../config/app-config";
import {ApiClient} from "twitch";
import axios from 'axios';
import querystring from 'querystring';
import {DBUserModel} from "../../../database/schemas/user.schema";
import {DBUser, UserModel} from "../../../models/users/user.model";

const router = Router();

// Route for authentication start
router.get('/authenticate', (req, res) => {
    // Redirect to front page when twitch-auth is disabled
    if (!TwitchConfig.enabled) return res.redirect('/');

    // Detect redirect-uri
    const redirectUri = `${req.protocol}://${req.hostname}/twitch-authentication/authenticate/callback`;

    // Redirect to twitch
    res.redirect(`https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${TwitchConfig.clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=user:read:email`);
});

// Route for authentication callback
router.get('/authenticate/callback', async (req, res) => {
    //  Detect redirect-uri
    const redirectUri = `${req.protocol}://${req.hostname}/twitch-authentication/authenticate/callback`;

    // Get and check code
    const code = req.query.code;
    if (!code) return res.redirect('/twitch-authentication/authenticate');

    try {
        // Try get access-token
        const result = (await axios.post(`https://id.twitch.tv/oauth2/token`, querystring.stringify({
            client_id: TwitchConfig.clientId,
            client_secret: TwitchConfig.clientSecret,
            code: code.toString(),
            grant_type: "authorization_code",
            redirect_uri: redirectUri
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })).data as { access_token: string, refresh_token: string };

        // Build API-client with access token
        const client = new ApiClient({authProvider: new StaticAuthProvider(TwitchConfig.clientId, result.access_token)});

        // Try get user data
        const me = await client.helix.users.getMe(true);

        // Check if user exists in database
        let dbUser: DBUser | null = await DBUserModel.findOne({'twitchAccount.twitchId': me.id}).exec();
        if (!dbUser) {
            const userData: Partial<UserModel> = {
                twitchAccount: {
                    avatar: me.profilePictureUrl,
                    displayName: me.displayName,
                    userName: me.name,
                    email: me.email as string,
                    token: {accessToken: result.access_token, refreshToken: result.refresh_token},
                    twitchId: me.id
                }
            };
            dbUser = await (new DBUserModel(userData)).save();
        }

        const jwt = dbUser.makeJwt;
        res.redirect('/static/html/save-jwt.html?jwt=' + encodeURIComponent(jwt));
    } catch (e) {
        return res.redirect('/twitch-authentication/authenticate');
    }
});

export const TwitchAuthController: RestController = {
    router,
    url: "/twitch-authentication"
}
