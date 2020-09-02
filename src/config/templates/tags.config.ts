export type TagsConfig = {
    allowedChars: {
        regex: string,
        flags: string,
    },
    maxLength: number
}

export const DefaultTagsConfig: TagsConfig = {
    allowedChars: {
        regex: new RegExp(/(?=((^[a-z0-9äöü]+[-?!._0-9a-zäöü]*[a-z0-9äöü]+$)|(^[a-z0-9äöü]+$)))(?!.*([-?!._]{2,}))/).source,
        flags: "gi"
    },
    maxLength: 30
}
