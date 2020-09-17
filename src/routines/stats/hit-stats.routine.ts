import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";

/**
 * Query hits by short and optionally tag.
 * @param short
 * @param tag Set this to a falsy value to aggregate the total hits of the specified short.
 * @return The hit amount or null if the combination or short/tag or the short does not exist.
 */
export const getUrlHits = async (short: string, tag?: string): Promise<number | null> => {
    if (tag) return (await DBShortenedUrlModel.findOne({short, tag}))?.hits || null;
    else return getTotalUrlHitsByShorts([short]);
}

/**
 * Query hits of multiple shorts aggregated together.
 * @param shorts
 */
export const getTotalUrlHitsByShorts = async (shorts: Array<string>): Promise<number> => {
    if (!shorts.length) return 0;
    return (await DBShortenedUrlModel.aggregate([
        {
            $match: {
                short: shorts.length > 1 ? {
                    $in: shorts.filter((item, pos) => shorts.indexOf(item) === pos) // Remove duplicates
                } : shorts[0]
            }
        }, {
            $group: {
                _id: null,
                hits: {$sum: '$hits'}
            }
        }
    ]))[0].hits;
}
