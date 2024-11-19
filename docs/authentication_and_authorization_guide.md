This document provides information on how authentication works with SSO
for GSRS system.

## Typical Authentication Framework
GSRS has a default built-in username/password authentication system. It
is mostly used during development. For production systems, most
organizations choose to use their own authentication services instead.
The default GSRS default authentication can be set to be bypassed in
production environments. The picture below shows a typical
authentication framework to use SSO for authentication.

<div align="center">
<img src="https://github.com/ncats/gsrs-ci/blob/gsrs-example-deployment/docs/images/auth_image1.png" alt="Diagram Description automatically generated" width=85% />
</div>
<div align="center">
Figure 1: Authentication Structure
</div>

## Settings to Bypass GSRS Username/Password Authentication

To bypass the default GSRS password authentication, some configs need to
be set in the GSRS config file.  
These settings instruct GSRS to trust headers coming from the proxy and
set the header names that will contain the username and email for a
given user.  

```
## START AUTHENTICATION  
# SSO HTTP proxy authentication settings  
ix.authentication.trustheader=true  
ix.authentication.usernameheader = ${?AUTH\_USERNAME}  
ix.authentication.useremailheader = ${?AUTH\_EMAIL}  
# set this "false" to only allow authenticated users to see the
application  
ix.authentication.allownonauthenticated=false  
# set this "true" to allow any user that authenticates to be registered
as a user automatically  
ix.authentication.autoregister=false  
#Set this to "true" to allow autoregistered users to be active as
well  
ix.authentication.autoregisteractive=false  
## END AUTHENTICATION  
ix.authentication.trustheader=true  
ix.authentication.autoregister=true  
If the above are true, then the user with the username and email are
passed to GSRS. If the user does not exist, then it will be created and
assigned a password and key. By hitting the whoami endpoint the person
can get their key to interact with the API.
```

## An Example SSO Setup in Deployment Environment 

It uses Oracle server as the reverse proxy.

First, log on as root

----------------------------------------------------------------

edit the file

/etc/security/limits.conf

add these lines (including asterisks) to the end of it
```

\* soft nofile 4096

\* hard nofile 65536

\* soft nproc 2047

\* hard nproc 16384
```
----------------------------------------------------------------

The remainder of these instructions is inspired (though not copied
verbatim) from:

https://oracle-base.com/articles/12c/oracle-http-server-ohs-installation-on-oracle-linux-6-and-7-1221

----------------------------------------------------------------
```
yum install binutils -y

yum install gcc -y

yum install gcc-c++ -y

yum install glibc -y

yum install glibc.i686 -y

yum install glibc-devel -y

yum install libaio -y

yum install libaio-devel -y

yum install libgcc -y

yum install libgcc.i686 -y

yum install libstdc++ -y

yum install libstdc++.i686 -y

yum install libstdc++-devel -y

yum install ksh -y

yum install make -y

yum install sysstat -y

yum install numactl -y

yum install numactl-devel -y

yum install motif -y

yum install motif-devel -y
```
----------------------------------------------------------------
```
groupadd -g 54321 oinstall

useradd -u 54321 -g oinstall orafda

usermod -a -G oinstall orafda

passwd XXXXXX
```
----------------------------------------------------------------
```
chmod a+rw /u01
```
----------------------------------------------------------------

\# IMPORTANT

\#

\# IMPORTANT

\#

\# Now log on as orafda

\# IMPORTANT

\#

```
su orafda
```
----------------------------------------------------------------
```
mkdir -p /u01/app/oracle/product/12.2.1.4/ohs_1

mkdir -p /u01/app/oracle/product/8/jdk_1

mkdir -p /u01/app/oracle/config/domains

mkdir -p /u01/app/oracle/config/applications

chown -R orafda:oinstall /u01/app/oracle

chmod -R 775 /u01/app/oracle

mkdir -p /u01/app/software/

chown -R orafda:oinstall /u01/app/software/

chmod -R 775 /u01/app/software/

mkdir -p ~orafda/scripts

```
----------------------------------------------------------------
```
cat > ~orafda/scripts/status.sh <<EOF

echo .

echo .

echo .

ps -ef | grep httpd | head -n1

echo .

echo .

echo .

ps -p $(cat
/u01/app/oracle/config/domains/ohs1/system_components/OHS/ohs1/data/nodemanager/ohs1.lck)
&> /dev/null && echo up || echo down

echo .

echo .

echo .

cat
/u01/app/oracle/config/domains/ohs1/system_components/OHS/ohs1/data/nodemanager/ohs1.state

echo .

echo .

echo .

EOF
```
----------------------------------------------------------------
```
cat> ~orafda/scripts/setEnv.sh <<EOF

export ORACLE_BASE=/u01/app/oracle

export MW_HOME=\$ORACLE_BASE/product/12.2.1.4/fmw_1

export JAVA_HOME=\$ORACLE_BASE/product/8/jdk_1

export PATH=\$JAVA_HOME/bin:\$PATH

export ORACLE_HOME=\$MW_HOME

export DOMAIN_HOME=\$ORACLE_BASE/config/domains/ohs1

export
INSTANCE_HOME=\$DOMAIN_HOME/config/fmwconfig/components/OHS/instances/ohs1

EOF
```
----------------------------------------------------------------
```
echo ". ~orafda/scripts/setEnv.sh" >> ~orafda/.bash_profile

. ~orafda/scripts/setEnv.sh
```
----------------------------------------------------------------
```
cat > ~orafda/scripts/start_all.sh <<EOF

#!/bin/bash

. ~orafda/scripts/setEnv.sh

echo "Start Node Manager" \`date\`

nohup \$DOMAIN_HOME/bin/startNodeManager.sh > /dev/null 2>&1 &

sleep 10

echo "Start OHS" \`date\`

\$DOMAIN_HOME/bin/startComponent.sh ohs1

echo "Complete..." \`date\`

EOF
```
----------------------------------------------------------------
```
cat > ~orafda/scripts/stop\_all.sh <<EOF

#!/bin/bash

. ~orafda/scripts/setEnv.sh

echo "Stop OHS..." \`date\`

\$DOMAIN_HOME/bin/stopComponent.sh ohs1

echo "Stop Node Manager..." \`date\`

\$DOMAIN_HOME/bin/stopNodeManager.sh

echo "Complete..." \`date\`

EOF
```
----------------------------------------------------------------
```
chmod a+rx ~orafda/scripts/\*.sh
```
----------------------------------------------------------------

\#Create Service File "/etc/systemd/system/ohs.service"

------------------
```
[Unit]

Description=ohs process

After=network.target centrifydc.service sshd.service

[Service]

User=orafda

Type=forking

ExecStart=/bin/sh /var/opt/oracle/scripts/start_all.sh start

ExecStop=/bin/sh /var/opt/oracle/scripts/stop_all.sh stop

[Install]

WantedBy=multi-user.target

Alias=ohs.service
```
------------------
```
chmod 664 /etc/systemd/system/ohs.service

systemctl daemon-reload

systemctl enable ohs

systemctl is-enabled ohs.service
```
----------------------------------------------------------------

\#Create Response File "/u01/app/software/webtier.rsp"

\#It is used to install a Standalone HTTP Server and contains a
place-holder for the ORACLE_HOME, which we will set as part of the
installation.

------------------
```
[ENGINE]

#DO NOT CHANGE THIS.

Response File Version=1.0.0.0.0

[GENERIC]

#Set this to true if you wish to skip software updates

DECLINE_AUTO_UPDATES=true

#My Oracle Support User Name

MOS_USERNAME=

#My Oracle Support Password

MOS_PASSWORD=<SECURE VALUE>

#If the Software updates are already downloaded and available on your
local system, then specify the path to the directory where these patches
are available and set SPECIFY_DOWNLOAD_LOCATION to true

AUTO_UPDATES_LOCATION=

#Proxy Server Name to connect to My Oracle Support

SOFTWARE_UPDATES_PROXY_SERVER=

#Proxy Server Port

SOFTWARE_UPDATES_PROXY_PORT=

#Proxy Server Username

SOFTWARE_UPDATES_PROXY_USER=

#Proxy Server Password

SOFTWARE_UPDATES_PROXY_PASSWORD=<SECURE VALUE>

#The oracle home location. This can be an existing Oracle Home or a new
Oracle Home

ORACLE_HOME=###ORACLE_HOME###

#Set this variable value to the Installation Type selected as either
Standalone HTTP Server (Managed independently of WebLogic server) OR
Collocated HTTP Server (Managed through WebLogic server)

INSTALL_TYPE=Standalone HTTP Server (Managed independently of WebLogic
server)

#Provide the My Oracle Support Username. If you wish to ignore Oracle
Configuration Manager configuration provide empty string for user name.

MYORACLESUPPORT_USERNAME=

#Provide the My Oracle Support Password

MYORACLESUPPORT_PASSWORD=<SECURE VALUE>

#Set this to true if you wish to decline the security updates. Setting
this to true and providing empty string for My Oracle Support username
will ignore the Oracle Configuration Manager configuration

DECLINE_SECURITY_UPDATES=true

#Set this to true if My Oracle Support Password is specified

SECURITY_UPDATES_VIA_MYORACLESUPPORT=false

#Provide the Proxy Host

PROXY_HOST=

#Provide the Proxy Port

PROXY_PORT=

#Provide the Proxy Username

PROXY_USER=

#Provide the Proxy Password

PROXY_PWD=<SECURE VALUE>

#Type String (URL format) Indicates the OCM Repeater URL which should
be of the format [scheme[Http/Https]]://[repeater host]:[repeater
port]

COLLECTOR_SUPPORTHUB_URL=
```
------------------
```
chmod a+rw /u01/app/software/webtier.rsp
```
------------------------------------------------------------------------

#Specify an Oracle inventory location.

#Create a file called "/u01/app/software/oraInst.loc" with the
following contents.

------------------
```
inventory_loc=/u01/app/oraInventory

inst_group=oinstall
```
------------------
```
chmod a+rw /u01/app/software/oraInst.loc
```
------------------------------------------------------------------------

\# IMPORTANT

\#

\# IMPORTANT

\#

\# exit orafda and return to root

------------------------------------------------------------------------
```
#initiate the installation in silent mode.

# Unzip the software.

cd /u01/app/software

unzip -o fmw_12.2.1.4.0_ohs_linux64_Disk1_1of1.zip

source ~orafda/scripts/setEnv.sh

# Set the ORACLE_HOME in the response file.

sed -i -e "s|###ORACLE_HOME###|$ORACLE_HOME|g"
/u01/app/software/webtier.rsp

mkdir /u01/app/software/temp

chmod a+x /u01/app/software/temp

# Install OHS.

./fmw_12.2.1.4.0_ohs_linux64.bin
-J-Djava.io.tmpdir=/u01/app/software/temp -ignoreSysPrereqs -silent
-responseFile /u01/app/software/webtier.rsp -invPtrLoc
/u01/app/software/oraInst.loc
```
------------------------------------------------------------------------
```
# Create OHS Instance

cd $MW_HOME/oracle_common/common/bin

nano ~orafda/scripts/create_ohs.py
```
----------------
```
selectTemplate('Oracle HTTP Server (Standalone)')

loadTemplates()

domain_path = raw_input('Enter domain path: ').strip()

nmpass = raw_input('Enter nodemanager password: ').strip()

cd('/SecurityConfiguration/base_domain')

set('NodeManagerPasswordEncrypted',nmpass)

writeDomain(domain_path)

exit()
```
----------------

------------------------------------------------------------------------
```
/u01/app/oracle/product/12.2.1.4/fmw_1/oracle_common/common/bin/wlst.sh
~orafda/scripts/create_ohs.py

--> Enter domain path: /u01/app/oracle/config/domains/ohs1

--> Enter nodemanager password: XXXXXX (the password must be at least
8 characters and contain at least one numeral, otherwise you'll see a
very unhelpful error)

# the log for this particular script run can be found at
/tmp/wlstOfflineLogs_orafda/cfgfwk_<date_time>.log

# Verify successful creation of the "ohs1" instance:

ls -al /u01/app/oracle/config/domains/ohs1
```
------------------------------------------------------------------------
```
# First-time Start:

# Make sure the environment is set

#

source ~orafda/scripts/setEnv.sh

cd /u01/app/oracle/config/domains/ohs1

# Start the node manager

#

nohup $DOMAIN_HOME/bin/startNodeManager.sh >
/u01/app/oracle/config/domains/ohs1/nohup_ohs_$(date
+"%Y_%m_%d__%Hh_%Mm_%Ss_%p").out 2>&1 & disown

# The first time we start the OHS instance, we use the
"storeUserConfig" option which saves the credentials so we never need to
enter them again.

# Enter the password (XXXXXX) when prompted

#

$DOMAIN_HOME/bin/startComponent.sh ohs1 storeUserConfig
```
------------------------------------------------------------------------
```
# Deploy the webgate as per the instructions here:

#
https://docs.oracle.com/en/middleware/fusion-middleware/12.2.1.4/wtins/configuring-webgate-oracle-access-manager.html#GUID-B4B416E5-A4F1-43E1-972B-4375221E5182

#

# on that page, DOMAIN_HOME =
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1

cd $ORACLE_HOME/webgate/ohs/tools/deployWebGate

./deployWebGateInstance.sh -w
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1
-oh $ORACLE_HOME

ls -lart
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1/webgate/

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib

cd
/u01/app/oracle/product/12.2.1.4/fmw_1/webgate/ohs/tools/setup/InstallTools/

./EditHttpConf -w
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1
-oh $ORACLE_HOME
```
------------------------------------------------------------------------

IMPORTANT:

Create an incident ticket with OIMT DAS FDA SSO SUPPORT to exclude
/api/v1/\*\* from the sso policy.

In the ticket, include the webgate host's name

------------------------------------------------------------------------
```
nano
$DOMAIN_HOME/config/fmwconfig/components/OHS/instances/ohs1/ohs.plugins.nodemanager.properties

# put this line at the end of it, save, and exit:

environment.LD_LIBRARY_PATH=$ORACLE\_HOME/webgate/ohs/lib/:$ORACLE_HOME/ohs/lib:$ORACLE_HOME/oracle_common/lib:$ORACLE_HOME/lib

~orafda/scripts/stop_all.sh

~orafda/scripts/start_all.sh
```
------------------------------------------------------------------------
```
cd ~orafda/scripts/

nano ohs_status.py

---------------

nmConnect('', '', 'localhost', '5556', 'base_domain',
'/home/oracle/product/12g/12.1.3/ohs2/oh/user_projects/domains/base_domain','ssl')

nmServerStatus('ohs1','OHS')

---------------

cd ~orafda/scripts/

nano ohs_status.sh

---------------

$ORACLE_HOME/oracle\_common/common/bin/wlst.sh
~orafda/scripts/ohs_status.py

---------------

chmod a+x ohs_status.sh

./ohs_status.sh

--> enter the password, XXXXXX
```
------------------------------------------------------------------------

get a file named something like "WG\_66020.zip" from the SSO team (or
the Middleware team)

put it at
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1/webgate/config/

unzip it there

IMPORTANT: make sure you're still logged in as orafda

-----------------------------------------------------

whoami

-----------------------------------------------------

restart OHS -- but first, make sure you're still logged in as orafda

-----------------------------------------------------
```
~/scripts/stop_all.sh

~/scripts/start_all.sh
```
-----------------------------------------------------

Test the instance

-----------------------------------------------------
```
curl http://fdslv66020.fda.gov:7777/
```
-----------------------------------------------------

------------------------------------------------------------------------
```
Make sure that the file:

/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1/httpd.conf

contains the line:

IncludeOptional "moduleconf/*.conf"

cd
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1/moduleconf

# create a file named virtual_hosts.conf

#

nano virtual_hosts.conf
```
----------------
```
#<LocationMatch "^/api.\*">

#AuthType Oblix

#require valid-user

#</LocationMatch>

<Location "/api">

RequestHeader unset OAM_REMOTE_USER

AuthType None

Require all granted

</Location>

<VirtualHost *:7777>

ServerName https://gsrs-uat.preprod.fda.gov #
<<<<<<<<<
------------------------------------- change the host name as needed

ProxyPreserveHost On

ProxyPassMatch ^/index.html !

ProxyPassMatch ^/$ !

ProxyPassMatch ^/ginas/app/index.html !

ProxyPassMatch ^/ginas/app$ !

ProxyPassMatch ^/ginas/app/$ !

ProxyPass / http://localhost:8080/

ProxyPassReverse / http://localhost:8080/

</VirtualHost>
```
----------------

------------------------------------------------------------------------

Restrict SSO auth to only non-/api routes

-----------------------------------------

cd
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/instances/ohs1/

nano webgate.conf

\# comment out this section in the file and insert the replacement
section as shown here:

----------------
```
#<LocationMatch "^/.\*">

#AuthType Oblix

#require valid-user

#</LocationMatch>

<LocationMatch "^(?!/api)/\[^/\]+">

AuthType Oblix

require valid-user

</LocationMatch>
```
----------------

------------------------------------------------------------------------
```
cd
/u01/app/oracle/config/domains/ohs1/config/fmwconfig/components/OHS/ohs1/htdocs

mv index.html index.html.orig

nano index.html
```
----------------
```
<!DOCTYPE html>

<html>

<head>

<script>

window.location = "/ginas/app/beta/home";

</script>

</head>

<body>

Launching GSRS ...

<p>

<a href="/ginas/app">Click here if you don't see GSRS within 3
seconds</a>

</body>

</html>
```
----------------
```
mkdir ginas

mkdir ginas/app

cp index.html ginas/app
```
------------------------------------------------------------------------

\# IMPORTANT

\#

\# IMPORTANT

\#

\# exit orafda and return to root

------------------------------------------------------------------------

shut off GSRS

rm 12.2.1.3 or 4 dir

rm ora_inventory

edit .rsp file

install

create ohs instance

instructions to set up webgate

run 2 scripts that I receive from the SSO team

get zip file to configure webgate

create virtual host for GSRS with a proxy pass to GSRS on port 9000

------------------------------------------------------------------------
