#!/bin/bash

# Run this script to view the default h2 database for a GSRS service.
# This database is usually created automatically, based on the service's configuration, assuming no alternative database is configured.
# The database is by default created services' ./ginas.ix/h2 folder or ${ix_home}/ginas.ix/h2 folder.
# In embedded tomcat Run the script at the root of the gsrs-ci, gsrs3-main-deployment, etc. folder.

H2_PACKAGE_JAR=${H2_PACKAGE_JAR:-~/.m2/repository/com/h2database/h2/2.1.214/h2-2.1.214.jar}
h2_package_jar_realpath=$(realpath "${H2_PACKAGE_JAR}")

current_dirname=${PWD##*/}

if [[ "$current_dirname" = "substances" ]]; then
   DATABASE=${DATABASE:-'./ginas.ix/h2/sprinxight'}
else
   DATABASE='./ginas.ix/h2/appinxight' 
fi

DB_URL=${DB_URL:-"jdbc:h2:file:${DATABASE};AUTO_SERVER=TRUE"}

if [[ -f "${DATABASE}.mv.db" ]]; then
   java -cp "${h2_package_jar_realpath}" org.h2.tools.Shell -user '' -password '' -driver org.h2.Driver -url "${DB_URL}" 
else
   echo "The database [${DATABASE}.mv.db] does not exist"
fi
