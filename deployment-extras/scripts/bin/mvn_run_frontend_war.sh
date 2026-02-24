#!/bin/bash

# mvn_run_frontend_war.sh

# Copy this file to your ~/bin folder so it can be run from any folder.
# Run from the script at the root folder of the GSRS frontend service.  

# For example: 
# cd gsrs3-main-deployment/frontend 
# bash ~/bin/mvn_run_frontend_war.sh

# After you've packaged the frontend service with "mvn_run_frontend_package.sh", you use this script to actually run the frontend service the first time, and for any subsequent restarts.  
# Using this script to launch the War allows you to avoid rebuilding the GSRSFrontend repository each time your want to run the service.   

# If you are using Git Bash on Windows or Windows CMD, please export or set CLASS_PATH_SEPARATOR=';'

# Windows CMD not recommended; You'll have better results with Git Bash.

# You can put your config.json file in $FRONTEND_BIN_CLASSES_DIR/static/assets/data/config.json to override the one that comes with the 
# the code from the GSRSFrontend Git repository downloaded and packaged by by mvn_run_frontend_pacakge.sh

USE_SUDO=${USE_SUDO:-''}
CLASS_PATH_SEPARATOR=${CLASS_PATH_SEPARATOR:-':'}
WAR_LAUNCHER_TYPE=${WAR_LAUNCHER_TYPE:-'2x'}
FRONTEND_BIN_CLASSES_DIR=${FRONTEND_BIN_CLASSES_DIR:-'../../frontend-bin/classes'}
FRONTEND_PORT=${FRONTEND_PORT:-8082}

if [ "$WAR_LAUNCHER_TYPE" == "2x" ]; then
   WAR_LAUNCHER='org.springframework.boot.loader.WarLauncher'
elif [ "$WAR_LAUNCHER_TYPE" == "3x" ]; then
   WAR_LAUNCHER='org.springframework.boot.loader.launch.WarLauncher'
else 
   echo "Error! WAR_LAUNCHER_TYPE does not correspond to available values." 1>&2
   exit 64 
fi

VERBOSE=no
if [ "$VERBOSE" == "yes" ]; then
    echo "USE_SUDO: "$USE_SUDO
    echo "FRONTEND_BIN_CLASSES_DIR: "$FRONTEND_BIN_CLASSES_DIR
    echo "CLASS_PATH_SEPARATOR: "$CLASS_PATH_SEPARATOR
    echo "FRONTEND_PORT: "$FRONTEND_PORT
    echo "WAR_LAUNCHER_TYPE: "$WAR_LAUNCHER_TYPE
    echo "WAR_LAUNCHER: "$WAR_LAUNCHER  
fi

$USE_SUDO java -cp "target/frontend.war$CLASS_PATH_SEPARATOR$FRONTEND_BIN_CLASSES_DIR" -Dserver.port=$FRONTEND_PORT $WAR_LAUNCHER
