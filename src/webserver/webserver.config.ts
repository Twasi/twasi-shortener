export type WebserverConfig = {
    port: number,
    fallback: string,
    graphql: {
        url: string,
        playground: boolean,
        mock: boolean
    }
}

export const DefaultWebserverConfig: WebserverConfig = {
    port: 80,
    fallback: "https://twasi.net",
    graphql: {
        mock: false,
        playground: false,
        url: "/gql"
    }
}
