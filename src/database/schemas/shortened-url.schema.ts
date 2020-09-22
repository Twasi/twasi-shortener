import * as mongoose from "mongoose";
import {Model, Schema} from "mongoose";
import {DBShortenedUrl, ShortenedUrlCreatorType} from "../../models/urls/shortened-url.model";
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
            validator: (value: string) => {
                return new RegExp(TagsConfig.allowedChars.regex, TagsConfig.allowedChars.flags).test(value);
            },
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
            validator: (value: string) => {
                return new RegExp(RedirectsConfig.allowedUrls.regex, RedirectsConfig.allowedUrls.flags).test(value);
            },
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
    },
    classification: {
        type: Boolean,
        required: false
    }
});
DBShortenedUrlSchema.virtual('urlNumber').get(async function () {
    // @ts-ignore
    return DBShortenedUrlModel.countDocuments({created: {$lte: this.created}, short: this.short});
})

export const DBShortenedUrlModel: Model<DBShortenedUrl> = mongoose.model<DBShortenedUrl>('shortened-urls', DBShortenedUrlSchema);
