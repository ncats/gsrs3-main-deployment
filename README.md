
# GSRS 3 Main Deployment


GSRS 3.x is based on a Spring Boot microservice infrastructure and is highly flexible and configurable. Both the core substance modules as well as the modules for additional entities (e.g. products, applications, impurities, clinical trials, adverse events, etc) can be deployed in a variety of flexible configurations to suit the needs of the user and use-case. GSRS requires the use of an RDBMS database for data storage.  The supported database flavors are: H2, PostGreSQL, MariaDB and MySQL.

GSRS 3.x works with Java 8, 11, 17; versions outside of these may result in build errors. Set `JAVA_HOME` to point to one of Java 8, 11, or 17 and verify with the terminal command: `mvn --show-version`. Note, however, that the `pom.xml` files still specify Java 8 or 11, and as of 3.1.2, the GSRS team writes code to conform with Java 8 or 11.

## SECTION 1: Important Notes

- In GSRS 3.1.2, there are dramatic changes to how GSRS is configured. This is outlined below with more detail in this "[How it works](./blob/main/docs/how-configuration-works-3.1.2.md)" document.
- In GSRS 3.1.2, there were changes to the Impurities microservice database schema.  Before upgrading your system, please check the [release notes](./docs/release%20notes) for discussion. Also please check the README files in [./impurities/database/](../../tree/main/impurities/database/) for suggested steps.
- For GSRS 3.1, there are database schema changes for the substances service.  Before upgrading your system, please check the [release notes](./docs/release%20notes) for discussion. Also please check the README files in [./substances/database/sql/](../../tree/main/substances/database/sql/) for suggested steps.
- In October 2024, we revised past Substances README files and database creation scripts to default to the use of sequences instead of auto_increment.
- As of August 2022, an Oracle database instantiated by GSRS 3.x requires an extra script before data is stored. If you are creating a new database, see this [script](../../blob/main/substances/database/sql/Oracle/GSRS_3.1/modifyColumnTypesForJPACreatedSchema_3.1.sql) and its mention in the 3.1 database [README](../../blob/main/substances/database/sql/Oracle/GSRS_3.1/README). Please contact the GSRS team with any questions.

## SECTION 2: Get Started

To run a deployment of the GSRS you'll need a **minimum** of two backend services (gateway and substances) and one frontend service. The backend "gateway" coordinates traffic between different microservices including the frontend. The default "substances" backend service handles the REST API for substance information, controlled vocabulary, session information and other "core" entities. The frontend service serves an Angular frontend application.

This Main Deployment contains all the required and optional artifacts you need to deploy and run GSRS. Each artifact is contained in a subdirectory. Navigate to the documentation for each by following these links.

- [Gateway](./gateway)
- [Substances](./substances)
- [Frontend](./frontend)

- [Applications](./applications)
- [Adverse Events](./adverse-events)
- [Clinical Trials](./clinical-trials)
- [Impurities](./impurities)
- [Invitro Pharmacology](./invitro-pharmacology)
- [Products](./products)

Beyond documentation of the parts, the rest of this README is meant to provide background on how to structure whole deployments of different types and to discuss ways of integrating the parts.

## SECTION 3A: Deployments

### Deployment Types

The GSRS is a SpringBoot Java application that is usually deployed on a Tomcat web server and servlet. Tomcat acts as a bridge between web servers and Java-based applications.

Traditionally, Tomcat is installed on a server and allows administrators to deploy multiple Java applications on the same server, each in its own folder (a.k."context"). In GSRS's case, multiple microservices can be installed within one Tomcat server all running under a single port. We call this a **single or Tomcat** deployment.

In contrast, an embedded Tomcat server consists of a single Java web application packaged together with its own Tomcat server. Each microservice is individually packaged this way into a single Jar. The Jar is portable and can be run without having to install separate Tomcat software on a server or in a local development environment.

Developers will first want to deploy locally and be able to modify code on the fly. This is achieved more efficiently with **embedded Tomcat**.

### Maven Central vs. Git repositories

If you're evaluating GSRS or want to take the simplest path toward installation of a public release for production, it makes most sense to rely on Maven Central to download all the necessary dependencies. In this case, you only need to download `gsrs3-main-deployment` from the NCATS Github website.  Next, when you run or package services, the Maven program will automatically locate and download the dependencies from Maven Central.

Developers who wish to peruse the code or make modifications to classes between releases can clone sources from the NCATS Github repository.  If you do this, use `mvn install` on starter modules that you clone from the NCATS Github site.

### Use `.mvnw` or `mvn`?

If you have installed a fully functional maven program. You can use the `mvn` command.  Otherwise, each service comes with a maven wrapper in the service's folder. This allows you to issue maven commands without having to install the maven program. Consider references to either command in this text as equivalents.

### Cloning/repositories from from Git

In order to launch a local maven run for testing GSRS 3.0, you will need to access to the following git repository:

https://github.com/ncats/gsrs3-main-deployment (GSRS 3 Main Deployment) **this is the repository you are viewing now**

- This repository contains the small wrappers and basic configuration settings needed to build the WAR files and to launch all microservices in an embedded mode.
- This repository also houses the raw compiled frontend artifacts which are needed to assemble the frontend.
- This repository also houses a `docs` folder and README files which give additional information on installation, configuration and development.

The following additional git repositories are optional, and should be cloned by developers who wish to edit code in the dependencies of the GSRS 3 Main Deployment, for testing, or other purposes.

https://github.com/ncats/gsrs-spring-starter (optional)

- This is the core starter library which is a dependency for all other entity endpoints (it’s also in maven central so you don’t need to clone this repository unless you want the most up-to-date code or special feature branch)

https://github.com/ncats/gsrs-spring-module-substances (optional)

- This is the core substance starter library and is the dependency where the majority of API logic is handled (it’s also in maven central so you don’t need to clone this repository unless you want the most up-to-date code or special feature branch)

https://github.com/ncats/GSRSFrontend/tree/development_3.0 (optional)

- This is the raw angular/typescript/html codebase for the frontend. This is where the frontend static files are generated for use in the frontend microservice found in the gsrs3-main-deployment repository. At the time of this writing the process for doing that build into the gsrs3-main-deployment frontend module is fairly manual. There is some limited documentation about the process within the gsrs3-main-deployment frontend README. This is not needed unless you intend to make a real change to the frontend code. Many changes to the frontend code can be done by changing its `config.json` file instead of changing the source code.

## SECTION 3B: Embedded Tomcat

For the base level simple deployment, you can follow these steps:

Clone gsrs3-main-deployment repository

Clone gsrs-spring-starter git repo and install (optional)

Clone gsrs-module-substance-starter git repo and install (optional)

### Substances configuration (embedded Tomcat)

Starting in GSRS 3.1.2, the GSRS team has tried to make deployments easier by standardizing the structure of  `application.conf` files. The application.conf are not structured so that you can provide values for environment variables that are in turn interpolated into the application.conf file. We also provide mechanism so that you can override configured values.  One way to take advantage of this structure is to rely on include files.  For example, the substances service application.conf file looks like this.

```
application.conf

include substances-env.conf
include substances-env-db.conf

# body
some.java.property = ${SOME_VALUE}

include substances.conf
include conf/substances.conf

```

The top-includes allow you to set environment variables and pass them to the body of the application.conf file. A key value pair such as `SOME_VALUE='apples'` is an example.

The bottom-includes allow you override Java properties set in application.conf or in upstream modules. in `substance.conf` we'd could write `some.java.property='orange'` to override previous settings.

Check here: [how-configuration-works-3.1.2.md](blob/main/docs/how-configuration-works-3.1.2.md) for details on how all this works.

Important values that are set by configuration for substances in an embedded Tomcat deployment include the following.

```
- `server.port= 8080`. Embedded Tomcat requires that server.port be set. The GSRS Team uses 8080 for substances.
- `ix.home="./ginas.ix"` In embedded Tomcat this the default location for the index.
- application.host="http://localhost:8081". The application host is typically the url that reaches the Gateway if you are using the Gateway. Otherwise it would be the url that reaches the service itself.

The data source is also important. Here's an example of how you would use `substances-env-db.conf` to configure Mariadb.

DB_URL_SUBSTANCES="jdbc:mysql://mysql:3306/substances"
DB_USERNAME_SUBSTANCES=yourusername
DB_PASSWORD_SUBSTANCES=XXXXXX
DB_DRIVER_CLASS_NAME_SUBSTANCES="com.mysql.cj.jdbc.Driver"
DB_CONNECTION_TIMEOUT_SUBSTANCES=12000
DB_MAXIMUM_POOL_SIZE_SUBSTANCES=50
DB_DIALECT_SUBSTANCES="org.hibernate.dialect.MySQL8Dialect"
# Set to .ddl-auto update if you want SpringBoot to generate a schema.
# Seware that this will may change your schema and/or erase data.
DB_DDL_AUTO_SUBSTANCES=none
```

Alternatively, you use the bottom-included `substances.conf` to override values in `application.conf`.

```
spring.datasource.driver-class-name="org.mariadb.jdbc.Driver"
spring.datasource.url="jdbc:mysql://mariadb:3306/substances"
spring.datasource.username="yourusername"
spring.datasource.password="XXXXXX"
spring.jpa.database-platform="org.hibernate.dialect.MariaDB103Dialect"
# Set to .ddl-auto update if you want SpringBoot to generate a schema.
# Seware that this will may change your schema and/or erase data.
spring.jpa.hibernate.ddl-auto=none
spring.datasource.connection-timeout = 12000
spring.datasource.maximum-pool-size= 50 #maximum pool size
```

### Gateway configuration (embedded Tomcat)

For the Gateway, check these configuration files in the `gateway/src/main/resources/` folder:

- gateway-env.conf
- application.conf
- gateway.conf

The gateway uses the Zuul package to route paths to the various GSRS services.

In embedded Tomcat, we access the url `http://localhost:8081/ginas/app/ui/`, and the Gateway forwards the request to the Frontend service at `http://localhost:8082/ginas/app/ui/`.

To get information about a substance, the Frontend UI sends requests to the gateway `http://localhost:8081/ginas/app/api/v1/substances(ASPIRIN)`. Then, the Gateway forwards this request to the substances service at `http://localhost:8080/api/v1/substances(ASPIRIN)`.

### Frontend configuration (embedded Tomcat)

Check the `gsrs3-main-deployment/frontend/src/main/resources` folder for configuration files:

- frontend-env.conf
- application.conf
- frontend.conf

By default, `server.port: 8082` is used for the Frontend service in embedded Tomcat.

The Frontend (Java) service's `pom.xml` file is structured to include an automated procedure that pulls Angular source code from Github. Thus, running the Frontend service results in a SpringBoot service Jar file and in turn includes an Angular distribution folder.  If you were to unzip the Jar file, you would find the Angular distribution in the `classes/static` folder and the Frontend UI angular configuration file is found here: `classes/static/assets/data/config.json`.

It's not practical to unzip the Jar file, but there are ways you can override the config.json file at runtime. Get a copy of the 3.1.2 [config.json](https://github.com/ncats/GSRSFrontend/blob/GSRSv3.1.2PUB/src/app/fda/config/config.json); save a copy locally to make modifications. You will need to add these key-values.

```
"apiBaseUrl": "http://localhost:8081/ginas/app/",
"gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
# optional
"apiSSG4mBaseUrl": "http://localhost:8081/ginas/app/",
```

### Running substances(embedded Tomcat)

Once the configuration above is performed, it will be possible to launch the service. Below, we will describe how to launch each of the 3 services in 3 different terminal sessions.

Keep all terminals open (or have them run in the background via `nohup` or `screen`).

Before running the substances service, it would be good to take note of the fork value in the `substances/pom.xml` file. As of GSRS 3.1.1, the default fork value is true.  However, you can pass `-Dwith.fork=false` or `-Dwith.fork=true` to make an explicit choice. On windows, false may work better on the substances services. You may need this to avoid a 'filename too long' error common with SpringBoot. However, if you choose to run the service and add the test records on the command line, set the fork value to true.

Open a new terminal or screen session and run these commands:

```
cd path/to/gsrs3-main/deployment
cd substances

# You may have to do this, depending on the circumstances, to install some extra depdencies.
bash installExtraJars.sh

# Option 1, No data load
./mvnw clean -U spring-boot:run -DskipTests

# Option 2, Run and load with a small set
# This will only work if fork=true, which it is by default.
./mvnw clean -U spring-boot:run -Dspring-boot.run.jvmArguments="-Dix.ginas.load.file=src/main/resources/rep18.gsrs"
```

If you wish to delete the substances index before running, you can do this beforehand:

```
rm -r ginas.ix
```

If you have problems with "file too long" on windows, try adding this option to the `./mvnw` command `-Dwith.fork=false`.

...

Besides being the default, another reason to use '-Dwith.fork=true'  is if you wish to set jvmArguments for a **specific** service.  This is more likely to be an issue if you're using embedded Tomcat in **production** with a large data set, rather than locally. The Substances service uses quite a bit of memory, whereas the other services don't need so much; so you'd use the defaults for other services, but apply specific values for substances.  The effect of enabling fork is that the specific service will run in its own JVM instance. The POM configuration, with arguments, would like something like this:

```
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    ...
    <configuration>
        <fork>${with.fork}</fork>
        <jvmArguments>-Xmx16000m -Xms12000m</jvmArguments>
    </configuration>
</plugin>
```

### Running the gateway (embedded Tomcat)

In a new terminal or screen session, run the following commands:

```
cd path/to/gsrs3-main-deployment
cd gateway
./mvnw clean -U spring-boot:run -DskipTests
```

#### Running the frontend (embedded Tomcat)

As of GSRS 3.1.1, the Angular build is no longer included in the gsrs3-main-deployment repository.  Instead, it is built automatically and included in the `.jar` file or `.war` file. This happens when  when you run or package the Frontend service.

There is a bit of learning curve to get comfortable with the new approach.

See the Frontend [README.md](./frontend/README.md) and related resources for more information.

For even more detail, this [document](./blob/main/docs/how-the-frontend-microservice-auto-build-works-and-options.md) about how the automation works.

In a new terminal or screen session, do the following.

You made a copy of the config.json above. Create a new file with an editor such as `nano` and, in it, paste the contents of your copied `config.json`.

```
mkdir -p /path/to/custom/static/assets/data
nano /path/to/custom/static/assets/data/config.json
```

Next, package with Maven and run with `java`.

```
cd path/to/gsrs3-main-deployment
cd frontend
# Package the frontend service
export FRONTEND_TAG='GSRSv3.1.2PUB' # Github tag
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests

# Run (mac, linux)
java -cp "target/frontend.war:/path/to/custom" -Dserver.port=8082 org.springframework.boot.loader.WarLauncher

# Run (Windows, GitBash)
java -cp "target/frontend.war;/path/to/custom" -Dserver.port=8082 org.springframework.boot.loader.WarLauncher
```

In the above procedure, we packaged first, and second, ran with a java command. Packaging takes a long time because the frontend Angular code is built automatically. The two step process allows us to make changes to the config.json file without having to rebuild the Angular code at each runtime.

To confirm it’s working, navigate to `http://localhost:8081/ginas/app/ui/` (or the equivalent for your configuration – note that "8081" in this case is the port for the gateway which will route to the frontend on another port, typically 8082).

You should be able to login from the Frontend UI.  In the local development version, the username and password are `admin`, `admin` respectively.

### Optionally use Development Mode for the Frontend (embedded Tomcat)

You can run the frontend in **development mode**.

**Do that only if** you want to make changes to the Angular code and compile on the fly while testing.

You will have to make some small modifications to the a/ the gateway `application.yml` file and b/ **your own** angular frontend code repository.

First, stop the gateway service if it is running.  Then, make the change below in the `src/main/resources/gateway-env.conf` file:

```
# Uncomment these two lines
MS_URL_FRONTEND="http://localhost:4200"
GATEWAY_FRONTEND_ROUTE_URL="http://localhost:4200"
```

Save `gateway-env.conf`.

Press Control-C to stop the gateway if it is still running, and restart it with `./mvn spring-boot:run -DskipTests`.

Next, go to your own Angular code repo (typically `GSRSFrontend`) outside of the gsrs3-main-deployment folder. Edit the file, `src/index.html`, temporarily changing from `<base href="/">` to `<base href="/ginas/app/ui/">`.  Make sure you temporarily have following in `src\app\fda\config\config.json`.

```
"apiBaseUrl": "http://localhost:8081/ginas/app/ui/",
"gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
# optional
"apiSSG4mBaseUrl": "http://localhost:8081/",
```

Finally, recompile the angular code, as usual with the `npm` command. See [Compile Requirements](frontend/README.md#compile-requirements) in the frontend README.

Now, hitting in your browser, `http://localhost:8081/ginas/app/ui/home` will run **your own** development Angular code, rather than the **compiled** version in the `gsrs3-main-deployment` repository.

## SECTION 3C: Single Tomcat deployment

### Single Tomcat Deployment with WAR files for Core and Frontend

FDA currently uses the single Tomcat WAR files deployment strategy in production for the GSRS core and additional microservices. The steps here have similarities to the local embedded testing deployment strategy as well as significant differences, so please review that section in this document before proceeding. FDA has also provided a detailed deployment guide in the [docs](./docs) folder, which goes into more specifics.

One big difference with single Tomcat is that Tomcat (running on port 8080) routes traffic to executed war file instances, all running on the same port. In contrast, in the embedded case, the gateway routes traffic to executable jar files, and each jar contains its own internal webserver, and each service runs on its own port.

Another practical difference is data written to disk, such as indexes and caches, are kept in folders separate from the code.



To save server specific configs from being overwritten, a copy of each microservice configuration is kept separate from the code, in a folder dedicated to configuration.  You make edits in this folder, and you copy them to the `webapps/<service>/WEB-INF/classes` folder to overwrite the ones that were generated at packaging time inside the WAR files.

For simplicity, we use Tomcat 9 in this README.md file so as to avoid some complications that arise with Tomcat 10. These complications in Tomcat 10 relate to the use of a webapps-javaee folder and the need to convert some `javax` classes to `jakarta` classes. Once GSRS is using SpringBoot 3x, this documentation will shift toward Tomcat 10.

### Cloning the gsrs3-main-deployment and other optional repositories

This gsrs3-main-deployment repository contains the small wrappers needed to build the WAR files. There are configurations in the repository for reference as well, but the out of the box configurations are written for the local development/embedded Tomcat deployment strategy.

Clone gsrs3-main-deployment repository.

```
git clone https://github.com/ncats/gsrs3-main-deployment
```

Optionally, you can clone and install the following repositories if you need the very latest code in development.

- https://github.com/ncats/gsrs-spring-starter (master)
- https://github.com/ncats/gsrs-spring-module-substances (master)
- https://github.com/ncats/GSRSFrontend (development_3.0)

At this time, you may also need to clone and install the applications and products starter repositories (starter branch). That is because the substance starter module has some dependencies from clinical trials, applications and products.

- https://github.com/ncats/gsrs-spring-module-drug-applications (starter)
- https://github.com/ncats/gsrs-spring-module-drug-products (starter)
- https://github.com/ncats/gsrs-spring-module-clinical-trials (master)

If you do not take the option of installing the git repositories, Maven will download the published repositories from Maven Central and use those for the dependencies.

### Prepare your environment for this tutorial

On your server, create some helpful environment variables for this tutorial and then create folders where configurations and runtime time data can be written. These folders should be separate from the code. That way, they won't be erased on each new deployment.

Run the following in your Linux terminal, or you can use `GitBash` on windows.

These export statements should be run each time you open a new terminal. Or put them in your `.bash_profile` so that the exports happen automatically each time you open a new terminal.

```
export gsrs_ci_repo_dir=/path/to/your/gsrs3-main-deployment/repository
export webapps=/path/to/tomcat/webapps
export config_dir=/path/to/gsrs_configs/
export data_dir=/path/to/data

```

### Create a folder for substances indexes

```
sudo mkdir -p $data_dir/gsrs_substances.ix
mkdir -p $config_dir

```

### Create a `conf` folder

Each service has a `context.xml` file. And, these point to a `conf` folder in the current `user.dir`.

The conf folder would be an alternative to the `$config_dir` approach utilized below. It's another option, that can save you from having to copy over configuration to `webapps` after edits.

We bring it up here only because you may get an error if the folder does not exist.

By default, the `user.dir` on single Tomcat will be the directory from which Tomcat is started, and typically that would be where tomcat was installed. In a default Ubuntu install, that might be: `/var/lib/tomcat9`. You may be able to reconfigure where Tomcat starts from by editing the `/etc/systemd/system/tomcat.service` file and setting CATALINA_HOME.

If you get an error because the `conf` folder does not exist. Try something like this:

```
sudo mkdir /var/lib/tomcat9/conf
```

### Preparing your configs (single Tomcat)

As noted in this [how configuration works in 3.1.2](./blob/gsrs_3.1.2_prerelease/docs/how-configuration-works-3.1.2.md) document, we will create files that will be included by the main `application.conf` file for each service.

These files set variables that will be interpolated into application.conf, or will override the values set in the `application.conf` file.

Because the `application.conf` assumes single Tomcat, the include files can be pretty sparse or even blank. However, it's essential to create the files even if blank, so that they overwrite the ones that come by default.

### Substances configuration (single Tomcat)

Create these three blank files:

```
touch $config_dir/substances-env.conf
touch $config_dir/substances-env-db.conf
touch $config_dir/substances.conf
```

Add these lines to `substances-env.conf`

```
# Application host url should have no trailing slash

# Assumption ONE
APPLICATION_HOST="https://localhost:8080"

# Assumption TWO
APPLICATION_HOST="https://my.server:8080"

# Assumption THREE
# Application host url should have no trailing slash
APPLICATION_HOST="https://my.server"
#  Assuming we have NGINX forwarding to a reverse proxy like this:
#  location /ginas/app {
#    proxy_http_version 1.1;
#    include proxy_params;
#    client_max_body_size 1000M;
#    proxy_pass http://localhost:8080;
#    proxy_read_timeout 300;
#    proxy_connect_timeout 300;
#    proxy_send_timeout 300;
#  }

# Options 1 & 2: 8080, Option 3: the port used to reach the Gateway such as defaults 80 or 443
APPLICATION_HOST_PORT="8080"

MS_SERVER_PORT_SUBSTANCES=8080
MS_LOOPBACK_PORT_SUBSTANCES=8080

IX_HOME="/path/to/data/substances/ginas.ix"
MS_EXPORT_PATH_SUBSTANCES="/path/to/data/substances/exports"
MS_ADMIN_PANEL_DOWNLOAD_PATH_SUBSTANCES="/path/to//data/substances/"

# If on production
GSRS_SESSIONS_SESSION_SECURE=true

# API URLs have slash
# Assumption here is service-to-service communication on server, so localhost is OK
API_BASE_URL_APPLICATIONS="http://localhost:8080/applications/"
API_BASE_URL_CLINICAL_TRIALS_US="http://localhost:8080/clinical-trials/"
API_BASE_URL_CLINICAL_TRIALS_EUROPE="http://localhost:8080/clinical-trials/"
API_BASE_URL_PRODUCTS="http://localhost:8080/products/"

# On single Tomcat, we want the context to be service's parent folder name
MS_SERVLET_CONTEXT_PATH_SUBSTANCES="substances"

MS_SALT_PATH_SUBSTANCES=salt_data_public.tsv
```

### Gateway configuration (single Tomcat)

Create these two blank files:

```
touch $config_dir/gateway-env.conf
touch $config_dir/gateway.conf
```

Because the default gateway `application.conf` file assumes single Tomcat values, you can probably leave them blank.

### Frontend configuration (single Tomcat)

Create these two blank files:

```
touch $config_dir/frontend-env.conf
touch $config_dir/frontend.conf
```

Because the default frontend `application.conf` file assumes Single Tomcat values, you can probably leave them blank.  However, you can later customize your deployment.

Create a file `$config_dir/frontend_config.json` and add the following.

Get a copy of the 3.1.2 [config.json](https://github.com/ncats/GSRSFrontend/blob/GSRSv3.1.2PUB/src/app/fda/config/config.json); You will need to adjust these key-values.

```
If you need to include a port, it's probably same one Tomcat uses, usually: 8080.

"apiBaseUrl": "http://my.server/ginas/app/",
"gsrsHomeBaseUrl": "http://my.server/ginas/app/ui/",
"apiSSG4mBaseUrl": "http://my.server/ginas/app/",
```

### Package your WAR files; then copy to Tomcat webapps; and overwrite configs

Stop your tomcat if needed.

For **Substances**, run these commands on the command-line:

```
sudo rm -r /var/lib/tomcat9/webapps/substances
cd $gsrs_ci_repo_dir/substances
bash installExtraJars.sh # may be necessary depending on the circumstances.
mvn clean -U package -DprofileIdEnabled=true -DskipTests  # to generate substances.war
sudo unzip $gsrs_ci_repo_dir/substances/target/substances.war -d $webapps/substances

# Something like this may be needed, to get started. You should adjust for security as needed.
sudo perl -pi -e 's/"\$\{gateway.allow.pattern:-\.\*\}"/".*"/g' ${webapps}/substances/META-INF/context.xml

sudo cp -rf ${config_dir}/substances-env.conf ${webapps}/substances/WEB-INF/classes/substances-env.conf
sudo chmod a+r ${webapps}/substances/WEB-INF/classes/substances-env.conf
sudo chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/substances-env.conf

sudo cp -rf ${config_dir}//substances-env-db.conf ${webapps}/substances/WEB-INF/classes/substances-env-db.conf
sudo chmod a+r ${webapps}/substances/WEB-INF/classes/substances-env-db.conf
sudo chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/substances-env-db.conf

sudo cp -rf ${config_dir}/substances.conf ${webapps}/substances/WEB-INF/classes/substances.conf
sudo chmod a+r ${webapps}/substances/WEB-INF/classes/substances.conf
sudo chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/substances.conf

```

For the **Gateway**, run these commands on the command-line:

```
# Notice that the gateway is written to ROOT in the Tomcat webapps folder

sudo rm -r /var/lib/tomcat9/webapps/ROOT
cd $gsrs_ci_repo_dir/gateway
mvn clean -U package -DskipTests # to generate gateway.war
sudo unzip $gsrs_ci_repo_dir/gateway/target/gateway.war -d $webapps/ROOT

sudo cp -rf ${config_dir}/gateway-env.conf ${webapps}/ROOT/WEB-INF/classes/gateway-env.conf
sudo chmod a+r ${webapps}/ROOT/WEB-INF/classes/gateway-env.conf
sudo chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/gateway-env.conf

sudo cp -rf ${config_dir}/gateway.conf ${webapps}/ROOT/WEB-INF/classes/gateway.conf
sudo chmod a+r ${webapps}/ROOT/WEB-INF/classes/gateway.conf
sudo chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/gateway.conf
```

For the Frontend, do the following on command-line:

```
export FRONTEND_TAG=GSRSv3.1.2PUB # or other branch
cd $gsrs_ci_repo_dir/frontend
sudo rm -r /var/lib/tomcat9/webapps/frontend
./mvnw clean -U package -Dfrontend.tag=$FRONTEND_TAG -Dwithout.visualizer -DskipTests
sudo unzip $gsrs_ci_repo_dir/frontend/target/frontend.war -d $webapps/frontend

# Something like this may be needed to get started. You should adjust for security as needed.
sudo perl -pi -e 's/"\$\{gateway.allow.pattern:-\.\*\}"/".*"/g' ${webapps}/frontend/META-INF/context.xml

sudo cp -rf ${config_dir}/frontend-env.conf ${webapps}/frontend/WEB-INF/classes/frontend-env.conf
sudo chmod a+r ${webapps}/frontend/WEB-INF/classes/frontend-env.conf
sudo chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/frontend-env.conf

sudo cp -rf ${config_dir}/frontend.conf ${webapps}/frontend/WEB-INF/classes/frontend.conf
sudo chmod a+r ${webapps}/frontend/WEB-INF/classes/frontend.conf
sudo chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/frontend.conf

sudo cp -rf ${config_dir}/frontend_config.json ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
sudo chmod a+r  ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json
sudo chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

```

Now, you're ready to run the application in Tomcat. Do the following:

```
# Start your tomcat

# Check this log $webapps/../logs/catalina...log

# Try to hit these Urls
http://localhost:8080/api/v1/substances
http://localhost:8080/ginas/app/ui/

# Again, check this log $webapps/../logs/catalina...log
```

### Turning on an Additional Entity Service in a single Tomcat Instance

An additional microservice works with two main parts. First, a starter package that establishes microservice entities, repositories, controllers, indexers, etc. Next, there is an executing implementation in the `gsrs3-main-deployment` that imports the starter package and sets configuration properties. The `gsrs3-main-deployment` implementation for the microservice also has a main() method that runs the service.

An additional service like Clinical Trials already exists, for example. The entities present in the Clinical Trials starter package are ClinicalTrialUS and ClinicalTrialEurope.  In the `gsrs3-main-deployment`, you'll see a folder `gsrs3-main-deployment/clinical-trials`. To make it work in the single Tomcat instance scenario described above, take the following steps.

### Prepare for Clinical Trials service (single Tomcat)

These export statements should be run each time you open a new terminal or put them in `bash_profile` if not already present.

```
export gsrs_ci_repo_dir=/path/to/your/gsrs3-main-deployment
export webapps=/path/to/tomcat/webapps
export config_dir=/path/to/gsrs_configs/
export data_dir=/path/to/data

```

The following need to be done once.

```
sudo mkdir -p $data_dir/gsrs_clinical-trials.ix
sudo mkdir -p $data_dir/gsrs_substances.ix
```

### Clinical Trials configuration (single Tomcat)

```
# Essential configs

APPLICATION_HOST="https://my.server"
APPLICATION_HOST_PORT=8080
MS_SERVER_PORT_CLINICAL_TRIALS=8080
MS_LOOPBACK_PORT_CLINICAL_TRIALS=8080

IX_HOME="/path/to/data/clinical-trials/ginas.ix"

# We use the same path as the substances service.
MS_EXPORT_PATH_CLINICAL_TRIALS="/path/to/data/substances/exports"
MS_ADMIN_PANEL_DOWNLOAD_PATH_CLINICAL_TRIALS="/path/to/data/substances/"

EUREKA_SERVICE_URL="http://localhost:8080/discovery/eureka"
EUREKA_CLIENT_ENABLED=false

# API URLs have slash
# We're communicating between two services on the same server so this is OK.
API_BASE_URL_SUBTANCES="http://localhost:8080/substances/"

MS_SERVLET_CONTEXT_PATH_CLINICAL_TRIALS="/clinical-trials"
```

In `clinical-trials-env-db.conf`, configure TWO databasources (example Mariadb).

```
# The clinical-trials needs access to the substances service to verify whether
# substances linked to trials exist, for example.
# Point to the same database as the substances service configuration
DB_URL_SUBSTANCES="jdbc:mysql://localhost:3306/substances"
DB_USERNAME_SUBSTANCES="yourusername"
DB_PASSWORD_SUBSTANCES="XXXXXX"
DB_DRIVER_CLASS_NAME_SUBSTANCES="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_SUBSTANCES=12000
DB_MAXIMUM_POOL_SIZE_SUBSTANCES=50
DB_DIALECT_SUBSTANCES="org.hibernate.dialect.MariaDB103Dialect"
DB_DDL_AUTO_SUBSTANCES=none

DB_URL_SRSCID="jdbc:mysql://localhost:3306/clinical_trials"
DB_USERNAME_CLINICAL_TRIALS="drugs"
DB_PASSWORD_CLINICAL_TRIALS="eeR1pood"
DB_DRIVER_CLASS_NAME_CLINICAL_TRIALS="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_CLINICAL_TRIALS=12000
DB_MAXIMUM_POOL_SIZE_CLINICAL_TRIALS=20
DB_DIALECT_CLINICAL_TRIALS="org.hibernate.dialect.MariaDB103Dialect"
DB_DDL_AUTO_CLINICAL_TRIALS=none
```

### Package Clinical Trials service WAR file and overwrite configs

Do or run the following on command-line:

Stop your tomcat if needed.

For ***Clinical Trials**, run these commands on the command-line:

```
sudo rm -r /var/lib/tomcat9/webapps/clinical-trials
cd $gsrs_ci_repo_dir/clinical-trials
mvn clean -U package -DskipTests # to generate clinical-trials.war
sudo unzip $gsrs_ci_repo_dir/clinical-trials/target/clinical-trials.war -d $webapps/clinical-trials

sudo perl -pi -e 's/"\$\{gateway.allow.pattern:-\.\*\}"/".*"/g' ${webapps}/clinical-trials/META-INF/context.xml

sudo cp -rf ${config_dir}/clinical-trials-env.conf ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env.conf
sudo chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env.conf
sudo chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env.conf

sudo cp -rf ${config_dir}/clinical-trials-env-db.conf ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env-db.conf
sudo chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env-db.conf
sudo chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/clinical-trials-env-db.conf

```

Now, you're ready to run the application in tomcat. Do the following:

```
# Start your tomcat

# Check this log $webapps/../logs/catalina...log

# Try to hit these Urls inside ssh.

http://localhost:8080/api/v1/clinical-trials

# Try to hit these Urls inside from your browser.

http://my.server/api/v1/clinicaltrialsus

http://my.server/ginas/app/ui/browse-clinical-trials

# Check this logs at $webapps/../logs/catalina...log
```

## Section 4: Making an additional microservice

### Backend

While the substance service is the core focus of GSRS, additional microservices can be built to relate another domains’ data to substances. Additional microservices currently implemented include Drug/Biologic Applications, Drug/Biologic Products and Clinical Trials. Each microservice works via two main elements: 1/ a domain specific spring boot starter module, and 2/ an executing implementation in `gsrs3-main-deployment`. The starter module builds on the core GSRS starter and defines domain specific models, controllers, indexers, services, etc. Next, the executing implementation in `gsrs3-main-deployment` contains a configuration file, and the "java main" application runner class that launches the microservice.  Each domain starter module currently works with two datasources. The domain specific datasource holds the domain's own entity data. The other "default" datasource may or may not be the same as the substance core datasource. The default datasource stores all data records GSRS routinely keeps for all GSRS entities, such as backups and incremental edits of the entity. Currently, the default datasource also contains session and user data required for authentication. **NOTE** At present time, in order for the _same_ authentication to work through the gateway and UI for each service, each service _must_ point to the same default ("spring") core data source. Alternative authentication schemes which would lift this requirement are possible, but beyond the scope of this document.

If the microservice to be added to `gsrs3-main-deployment` does not yet exist, the simplest path is to copy the `substances` folder to a new folder such as `my-service`.  However, the following (and more) files will have to edited (E), renamed (R), deleted (D) and/or simplified (S) as appropriate:

- pom.xml (E, S)
- application.conf (E, S)
- SubstancesApplication.java (R, S)
- LoadGroupsAndUsersOnStartup.java (D)

If the microservice to be added already has an implementation in the `gsrs3-main-deployment`, then it’s likely that you just need to modify configuration settings. If you're adding a completely new microservice, follow the patterns used for configuration in the established ones.

One point worth highlight is how a datasource would be configured for a new GSRS service.

Note that your microservice datasource is configured in a spring starter module java configuration class. In this case, `myservice` in the datasource configuration corresponds to the `PERSIST_UNIT` value in your `MyServiceDataSourceConfig` class. That persist unit value should be all lower case. The `spring` value is the default `PERSIST_UNIT`. The default datasource is configured in the GSRS Spring Boot starter in the `DefaultDataSourceConfig` class.

To get your new microservice running you also have to specify some new paths in the gateway service `application.conf`. These paths tell the Gateway how to route traffic to your microservice's entity services. Let’s say your microservice has two entities, MyWidget and MyThingy; and your server.port defined above is 8999. Assuming an embedded tomcat context, your added paths would look like this:

```
zuul.routes: {
  # ...
  "my_widgets": {
    "path": "/api/v1/mywidgets/**",
    "url": http://localhost:8999/api/v1/mywidgets
    "serviceId": "my_widgets"
  },
  "my_widgets_alt": {
    "path": "/api/v1/mywidgets(**)/**",
    "url": http://localhost:8999/api/v1/mywidgets",
    "serviceId": "my_widgets"
  },
  "my_thingies": {
    "path": "/api/v1/mythingies/**",
    "url": "http://localhost:8999/api/v1/mythingies",
    "serviceId": "my_thingies"
  },
  "my_thingies_alt": {
    "path": /api/v1/mythingies(**)/**
    "url": http://localhost:8999/api/v1/mythingies",
    "serviceId": "my_thingies"
  }
}
```

While an entity class `MyWidget` is singular, the url uses the plural `CONTEXT` value as defined in something like `MyWidgetEntityService.java`. The `_alt` values are necessary to handle certain [ODATA-like](https://www.odata.org/getting-started/basic-tutorial/) patterns not captured by the standard route.

### Make a new frontend UI submodule for a new microservice

When developers add a new microservice to the GSRS, they may also want to create a frontend module to interact with the backend service. The frontend code is all separate from the backend and currently in a single Angular project.  Typically, each entity service has its own folder where Angular code and templates are stored. To date, all non-core folders are located in the folder: `src/app/fda`.

Critical files affecting non-substance modules are:

```
src/app/fda/config/config.json
src/app/fda/fda.module.ts
```

Projects can be selectively defined as loaded components. This makes it easy to display content in templates only when the entity component is configured to be on. For example:

```
<div *ngIf = "loadedComponents.clinicaltrialsus">
  your content
</div>
```

In this example, "clinicaltrialsus" is the name of the loaded component. The following shows several files that you will likely have to modify if you add a frontend for a new entity service.

```
# src/app/fda/config.json
# Add:
"loadedComponents": {
  ...
  "clinicaltrialsus": true
  },
"navItems": [
  ...
  {
    "component": "clinicaltrialsus",
    "display": "Browse Clinical Trials",
    "path": "browse-clinical-trials-us",
    "order": 999
  }
 ]
```

```
# src/app/core/config/config.model.ts
# Add:
export interface LoadedComponents {
  ...
  clinicaltrialsus?: boolean;
}
```

```
# src/app/fda/fda.module.ts
# Add Module and Service declarations, varying approaches used.
```

```
# src/app/core/facets-manager/facets-manager.component.ts
# Modify this method to add your entity group to the `if` statement so that facets will be collected.
set configName(configName: string) {
     ...
     if (configName === '...' || configName === 'clinicaltrialsus' ... )
    ...
}
```

```
# src/app/core/base/base.component.html
# Add:
  <span *ngIf = "loadedComponents.clinicaltrialsus">
  <a mat-menu-item routerLink="/browse-clinical-trials-us">
    Browse US Clinical Trials
  </a>
  <mat-divider></mat-divider>
  </span>
```
