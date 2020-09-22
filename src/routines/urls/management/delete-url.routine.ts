import {DBShortenedUrlModel} from "../../../database/schemas/shortened-url.schema";
import {DBHitKeeperModel} from "../../../database/schemas/hit-keeper.schema";

export const keepHits = async (short: string, hits: number) => {
    let hitKeeper = await DBHitKeeperModel.findOne({short});
    if (!hitKeeper) return (await new DBHitKeeperModel({short, hits}).save()).hits;
    hitKeeper.hits += hits;
    return (await hitKeeper.save()).hits;
}

export const deleteUrl = async (id: string): Promise<number | false> => {
    const url = await DBShortenedUrlModel.findByIdAndDelete(id);
    if (url) return await keepHits(url.short, url.hits || 0);
    return false;
}
