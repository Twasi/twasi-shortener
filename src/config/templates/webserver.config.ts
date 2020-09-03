export type WebserverConfig = {
    port: number,
    trustProxy: boolean;
    fallback: string,
    graphql: {
        url: string,
        playground: boolean,
        mock: boolean,
        wsUrl: string,
        debug: boolean
    }
}

export const DefaultWebserverConfig: WebserverConfig = {
    port: 80,
    trustProxy: false,
    fallback: "/?404",
    graphql: {
        mock: false,
        playground: false,
        url: "/gql",
        wsUrl: "/ws",
        debug: false
    }
}
