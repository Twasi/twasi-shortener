FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY docker-config.json ./config.json
EXPOSE 80
RUN npm run build
RUN npm run build:frontend
CMD [ "node", "." ]
