import {model, Schema} from "mongoose";
import {DBHitKeeper} from "../../models/hit-keeper.model";

export const HitKeeperSchema = new Schema<DBHitKeeper>({
    short: {
        type: String,
        required: true,
        unique: true
    },
    hits: {
        type: Number,
        required: true,
        default: 0
    }
});

export const DBHitKeeperModel = model<DBHitKeeper>("kept-hits", HitKeeperSchema);
