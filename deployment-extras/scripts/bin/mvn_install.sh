#!/bin/bash

# mvn_install.sh

# Copy this file to your ~/bin folder so it can be run from any folder. Run from the script at the root of the module folder. 
# For example: 
# cd gsrs-spring-starter
# bash ~/bin/mvn_install.sh

# This script may be used to have maven install a GSRS module such as gsrs-spring-starter on you local system. 
# After intalling, changes will be included in the local maven .m2 folder. 
# You would use it after a clone or update of the module from Github. 
# You would also use it if you are testing a local code change to the module. Re-install before rerunning the service.  

USE_SUDO=${USE_SUDO:-''}
MVN_COMMAND=${MVN_COMMAND:-./mvnw}
$USE_SUDO $MVN_COMMAND clean -U install -DskipTests
