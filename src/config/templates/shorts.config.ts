export type ShortsConfig = {
    public: string,
    panel: string,
    mappings: Array<[string, string]>
}

export const DefaultShortsConfig: ShortsConfig = {
    mappings: [],
    panel: "c",
    public: "r"
};
