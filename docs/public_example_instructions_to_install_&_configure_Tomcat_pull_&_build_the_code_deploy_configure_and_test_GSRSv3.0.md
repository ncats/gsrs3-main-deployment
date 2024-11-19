# Instructions to Install and Configure a Single Tomcat Instance, Pull and Build the Code, Deploy, Configure and Test GSRS v3.0 on Red Hat Linux (RHEL)

## Introduction
This guide describes the process of building, deploying and configuring GSRS 3.0, with multiple microservices, on a single Tomcat installation. While this guide was composed for a U.S. FDA-specific configuration, the procedures described can serve as an example for others wishing to deploy a similar configuration. 
How to Read This Guide
This guide uses some specific conventions and makes some assumptions about the installation environment. Some of these conventions and assumptions are explained below.

1.	This guide assumes the installation and build system is a linux system where the user has sudo access.
2.	This guide assumes that the build/dev server which will produce the deployment artifacts is also a deployment server. However, the war file and configuration files obtained from the build process can be moved to other environments. There is no need to rebuild the artifacts.
3.	This guide will typically highlight <mark style="background-color: #FFFF00">in yellow</mark> cases where the JRE or JDK path is specified, and may need to be changed based on specific configurations.
4.	This guide details the specific case of checking out the source repositories and building/installing them directly, keeping them up-to-date with current snapshot versions. This isn’t strictly necessary. For the core substance elements of GSRS3 the maven central repository version specified in the pom.xml files of the gsrs3-main-deployment repository is sufficient.
5.	This guide assumes the building user is named “<span style="color:red">installation_user</span>” and will make reference to that user’s home directory. This can be changed.
6.	This guide assumes that the setup for authentication will use “TRUST HEADER” authentication, where a proxy server is responsible for single-sign-on (SSO) authentication and forwards requests to the GSRS gateway with the authenticated username present in an HTTP header. The details of setting up such a proxy server are out of scope for this guide. 
Disabling trust header authentication and using simple username+password authentication is an option in GSRS.
7.	This guide assumes the user-facing hostname is ‘**gsrs-hostname**’ running on port **8080** (for example https://gsrs-hostname:8080/ginas/app/beta). This should typically be changed to whatever hostname and port the end-user is expected to hit.
8.	This guide assumes the use of an Oracle database for storing data. Slightly different conventions, connection configurations and JDBC driver changes may be necessary depending on the RDBMS database flavor used. More information about these conventions can be found in other GSRS documentation.
9.	This guide presents example scripts which sometimes assume the installation of all entity microservices. These scripts may need to be adjusted or modified depending on which services are intended for a specific installation.
10.	This guide assumes that configuration files for each microservice will be stored in a directory called `config_files_gsrs3.0`, which will store each configuration file using the convention “{service_name}_{configuration_file_name}.{extension}”. For example, “substances_application.conf” will be the name of the configuration file used for substances. These files will be copied to a running deployed version to set up the desired configuration. 
In this guide, we will create a shell script to copy these files to their intended destination and launch Tomcat/GSRS all in one command. 

## Repositories Used

GSRS3 currently uses many source repositories for the fundamental installation. The list of these repositories is shown in the table below.

The main repository used to build and install GSRS3 is **gsrs3-main-deployment**, which comes with some sample server code, README files, and configurations used to build war files for each commonly used microservice. The actual repository libraries supporting the microservices are detailed in this table below. For a simple substances-only deployment, only the only additional artifacts needed from outside of **gsrs3-main-deployment** are the libraries built from **gsrs-spring-starter** and **gsrs-spring-module-substances**. These artifacts are published to Maven central, so there is no fundamental need to clone or build the source Git repositories directly.

For non-substance entity microservices, however, these libraries are not necessarily available in Maven central. In order to include them in a GSRS installation, one would need to clone and install these into a local Maven repository before their associated microservice **war** files can be built and deployed. 

|Name |	In Maven Central?	| Build Needed for Basic Installation?	|Source Needed for Basic Installation	|Description|
|---|---|---|---|---|
|gsrs3-main-deployment https://github.com/ncats/gsrs3-main-deployment|N/A	|N/A	|Yes	|Deployment and configuration repo that assists in the build and houses the pre-built UI frontend.|
|gsrs-spring-starter https://github.com/ncats/gsrs-spring-starter|Yes|Yes|	No	|Core Spring Boot java library resource used by all entity services.|
|gsrs-spring-module-substances https://github.com/ncats/gsrs-spring-module-substances|	Yes|Yes|	No|	Core substance entity service (and CV entity service) libraries used to create substance microservice, as well as connecting REST API connections to a substance microservice|
|gsrs-spring-module-clinical-trials https://github.com/ncats/gsrs-spring-module-clinical-trials|Not yet	|No	|No	|Core clinical trial (CT) entity service libraries used to create CT microservice, as well as connecting REST API connections to a CT microservice|
|gsrs-spring-module-adverse-events https://github.com/ncats/gsrs-spring-module-adverse-events |Not yet	|No	|No	|Core adverse events (AE) entity service libraries used to create AE microservice, as well as connecting REST API connections to an AE microservice|
|gsrs-spring-module-impurities https://github.com/ncats/gsrs-spring-module-impurities	|Not yet	|No	|No	|Core impurities (IMP) entity service libraries used to create IMP microservice, as well as connecting REST API connections to an IMP microservice|
|gsrs-spring-module-drug-products https://github.com/ncats/gsrs-spring-module-drug-products	|Not yet	|No	|No	|Core products (PRO) entity service libraries used to create PRO microservice, as well as connecting REST API connections to a PRO microservice|
|gsrs-spring-module-drug-applications https://github.com/ncats/gsrs-spring-module-drug-applications|	Not yet	|No	|No	|Core applications (APP) entity service libraries used to create APP microservice, as well as connecting REST API connections to an APP microservice|
|GSRSFrontend https://github.com/ncats/GSRSFrontend|	N/A|	Yes	|No	|GSRS Frontend code. This source code is written in angular/typescript and can be built and configured to talk to each microservice. The built version of the frontend is regularly supplied to the gsrs3-main-deployment repository.|


## Prerequisite 1: Install Java 11 
Install JDK on Dev/build host, or JRE on deployment hosts.\
Java 11 is recommended. \
**IMPORTANT**: Write down (or copy/paste) the path and name of your unzipped Java directory.
## Prerequisite 2: Install Maven 
Install Maven (mvn) on your Dev/build host. 
This is not needed for deployment-only hosts. This step is not always necessary as most source repositories are delivered with a simple wrapped version of Maven which can be used without direct installation.
## Prerequisite 3: Install and configure Tomcat 10.0.8
Install Tomcat on your deployment hosts. 
If you intend to deploy GSRS on your build host, then Tomcat is a prerequisite on that host too. 
The following instructions are adapted from: 
    https://www.itzgeek.com/how-tos/linux/centos-how-tos/how-to-install-apache-tomcat-9-on-rhel-8.html 
Log on to your Linux host as root 
```
useradd -s /bin/bash -m tomcat 
```
Set the new user (“tomcat”) account’s password to never expire: 

Enter the chage command shown below, and respond to it as shown in bold red

Note: to take the default value shown [between square brackets] press Enter without typing a response
```
chage tomcat
Changing the aging information for tomcat
Enter the new value, or press ENTER for the default

    Minimum Password Age [1]: 60
    Maximum Password Age [60]: 99999
    Last Password Change (YYYY-MM-DD) [2021-10-14]:
    Password Expiration Warning [17]:
    Password Inactive [35]: 0
    Account Expiration Date (YYYY-MM-DD) [-1]:
```
Confirm your settings with this command:  
```
chage -l tomcat
Last password change                                : Oct 14, 2021
Password expires                                    : never
Password inactive                                   : never
Account expires                                     : never
Minimum number of days between password change      : 60
Maximum number of days between password change      : 99999
Number of days of warning before password expires   : 17
```
Now let’s install Apache Tomcat \
```
cd /u01/
```
Acquire apache tomcat, for example with the following command
```
wget https://downloads.apache.org/tomcat/tomcat-10/v10.0.10/bin/apache-tomcat-10.0.10.zip 
unzip apache-tomcat-10.0.20.zip 
```
This next command is critical. 
Be sure to execute it: 
```
mv  apache-tomcat-10.0.20  tomcat 
```
All of the commands below are important, but first be sure to have executed the previous one (mv) first. 
```
chown -R tomcat:tomcat /u01/tomcat/
cd /u01/tomcat 
usermod -d /u01/tomcat tomcat
chmod a+x bin/*.sh
mkdir gsrs_exports
chown tomcat:tomcat gsrs_exports/
chmod a+rw gsrs_exports/
cd ~ 
ln -s /u01/tomcat 
ln -s /u01/tomcat/webapps 
```
**NOTE**: 	In order to configure GSRS in a single tomcat environment, it’s useful to have a directory where config files are stored and can be copied to running deployments via script. This guide uses the path of ‘/root/config_files_gsrs3.0’ for the config files, but any path could be used.
```
mkdir /root/config_files_gsrs3.0
ln -s /root/config_files_gsrs3.0 config_dir
setenforce 0
sed -i 's/ELINUX=enforcing/ELINUX=disabled/g' /etc/selinux/config
```
At the top of this document, you were asked to remember the path and name of your unzipped Java directory.\ 
Now is where you must use that <mark style="background-color: #FFFF00">path and name</mark>, in the <mark style="background-color: #FFFF00">JAVA_HOME</mark> parameter 
```
nano ~/.bashrc
```
add these lines to the end of the file, save and exit: 
```
export webapps=/u01/tomcat/webapps
export webapps_deployment=/u01/tomcat/webapps-javaee-manual
export webapps_convert=/u01/tomcat/webapps-convert
export CATALINA_HOME=/u01/tomcat
export tomcat=/u01/tomcat
export config_dir=/root/config_files_gsrs3.0
export JAVA_HOME=/u01/openjdk-11.0.12_7-jre
```
```
source ~/.bashrc
echo $webapps
```
Verify that the env var now contains the correct value 
```
cd $webapps 
```
Give the default ROOT app some other name so that we can later place here our own ROOT app: 
```
mv ROOT.war ORIG_ROOT.war 
mv ROOT ORIG_ROOT 
```
Alternatively, you can just delete this war file and its corresponding directory. There is no reason to rename and preserve them. 
```
cd $tomcat 
```
Each individual microservice uses its own directory to house search indexes and cache files. It is convenient to name these directories based on the microservices. Below, we make a special directory for the search index of each of the microservices we will deploy. 
```
mkdir ginas.ix gsrs_applications.ix gsrs_products.ix gsrs_impurities.ix gsrs_adverse-events.ix gsrs_clinical-trials.ix
chown tomcat:tomcat *.ix 
chmod a+rw *.ix 
chmod o-w *.ix
nano conf/server.xml
```
Add  the **relaxedQueryChars** attribute to the <Connector /> element, then save and exit: 

    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443""
               relaxedQueryChars="^{}[]|&quot;" />


Replace the <Valve /> element at the end of the file with this, then save and exit: 

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".log"
               pattern="%h %l %u %t %{username}s &quot;%r&quot; %s %b"
               resolveHosts="false" />

```
nano bin/setenv.sh
```
A single-Tomcat deployment of GSRS with all the microservices described in this guide will typically need at least <mark style="background-color: #0BFFFF">32</mark>GB of runtime memory to perform as expected. Depending on the scale and needs of a specific installation these options may vary.
Put this content into this new file, then save and exit: 
```
export CATALINA_OPTS="$CATALINA_OPTS -Xms32G -Xmx32G"
```
Be sure to change the <mark style="background-color: #0BFFFF">32</mark>G parameter in the line above, as explained below: \

**<u>Guideline</u>**: If your host has 64 GB of memory and your instance of GSRS will run 9 microservices as is the case at FDA, then you should use <mark style="background-color: #0BFFFF">32</mark> GB for GSRS because the 9 microservices will need this much memory. But if your host has only  32 GB (or less) and you’re running only 3 microservices for GSRS, then you should set this parameter to a value below the system’s physical RAM capacity. \
```
chmod a+rx bin/setenv.sh 
chown tomcat:tomcat bin/setenv.sh 
nano /etc/systemd/system/tomcat.service 
```
Here, too, in the JAVA_HOME parameter you must use the path and name that you were asked to remember at the top of this document. \
And as for the <mark style="background-color: #0BFFFF">32</mark>G parameter below, use the guideline set forth above. \

Put this content into this new file, then save and exit: 
```
[Unit]
Description=Apache Tomcat
After=network.target centrifydc.service

[Service]
Type=forking

Environment=JAVA_HOME=/u01/openjdk-11.0.12_7-jre

Environment=CATALINA_PID=/u01/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/u01/tomcat
Environment=CATALINA_BASE=/u01/tomcat
Environment='CATALINA_OPTS=-Xms32G -Xmx32G -Djava.net.preferIPv4Stack=true'
Environment='JAVA_OPTS=-Djava.awt.headless=true'

ExecStart=/u01/tomcat/bin/catalina.sh start
ExecStop=/u01/tomcat/bin/catalina.sh stop
SuccessExitStatus=143

User=tomcat
Group=tomcat
UMask=0007
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target

```
```
systemctl daemon-reload
```
Insert these two lines just above the last line of Tomcat’s /u01/tomcat/conf/tomcat-users.xml
```
  <role rolename="admin-gui,manager-gui"/>
  <user username="admin" password="tomcat" roles="manager-gui,admin-gui"/>
  ```
  

Add this line just before </Context> near the end of Tomcat's /u01/tomcat/conf/context.xml 
```
  <Resources cachingAllowed="true" cacheMaxSize="100000"/> <!--The unit here is KB -->
  ```
and just to be sure, again: \
```
systemctl daemon-reload
systemctl enable tomcat
systemctl is-enabled tomcat.service
netstat -antup | grep 8080
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd -reload
```

**<u>In the future, in order to start/stop/restart Tomcat, use one of these commands: </u>** 
```
systemctl stop tomcat 
systemctl start tomcat 
systemctl status tomcat
systemctl restart tomcat
   -- OR if you’re not already root, -- 
sudo service tomcat stop 
sudo service tomcat start 
sudo service tomcat status 
sudo service tomcat restart 
```

**Pull the GSRS v3.0 code from Git**\
<u>(this is to be done on the Dev build host only)</u>

cd into your workspace directory \
You may need to create It first in your ~ home dir. \
For example:    
>mkdir /home/installation_user/workspace3.0\
>or:  mkdir ~ad_app_rghazzaoui/workspace3.0\


Once you’ve cd’d into it, proceed: 
```
ln -s /u01/tomcat 
ln -s /u01/tomcat/webapps 
ln -s /root/config_files_gsrs3.0 config_dir
```
Here, we checkout the deployment repository with the default microservices and configuration. For some deployments, a special branch or fork from this repo may be more appropriate.
```
git clone https://github.com/ncats/gsrs3-main-deployment
```
This (git clone) command will require you to enter your username and user access token. \
```
cd gsrs3-main-deployment
chmod -R a+x mvnw
ln -s /u01/tomcat 
ln -s /u01/tomcat/webapps 
ln -s /root/config_files_gsrs3.0 config_dir 
mkdir /root/config_files_gsrs3.0
cd $tomcat 
mkdir webapps-convert
mkdir webapps-javaee
mkdir webapps-javaee-manual
mkdir webapps_old
chown tomcat:tomcat webapps*
chmod a+rw webapps*
```

**Create Deployment and Configuration scripts**\
<u>(this is to be done on your Dev build host only, if you have one)</u> \
This guide will rely on the existence of the following scripts. Each of these files should be created, and will be configured below based on needs. Example scripts and snippets can be found later in this document.\

|Script Name|Expected Path|Purpose|
|----|----|----|
|<mark style="background-color: #FFFF00">buildAllAndCopyToWebapps.sh</mark>|/home/installation_user/workspace3.0/gsrs3-main-deployment|Builds the individual war files for all microservices expected, and copies the result to the tomcat directory for local deployment|
|<mark style="background-color: #FFFF00">configureGSRS.sh</mark>|	/home/installation_user/workspace3.0/gsrs3-main-deployment|Shuts down tomcat, deploys configuration files, and restarts tomcat|
|<mark style="background-color: #FFFF00">pullInstallBuildDeploy.sh</mark>	|/home/installation_user/workspace3.0	|Pulls source code from source repositories, and then calls the other two scripts above to build, deploy and configure.|
|clear_cache_lock.sh	|/home/installation_user/workspace3.0	|Clears local files cache files that may prevent GSRS webapps from restarting|
|daily_build.sh	|/home/installation_user/workspace3.0	|A simple script to pull, build, deploy and log the build process which can be used to do simple daily deployments.|

**[Optional] Pull the GSRS v3.0 prerequisites from Git and create a local Maven repository for them**\
<u><span style="color:red">(this is to be done on your Dev build host only, if you have one)</span> </u>\

**Note**: This section describes building the core java Spring Boot libraries from source. However, the current released versions of the substances and starter libraries can also be pulled directly from maven central. If the current public released version of the libraries is sufficient, this section can be skipped. For non-substance entities which are not yet in maven central this step may still be required.

cd into your workspace directory 
You may need to create It first in your ~ home dir. 
```
For example: mkdir /home/installation_user/workspace3.0
```

**<u>[Optional] Pull GSRS starter module from Git for GSRS v3.0</u>** 

**Note**: The GSRS-starter repository is a core library that all other entity microservices rely on. As noted above, if the maven central version is sufficient, there is no need to check out the code here.\
cd into your workspace directory  (e.g. <span style="color:red">/home/installation_user/workspace3.0</span>)
Once you’ve cd’d into it, proceed: 
```
git clone https://github.com/ncats/gsrs-spring-starter
cd gsrs-spring-starter
```
In the following scripts (created elsewhere In this document), ADD relevant lines to activate this module: 
```
- gsrs-ci/buildAllAndCopyToWebapps.sh
- gsrs-ci/configureGSRS.sh
- pullInstallBuildDeploy.sh
- clear_cache_lock.sh
```
**<u>[Optional] Pull GSRS Substances module from Git for GSRS v3.0</u>** \
cd into your workspace directory  (e.g. /home/installation_user/workspace3.0)
Once you’ve cd’d into it, proceed: 
```
git clone https://github.com/ncats/gsrs-spring-module-substances
```
cd gsrs-spring-module-substances
In the following scripts (created elsewhere In this document), ADD relevant lines to activate this module: 
```
- gsrs-ci/buildAllAndCopyToWebapps.sh
- gsrs-ci/configureGSRS.sh
- pullInstallBuildDeploy.sh
- clear_cache_lock.sh
```

ADD the module’s “**application.conf**” file to $config_dir, 
rename it to {module_name}_application.conf  and edit it to \

-	Specify the correct hostname and search index dir (".ix" directory)\
-	Remove all references to an H2 database from this config file (even within comments) \
-	Add this line to it
```
ix.ginas.export.path=/u01/tomcat/gsrs_exports \
```

-    Also add these ix.authentication lines: 
```
# SSO HTTP proxy authentication settings
ix.authentication.trustheader=true
ix.authentication.usernameheader="OAM_REMOTE_USER"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"
ix.authentication.logheaders=true
```
-	Edit the database connection strings to specify the correct driver and credentials 
-	Customize further as needed and desired for this specific installation \
FINALLY, edit the gateway routes in  $config_dir/gateway_application.yml\


**<u>[Optional] Pull FDA’s Application starter module from Git for GSRS v3.0</u>**\
Please follow the instructions for product, replacing product references to the appropriate application repository/names. More information can be found in the README.MD file found in the applications directory.

**<u>[Optional] Pull FDA’s Clinical Trial starter module from Git for GSRS v3.0</u>**\
Please follow the instructions for product, replacing product references to the appropriate clinicaltrials repository/names. More information can be found in the README.MD file found in the clinical-trials directory.

**<u>[Optional] Pull FDA’s Impurites starter module from Git for GSRS v3.0</u>**\
Please follow the instructions for product, replacing product references to the appropriate impurities repository/names. More information can be found in the README.MD file found in the impurities directory.

**<u>[Optional] Pull FDA’s Adverse Events starter module from Git for GSRS v3.0</u>**\
Please follow the instructions for product replacing product references to the appropriate adverse events repository/names. More information can be found in the README.MD file found in the adverse-events directory.

## Build GSRS v3.0
<span style="color:red"><u>(this is to be done on your Dev build host only, if you have one) </u></span>
```
nano configureGSRS.sh 
```
create this new file on your Dev build host and put these lines into it, save and exit: 
```
#!/bin/bash

echo "shutting down tomcat"
sudo service tomcat stop
sleep 5

rm -rf $CATALINA_HOME/logs/catalina.out
bash ${config_dir}/clear_cache_lock.sh

chmod a+r ${webapps}/*.war
chown tomcat:tomcat ${webapps}/*.war

if [ "$1" == "" ] || [ $# -gt 1 ];
then
   echo "....................................... Configuring without unzipping ............................................"
elif [ "$1" == "unzip" ]
then
   cd ${webapps}
   echo "............................................... Unzipping war files .............................................."
   rm -R -- */
   ls |sed 's/.war$//g' | awk '{print "unzip "$1".war -d ./"$1}'|bash
   chown -R tomcat:tomcat ${webapps}
   echo "................................................... Configuring .................................................."
else
   echo "....................................... Configuring without unzipping ............................................"
fi

# Entity config files: substances
\cp -rf ${config_dir}/substances_application.conf ${webapps}/substances/WEB-INF/classes/application.conf
chmod a+r ${webapps}/substances/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/application.conf

\cp -rf ${config_dir}/substances_codeSystem.json ${webapps}/substances/WEB-INF/classes/codeSystem.json
chmod a+r ${webapps}/substances/WEB-INF/classes/codeSystem.json
chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/codeSystem.json

# Entity config files: frontend
\cp -rf ${config_dir}/frontend_config.json ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

# Entity config files: gateway (Tomcat ROOT)
\cp -rf ${config_dir}/gateway_application.yml ${webapps}/ROOT/WEB-INF/classes/application.yml
chmod a+r ${webapps}/ROOT/WEB-INF/classes/application.yml
chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/application.yml

# Entity config files: applications
\cp -rf ${config_dir}/application_application.conf ${webapps}/applications/WEB-INF/classes/application.conf
chmod a+r ${webapps}/applications/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/applications/WEB-INF/classes/application.conf

# Entity config files: products
\cp -rf ${config_dir}/product_application.conf ${webapps}/products/WEB-INF/classes/application.conf
chmod a+r ${webapps}/products/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/products/WEB-INF/classes/application.conf

# Entity config files: impurities
\cp -rf ${config_dir}/impurities_application.conf ${webapps}/impurities/WEB-INF/classes/application.conf
chmod a+r ${webapps}/impurities/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/impurities/WEB-INF/classes/application.conf

# Entity config files: adverse events
\cp -rf ${config_dir}/adverse-events_application.conf ${webapps}/adverse-events/WEB-INF/classes/application.conf
chmod a+r ${webapps}/adverse-events/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/adverse-events/WEB-INF/classes/application.conf

# Entity config files: clinical trials
\cp -rf ${config_dir}/clinical-trials_application.conf ${webapps}/clinical-trials/WEB-INF/classes/application.conf
chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/application.conf

# if it does not already exist, create the documentation subdir under tomcat/webapps
mkdir -p ${webapps}/frontend/WEB-INF/classes/static/assets/documentation

# Documentation: GSRS Data Dictionary
\cp -rf ${config_dir}/docs_GSRS_data_dictionary_11-20-19.xlsx ${webapps}/ROOT/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx

# Documentation: GSRS User Manual
\cp -rf ${config_dir}/docs_GSRS_data_dictionary_11-20-19.xlsx ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf

sleep 8
sudo service tomcat start

sleep 8
date
echo "curling vocabs"
curl -H "auth-username: admin" -H "auth-password: admin" "http://localhost:8080/api/v1/vocabularies/@count"
dates
```

```
chmod a+x configureGSRS.sh 
nano clear_cache_lock.sh 
```

create this new file and put these lines into it, save and exit: 
```
rm -rf $tomcat/ginas.ix/cache
rm -rf $tomcat/gsrs_applications.ix/cache
rm -rf $tomcat/gsrs_products.ix/cache
rm -rf $tomcat/gsrs_impurities.ix/cache
rm -rf $tomcat/gsrs_adverse-events.ix/cache
rm -rf $tomcat/gsrs_clinical-trials.ix/cache
chown -R tomcat:tomcat $tomcat/ginas.ix
chown -R tomcat:tomcat $tomcat/gsrs_applications.ix
chown -R tomcat:tomcat $tomcat/gsrs_products.ix
chown -R tomcat:tomcat $tomcat/gsrs_impurities.ix
chown -R tomcat:tomcat $tomcat/gsrs_adverse-events.ix
chown -R tomcat:tomcat $tomcat/gsrs_clinical-trials.ix
```

```
chmod a+x clear_cache_lock.sh 
nano buildAllAndCopyToWebapps.sh 
```
add these lines to this build script, save and exit: 
```
#!/bin/bash

# This is a script to build all the microservices specified below
# and then copy the build .war files to $webapps directory
# the value of $webapps must already be set

date
echo start builds

(cd frontend && ./build.sh)
(cd gateway && ./build.sh)
#(cd discovery && ./build.sh)
(cd substances && ./build.sh)
(cd applications && ./build.sh)
(cd products && ./build.sh)
(cd impurities && ./build.sh)
(cd adverse-events && ./build.sh)
(cd clinical-trials && ./build.sh)

echo "Converting war files"
ls $webapps_deployment|awk '{print "bash $tomcat/bin/migrate.sh $webapps_deployment/"$1 " $webapps_convert/"$1}'|bash
chown -R tomcat:tomcat $webapps_convert

pushd $webapps_convert
echo "Unzipping war files"
ls |sed 's/.war$//g' | awk '{print "unzip "$1".war -d ./"$1}'|bash
echo "shutting down tomcat"
sudo service tomcat stop
sleep 5
rm -rf "${webapps}_old"
mv $webapps "${webapps}_old"
mv $webapps_convert "${webapps}"
mkdir $webapps_convert
chown -R tomcat:tomcat $webapps_convert
chown -R tomcat:tomcat $webapps
chmod a+r $webapps/*.war
popd

date
echo copying config files...
./configureGSRS.sh
date
echo done
```

cd into <span style="color:red">each</span> microservice directory (frontend, gateway, discovery, substances, etc) 
and edit its build.sh file to make sure it ends with three lines similar to these: 
```
cp target/substances.war $webapps_deployment/.
chmod a+r $webapps_deployment/substances.war
chown tomcat:tomcat $webapps_deployment/substances.war
```
**Note**: In a single tomcat deployment it’s convenient to have the gateway service specifically deployed to ROOT rather than to its own context. The following code makes this convention explicit. 

cd into the <span style="color:red">gateway</span> microservice directory \
and edit its build.sh file to replace its contents with this: 
```
./mvnw clean package -DskipTests

cp target/gateway.war $webapps_deployment/ROOT.war
chmod a+r $webapps_deployment/ROOT.war
chown tomcat:tomcat $webapps_deployment/ROOT.war
```
```
./buildAllAndCopyToWebapps.sh
```

## Set up a daily build 

**Note**: This daily build section details how to set up a build which will install all java source dependencies from the active development branches found in the git repositories. If specific versions are desired that may require changes both to the pom.xml files which reference these libraries as well as the specific branches/tags which are checked out and installed from each repository. 

cd into your workspace directory   (e.g. <span style="color:red">/home/installation_user/workspace3.0</span>)\
```
nano pullInstallBuildDeploy.sh 
```
create this new file and put these lines into it, save and exit: 
```
#!/bin/bash

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ........................................ start Git pulls .........................................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-substances
pwd
#git checkout data_merge_fine_points
#git pull
# git pull origin data_merge_fine_points
echo "Checkout master branch for Substance"
git checkout master
echo "Pulling master branch for Substance"
git pull origin master


cd $workspace
pwd
cd gsrs-spring-starter
pwd
#git checkout data_merge_fine_points
#git pull
# git pull origin data_merge_fine_points
echo "Checkout master branch for starter"
git checkout master
echo "Pulling master branch for Starter"
git pull origin master


cd $workspace
pwd
cd gsrs-spring-module-drug-applications
pwd
git checkout starter
git pull origin starter


cd $workspace
pwd
cd gsrs-spring-module-drug-products
pwd
git checkout starter
git pull origin starter


cd $workspace
pwd
cd gsrs-spring-module-impurities
pwd
git checkout starter
git pull origin starter


cd $workspace
pwd
cd gsrs-spring-module-adverse-events
pwd
git checkout starter
git pull origin starter


cd $workspace
pwd
cd gsrs-spring-module-clinical-trials
pwd
git checkout master
git pull origin master

cd $workspace
pwd
cd gsrs-spring-module-ssg4
pwd
git checkout master
git pull origin master

cd $workspace
pwd
cd gsrs-ci
pwd
git fetch origin fda
git checkout fda
git pull origin fda

echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ........................................ done with pulls .........................................

echo ......................................... start builds ...........................................
date
echo ............................... start install gsrs-spring-starter ................................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-starter
pwd
./installExtraJars.sh
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo .......................... start install gsrs-spring-module-substances ...........................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-substances
pwd
./installExtraJars.sh
./mvnw clean install -DskipTests -Pcdk

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ....................... start install gsrs-spring-module-drug-applications .......................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-drug-applications
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ....................... start install gsrs-spring-module-drug-products ...........................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-drug-products
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ......................... start install gsrs-spring-module-impurities ............................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-impurities
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ........................ start install gsrs-spring-module-adverse-events .........................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-adverse-events
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ........................ start install gsrs-spring-module-clinical-trials ........................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-clinical-trials
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo .............................. start install gsrs-spring-module-ssg4 .............................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-spring-module-ssg4
pwd
./mvnw clean install -DskipTests

date
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................
echo ............................. start GSRS build and deployment script .............................
echo ..................................................................................................
echo ..................................................................................................
echo ..................................................................................................

cd $workspace
pwd
cd gsrs-ci
pwd

chmod 777 ./deployment-extras/build.sh ./ssg4m/build.sh ./clinical-trials/build.sh ./adverse-events/build.sh ./impurities/build.sh ./products/build.sh ./applications/build.sh ./discovery/build.sh ./substances/build.sh ./gateway/build.sh ./frontend/target/frontend/WEB-INF/classes/static/assets/dojox/mobile/build/build.sh ./frontend/target/classes/static/assets/dojox/mobile/build/build.sh ./frontend/build.sh ./frontend/src/main/resources/static/assets/dojox/mobile/build/build.sh

chmod 777 ./frontend/mvnw ./gateway/mvnw ./substances/mvnw ./discovery/mvnw ./applications/mvnw ./products/mvnw ./impurities/mvnw ./adverse-events/mvnw ./clinical-trials/mvnw ./ssg4m/mvnw ./deployment-extras/mvnw ./gsrs-spring-starter/gsrs-discovery/mvnw ./gsrs-spring-starter/mvnw ./gsrs-spring-module-substances/mvnw ./gsrs-spring-module-substances/gsrs-module-substances-dto/mvnw ./gsrs-spring-module-substances/gsrs-module-substances-tests/mvnw ./gsrs-spring-module-drug-applications/mvnw ./gsrs-spring-module-drug-products/mvnw ./gsrs-spring-module-impurities/mvnw ./gsrs-spring-module-adverse-events/mvnw ./gsrs-spring-module-clinical-trials/mvnw

rm -rf ./frontend/target/frontend.war ./gateway/target/gateway.war ./substances/target/substances.war ./discovery/target/discovery.war ./applications/target/applications.war ./products/target/products.war ./impurities/target/impurities.war ./adverse-events/target/adverse-events.war ./clinical-trials/target/clinical-trials.war

./buildAllAndCopyToWebapps.sh

chmod a+r $webapps/*.war
```
```
nano daily_build.sh 
```
create this new file and put these lines into it, save and exit: 
```
#!/bin/bash

cdate=`date +"%Y-%m-%d__%0k.%M.%S"`

exec 3>&1 4>&2 1> /tmp/gsrs_daily_build_`hostname`_$cdate.log 2>&1

pwd

# Because JDK keeps getting updated on its own,
# we need our JAVA_HOME env var to dynamically find it rather than statically pointing to it
#
export JAVA_HOME=/etc/alternatives/java_sdk

export workspace=~ad_app_rghazzaoui/workspace3.0
export tomcat=/u01/tomcat
export CATALINA_HOME=/u01/tomcat
export HOSTNAME=fdslv22019
export webapps=/u01/tomcat/webapps
export config_dir=/root/config_files_gsrs3.0

export webapps_convert=$tomcat/webapps-convert

export webapps_deployment=/u01/tomcat/webapps-javaee-manual
#export webapps_deployment=/u01/tomcat/webapps-javaee

mkdir -p $webapps_deployment
cd $workspace
pwd
cd /home/ad_app_rghazzaoui/workspace3.0
pwd
./pullInstallBuildDeploy.sh & disown
```
```
crontab -e
```

add these lines to it for an evening build and an early morning build:  
```
00 6 * * * /home/installation_user/workspace3.0/daily_build.sh
30 5 * * * /home/installation_user/workspace3.0/daily_build.sh
```

## Stage the configuration files and restart Tomcat
This section describes specific configuration files used in an example single-Tomcat deployment. Many specific settings may be changed based on the installation needs. A few conventions and assumptions are used here:\
•	These configurations expect that the database(s) used by GSRS already exist and already have the schema(s) and tables generated and live. The “ddl-auto” can be adjusted to create the schema(s) if missing. Some additional database indexes and adjustments may be desirable beyond the automatically-generated schemas.\
•	The database configuration examples are for Oracle 12c databases. Other JDBC drivers, dialects and configuration settings will be appropriate for other database flavors.\
•	Some of these microservices (applications, products, impurities, adverse events, clinical trials) use more than one datasource. In each case, the core datasource is the “spring.datasource” and it points to the same database and schema as the substance datasource. The other datasoruces for each microservice will be named “<microservice_name>.datasource” and can be their own database independent of substances. However, in this guide, this example, all datasources will be found within the same database server, with each non-core and non-substance service found in the “GSRS_EXTENSION_SCHEMA” schema.\
•	All non-core, non-substance entity microservices currently work best when connected to the same core database as the substances service. This connection is used to share user, session and etag information. The connection is also occasionally used by the extending service to directly query the substance tables. **This convention is likely to change in future releases, with authentication, session, etag and substance connections all using microservice messaging/REST API messaging instead.**

Proceed as follows:
```
cd /root/config_files_gsrs3.0
nano application_application.conf
```
Put this content into this new file, make sure the URL is the correct one that users will use in their browser, then save and exit: 
```
include "applications-core.conf"
#include "substances-core.conf"

# need to reconsider this a bit
substanceAPI.BaseUrl="http://gsrs-hostname:8080/"

ix.home= "/u01/tomcat/gsrs_applications.ix"
application.host= "http://gsrs-hostname:8080"
spring.application.name="applications"
#this is what it registers under eureka
eureka.instance.hostname="applications"

logging.file.path=/u01/tomcat/logs/applications

gsrs.substances.molwitch.enabled=false

##################################################################
# SPRING BOOT ACTUATOR SETTINGS FOR MICROSERVICE HEALTH CHECKS  ##
##################################################################
# turn off rabbit mq check for now since we don't use it otherwise it wil say we ar down
management.health.rabbit.enabled: false

# PUT YOUR PERSONAL EXTENSIONS AND ADDITIONS HERE
#debug=true
spring.main.allow-bean-definition-overriding=true

#this is how HOCON does default values
eureka.client.serviceUrl.defaultZone= "http://localhost:8761/eureka"
eureka.client.serviceUrl.defaultZone= ${?EUREKA_SERVER}

ix.ginas.export.path=/u01/tomcat/gsrs_exports

## START AUTHENTICATION

# SSO HTTP proxy authentication settings
ix.authentication.trustheader=true
ix.authentication.usernameheader="OAM_REMOTE_USER"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"
ix.authentication.logheaders=false

# set this "false" to only allow authenticated users to see the application
ix.authentication.allownonauthenticated=false

# set this "true" to allow any user that authenticates to be registered
# as a user automatically
ix.authentication.autoregister=false

#Set this to "true" to allow autoregistered users to be active as well
ix.authentication.autoregisteractive=false

## END AUTHENTICATION


# Oracle Connection
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url="jdbc:oracle:thin:@//SUBSTANCE_DATABASE_SERVER:PORT/SUBSTANCE_DB_NAME"
spring.datasource.username=GSRS_CORE_SCHEMA
spring.datasource.password=***CORE_PASSWORD***

application.datasource.driver-class-name=oracle.jdbc.OracleDriver
application.datasource.url="jdbc:oracle:thin:@//SUBSTANCE_DATABASE_SERVER:PORT/SUBSTANCE_DB_NAME"
application.datasource.username=GSRS_EXTENSION_SCHEMA
application.datasource.password=***EXTENSION_PASSWORD***

application.datasource.maximumPoolSize=20 #this Oracle driver does not allow pool size of 35 or higher

spring.jpa.hibernate.ddl-auto=none

spring.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect
application.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect

# Spring Boot Config
spring.jpa.hibernate.ddl-auto=none  #### THIS IS VERY IMPORTANT, OTHERWISE Hibernate will WIPE OUT our database
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

eureka.client.enabled=false



##################################################################
# CONFIGURATIONS VALIDATORS, PROCESSORS, EXPORT, etc            ##
##################################################################

gsrs.validators.applications = [
    {
        "validatorClass" = "gov.hhs.gsrs.application.application.validators.RequiredFieldNonNullValidator",
        "newObjClass" = "gov.hhs.gsrs.application.application.models.Application",
    }
]

gsrs.entityProcessors = [
    {
        "class" = "gov.hhs.gsrs.application.application.models.Application",
        "processor" = "gov.hhs.gsrs.application.application.processors.ApplicationProcessor"
    },
    {
        "class" = "gov.hhs.gsrs.application.applicationall.models.ApplicationAll",
        "processor" = "gov.hhs.gsrs.application.applicationall.processors.ApplicationAllProcessor"
    },
    {
        "class" = "gov.hhs.gsrs.application.applicationdarrts.models.ApplicationDarrts",
        "processor" = "gov.hhs.gsrs.application.applicationdarrts.processors.ApplicationDarrtsProcessor"
    }
]

ix.ginas.export.factories.applications = [
  "gov.hhs.gsrs.application.application.exporters.ApplicationExporterFactory"
]

ix.ginas.export.factories.applicationsall = [
  "gov.hhs.gsrs.application.applicationall.exporters.ApplicationAllExporterFactory"
]

gsrs.indexers.list=[
    {
        "indexer" = "gov.hhs.gsrs.application.application.indexers.ApplicationIngredientIndexValueMaker",
        "class" = "gov.hhs.gsrs.application.application.models.Application"
    },
    {
        "indexer" = "gov.hhs.gsrs.application.application.indexers.ApplicationClinicalTrialIndexValueMaker",
        "class" = "gov.hhs.gsrs.application.application.models.Application"
    },
    {
        "indexer" = "gov.hhs.gsrs.application.applicationall.indexers.ApplicationSubstanceIndexValueMaker",
        "class" = "gov.hhs.gsrs.application.applicationall.models.ApplicationAll"
    }
]

# Dev only: Set this to false
# This is set to true in gsrs-core.conf
gsrs.sessionSecure=false
```
```
cp $webapps/frontend/WEB-INF/classes/static/assets/data/config.json ./frontend_config.json
nano frontend_config.json 
```
edit the apiBaseUrl line near the top to read: 
>  "apiBaseUrl" : "http://gsrs-hostname:8080/ginas/app/",

… make sure the URL is the correct one that users will use in their browser, 
edit the “GSRS User Guide” href file to read: 
  >"href" : "assets/documentation/FDA_GSRS_User_Manual.pdf",
  
edit the “GSRS Data Dictionary” href file to read: 
>  "href" : "assets/documentation/GSRS_data_dictionary_11-20-19.xlsx",

then save and exit the editor 

**NOTE**: 	The configuration file **frontend_config.json** allows for a lot of custom settings, many of which are likely to be relevant to a given deployment. In particular, it allows the UI to turn on and off the support for given microservices. Consult the GSRS frontend Angular code for more information on specific configuration settings. 
```
nano gateway_application.yml
```
Put this content into this new file, then save and exit: 
```
gsrs:
  gateway:
    server:
      addHeaders:
        # these are for the FDA UAT GSRS server to be able to respond to the KASA SSG4M GSRS instance
        - "Access-Control-Allow-Origin: *"
        - "Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS"
        - "Access-Control-Allow-Headers: auth-key, auth-username, auth-password, auth-token, Content-Type, Content-Range, Content-Disposition, Content-Description"
      redirectPatterns:
        # fixes for improper redirects on single tomcat instance
        - "[/][a-z|A-Z]*/api/v1/: /api/v1/"

eureka:
  client:
    registerWithEureka: false
    fetch-registry: true
    serviceUrl:
      defaultZone: ${EUREKA_SERVER:http://localhost:8761/eureka}

spring:
  application:
    name: gateway
  cloud:
    gateway:
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Origin Access-Control-Allow-Credentials, RETAIN_UNIQUE

debug: true

spring.servlet.multipart.max-file-size:    100MB
spring.servlet.multipart.max-request-size: 100MB

zuul:
  #this sets sensitiveHeaders to empty list so cookies and auth headers are passed through both ways
  sensitiveHeaders:
  routes:
    ui:
      path: /ginas/app/beta/**
      url: http://localhost:8080/frontend/ginas/app/beta
      serviceId: frontend
    ginas_app:
      path: /ginas/app/**
      url: http://localhost:8080
      serviceId: ginas_app_route
    applications_core:
      path: /api/v1/applications/**
      url: http://localhost:8080/applications/api/v1/applications
      serviceId: applications_core
    applications_core_alt:
      path: /api/v1/applications(**)/**
      url: http://localhost:8080/applications/api/v1/applications
      serviceId: applications_core_alt
    applications_all:
      path: /api/v1/applicationsall/**
      url: http://localhost:8080/applications/api/v1/applicationsall
      serviceId: applications_all
    applications_all_alt:
      path: /api/v1/applicationsall(**)/**
      url: http://localhost:8080/applications/api/v1/applicationsall
      serviceId: applications_all_alt
    applications_darrts:
      path: /api/v1/applicationsdarrts/**
      url: http://localhost:8080/applications/api/v1/applicationsdarrts
      serviceId: applications_darrts
    applications_darrts_alt:
      path: /api/v1/applicationsdarrts(**)/**
      url: http://localhost:8080/applications/api/v1/applicationsdarrts
      serviceId: applications_darrts_alt
    applications_searchcount:
      path: /api/v1/searchcounts/**
      url: http://localhost:8080/applications/api/v1/searchcounts
      serviceId: applications_searchcount
    applications_searchcount_alt:
      path: /api/v1/searchcounts(**)/**
      url: http://localhost:8080/applications/api/v1/searchcounts
      serviceId: applications_searchcount
    products_core:
      path: /api/v1/products/**
      url: http://localhost:8080/products/api/v1/products
      serviceId: products_core
    products_core_alt:
      path: /api/v1/products(**)/**
      url: http://localhost:8080/products/api/v1/products
      serviceId: products_core
    products_all:
      path: /api/v1/productsall/**
      url: http://localhost:8080/products/api/v1/productsall
      serviceId: products_all
    products_all_alt:
      path: /api/v1/productsall(**)/**
      url: http://localhost:8080/products/api/v1/productsall
      serviceId: products_all
    products_elist:
      path: /api/v1/productselist/**
      url: http://localhost:8080/products/api/v1/productselist
      serviceId: products_elist
    products_elist_alt:
      path: /api/v1/productselist(**)/**
      url: http://localhost:8080/products/api/v1/productselist
      serviceId: products_elist
    impurities:
      path: /api/v1/impurities/**
      url: http://localhost:8080/impurities/api/v1/impurities
      serviceId: impurities
    impurities_alt:
      path: /api/v1/impurities(**)/**
      url: http://localhost:8080/impurities/api/v1/impurities
      serviceId: impurities
    adverseeventpt:
      path: /api/v1/adverseeventpt/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
      serviceId: adverseeventpt
    adverseeventpt_alt:
      path: /api/v1/adverseeventpt(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
      serviceId: adverseeventpt
    adverseeventdme:
      path: /api/v1/adverseeventdme/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
      serviceId: adverseeventdme
    adverseeventdme_alt:
      path: /api/v1/adverseeventdme(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
      serviceId: adverseeventdme
    adverseeventcvm:
      path: /api/v1/adverseeventcvm/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
      serviceId: adverseeventcvm
    adverseeventcvm_alt:
      path: /api/v1/adverseeventcvm(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
      serviceId: adverseeventcvm
    clinical_trials_us:
      path: /api/v1/clinicaltrialsus/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us
    clinical_trials_us_alt:
      path: /api/v1/clinicaltrialsus(**)/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us
    clinical_trials_europe:
      path: /api/v1/clinicaltrialseurope/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe
    clinical_trials_europe_alt:
      path: /api/v1/clinicaltrialseurope(**)/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe
    legacy:
      path: /**
      url: http://localhost:8080/substances
     #url: forward:/substances
      serviceId: substances

#############################
#START SSG4 section
#############################
#    ssg4m_core:
#      path: /api/v1/ssg4m/**
#      url: http://localhost:8080/ssg4m
#      serviceId: ssg4m_core
    ssg4m_core:
      path: /api/v1/ssg4m/**
#      url: http://localhost:8080/ssg4m/api/v1/ssg4m
      url: http://localhost:8080/ssg4m/ssg4m
      serviceId: ssg4m_core
    ssg4m_core_alt:
      path: /api/v1/ssg4m(**)/**
#      url: http://localhost:8080/ssg4m/api/v1/ssg4m
      url: http://localhost:8080/ssg4m/ssg4m
      serviceId: ssg4m_core_alt
#############################
#END SSG4 section
#############################

  ignored-patterns:
      - "/actuator/health"
      - /substances/substances/**
      - "/substances/substances/**"

ribbon:
  eureka:
    enabled: false

#server.port: 8081
#management.endpoints.web.exposure.include: *
management.endpoints.web.exposure.include: 'routes,filters'

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    reactor.netty.http.client: DEBUG

eureka.client.enabled:  false

zuul.host.socket-timeout-millis: 300000

# This will force the proxy forwards to keep the URL encoding for characters like "+", so that the behavior
# of the microservices is the same as it is via the gateway routes
zuul.forceOriginalQueryStringEncoding: true

#zuul.ignored-headers: Access-Control-Allow-Credentials, Access-Control-Allow-Origin
```

```
nano product_application.conf
```
Put this content into this new file, make sure the <mark style="background-color: #FFFF00">URL, substanceAPI.BaseUrl or application.host</mark>, is the correct one that users will use in their browser, then save and exit: 
```
#include "substances-core.conf"
include "products-core.conf"

# need to reconsider this a bit
substanceAPI.BaseUrl="http://localhost:8080/"

#server.port=8080

ix.home= "/u01/tomcat/gsrs_products.ix"
application.host= "http://gsrs-hostname:8080"
spring.application.name="products"
#this is what it registers under eureka
eureka.instance.hostname="products"

logging.file.path=/u01/tomcat/logs/products

#turn off eureka for now
eureka.client.enabled=false
eureka.client.enable=false

gsrs.substances.molwitch.enabled=false

##################################################################
# SPRING BOOT ACTUATOR SETTINGS FOR MICROSERVICE HEALTH CHECKS  ##
##################################################################
# turn off rabbit mq check for now since we don't use it otherwise it wil say we ar down
management.health.rabbit.enabled: false

# PUT YOUR PERSONAL EXTENSIONS AND ADDITIONS HERE
#debug=true
spring.main.allow-bean-definition-overriding=true

#this is how HOCON does default values
eureka.client.serviceUrl.defaultZone= "http://localhost:8761/eureka"
eureka.client.serviceUrl.defaultZone= ${?EUREKA_SERVER}

ix.ginas.export.path=/u01/tomcat/gsrs_exports

## START AUTHENTICATION

# SSO HTTP proxy authentication settings
ix.authentication.trustheader=true
ix.authentication.usernameheader="OAM_REMOTE_USER"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"
ix.authentication.logheaders=false

# set this "false" to only allow authenticated users to see the application
ix.authentication.allownonauthenticated=false

# set this "true" to allow any user that authenticates to be registered
# as a user automatically
ix.authentication.autoregister=false

#Set this to "true" to allow autoregistered users to be active as well
ix.authentication.autoregisteractive=false

## END AUTHENTICATION


##################################################################
# DATABASE CONNECTION                                           ##
##################################################################

# Oracle Connection
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url="jdbc:oracle:thin:@//SUBSTANCE_DATABASE_SERVER:PORT/SUBSTANCE_DB_NAME"
spring.datasource.username=GSRS_CORE_SCHEMA
spring.datasource.password=***CORE_PASSWORD***

product.datasource.driver-class-name=oracle.jdbc.OracleDriver
product.datasource.url="jdbc:oracle:thin:@//SUBSTANCE_DATABASE_SERVER:PORT/SUBSTANCE_DB_NAME"
product.datasource.username=GSRS_EXTENSION_SCHEMA
product.datasource.password=***EXTENSION_PASSWORD***

product.datasource.maximumPoolSize=20 #this Oracle driver does not allow pool size of 35 or higher

spring.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect
product.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect

# !!!!! IMPORTANT, KEEP TO "none" for non-memory databases such as ORACLE, MYSQL, etc.
# Otherwise all the tables can be dropped or deleted
spring.jpa.hibernate.ddl-auto=none

eureka.client.enabled=false


##################################################################
# CONFIGURATIONS VALIDATORS, PROCESSORS, EXPORT, etc            ##
##################################################################

gsrs.validators.products = [
    {
        "validatorClass" = "gov.hhs.gsrs.products.product.validators.RequiredFieldNonNullValidator",
        "newObjClass" = "gov.hhs.gsrs.products.product.models.Product",
    }
]

gsrs.entityProcessors = [
    {
        "class" = "gov.hhs.gsrs.products.product.models.Product",
        "processor" = "gov.hhs.gsrs.products.product.processors.ProductProcessor"
    },
    {
        "class" = "gov.hhs.gsrs.products.productelist.models.ProductElist",
        "processor" = "gov.hhs.gsrs.products.productelist.processors.ProductElistProcessor"
    },
    {
        "class" = "gov.hhs.gsrs.products.productall.models.ProductMainAll",
        "processor" = "gov.hhs.gsrs.products.productall.processors.ProductAllProcessor"
    }
]

ix.ginas.export.factories.productsall = [
    "gov.hhs.gsrs.products.productall.exporters.ProductAllExporterFactory",
    "gov.hhs.gsrs.products.productall.exporters.ProductTextExporterFactory"
]

gsrs.indexers.list=[
    {
        "indexer" = "gov.hhs.gsrs.products.productall.indexers.ProductSubstanceIndexValueMaker",
        "class" = "gov.hhs.gsrs.products.productall.models.ProductMainAll"
    }
]

# Dev only: Set this to false
# This is set to true in gsrs-core.conf
gsrs.sessionSecure=false
```

**NOTE**: 	For each other service intended, a similar configuration should be used. Default/sample configuration files are located in each entity service directory with a pattern like `{service_directory}/src/main/resources/application.conf`. For example the following configuration files would be expected for impurities, adverse events and clinical trials, respectively:\

>impurities_application.conf\
>adverse-events_application.conf\
>clinical-trials_application.conf

Next, customize the substances service configuration file: 
```
nano substances_application.conf
```
Put this content into this new file, make sure the URL is the correct one that users will use in their browser, then save and exit: 
```
include "substances-core.conf"

server.tomcat.max-threads=2000

ix.home= "/u01/tomcat/ginas.ix"
application.host= "http://gsrs-hostname:8080"
spring.application.name="substances"

logging.file.path=/u01/tomcat/logs/substances

# Prevent a library imported into spring-boot from serving up a swagger page that allows cross site pages displayed indirectly
springfox.documentation.enabled=false

##################################################################
# SPRING BOOT ACTUATOR SETTINGS FOR MICROSERVICE HEALTH CHECKS  ##
##################################################################
# turn off rabbit mq check for now since we don't use it otherwise it will say we are down
management.health.rabbit.enabled: false

# PUT YOUR PERSONAL EXTENSIONS AND ADDITIONS HERE
#debug=true
spring.main.allow-bean-definition-overriding=true

#this is how HOCON does default values
#eureka.client.serviceUrl.defaultZone= "http://localhost:8761/eureka"
#eureka.client.serviceUrl.defaultZone= ${?EUREKA_SERVER}

#JChem
#ix.structure-hasher = "ix.core.chem.LychiStructureHasher"
#ix.structure-standardizer = "ix.core.chem.LychiStandardizer"

#CDK
ix.structure-hasher = "ix.core.chem.InchiStructureHasher"
ix.structure-standardizer = "ix.core.chem.InchiStandardizer"

ix.ginas.export.path=/u01/tomcat/gsrs_exports

gsrs.renderers.selected="USP"

#Updated on Apr 6th 2017 - Ravi Chavali - Resolve Name Feature
#ix.proxy.enabled=true
#ix.proxy.name=10.172.18.7
#ix.proxy.port=8080

#hibernate.format_sql=true
#hibernate.show_sql=true
#logging.level.org.hibernate.type.descriptor.sql.BasicBinder=trace
#
#spring.hibernate.show_sql=true
#logging.level.org.hibernate.type=trace
#logging.level.org.hibernate.SQL=DEBUG
#logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

## START AUTHENTICATION

# SSO HTTP proxy authentication settings
ix.authentication.trustheader=true
ix.authentication.usernameheader="OAM_REMOTE_USER"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"
ix.authentication.logheaders=false

# set this "false" to only allow authenticated users to see the application
ix.authentication.allownonauthenticated=false

# set this "true" to allow any user that authenticates to be registered
# as a user automatically
ix.authentication.autoregister=false

#Set this to "true" to allow autoregistered users to be active as well
ix.authentication.autoregisteractive=false

## END AUTHENTICATION


spring.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect

# Oracle Connection
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url="jdbc:oracle:thin:@//SUBSTANCE_DATABASE_SERVER:PORT/SUBSTANCE_DB_NAME"
spring.datasource.username=GSRS_CORE_SCHEMA
spring.datasource.password=***CORE_PASSWORD***
spring.datasource.hikari.maximum-pool-size= 500 #maximum pool size

spring.datasource.maximumPoolSize=32 #this Oracle driver does not allow pool size of 35 or higher

# Spring Boot Config
spring.jpa.hibernate.ddl-auto=none  #### THIS IS VERY IMPORTANT, OTHERWISE Hibernate will WIPE OUT our database
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

eureka.client.enabled=false

logging.level.gsrs=WARN
logging.level.ix=WARN
logging.level.gsrs.imports=TRACE
logging.level.gsrs.controller=TRACE


gsrs.entityProcessors +={
               "entityClassName" = "ix.ginas.models.v1.Substance",
               "processor" = "gsrs.module.substance.processors.UniqueCodeGenerator",
               "with"=  {
                        "useLegacy"=true,
                        "codesystem"="BDNUM",
                       "suffix"="AB",
                       "length"=9,
                       # For BDNUM of 9 chars, "max" has 7 digits, taking into account the length
                       # of the suffix.
                       # Only have "max" uncommented if useLegacy==false
                       # "max": 9999999,
                       "padding"=true
               }
        }

gsrs.entityProcessors +=
        {
        "entityClassName" = "ix.ginas.models.v1.Substance",
        "processor" = "gsrs.module.substance.processors.ApprovalIdProcessor",
        "parameters" = {
            "codeSystem" = "FDA UNII"
        }
        }

gsrs.entityProcessors+=
      {
           "entityClassName":"ix.ginas.models.v1.Substance",
           "processor":"gsrs.module.substance.processors.CodeProcessor",
           "with":{
               "class":"gsrs.module.substance.datasource.DefaultCodeSystemUrlGenerator",
               "json":{
                  "filename": "codeSystem.json"
               }
           }
      }

#added by Mitch Miller in March, 2023
gsrs.entityProcessors+={
                "entityClassName":"ix.ginas.models.v1.Substance",
                "processor":"gsrs.dataexchange.processors.CalculateMatchablesProcessor",
                "with":{
                }
}

gsrs.indexers.list += {
     "indexer" = "fda.gsrs.substance.indexers.SubstanceApplicationIndexValueMaker"
  }

gsrs.indexers.list += {
     "indexer" = "fda.gsrs.substance.indexers.SubstanceProductIndexValueMaker"
  }

gsrs.indexers.list += {
  "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalUSTrialIndexValueMaker"
}

gsrs.indexers.list += {
  "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalEuropeTrialIndexValueMaker"
}

ix.ginas.export.factories.substances = ${ix.ginas.export.factories.substances}[
       #"gsrs.module.substance.ExtraColumnsSpreadsheetExporterFactory",
       #"fda.gsrs.substance.exporters.FDANameExporterFactory",
       #"fda.gsrs.substance.exporters.FDACodeExporterFactory",
        "fda.gsrs.substance.exporters.SPLValidatorXMLExporterFactory",
       #"fda.gsrs.substance.exporters.FDARelationshipExporterFactory",
        "fda.gsrs.substance.exporters.ExcelSubstanceRelatedApplicationsExporterFactory",
        "fda.gsrs.substance.exporters.ExcelSubstanceRelatedProductsExporterFactory",
        "fda.gsrs.substance.exporters.SRSLegacyDictionaryExporterFactory",
        "fda.gsrs.substance.exporters.ExcelSubstanceRelatedClinicalTrialsUSExporterFactory",
        "fda.gsrs.substance.exporters.ExcelSubstanceRelatedClinicalTrialsEuropeExporterFactory"
]

ix.ginas.export.exporterfactories.substances +=
    {
        "exporterFactoryClass" : "fda.gsrs.substance.exporters.FDACodeExporterFactory",
        "parameters":{
         "primaryCodeSystem": "BDNUM"
        }
    }

ix.ginas.export.exporterfactories.substances +=
    {
        "exporterFactoryClass" : "fda.gsrs.substance.exporters.FDANameExporterFactory",
        "parameters":{
          "primaryCodeSystem": "BDNUM"
         }
    }

ix.ginas.export.exporterfactories.substances +=
    {
        "exporterFactoryClass" : "fda.gsrs.substance.exporters.FDARelationshipExporterFactory",
        "parameters":{
          "primaryCodeSystem": "BDNUM"
        }
    }

ix.ginas.export.sortOutput.substances=[true];

#added by Mitch in May 2023
include "import.conf"

ix.ginas.approvalIdGenerator.generatorClass=ix.ginas.utils.UNIIGenerator


gsrs.validators.substances +=
    {
        "validatorClass" = "fda.gsrs.substance.validators.BdNumModificationValidator",
        "newObjClass" = "ix.ginas.models.v1.Substance"
    }

gsrs.validators.substances +=
    {
        "validatorClass" = "ix.ginas.utils.validation.validators.CodeUniquenessValidator",
                           "newObjClass" = "ix.ginas.models.v1.Substance",
        "configClass" = "SubstanceValidatorConfig",
        "parameters"= {"singletonCodeSystems" =["BDNUM", "CAS", "FDA UNII", "PUBCHEM", "DRUG BANK", "EPA CompTox", "RS_ITEM_NUM", "STARI", "INN", "NCI_THESAURUS", "WIKIPEDIA", "EVMPD", "RXCUI", "ECHA (EC/EINECS)", "FDA ORPHAN DRUG", "EU-Orphan Drug", "NSC", "NCBI TAXONOMY", "ITIS", "ALANWOOD", "EPA PESTICIDE CODE", "CAYMAN", "USDA PLANTS", "PFAF", "MPNS", "GRIN", "DARS", "BIOLOGIC SUBSTANCE CLASSIFICATION CODE", "CERES"]}
    }

#Standardize Names in accordance with FDA rules
# Implemented by Mitch Miller
gsrs.validators.substances += {
          "validatorClass" = "ix.ginas.utils.validation.validators.StandardNameValidator",
          "newObjClass" = "ix.ginas.models.v1.Substance",
          "configClass" = "SubstanceValidatorConfig",
          "parameters"= {
             "inPlaceNameStandardizerClass":"gsrs.module.substance.standardizer.FDAMinimumNameStandardizer",
             "fullNameStandardizerClass":"gsrs.module.substance.standardizer.FDAFullNameStandardizer",
             "behaviorOnInvalidStdName": "warn"
          }
}

gsrs.validators.substances += {
         "validatorClass" = "ix.ginas.utils.validation.validators.StandardNameDuplicateValidator",
         "newObjClass" = "ix.ginas.models.v1.Substance",
          "parameters"= {
              "checkDuplicateInOtherRecord" = true,
              "checkDuplicateInSameRecord" = true,
              "onDuplicateInOtherRecordShowError" = false,
              "onDuplicateInSameRecordShowError" = false
          }
}

gsrs.validators.substances += {
    "validatorClass" = "ix.ginas.utils.validation.validators.tags.TagsValidator",
    "newObjClass" = "ix.ginas.models.v1.Substance",
    "parameters" = {
        "checkExplicitTagsExtractedFromNames": false,
        "checkExplicitTagsMissingFromNames": true,
        "addExplicitTagsExtractedFromNamesOnCreate": false,
        "addExplicitTagsExtractedFromNamesOnUpdate": false,
        "removeExplicitTagsMissingFromNamesOnCreate": false,
        "removeExplicitTagsMissingFromNamesOnUpdate": false
    }
 }

#Check for confusing references with substance images
gsrs.validators.substances +=
{
        "validatorClass" = "ix.ginas.utils.validation.validators.ImageReferenceValidator",
        "newObjClass" = "ix.ginas.models.v1.Substance",
        "configClass" = "SubstanceValidatorConfig",
        "parameters"= {
        }
}

# schedule a full dump of the data for the 3D Relationship Visualizer and for the Public Data Export
gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.ScheduledExportTaskInitializer",
        "parameters" :
        {
            "username":"admin",
            "cron":"0 9 2 * * ?", #2:09 AM every day
           #"cron":"0 0/6 * * * ?" #every 6 mins
            "autorun":false,
            "name":"Full GSRS export"
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass":"gsrs.module.substance.tasks.SplExportInitializer",
        "parameters" :
        {
            "autorun":false,
            "username":"admin",
            "outputPath": "/u01/tomcat/gsrs_exports/spl",
            "name":"SPL export",
            "cron":"0 9 3 * * ?", #3:09 AM every day
           #"cron":"0 0/5 * * * ?" #every 5 mins
        }
    }

#added by Mitch Miller on June 12, 2023
gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass":"gsrs.module.substance.tasks.SplExportInitializer",
        "parameters" :
        {
            "autorun":false,
            "username":"admin",
            "outputPath": "/u01/tomcat/gsrs_exports/spl",
            "name":"SPL export",
            "cron":"0 9 3 * * ?", #3:09 AM every day
           #"cron":"0 0/5 * * * ?" #every 5 mins
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.SQLReportScheduledTaskInitializer",
        "parameters" :
        {
            "autorun":false,
           #"cron":"0 0/2 * * * ?", #every 2 minutes
            "cron":"0 21 5 ? * FRI", #5:21 AM every Friday
            "sql":"""select n.UUID NAME_ID,
                            n.OWNER_UUID,
                            n.type,
                            NVL(DBMS_LOB.SUBSTR (n.full_name, 4000, 1), n.name) as NAME,
                            decode(n.record_access, null, 'Public', 'Private') as "Public or Private",
                            nvl(concept_data.substance_class, 'parent/substance') as "This is a",
                            nvl(concept_data.parent_UNII, s.approval_id) as UNII,
                            c.code as BDNUM,
                            dt.name as display_term,
                            concept_data.parent_BDNUM,
                            concept_data.parent_display_term
                       from ix_ginas_name n
                            INNER JOIN ix_ginas_substance s ON n.OWNER_UUID = s.UUID
                            INNER JOIN ix_ginas_code c ON c.OWNER_UUID = s.UUID and c.code_system = 'BDNUM'
                            inner join ix_ginas_name dt on dt.owner_uuid = s.uuid and dt.display_name = 1
                            LEFT JOIN (
                                select ref.refuuid substance_uuid,
                                   s.approval_id as parent_UNII,
                                   code.code as parent_BDNUM,
                                   nm.name as parent_display_term,
                                   'sub-concept' as substance_class
                                 from ix_ginas_substanceref ref
                                   inner join ix_ginas_relationship rel on rel.related_substance_uuid=ref.uuid
                                   inner join ix_ginas_substance s on s.uuid = rel.owner_uuid
                                   INNER JOIN ix_ginas_code code ON code.OWNER_UUID = s.UUID 
                                              and code.code_system = 'BDNUM' and code.type = 'PRIMARY'
                                   inner join ix_ginas_name nm on nm.owner_uuid = s.uuid and nm.display_name = 1
                                 where rel.type = 'SUB_CONCEPT->SUBSTANCE'
                              ) concept_data on concept_data.substance_uuid = n.owner_uuid
                      where regexp_like(n.name,'[^ -'||chr(126)||']')
                      order by NAME""",
            "name":"Names With Non-ASCII Characters",
            "outputPath":"/u01/tomcat/gsrs_exports/WeeklyGSRSreports/NamesWithNonASCIIcharacters-%DATE%_%TIME%.txt"
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.SQLReportScheduledTaskInitializer",
        "parameters" :
        {
            "autorun":false,
           #"cron":"0 0/2 * * * ?", #every 2 minutes
            "cron":"0 21 5 ? * FRI", #5:21 AM every Friday
            "sql":"""select n.UUID NAME_ID,
                            n.OWNER_UUID,
                            n.type,
                            NVL(DBMS_LOB.SUBSTR (n.full_name, 4000, 1), n.name) as NAME,
                            decode(n.record_access, null, 'Public', 'Private') as "Public or Private",
                            nvl(concept_data.substance_class, 'parent/substance') as "This is a",
                            nvl(concept_data.parent_UNII, s.approval_id) as UNII,
                            c.code as BDNUM,
                            dt.name as display_term,
                            concept_data.parent_BDNUM,
                            concept_data.parent_display_term
                       from ix_ginas_name n
                            INNER JOIN ix_ginas_substance s ON n.OWNER_UUID = s.UUID
                            INNER JOIN ix_ginas_code c ON c.OWNER_UUID = s.UUID and c.code_system = 'BDNUM'
                            inner join ix_ginas_name dt on dt.owner_uuid = s.uuid and dt.display_name = 1
                            LEFT JOIN (
                                select ref.refuuid substance_uuid,
                                   s.approval_id as parent_UNII,
                                   code.code as parent_BDNUM,
                                   nm.name as parent_display_term,
                                   'sub-concept' as substance_class
                                 from ix_ginas_substanceref ref
                                   inner join ix_ginas_relationship rel on rel.related_substance_uuid=ref.uuid
                                   inner join ix_ginas_substance s on s.uuid = rel.owner_uuid
                                   INNER JOIN ix_ginas_code code ON code.OWNER_UUID = s.UUID and code.code_system = 'BDNUM' and code.type = 'PRIMARY'
                                   inner join ix_ginas_name nm on nm.owner_uuid = s.uuid and nm.display_name = 1
                                 where rel.type = 'SUB_CONCEPT->SUBSTANCE'
                              ) concept_data on concept_data.substance_uuid = n.owner_uuid
                      order by NAME""",
            "name":"All Names Report",
            "outputPath":"/u01/tomcat/gsrs_exports/WeeklyGSRSreports/AllNamesReport-%DATE%_%TIME%.txt"
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.ScheduledExportTaskInitializer",
        "parameters" :
        {
            "username":"admin",
            "cron":"0 9 2 * * ?", #2:09 AM every day
           #"cron":"0 0/6 * * * ?" #every 6 mins
            "autorun":false,
            "name":"Full GSRS export"
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass":"gsrs.module.substance.tasks.SplExportInitializer",
        "parameters" :
        {
            "autorun":false,
            "username":"admin",
            "outputPath": "/u01/tomcat/gsrs_exports/spl",
            "name":"SPL export",
            "cron":"0 9 3 * * ?", #3:09 AM every day
           #"cron":"0 0/5 * * * ?" #every 5 mins
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass":"gsrs.module.substance.tasks.SQLReportScheduledTaskInitializer",
        "parameters" : {
            "autorun":false,
           #"cron":"0 0/2 * * * ?", #every 2 minutes
            "cron":"0 11 5 ? * WED", #5:11 AM every Wednesday
            "sql":"""select c.UUID CODE_UUID,
                            c.OWNER_UUID,
                            b.CODE BDNUM,
                            c.CODE_SYSTEM,
                            c.CODE,
                            c.TYPE,
                            dbms_lob.substr(c.url, 3999, 1) URL,
                            dbms_lob.substr(c.comments, 3999, 1) COMMENTS,
                            dn.name as preferred_name
                       FROM ix_ginas_code c
                            INNER JOIN ix_ginas_code b ON b.OWNER_UUID = c.OWNER_UUID and b.code_system = 'BDNUM'
                            INNER JOIN ix_ginas_name dn on dn.owner_uuid = c.OWNER_UUID and dn.display_name = 1
                      WHERE c.CODE_SYSTEM <> 'BDNUM'
                      ORDER BY b.CODE, c.CODE_SYSTEM""",
            "name":"All Codes Report",
            "outputPath":"/u01/tomcat/gsrs_exports/AllCodesReport-%DATE%_%TIME%.txt",
#            "dataSourceQualifier":"defaultDataSource",
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.SQLReportScheduledTaskInitializer",
        "parameters" :
        {
            "autorun":false,
           #"cron":"0 0/20 * * * ?", #every 20 minutes
            "cron":"0 20 4 ? 1/3 MON#1 *", #First Monday of every third month, at 4:20 AM
            "sql":"""select a.center,
                            a.app_type, a.app_number,
                            a.app_sub_type,
                            replace(replace(replace(pn.product_name, chr(10), ' '), chr(13), ' '), chr(9), ' ') product_name,
                            a.sponsor_name,
                            a.status,
                            replace(replace(replace(a.application_title, chr(10), ' '), chr(13), ' '), chr(9), ' ') application_title,
                            t.bdnum as Active_Ingredient_BDNUM,
                            n.name as Active_Ingredient_Name,
                            n.name active_ingredient_display_name,
                            sr.refuuid as ACTIVE_MOIETY_UUID,
                            sr.approval_id as ACTIVE_MOIETY_UNII,
                            sr.ref_pname as ACTIVE_MOIETY_Display_name,
                            amb.code as Active_Moiety_BDNUM,
                            a.application_id, p.product_id, t.application_type_id,
                            pn.id as product_name_id
                       from srscid.srscid_application_srs a
                            inner join srscid.srscid_product_srs p on p.application_id = a.application_id
                            inner join srscid.srscid_application_type_srs t on t.product_id = p.product_id and t.ingredient_type = 'Active Ingredient'
                            left outer join gsrs_prod.ix_ginas_code b on b.code = t.bdnum and b.code_system = 'BDNUM'
                            left outer join gsrs_prod.ix_ginas_name n on n.owner_uuid = b.owner_uuid and n.display_name = 1
                            left outer join srscid.srscid_product_name_srs pn on pn.product_id = p.product_id
                            left outer join gsrs_prod.ix_ginas_relationship r on r.owner_uuid = b.owner_uuid and r.type = 'ACTIVE MOIETY'
                            left outer join gsrs_prod.ix_ginas_substanceref sr on sr.uuid = r.related_substance_uuid
                            left outer join gsrs_prod.ix_ginas_code amb on amb.owner_uuid = sr.refuuid and amb.code_system = 'BDNUM'
                      where a.app_type = 'IND'
                        and a.center = 'CDER'
                      order by bdnum asc nulls last, product_name nulls last""",
            "name":"CDER INDs Active Ingredient and Active Moiety mappings",
            "outputPath":"/u01/tomcat/gsrs_exports/admin/CDER-INDs-Active-Ingredient-and-Active-Moiety-mappings-%DATE%_%TIME%.txt"
        }
    }

gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.dataexchange.tasks.ImportMetadataReindexTask",
        "parameters" : {
            "autorun": false
        }
    }

admin.panel.download.path="/u01/tomcat/"

# NEED THESE for Applications-api and Products-api
gsrs.microservice.applications.api.baseURL = "http://localhost:8080"
gsrs.microservice.applications.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="gtZIutM77L6NFWaozDES"
}

gsrs.microservice.products.api.baseURL = "http://localhost:8080"
gsrs.microservice.products.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="gtZIutM77L6NFWaozDES"
}

gsrs.microservice.clinicaltrialsus.api.baseURL="http://localhost:8080"
gsrs.microservice.clinicaltrialsus.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="gtZIutM77L6NFWaozDES"
}

gsrs.microservice.clinicaltrialseurope.api.baseURL="http://localhost:8080"
gsrs.microservice.clinicaltrialseurope.api.headers= {
                       "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                       "auth-key"="gtZIutM77L6NFWaozDES"
}

# Dev only: Set this to false
# This is set to true in gsrs-core.conf
gsrs.sessions.sessionCookieSecure=false
```

NOTE: 	The substances module’s configuration example shown above explicitly sets up some FDA-specific validation rules, code generation, indexing settings, and microservice connections. Some of these settings may not be applicable (or even possible) with another deployment environment. The use of UNIIGenerator, BDNUM, “FDA UNII”, custom exporters, application and product apis, and several of the special IndexValueMakers, in particular, must be disabled or commented out. 

```
nano substances_codeSystem.json 
```
paste into it the contents of this file from another production instance of GSRS (e.g. from FDA) \
… then save it and exit the editor 

A sample substances_codeSystem.json is shown below: 
```
[
    {"codeSystem":"JMPR-PESTICIDE RESIDUE","url":"http://www.codexalimentarius.net/pestres/data/pesticides/details.html?id=$CODE$"},
    {"codeSystem":"CODEX ALIMENTARIUS (GSFA)","url":"http://www.fao.org/gsfaonline/additives/details.html?id=$CODE$"},
    {"codeSystem":"Food Contact Substance Notif, (FCN No.)","url":"http://www.accessdata.fda.gov/scripts/fcn/fcnDetailNavigation.cfm?rpt=fcslisting&id=$CODE$"},
    {"codeSystem":"JECFA EVALUATION","url":"http://apps.who.int/food-additives-contaminants-jecfa-database/chemical.aspx?chemINS=$CODE$"},
    {"codeSystem":"IUPHAR","url":"http://www.guidetopharmacology.org/GRAC/LigandDisplayForward?ligandId=$CODE$"},
    {"codeSystem":"ALANWOOD","url":"http://www.alanwood.net/pesticides/$CODE$"},
    {"codeSystem":"MERCK INDEX","url":"https://merckindex.rsc.org/monographs/$CODE$"},
    {"codeSystem":"INN","url":"https://extranet.who.int/soinn/mod/page/view.php?id=137&inn_n=$CODE$"},
    {"codeSystem":"GRIN","url":"https://npgsweb.ars-grin.gov/gringlobal/taxon/taxonomydetail?id=$CODE$"},
    {"codeSystem":"DEA NO.","url":"http://forendex.southernforensic.org/index.php/detail/index/$CODE$"},
    {"codeSystem":"DRUG BANK","url":"http://www.drugbank.ca/drugs/$CODE$"},
    {"codeSystem":"PHAROS","url":"https://pharos.nih.gov/idg/targets/$CODE$"},
    {"codeSystem":"STARI","url":"https://cfsanappsinternal.fda.gov/scripts/stari/?action=main.detail&id=$CODE$"},
    {"codeSystem":"PFAF","url":"http://www.pfaf.org/user/Plant.aspx?LatinName=$CODE$"},
    {"codeSystem":"CAS","url":"https://commonchemistry.cas.org/detail?cas_rn=$CODE$"},
    {"codeSystem":"ChEMBL","url":"https://www.ebi.ac.uk/chembl/compound/inspect/$CODE$"},
    {"codeSystem":"NDF-RT","url":"https://nciterms.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=VA_NDFRT&code=$CODE$"},
    {"codeSystem":"RXCUI","url":"https://rxnav.nlm.nih.gov/REST/rxcui/$CODE$/allProperties.xml?prop=all"},
    {"codeSystem":"WHO-ATC","url":"http://www.whocc.no/atc_ddd_index/?code=$CODE$&showdescription=yes"},
    {"codeSystem":"CLINICAL_TRIALS.GOV","url":"https://clinicaltrials.gov/ct2/show/$CODE$"},
    {"codeSystem":"ITIS","url":"https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=$CODE$"},
    {"codeSystem":"NCBI TAXONOMY","url":"https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=$CODE$"},
    {"codeSystem":"USDA PLANTS","url":"https://plants.sc.egov.usda.gov/home/plantProfile?symbol=$CODE$"},
    {"codeSystem":"PUBCHEM","url":"https://pubchem.ncbi.nlm.nih.gov/compound/$CODE$"},
    {"codeSystem":"CFR","url":"https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfCFR/CFRSearch.cfm?fr=$CODE$"},
    {"codeSystem":"NCI_THESAURUS","url":"https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI%20Thesaurus&code=$CODE$"},
    {"codeSystem":"MESH","url":"https://www.ncbi.nlm.nih.gov/mesh/$CODE$"},
    {"codeSystem":"UNIPROT","url":"http://www.uniprot.org/uniprot/$CODE$"},
    {"codeSystem":"RS_ITEM_NUM","url":"https://store.usp.org/product/$CODE$"},
    {"codeSystem":"USAN","url":"https://searchusan.ama-assn.org/finder/usan/search/$CODE$/relevant/1/"},
    {"codeSystem":"NSC","url":"https://dtp.cancer.gov/dtpstandard/servlet/dwindex?searchtype=NSC&outputformat=html&searchlist=$CODE$"},
    {"codeSystem":"EPA CompTox","url":"https://comptox.epa.gov/dashboard/chemical/details/$CODE$"},
    {"codeSystem":"DailyMed","url":"https://dailymed.nlm.nih.gov/dailymed/search.cfm?adv=1&query=($CODE$)"},
    {"codeSystem":"Catalogue of Life","url":"https://www.catalogueoflife.org/data/taxon/$CODE$"}
]
```

Transfer the latest User Manual (PDF) and Data Dictionary (XSLX) files and put them at <span style="color:red">$config_dir </span>
Give them these filenames: 
```
	docs_FDA_GSRS_User_Manual.pdf
	docs_GSRS_data_dictionary_11-20-19.xlsx
```
Once you have written or customized your own user manual, it is recommended that you give your file a name that doesn’t include the string “FDA” unless you are deploying anew instance of GSRS for FDA. \
On every host <u>other than</u> the Dev build host, 
```
nano $config_dir/configureGSRS.sh
```
Put this content into this new file: 
```
#!/bin/bash

echo "shutting down tomcat"
sudo service tomcat stop
sleep 5

rm -rf $CATALINA_HOME/logs/catalina.out
bash ${config_dir}/clear_cache_lock.sh

chmod a+r ${webapps}/*.war
chown tomcat:tomcat ${webapps}/*.war

if [ "$1" == "" ] || [ $# -gt 1 ];
then
   echo "....................................... Configuring without unzipping ............................................"
elif [ "$1" == "unzip" ]
then
   cd ${webapps}
   echo "............................................... Unzipping war files .............................................."
   rm -R -- */
   ls |sed 's/.war$//g' | awk '{print "unzip "$1".war -d ./"$1}'|bash
   chown -R tomcat:tomcat ${webapps}
   echo "................................................... Configuring .................................................."
else
   echo "....................................... Configuring without unzipping ............................................"
fi

# Entity config files: substances
\cp -rf ${config_dir}/substances_application.conf ${webapps}/substances/WEB-INF/classes/application.conf
chmod a+r ${webapps}/substances/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/application.conf

\cp -rf ${config_dir}/substances_import.conf ${webapps}/substances/WEB-INF/classes/import.conf
chmod a+r ${webapps}/substances/WEB-INF/classes/import.conf
chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/import.conf

\cp -rf ${config_dir}/substances_codeSystem.json ${webapps}/substances/WEB-INF/classes/codeSystem.json
chmod a+r ${webapps}/substances/WEB-INF/classes/codeSystem.json
chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/codeSystem.json

# Entity config files: frontend
\cp -rf ${config_dir}/frontend_config.json ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

# frontend index.html
##old##\cp -rf ${config_dir}/frontend_index.html ${webapps}/frontend/WEB-INF/classes/static/index.html
INDEX_PATH_INPUT="${webapps}/frontend/WEB-INF/classes/static/index.html"
INDEX_PATH_OUTPUT="${webapps}/frontend/WEB-INF/classes/static/index-fixed.html"
INSERT_PATH="./insert.html"
INDEX_VAR=`cat $INDEX_PATH_INPUT|grep -v "alert"`
INSERT_VAR=`cat $INSERT_PATH`
INDEX_VAR_HEAD=`echo "$INDEX_VAR" |tr '\n' '~'|sed 's/[<]body[>]/<body>\n/g'|head -n 1|tr '~' '\n'`
INDEX_VAR_TAIL=`echo "$INDEX_VAR" |tr '\n' '~'|sed 's/[<]body[>]/<body>\n/g'|tail -n 1|tr '~' '\n'`
echo "$INDEX_VAR_HEAD" > $INDEX_PATH_OUTPUT
echo "$INSERT_VAR" >> $INDEX_PATH_OUTPUT
echo "$INDEX_VAR_TAIL" >> $INDEX_PATH_OUTPUT
rm -rf $INDEX_PATH_INPUT
mv $INDEX_PATH_OUTPUT $INDEX_PATH_INPUT
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/index.html
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/index.html

# Entity config files: gateway (Tomcat ROOT)
\cp -rf ${config_dir}/gateway_application.yml ${webapps}/ROOT/WEB-INF/classes/application.yml
chmod a+r ${webapps}/ROOT/WEB-INF/classes/application.yml
chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/application.yml

# Entity config files: applications
\cp -rf ${config_dir}/application_application.conf ${webapps}/applications/WEB-INF/classes/application.conf
chmod a+r ${webapps}/applications/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/applications/WEB-INF/classes/application.conf

# Entity config files: products
\cp -rf ${config_dir}/product_application.conf ${webapps}/products/WEB-INF/classes/application.conf
chmod a+r ${webapps}/products/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/products/WEB-INF/classes/application.conf

# Entity config files: impurities
\cp -rf ${config_dir}/impurities_application.conf ${webapps}/impurities/WEB-INF/classes/application.conf
chmod a+r ${webapps}/impurities/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/impurities/WEB-INF/classes/application.conf

# Entity config files: adverse events
\cp -rf ${config_dir}/adverse-events_application.conf ${webapps}/adverse-events/WEB-INF/classes/application.conf
chmod a+r ${webapps}/adverse-events/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/adverse-events/WEB-INF/classes/application.conf

# Entity config files: clinical trials
\cp -rf ${config_dir}/clinical-trials_application.conf ${webapps}/clinical-trials/WEB-INF/classes/application.conf
chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/application.conf

# Entity config files: ssg4m
\cp -rf ${config_dir}/ssg4m_application.conf ${webapps}/ssg4m/WEB-INF/classes/application.conf
chmod a+r ${webapps}/ssg4m/WEB-INF/classes/application.conf
chown tomcat:tomcat ${webapps}/ssg4m/WEB-INF/classes/application.conf

# if it does not already exist, create the documentation subdir under tomcat/webapps
mkdir -p ${webapps}/frontend/WEB-INF/classes/static/assets/documentation
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation

# Documentation: GSRS Data Dictionary
\cp -rf ${config_dir}/docs_GSRS_data_dictionary_11-20-19.xlsx ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/GSRS_data_dictionary_11-20-19.xlsx

# Documentation: GSRS User Manual
\cp -rf ${config_dir}/docs_FDA_GSRS_User_Manual.pdf ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
chmod a+r ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf
chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/documentation/FDA_GSRS_User_Manual.pdf

sleep 8
sudo service tomcat start

sleep 8
date
echo "curling vocabs"
curl -H "auth-username: admin" -H "auth-password: prodadmin96083" "http://localhost:8080/api/v1/vocabularies/@count"
echo
date
echo
```
## Launch GSRS v3.0 on your host

On the Dev build host <u>only</u>, 
>cd $workspace/gsrs3-main-deployment/ \
>./configureGSRS.sh

On every host <u>other than</u> the Dev build host, \
>cd $config_dir \
>./configureGSRS.sh

## Create a specialized user account to allow microservices to communicate with each other 
Use a web browser to access the GSRS instance’s UI 
Since this will likely be your first time launching GSRS on this host, there is a chance that it may throw one or more errors. View the log files under **$tomcat/logs/** to troubleshoot it. \

Use the GSRS main menu to go to the Admin Panel \
Select the [User Management] tab \
Click “Add User” \
Create user GSRS_QUERY_SERVICE_ACCOUNT \
>Set its password to <SOME_PASSWORD> \
>Check the Active and Query and boxes \
>Click [Add] to create the new user account 

On the Linux console for the instance, run this command: 
```
curl -H 'auth-username: GSRS_QUERY_SERVICE_ACCOUNT' -H 'auth-password: <SOME_PASSWORD>' "http://localhost:8080/api/v1/profile/@keygen"
```
take the auth key from the JSON output, and use it in the gsrs.microservice.substances.api.headers entries within the various application.conf files for this particular instance (at xxxxxxxxxxxxxxx below) 

Make sure that this entry exists in the Clinical Trials microservice’s application.conf file at $config_dir:
```
# NEED THIS for the CT microservice to access the Substances microservice
gsrs.microservice.substances.api.baseURL="http://localhost:8080/"
gsrs.microservice.substances.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="xxxxxxxxxxxxxxx"
}
```
Make sure that this entry exists in the Substances microservice’s application.conf file at $config_dir:
```
# NEED THESE for Applications-api and Products-api
gsrs.microservice.applications.api.baseURL = "http://localhost:8080"
gsrs.microservice.applications.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="xxxxxxxxxxxxxxx"
}
gsrs.microservice.products.api.baseURL = "http://localhost:8080"
gsrs.microservice.products.api.headers= {
                        "auth-username" ="GSRS_QUERY_SERVICE_ACCOUNT",
                        "auth-key"="xxxxxxxxxxxxxxx"
}
```
Deploy the config files and restart the GSRS (Tomcat) instance: 
```
$config_dir/configureGSRS.sh
```


## Indexing and Reindexing of Data 
GSRS uses Lucene and other indexing technologogies to support its search and facet functionalities. These technologies require local storage of index files outside of the database(s). It is sometimes necessary to re-build these indexes following bulk database updates, or file loss, of implementation of new indexing features, or for other synchronization purposes. \
This section describes how to make Unix bash scripts that can be used to manually trigger the GSRS REST API for each microservice to reindex its entities from the database. \
These bash scripts can be run ad-hoc or as part of a cron-scheduled procedure on the application host.

```
Do not use this manual indexing mechanism for Substance data. GSRS offers a UI interface to do this under its admin panel’s Scheduled Tasks tab 
```

```
cd $tomcat 
nano index-adverse-events.sh
```
Put this content into this new file, then save and exit: 

```
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/adverseeventpt/@reindex?wipeIndex=true" & disown
sleep 10
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/adverseeventdme/@reindex" & disown
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/adverseeventcvm/@reindex" & disown
```

```
nano index-applications.sh
```

Put this content into this new file, then save and exit: 
```
date >> /u01/tomcat/application-indexing-times.log
echo Partial/Bulk Application indexing launched at:
date

#Change these sections with the appropriate entities,
#api URL and auth information

entity="applications"
api_url="http://localhost:8080/api/v1"
auth_key="auth-password: __admin__"      #this can be a password or token instead if desired
auth_username="auth-username: admin"

pageSize=18000


echo "Beginning selective reindexing of $entity"
echo "Step 1: Gathering the set of database IDs for $entity"
echo "====================================================="


rm -rf ALL_APPS.txt

tot=`curl -k "$api_url/$entity/@count" \
          -H "$auth_key" \
          -H "$auth_username" \
          --compressed`
echo "Total number of $entity: $tot"

big=$((tot/pageSize + 1))
echo "Total number of pages for the API: $big"
dbTotal=0


while  [ $((tot-dbTotal)) -gt 0 ]
do
        for (( i=0; i<=$big; i++ ))
        do
                        skip=$((i*pageSize))
                        echo "Fetching page $i of $big"
                        echo "$api_url/$entity/?view=key&top=$pageSize&skip=$skip"
                        curl -k "$api_url/$entity/?view=key&top=$pageSize&skip=$skip" \
                          -H "$auth_key" \
                          -H "$auth_username" \
                          --compressed | tr ',' '\n'|grep idString|sed 's/.*://g'|sed 's/[^0-9a-f\-]//g' >> ALL_APPS.txt
        done
        cat ALL_APPS.txt|sort|uniq > ALL_APPS.sorted.txt
        mv ALL_APPS.sorted.txt ALL_APPS.txt
        dbTotal=`cat ALL_APPS.txt|wc -l`
        echo "Total number of $entity IDs fetched from the database: $dbTotal of $tot"
        if [ $((tot-dbTotal)) -gt 0 ]; then
                echo "Some $entity records are missing, trying again"
        fi
done


echo "Step 2: Gathering the set of indexed IDs for $entity"
echo "====================================================="

rm -rf ALL_APPS_INDEXED.txt
for (( i=0; i<=$big; i++ ))
do
        skip=$((i*pageSize))
        echo "Fetching page $i of $big"
        echo "$api_url/$entity/search?simpleSearchOnly=true&view=key&top=$pageSize&skip=$skip"
        curl -k "$api_url/$entity/search?simpleSearchOnly=true&view=key&top=$pageSize&skip=$skip" \
          -H "$auth_key" \
          -H "$auth_username" \
          --compressed | tr ',' '\n'|grep idString|sed 's/.*://g'|sed 's/[^0-9a-f\-]//g' >> ALL_APPS_INDEXED.txt
done
indexTotal=`cat ALL_APPS_INDEXED.txt|wc -l`
echo "Total number of $entity IDs fetched from the index: $indexTotal of $tot"


echo "Step 3: Compare the two lists of IDs"
echo "====================================================="
cat ALL_APPS.txt ALL_APPS_INDEXED.txt |sort|uniq -c > MATCH_REPORT.txt
doubleIndexed=`cat MATCH_REPORT.txt|grep -v " 2 "|grep -v " 1 "| wc -l`
nonIndexed=`cat MATCH_REPORT.txt|grep " 1 "| wc -l`
echo "Total number of DUPLICATE indexed applications: $doubleIndexed"
echo "Total number of NOT indexed applications: $nonIndexed"
cat MATCH_REPORT.txt|grep -v " 2 "|sed 's/^[ ]*[0-9]*[ ]//g' > BAD_INDEX.txt
reindexCount=`cat BAD_INDEX.txt|wc -l`
echo "Total number of $entity to be reindexed: $reindexCount"

echo "Step 4: Start bulk reindex for set needing reindexing"
echo "====================================================="

if [ $((reindexCount)) -gt 0 ]; then
        curl -k "$api_url/$entity/@reindexBulk" \
                  -H "$auth_key" \
                  -H "$auth_username" \
          -H 'Content-Type: text/plain;charset=UTF-8' \
          --data-binary @BAD_INDEX.txt \
          --compressed > BULK_API_RESPONSE.txt

        statusID=`cat BULK_API_RESPONSE.txt|sed 's/,/\n/g'|grep "statusID"|awk -F\: '{print $2}'| sed 's/[^0-9a-f\-]//g'`
        echo "Job submitted with statusID: $statusID"
        echo "***the process can be monitored using the statusID above via the API***"
else
        echo "***$entity is already indexed completely***"
fi
```

```
nano index-clinical-trials.sh
```
Put this content into this new file, then save and exit: 

```
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/clinicaltrialsus/@reindex?wipeIndex=true" & disown
sleep 10
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/clinicaltrialseurope/@reindex" & disown
```
```
nano index-products.sh
```
Put this content into this new file, then save and exit: 
```
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/productsall/@reindex?wipeIndex=true" & disown
sleep 10
curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i "http://localhost:8080/api/v1/products/@reindex" & disown
```
```
nano count-applications.sh
```
Put this content into this new file, then save and exit: 
```
export APP_ALL_COUNT=`curl -s -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/@count"`
export APP_INDEXED_COUNT=`curl -s -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/search?simpleSearchOnly=true&view=key" | sed 's/.*total..//g'|sed 's/[,].*//g'` > /dev/null
echo "Applications indexed so far: ${APP_INDEXED_COUNT} out of ${APP_ALL_COUNT}"
```
```
nano count-products.sh
```
Put this content into this new file, then save and exit: 
```
export PROD_ALL_COUNT=`curl -s -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/productsall/@count"`
export PROD_INDEXED_COUNT=`curl -s -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/productsall/search?simpleSearchOnly=true&view=key" | sed 's/.*total..//g'|sed 's/[,].*//g'`
echo "Products indexed so far: ${PROD_INDEXED_COUNT} out of ${PROD_ALL_COUNT}"
```
```
chown tomcat:tomcat *.sh 
chmod a+rx *.sh 
```

## Verify the GSRS Deployment 
Use the following commands on your Linux console to verify that GSRS and its various parts are running as expected. The <span style="color:red">\_\_admin\_\_</span> string ought to be replaced with the actual password of the main <span style="color:red">admin</span> user registered in your GSRS database. \
```
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/substances/actuator/health

curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/ginas/app/substances/api/v1/whoami

curl localhost:8080/frontend/ginas/app/beta/index.html

curl localhost:8080/ginas/app/beta/index.html

## – direct
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/substances/api/v1/vocabularies/@count   

## – through gateway reroute 
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/vocabularies/@count 

curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/vocabularies/search

curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/substances/@count
```
These two should return the same count:
```
curl -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/@count"

curl -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/search?simpleSearchOnly=true&view=key" | sed 's/.*total..//g'|sed 's/[,].*//g'
```

Here’s a practical way to confirm this: 
```
export APP_ALL_COUNT=`curl -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/@count"`
export APP_INDEXED_COUNT=`curl -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/applicationsall/search?simpleSearchOnly=true&view=key" | sed 's/.*total..//g'|sed 's/[,].*//g'`
echo "Applications indexed so far: ${APP_INDEXED_COUNT} out of ${APP_ALL_COUNT}"
```

```
## -– direct 
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/impurities/api/v1/impurities/@count 
## – through gateway reroute
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/impurities/@count  

curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/impurities/search 
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/products/api/v1/productsall/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080//api/v1/applications/@count
curl -H "auth-username: admin" -H "auth-password: __admin__"  http://localhost:8080/api/v1/productsall/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/api/v1/adverseeventcvm/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/api/v1/adverseeventdme/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/api/v1/adverseeventpt/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/api/v1/clinicaltrialsus/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/api/v1/clinicaltrialseurope/@count
curl -H "auth-username: admin" -H "auth-password: __admin__" http://localhost:8080/products/api/v1/product/30
curl http://localhost:8080/api/v1/product/30
curl http://localhost:8080/api/v1/productselist/7ad4edc6-6775-4f02-b77c-ef56dc68eca1
curl http://localhost:8080/products/api/v1/productelist/7ad4edc6-6775-4f02-b77c-ef56dc68eca1

## – counts substances in the database
curl localhost:8080/api/v1/substances/@count  
curl -H "auth-username: admin" -H "auth-password: __admin__" localhost:8080/api/v1/substances/search

## – counts substances in the index
curl -H "auth-username: admin" -H "auth-password: __admin__" "http://localhost:8080/api/v1/substances/search?fdim=0&top=1"|sed 's/.*total..//g'|sed 's/[,].*/\n/g'  

curl -X POST -H "auth-username: admin" -H "auth-password: __admin__" -i http://localhost:8080/api/v1/substances(a05ec20c-8fe2-4e02-ba7f-df69e5e30248)/@hierarchy
```

If these do work, open a browser window and browse to \
http://gsrs-hostname:8080/ginas/app/beta  

then to these addresses as well: \
http://gsrs-hostname:8080/frontend/actuator/health \
http://gsrs-hostname:8080/actuator/health \
http://gsrs-hostname:8080/substances/actuator/health \
http://gsrs-hostname:8080/ginas/app/substances/api/v1/whoami  \
http://gsrs-hostname:8080/api/v1/applicationsall/search?q=entity_link_substances:* \
http://gsrs-hostname:8080/api/v1/productsall/search?q=entity_link_substances:* 


