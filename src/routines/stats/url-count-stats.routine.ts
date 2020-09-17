import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";

export const getCreatedUrlAmountByShort = async (short: string) => DBShortenedUrlModel.countDocuments({short});

export const getCreatedUrlAmountByShorts = async (shorts: Array<string>) => DBShortenedUrlModel.countDocuments({
    short: {
        $in: shorts.filter((item, pos) => shorts.indexOf(item) === pos) // Remove duplicates
    }
});

export const getTotalCreatedUrlAmount = async (): Promise<number> => DBShortenedUrlModel.countDocuments();
