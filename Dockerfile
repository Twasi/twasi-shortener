FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
COPY docker-config.json ./config.json
EXPOSE 80
RUN yarn && yarn run build && yarn run build:frontend
CMD [ "node", "." ]
