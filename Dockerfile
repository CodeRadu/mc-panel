FROM node:16-bullseye

LABEL org.opencontainers.image.source https://github.com/CodeRadu/mc-panel

RUN apt update && apt upgrade -y
RUN apt install -y openjdk-17-jdk

WORKDIR /server
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

ENTRYPOINT [ "node", "/server/dist/index.js" ]