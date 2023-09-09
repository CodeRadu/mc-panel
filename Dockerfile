FROM node:16-bullseye as builder

LABEL org.opencontainers.image.source https://github.com/CodeRadu/mc-panel

RUN apt update && apt upgrade -y

WORKDIR /server
RUN npm i -g pnpm
COPY package.json .
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY pnpm-*.yaml .
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:16-bullseye as runner

RUN apt update && apt upgrade -y
RUN apt install -y openjdk-17-jdk

WORKDIR /server
COPY --from=builder /server/backend/package.json .
RUN npm install
COPY --from=builder /server/backend/dist .
COPY --from=builder /server/frontend/dist ./frontend

ENTRYPOINT ["node", "/server/index.js"]