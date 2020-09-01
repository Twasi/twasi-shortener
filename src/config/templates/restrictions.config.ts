export type Restriction = {
    periodInMs: number,
    maxUrls: number
}

export type RestrictionsConfig = {
    users: Restriction,
    public: Restriction,
    partners: Restriction
}

export const DefaultRestrictionsConfig: RestrictionsConfig = {
    partners: {
        periodInMs: 1 * 60 * 1000,
        maxUrls: 10
    },
    public: {
        periodInMs: 5 * 60 * 1000,
        maxUrls: 10
    },
    users: {
        periodInMs: 3 * 60 * 1000,
        maxUrls: 10
    }
}
