#!/usr/bin/env bash

server=root@116.203.76.251

scp -pr ./src $server:~/laas
scp package.json package-lock.json build.sh tsconfig.json $server:~/laas
ssh $server "cd laas && ./build.sh"
ssh $server "forever stop ~/laas/dist/server.js"
ssh $server "forever start ~/laas/dist/server.js"
