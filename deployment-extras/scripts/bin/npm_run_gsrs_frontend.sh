#!/bin/bash

# npm_run_gsrs_frontend.sh
# Script to run the Angular UI in development mode.
# Run this script at the root of the GSRSFrontend repo.
# If you are running in development mode, you should probably not be running the Java frontend service.
# You will may have to edit the following too:
# 1) in GSRSFrontend/src/index.html change the href tag value from "/" to "/ginas/app/ui/"
# 2) in GSRSFrontend/src/app/fda/config.json change to have the right values 
#    (The defaults may work for you, 8081 is the default gateway port)
#    "apiBaseUrl": "http://localhost:8081/ginas/app/",
#    "gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
# 3) In path/to/gsrs3-main-deployment/gateway/src/main/resources/gateway-env.conf uncomment these lines 
#    MS_URL_FRONTEND="http://localhost:4200"
#    GATEWAY_FRONTEND_ROUTE_URL="http://localhost:4200"
# ==== 

GSRS_UI_RUN_RECIPE=${GSRS_UI_RUN_RECIPE:-'start:fda:local'}
npm run $GSRS_UI_RUN_RECIPE
