#!/bin/bash

# mvn_run_frontend_package.sh

# Copy this file to your ~/bin folder so it can be run from any folder.
# Run from the script at the root folder of a GSRS frontend service.  

# For example: 
# cd gsrs3-main-deployment/frontend 
# bash ~/bin/mvn_run_frontend_package.sh

# This script may be used to have maven package the GSRS frontend service into a War file (./target/frontend.war).
# At packaging time, the service typically downloads the Angular GSRSFrontend from Github and builds the UI distribution to be included in the packaged Java SpringBoot service.
# Even if using Embedded Tomcat, it is convenient to package the service first so that we don't have to rebuild the Angular code when we stop and restart the service.
# If no changes have been made to the Angular Code, there is no reason rebuild it. 
# To actually run the frontend service in Embedded Tomcat, see the companion script "mvn_run_frontend_war.sh" 

# For the Angular 13 branches: 
# -- use export to set the FRONTEND_NODE_VERSION to v14.17.0
# -- use export to set the FRONTEND_PLUGIN_VERSION to 1.15.4

# For the Angular 20+ upgrade:
# -- using the defaults will work. 

# To run the tagged version use something like this in your terminal session:
# export FRONTEND_TAG='GSRSv3.1.2PUB'

USE_SUDO=${USE_SUDO:-''}
MVN_COMMAND=${MVN_COMMAND:-./mvnw}
NPM_SCRIPT_NAME=${NPM_SCRIPT_NAME:-'build:gsrs:prod'}
FRONTEND_TAG=${FRONTEND_TAG:-development_3.0}
FRONTEND_NODE_VERSION=${FRONTEND_NODE_VERSION:-'v25.2.0'}
FRONTEND_PLUGIN_VERSION=${FRONTEND_PLUGIN_VERSION:-'1.15.4'}
FRONTEND_USE_VISUALIZER=${FRONTEND_USE_VISUALIZER:-'without.visualizer'}

VERBOSE=no
if [ "$VERBOSE" == "yes" ]; then
    echo "USE_SUDO: $USE_SUDO"
    echo "MVN_COMMAND: $MVN_COMMAND"
    echo "NPM_SCRIPT_NAME: $NPM_SCRIPT_NAME"
    echo "FRONTEND_TAG: $FRONTEND_TAG"
    echo "FRONTEND_NODE_VERSION: $FRONTEND_NODE_VERSION"
    echo "FRONTEND_PLUGIN_VERSION: $FRONTEND_PLUGIN_VERSION"
    echo "FRONTEND_USE_VISUALIZER: $FRONTEND_USE_VISUALIZER"
fi

$USE_SUDO $MVN_COMMAND clean -U package -DskipTests -Dnode.version=${FRONTEND_NODE_VERSION} -Dfrontend.plugin.version=${FRONTEND_PLUGIN_VERSION} -Dnpm.script.name=${NPM_SCRIPT_NAME} -Dfrontend.tag=$FRONTEND_TAG -D${FRONTEND_USE_VISUALIZER}
