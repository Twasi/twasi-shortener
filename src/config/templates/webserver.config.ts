export type WebserverConfig = {
    port: number,
    trustProxy: boolean;
    fallback: string,
    graphql: {
        url: string,
        playground: boolean,
        mock: boolean,
        debug: boolean
    }
}

export const DefaultWebserverConfig: WebserverConfig = {
    port: 80,
    trustProxy: true,
    fallback: "https://twasi.net",
    graphql: {
        mock: false,
        playground: false,
        url: "/gql",
        debug: false
    }
}
