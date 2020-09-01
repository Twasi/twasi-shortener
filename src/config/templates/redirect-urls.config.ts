export type RedirectUrlsConfig = {
    allowedUrls: {
        regex: string,
        flags: string
    }
}

export const DefaultRedirectUrlsConfig: RedirectUrlsConfig = {
    allowedUrls: {
        regex: new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/).source,
        flags: "gi"
    }
}
