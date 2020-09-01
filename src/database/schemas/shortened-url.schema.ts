import {Schema, SchemaOptions} from "mongoose";
import {DBShortenedUrl, ShortenedUrlCreatorType} from "../../models/shortened-url.model";
import * as mongoose from "mongoose";

const CreatorSubSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: Object.values(ShortenedUrlCreatorType),
    },
    id: {
        type: String,
        required: false,
    },
    ip: {
        type: String,
        required: false,
    }
});

export const DBShortenedUrlSchema = new Schema<DBShortenedUrl>({
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
    createdBy: {
        type: CreatorSubSchema,
        required: true
    }
});

export const DBShortenedUrlModel = mongoose.model<DBShortenedUrl>('shortened-urls', DBShortenedUrlSchema);
