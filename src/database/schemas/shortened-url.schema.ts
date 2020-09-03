import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {DBShortenedUrl, ShortenedUrlCreatorType} from "../../models/shortened-url.model";
import {RedirectsConfig, TagsConfig} from "../../config/app-config";

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
        required: true
    },
    tag: {
        type: String,
        maxlength: TagsConfig.maxLength,
        required: true,
        validate: {
            validator: new RegExp(TagsConfig.allowedChars.regex, TagsConfig.allowedChars.flags),
            message: "Invalid characters in tag."
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
        validate: {
            validator: new RegExp(RedirectsConfig.allowedUrls.regex, RedirectsConfig.allowedUrls.flags),
            message: 'The url is not valid.'
        }
    },
    createdBy: {
        type: CreatorSubSchema,
        required: true
    },
    hits: {
        type: Number,
        required: true,
        default: 0
    }
});

export const DBShortenedUrlModel = mongoose.model<DBShortenedUrl>('shortened-urls', DBShortenedUrlSchema);
