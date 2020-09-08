# Twasi-Shortener
A simple URL shortener written in TypeScript created for [twa.si](https://twa.si) and open-sourced for others.

## URLs
The shortened URLs have two parts:
- The **short** that depends on the environment the URL was shortened from (public shortener page or twasi-panel e.g.)
- The **tag** that is either a random or a chosen string

The created URLs look like this:
https://twa.si/<**short**>/<**tag**>

By default, any URLs created from the public shortener page have the short "r" for redirect.

## Deployment
**Local:**
1. Clone the repo **with submodules** ("*git clone --recursive https://github.com/twasi/twasi-shortener.git*").
2. Run "*npm install*".
3. Run "*npm build*".

You can start the built application using "*node .*".

**Docker:**
1. Adjust docker-config.json.
2. Run "*docker-compose build app*"
3. Run "*docker-compose up -d*".

You could also just build the image and use an existing MongoDB instance.

## Development
**Start without building**
```console
$ npm run dev
```

**Start with hot-reload**
```console
$ npm i -g ts-node-dev
$ ts-node-dev src/index.ts
```

## API
To view the available API-endpoints and for debugging purposes you can enable "WEBSERVER.graphql.playground" in the config.json. The playground is available at "/gql" (or whatever URL you defined for GraphQL) after a restart.

## Integrating third-party apps to create shortlinks
To create a shortlink from a third-party app you could either integrate a GraphQL client in it and create shortlinks via the public api or you can create them directly in the MongoDB-database. They will be instantly available for redirection if you place them in the same collection and use the same schema as the shortener.
