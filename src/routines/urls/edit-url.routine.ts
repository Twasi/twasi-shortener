import {DBShortenedUrl} from "../../models/shortened-url.model";
import {DBShortenedUrlModel} from "../../database/schemas/shortened-url.schema";

export const editUrl = async (id: string, newRedirection: string): Promise<DBShortenedUrl | null> => {
    const model = await DBShortenedUrlModel.findById(id);
    if (!model) return null;
    model.redirection = newRedirection;
    await model.validate();
    return await model.save();
}
