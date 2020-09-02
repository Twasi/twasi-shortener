/*
THIS WOULD ONLY BE NEEDED WHEN format=json IS PROVIDED IN QUERY.
ShareX uses simple mode so these models are not currently in use.
 */

export interface YourlsResultModel {
    status: "fail" | "success",
    code?: string,
    url?: {
        keyword: string,
        url: string,
        title: string,
        date: string,
        ip: string,
        clicks: string
    },
    title?: string,
    shorturl?: string,
    message: string,
    statusCode: number
}

export const YourlsResultAlreadyExists = (tag: string): YourlsResultModel => {
    return {
        status: "fail",
        code: "url:keyword",
        message: `Short URL ${tag} already exists in database or is reserved`,
        statusCode: 200
    }
}

export const YourlsResultInvalidTag = (tag: string): YourlsResultModel => {
    return {
        status: "fail",
        code: "url:keyword",
        message: `Short URL ${tag} is invalid`,
        statusCode: 200
    }
}

const dateToYourlsTimestamp = (date: Date = new Date()): string => {
    const flat = (num: number): string => num < 10 ? "0" + num : `${num}`;
    const Y = flat(date.getFullYear());
    const M = flat(date.getMonth() + 1);
    const D = flat(date.getDate());
    const h = flat(date.getHours());
    const m = flat(date.getMinutes());
    const s = flat(date.getSeconds());
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export const YourlsResultSuccess = (shorturl: string, title: string, ip: string, url: string, keyword: string): YourlsResultModel => {
    return {
        url: {
            keyword,
            url,
            title,
            date: dateToYourlsTimestamp(),
            ip,
            clicks: "0"
        },
        status: "success",
        message: `${url} added to database`,
        title,
        shorturl,
        statusCode: 200
    }
}
