#!/bin/bash

# This is a script to build all the microservices specified below
# and then copy the build .war files to $webapps directory
# the value of $webapps must already be set

date
echo start builds

function build_cmd {
  mvn clean -U package -DskipTests
  cp target/$1.war $webapps_deployment/$2.war
  chmod a+r $webapps_deployment/$2.war
  #chown tomcat:tomcat $webapps_deployment/$2.war

}
function build {
    echo "Building $1 to thw WAR $2"
    (cd $1 && build_cmd $1 $2)
}

build frontend frontend
build gateway ROOT
#build discovery discovery

build substances substances
build applications applications
build products products
build impurities impurities
build adverse-events adverse-events
build clinical-trials clinical-trials

echo "Converting war files"
ls $webapps_deployment|awk '{print "bash $tomcat/bin/migrate.sh $webapps_deployment/"$1 " $webapps_convert/"$1}'|bash
#chown -R tomcat:tomcat $webapps_convert

pushd $webapps_convert
echo "Unzipping war files"
ls |sed 's/.war$//g' | awk '{print "unzip "$1".war -d ./"$1}'|bash
#echo "shutting down tomcat"
#sudo service tomcat stop
#sleep 5
rm -rf "${webapps}_old"
mv $webapps "${webapps}_old"
mv $webapps_convert "${webapps}"
mkdir $webapps_convert
#chown -R tomcat:tomcat $webapps_convert
#chown -R tomcat:tomcat $webapps
chmod a+r $webapps/*.war
popd

date
echo copying config files...
./configureGSRS.sh
date
echo done
