export type TwitchConfig = {
    enabled: boolean,
    clientId: string,
    clientSecret: string
}

export const DefaultTwitchConfig: TwitchConfig = {
    enabled: false,
    clientId: "",
    clientSecret: "",
};
