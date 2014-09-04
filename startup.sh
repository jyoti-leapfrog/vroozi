#!/bin/sh

GIT_HASH=`git rev-parse --short HEAD`
APP_START=`echo $(($(date +%s%N)/1000000))`

forever -m 100 start app.js --port 5001 --appStart $APP_START --gitHash $GIT_HASH
forever -m 100 start app.js --port 5002 --appStart $APP_START --gitHash $GIT_HASH
forever -m 100 start app.js --port 5003 --appStart $APP_START --gitHash $GIT_HASH
forever -m 100 start app.js --port 5004 --appStart $APP_START --gitHash $GIT_HASH

forever list

