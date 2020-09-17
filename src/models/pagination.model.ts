export interface PaginationModel<T> {
    items: Array<T>;
    page: number;
    pages: number;
    total: number;
}
