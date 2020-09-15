import mongoose, {Schema} from "mongoose";
import {DBUser, TwitchAccountModel, UserModel, UserRank} from "../../models/user.model";
import JWT from 'jsonwebtoken';

const makeJwtSecret = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-!§$%&/()=?*+#,;.:';
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const TwitchAccountSchema = new Schema<TwitchAccountModel>({
    userName: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    token: {
        accessToken: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,
            required: true
        }
    },
    twitchId: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const UserSchema = new Schema<UserModel>({
    twitchAccount: {
        type: TwitchAccountSchema,
        required: true
    },
    rank: {
        type: String,
        enum: Object.keys(UserRank),
        required: true,
        default: UserRank.STREAMER
    },
    jwtSecret: {
        type: String,
        required: true,
        default: () => makeJwtSecret(2048)
    }
});

UserSchema.virtual('makeJwt').get(function (this: DBUser) {
    const data = this.twitchAccount;
    const twitchAccount: Partial<TwitchAccountModel> = {
        avatar: data.avatar,
        displayName: data.displayName,
        email: data.email,
        twitchId: data.twitchId,
        userName: data.userName
    };
    return JWT.sign(twitchAccount, this.jwtSecret);
});

export const DBUserModel = mongoose.model<DBUser>("users", UserSchema);
