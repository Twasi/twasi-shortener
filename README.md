# Twasi-Shortener
A simple URL shortener written in TypeScript created for [twa.si](https://twa.si) and open-sourced for others.

## Deployment
**Local:**
1. Clone the repo.
2. Run "*npm install*".
3. Run "*npm build*".

You can start the built application using "*node .*".

**Docker:**
1. Adjust docker-config.json.
2. Run "*docker-compose up -d*".

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
