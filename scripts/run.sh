#! /bin/bash

echo "Waiting for postgres to initialize"
sleep 3
prisma migrate deploy
prisma generate
node /server/index.js &
PID=$!
trap 'kill -SIGINT $PID' SIGINT
wait $PID