FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
COPY docker-config.json ./config.json
EXPOSE 80
RUN yarn
RUN yarn create-deployment-build
CMD [ "node", "." ]
