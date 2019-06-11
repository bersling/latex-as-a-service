#!/usr/bin/env bash

server=ubuntu@116.203.76.251

scp -r . $server:~/laas
ssh $server "forever restart dist/server.ts"
