import {Document, Model, Query} from "mongoose";
import {PaginationModel} from "../models/pagination.model";
import {PaginationConfig} from "../config/app-config";

export const paginationFrom = async <T extends Document>(query: Query<Array<T>>, page: number, pageSize: number = PaginationConfig.defaultPaginationSize): Promise<PaginationModel<T>> => {
    if (pageSize > PaginationConfig.maxPaginationSize) throw new Error(`Page size can't be greater than ${PaginationConfig.maxPaginationSize}.`);

    const totalQuery = (query as unknown as { model: Model<T> }).model.find().merge(query);
    const total = await totalQuery.countDocuments();
    const pages = Math.floor(total / pageSize) + 1;
    if (page > pages) page = pages;
    if (page < 1) page = 1;

    return {page, pages, total, items: await query.setOptions({limit: pageSize, skip: pageSize * (page - 1)})};
}
