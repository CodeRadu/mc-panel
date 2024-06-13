FROM node:20-bookworm as builder

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

FROM node:20-bookworm as runner
ARG BUILD_ARCH

RUN apt update && apt upgrade -y
ADD https://apt.corretto.aws/pool/main/j/java-21-amazon-corretto-jdk/java-21-amazon-corretto-jdk_21.0.3.9-1_${BUILD_ARCH}.deb /tmp/java-21.deb
RUN apt install -y /tmp/java-21.deb libxi6 libxtst6 libxrender1

WORKDIR /server
COPY --from=builder /server/backend/package.json .
RUN npm install -d
COPY --from=builder /server/backend/dist .
COPY --from=builder /server/frontend/dist ./frontend

ENTRYPOINT ["node", "/server/index.js"]
