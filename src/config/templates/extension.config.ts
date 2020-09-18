export type ExtensionConfig = {
    ids: {
        chrome: string
    }
}

export const DefaultExtensionConfig: ExtensionConfig = {
    ids: {
        chrome: "lngjokdnklohagplfpcpjjmmkcehiabm"
    }
}

export type Extension = false | 'chrome';
