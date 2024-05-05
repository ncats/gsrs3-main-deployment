#!/bin/bash

#echo "shutting down tomcat"
#sudo service tomcat stop
#sleep 5

rm -rf $CATALINA_HOME/logs/catalina.out
bash ${config_dir}/clear_cache_lock.sh

chmod a+r ${webapps}/*.war
#chown tomcat:tomcat ${webapps}/*.war

if [ "$1" == "" ] || [ $# -gt 1 ];
then
   echo "....................................... Configuring without unzipping ............................................"
elif [ "$1" == "unzip" ]
then
   cd ${webapps}
   echo "............................................... Unzipping war files .............................................."
   rm -R -- */
   ls |sed 's/.war$//g' | awk '{print "unzip "$1".war -d ./"$1}'|bash
   #chown -R tomcat:tomcat ${webapps}
   echo "................................................... Configuring .................................................."
else
   echo "....................................... Configuring without unzipping ............................................"
fi

# Entity config files: substances
\cp -rf ${config_dir}/substances_application.conf ${webapps}/substances/WEB-INF/classes/application.conf
chmod a+r ${webapps}/substances/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/application.conf

\cp -rf ${config_dir}/substances_codeSystem.json ${webapps}/substances/WEB-INF/classes/codeSystem.json
chmod a+r ${webapps}/substances/WEB-INF/classes/codeSystem.json
#chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/codeSystem.json

# Entity config files: frontend
\cp -rf ${config_dir}/frontend_config.json ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
#chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

# Entity config files: gateway (Tomcat ROOT)
\cp -rf ${config_dir}/gateway_application.yml ${webapps}/ROOT/WEB-INF/classes/application.yml
chmod a+r ${webapps}/ROOT/WEB-INF/classes/application.yml
#chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/application.yml

# Entity config files: applications
\cp -rf ${config_dir}/application_application.conf ${webapps}/applications/WEB-INF/classes/application.conf
chmod a+r ${webapps}/applications/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/applications/WEB-INF/classes/application.conf

# Entity config files: products
\cp -rf ${config_dir}/product_application.conf ${webapps}/products/WEB-INF/classes/application.conf
chmod a+r ${webapps}/products/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/products/WEB-INF/classes/application.conf

# Entity config files: impurities
\cp -rf ${config_dir}/impurities_application.conf ${webapps}/impurities/WEB-INF/classes/application.conf
chmod a+r ${webapps}/impurities/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/impurities/WEB-INF/classes/application.conf

# Entity config files: adverse events
\cp -rf ${config_dir}/adverse-events_application.conf ${webapps}/adverse-events/WEB-INF/classes/application.conf
chmod a+r ${webapps}/adverse-events/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/adverse-events/WEB-INF/classes/application.conf

# Entity config files: clinical trials
\cp -rf ${config_dir}/clinical-trials_application.conf ${webapps}/clinical-trials/WEB-INF/classes/application.conf
chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/application.conf
#chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/application.conf

# if it does not already exist, create the documentation subdir under tomcat/webapps
mkdir -p ${webapps}/frontend/WEB-INF/classes/static/assets/documentation

# Documentation: GSRS Data Dictionary
\cp -rf ${config_dir}/docs_GSRS_data_dictionary_11-20-19.xlsx ${webapps}/ROOT/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
#chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx

# Documentation: GSRS User Manual
\cp -rf ${config_dir}/docs_GSRS_data_dictionary_11-20-19.xlsx ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
#chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf

#sleep 8
#sudo service tomcat start

#sleep 8
#date
echo "curling vocabs"
curl -H "auth-username: admin" -H "auth-password: admin" "http://localhost:8080/api/v1/vocabularies/@count"
date

