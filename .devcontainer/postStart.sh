#! /bin/bash

apt update

# Install java 21
wget https://apt.corretto.aws/pool/main/j/java-21-amazon-corretto-jdk/java-21-amazon-corretto-jdk_21.0.3.9-1_amd64.deb -O /tmp/java-21.deb
apt install -y /tmp/java-21.deb libxi6 libxtst6 libxrender1

# Install pnpm
npm install -g pnpm