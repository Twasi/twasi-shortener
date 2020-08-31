import {Schema, SchemaOptions} from "mongoose";
import {DBShortenedUrl} from "../../models/shortened-url.model";

export const UserSchema = new Schema<DBShortenedUrl>({
    short: {
        type: String,
        required: true,
        set<T extends keyof SchemaOptions>(key: T): SchemaOptions[T] {
            return key.toLowerCase();
        }
    },
    tag: {
        type: String,
        required: true,
        set<T extends keyof SchemaOptions>(key: T): SchemaOptions[T] {
            return key.toLowerCase();
        }
    },
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    redirection: {
        type: String,
        required: true,
        set<T extends keyof SchemaOptions>(key: T): SchemaOptions[T] {
            if (!key.startsWith('http://') && !key.startsWith('https://')) {
                return 'http://' + key;
            } else {
                return key;
            }
        },
        validate: {
            validator: (value: string) => {
                return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi.test(value)
            },
            message: 'The url is not valid.'
        }
    },
});
