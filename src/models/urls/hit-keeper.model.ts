import {Document} from "mongoose";

export interface HitKeeperModel {
    short: string,
    hits: number
}

export interface DBHitKeeper extends HitKeeperModel, Document {
}
