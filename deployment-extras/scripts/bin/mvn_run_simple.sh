#!/bin/bash

# mvn_run_simple.sh

# Copy this file to your ~/bin folder so it can be run from any folder.
# Run from the script at the root folder of a GSRS service (though not recommended for the frontend service).  

# For example: 
# cd gsrs3-main-deployment/gateway 
# bash ~/bin/mvn_install.sh

# This script may be used to have maven and java run a GSRS service, assuming you are using Embedded Tomcat.
# Stop and rerun the script if you've made local changes to one of the services' dependencies, or the service itself.

USE_SUDO=${USE_SUDO:-''}
MVN_COMMAND=${MVN_COMMAND:-./mvnw}
$USE_SUDO $MVN_COMMAND clean -U spring-boot:run -DskipTests 
