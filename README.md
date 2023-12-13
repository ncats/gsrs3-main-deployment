
# GSRS 3 Main Deployment

GSRS 3.0.2 is based on a Spring Boot microservice infrastructure and is highly flexible and configurable. Both the core substance modules as well as the modules for additional entities (e.g. products, applications, impurities, clinical trials, adverse events, etc) can be deployed in a variety of flexible configurations to suit the needs of the user and use-case. 

# Note for GSRS 3.1: There are database schema changes in this release. Before upgrading your system, please check the 3.1 release notes for the related section. Also please check the README in the ./substances/database/sql/${your database flavor}/GSRS_3.1 folder for suggesting steps.

# Note: as of 17 August 2022, an Oracle database instantiated by GSRS 3.x requires an extra script before data is stored.
If you are creating a new database in Oracle using GSRS 3.x, please contact the GSRS team for a script file.

Please feel free to run using one of the other support RDBMSs (PostGreSQL, MariaDB or MySQL)

Before running this application locally, it would be good to note that it only works with Java 8 to Java 11 so any versions outside of these would create build errors. A quick way to check what version is installed on your system is 

```
java --version
```

Multiple java versions can be installed on your system but Java 8 - 11 needs to be added as an environment variable for JAVA_HOME.

To run a deployment of the GSRS you'll need a **minimum** of two backend services (gateway and substances) and one frontend service. The backend "gateway" coordinates traffic between different microservices including the frontend. The default "substances" backend service handles the REST API for substance information, controlled vocabulary, session information and other "core" entites. The frontend service loads an Angular frontend application. 

This Main Deployment contains all the required and optional artifacts you need to deploy and run GSRS. Each artifact is contained in a subdirectory. Navigate to the documentation for each by following these links.         

- [Gateway](./gateway)
- [Substances](./substances)
- [Frontend](./frontend)
- [Applications](./applications)
- [Adverse Events](./adverse-events)
- [Clinical Trials](./clinical-trials)
- [Products](./products)
- [Impurities](./impurities)
 
Beyond documenation of the parts, the rest of this README is meant to provide background on how to structure whole deployments of different types and to discuss ways of integrating the parts. 
 
## Your Deployment Type Depends on Your Goal   

Developers will often want to deploy locally and be able to modify code on the fly. In this case, **embedded Tomcat instances** for each service make the most sense. 

A production deployment may also use an embedded archicture in combination with other technologies such as Docker. A **single Tomcat instance** where all the microservices run under one Tomcat instance as individual "war" files is also an option.

Developers will probably want to clone referenced source git repositories as well.  Those deploying for production or just trying to run instances of GSRS microservices for evaluation can rely on published maven repostories that are downloaded automatically at build time.

## Cloning/repostitories from from Git

In order to launch a local maven run for testing GSRS 3.0, you will need to access to the following git repository:

https://github.com/ncats/gsrs3-main-deployment (GSRS 3 Main Deployment) **this is the repository you are viewing now**
- This repository contains the small wrappers and basic configuration settings needed to build the WAR files and to launch all microservices in an embedded mode.
- This repository also houses the raw compiled frontend artifacts which are needed to assemble the frontend. 
- This repository also houses a `docs` folder and README files which give additional information on installation, configuration and development.

The following additional git repositories are optional, and should be cloned by developers who wish to edit code in the dependencies of the GSRS 3 Main Deployment, for testing or other purposes.

https://github.com/ncats/gsrs-spring-starter (optional)
- This is the core starter library which is a dependency for all other entity endpoints (it’s also in maven central so you don’t need to clone this repository unless you want the most up-to-date code or special feature branch)

https://github.com/ncats/gsrs-spring-module-substances (optional)
- This is the core substance starter library and is the dependency where the majority of API logic is handled (it’s also in maven central so you don’t need to clone this repository unless you want the most up-to-date code or special feature branch)

https://github.com/ncats/GSRSFrontend/tree/development_3.0 (optional)
- This is the raw angular/typescript/html codebase for the frontend. This is where the frontend static files are generated for use in the frontend microservice found in the gsrs3-main-deployment repository. At the time of this writing the process for doing that build into the gsrs3-main-deployment frontend module is fairly manual. There is some limited documentation about the process within the gsrs3-main-deployment frontend README. This is not needed unless you intend to make a real change to the frontend code. Many changes to the frontend code can be done by changing its `config.json` file instead of changing the source code.

## Local Embedded Tomcat Instance Deployment

For the base level simple deployment, you can follow these steps: 
- Clone gsrs3-main-deployment repository
- Clone gsrs-spring-starter git repo and install (optional)
- Clone gsrs-module-substance-starter git repo and install (optional)
- Within the gsrs3-main-deployment repository, modify the `frontend/src/main/resources/application.properties` file to have the port you’d like the frontend to run on. The default is port 8082 and that is typically sufficient for local deployments.
- Within the gsrs3-main-deployment repository, modify the `frontend/src/main/resources/static/assets/data/config.json` file to have the "apiBaseUrl" property point to the correct REST API endpoint. In this case, that endpoint should be the full path you will use for the gateway, including a terminal slash ("/"). The JSON property "apiBaseUrl" might not be present in the JSON file. If not, add it as the first JSON property. Similarly add properties for "gsrsHomeBaseUrl" and optionally "apiSSG4mBaseUrl". add In the default configuration where the gateway is on localhost port 8081, you would write:

  ```
  "apiBaseUrl": "http://localhost:8081/",
  "gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/beta/",
  # optional
  "apiSSG4mBaseUrl": "http://localhost:8081/",
  ```

- Within the gsrs3-main-deployment repository, modify the `substances/src/main/resources/application.conf` file, give it a port, tell it where the gateway is, and ensure the `ix.home` setting for the indexing/cache folder is properly configured, and any database connection strings are set as expected. In a default configuration which uses H2 and has substances running on port 8080, the following conf settings should be as shown below. NOTE: The above configuration if no datasource is specified will use an in-memory transient database. Every restart of the application will result in the data being lost in such a case, but this may lead to confusing results as the cache and index found in the ix.home directory will remain between restarts. If you wish to use a persistent database, please configure the jdbc connections accordingly. If using the in memory database, you may want to delete your `ginas.ix` folder between restarts. 

  ```
  # Use port 8080 for the substances API
  server.port= 8080
 
  # This says to use a local folder called ginas.ix 
  ix.home="./ginas.ix"                     
 
  # Set the gateway address (for use with returning proper url patterns from the API) 
  application.host="http://localhost:8081"
  ```

- Within the gsrs3-main-deployment repository, modify `gateway/src/main/resources/application.yml`, give it a port, tell it where the other 2 microservices are. The default settings should typically be configured for substances on 8080 and the frontend on 8082, but this is subject to change. The following snippet would configure things for just the substances (running on 8080) and frontend (running on 8082):

  ```
  zuul:
    #this sets sensitiveHeaders to empty list so cookies and auth headers are passed through both ways
    sensitiveHeaders:
    routes:
      ui:
        path: /ginas/app/beta/**
        url: http://localhost:8082
        serviceId: frontend
        stripPrefix: false
      #fallback anything else goes to substances
      legacy:
        path: /**
        url: http://localhost:8080
        serviceId: substances
    ignored-patterns:
        - "/actuator/health"

  ribbon:
    eureka:
      enabled: false

  server.port: 8081
  ```

Once the configuration above is performed, it's now possible to launch the serviced. Below we will describe how to launch each of the 3 services in 3 different terminals. Keep all terminals open (or have them run in the background via `nohup` or `screen`).


- **Running the gateway service:** In a new terminal or screen session, in the `gsrs3-main-deployment` directory launch gateway with these commands:

  ```
  cd gateway
  ./mvnw clean -U spring-boot:run
  ```
  
- **Running the substances service:** Before running the substances service, it would be good to take note of the fork value in the substances/pom.xml file. If you are running the substance service as-is with no data load, the fork value should be left as the default - which is false - in order to avoid a 'filename too long' error common with spring boot. However, if you choose to run the service and add the test records, set the fork value to true.
Again in a new terminal or screen session, in the gsrs3-main-deployment directory launch substances by:
  ```
  # To run substances as-is with no data load (fork should be set to false):
  cd substances
  ./mvnw clean -U spring-boot:run

  # If you’re using a blank database, you may want to add the test set of 18 records by doing the following instead
  # to preload a small sample for testing (fork should be set to true):
  cd substances 
  ./mvnw clean -U spring-boot:run -Dspring-boot.run.jvmArguments="-Dix.ginas.load.file=src/main/resources/rep18.gsrs"
  ```

Another reason to use fork=true is if you wish to set jvmArguments for a specific service.  This is more likely to be an issue if you're using embedded tomcat in **production** with a large data set rather than locally. Subustances uses quite a bit of memory, whereas the other services don't need so much; so you'd use the defaults for other services, but apply specific values for substances.  The effect of fork=true is that the service will run in it's own JVM instance. The POM configuration with arguments would like something like this:  

'''
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        ...
        <configuration>
            <fork>true</fork>
            <jvmArguments>-Xmx16000m -Xms12000m</jvmArguments>
        </configuration>
    </plugin>
'''


- **Running the frontend service:** Again in a new terminal or screen session, in the gsrs3-main-deployment directory launch frontend by:
  ```
  cd frontend
  ./mvnw clean -U spring-boot:run
  ```

- To confirm it’s working, navigate to `http://localhost:8081/ginas/app/beta` (or the equivalent for your configuration – note that "8081" in this case is the port for the gateway which will route to the frontend on another port). Note: if you deploy this application for others to use, please make sure to perform this step.  Otherwise, the first user to hit the application will see an error message.  If you deploy GSRS via script, include a GET (via curl or similar utilty) within the script.

- You should be able to login on the Frontend.  In the local development version, the username and password are `admin`, `admin` respectively.    

## Optionally use Development Mode for the Frontend in the Local Embedded Deployment

You can run the frontend in **development mode**. Do that if you want to make changes to the Angular code and compile on the fly while testing.  

- You will have to make some small modifications to the a) the gateway `application.yml` file and b) **your own** angular frontend code repository.  First, stop the gateway service if it is running.  Then, make the change below in the `gsrs3-main-deployment/gateway/java/main/resources/application.yml` file:

  ```
   # Change FROM
  routes:
     ui:
        path: /ginas/app/beta/**    
        url: http://localhost:8082   
        serviceId: frontend
        stripPrefix: false

   # Change TO 
  routes:    
    ui:
       path: /ginas/app/beta/**     
          url: http://localhost:4200/
          serviceId: frontend 
          # use default
          # stripPrefix: false
  ```

- Save `application.yml` and restart the gateway.

Next, go to your own Angular code repo (typically `GSRSFrontend`) outside of the gsrs3-main-deployment folder. Temporarily edit the file, `src/index.html`, changing from `<base href="/">` to `<base href="/ginas/app/beta/">`.  Make sure you temporarily have following in `src\app\fda\config\config.json` and/or `src\app\core\config\config.json` 

  ```
  "apiBaseUrl": "http://localhost:8081/",
  "gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/beta/",
  # optional
  "apiSSG4mBaseUrl": "http://localhost:8081/",  
  ```
  
Finally, recompile the angular code, as usual with the `npm` command. See [Compile Requirements](frontend/README.md#compile-requirements) in the frontend README. 

Now, hitting in your browser, `http://localhost:8081/ginas/app/beta/home` will run **your own** development Angular code, rather than the **compiled** version in the `gsrs3-main-deployment` repository.  Please make sure not to commit the above changes if making a pull request to this repository.

## Making an Additional Microservice 

While the substance service is the core focus of GSRS, additional microservices can be built to relate another domains’ data to substances. Additional microservices currently implemented include Drug/Biologic Applications, Drug/Biologic Products and Clinical Trials. Each microservice works via two main elements: 1) a domain specific spring boot starter module, and 2) an executing implementation in `gsrs3-main-deployment`. The starter module builds on the core GSRS starter and defines domain specific models, controllers, indexers, services, etc. Next, the executing implementation in `gsrs3-main-deployment` contains a configuration file, and the "java main" application runner that launches the microservice.  Each domain starter module currently works with two datasources. The domain specific datasource holds the domain's own entity data. The other "default" datasource may or may not be the same as the substance core datasource. The default datasource stores all data records GSRS routinely keeps for all GSRS entities, such as backups and incremental edits of the entity. Currently, the default datasource also contains session and user data required for authentication. **NOTE** At present time, in order for the _same_ authenticaion to work through the gateway and UI for each service, each service _must_ point to the same default ("spring") core data source. Alternative authentication schemes which would lift this requirement are possible, but beyond the scope of this document.


If the microservice to be added to `gsrs3-main-deployment` does not yet exist, the simplest path is to copy the `substances` folder to a new folder such as `my-service`.  However, the following (and more) files will have to edited (E), renamed (R), deleted (D) and/or simplified (S) as appropriate:  
- pom.xml (E, S)
- application.conf (E, S) 
- SubstancesApplication.java (R, S)
- LoadGroupsAndUsersOnStartup.java (D) 

If the microsrevice to be added already has an implementation in the `gsrs3-main-deployment`, then it’s likely that you just need to modify its application.conf file to meet your needs and then change the gateway’s `application.yml` file to include the associated paths. Either way, the `application.conf` file will have these important values, among others.

```
server.port = ####  
application.gateway = "http://localhost:8081"
ix.home= "ginas.ix/"

# Currently The GSRS FrontEnd requires that the export directory for your microservice be the same as that of substances in order
# for all exports to show in the user's download interface. This requirement will likely not be needed in future versions. 
ix.ginas.export.path=../substances/ginas.ix/gsrs_exports

# Default datasource #
spring.datasource.url="jdbc:h2:file:../substances/ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE"
spring.datasource.driverClassName="org.h2.Driver"
spring.jpa.database-platform="org.hibernate.dialect.H2Dialect"
### !!!! CAREFUL !!!! ####
### Hibernate ddl auto (none, create, create-drop, validate, update) ###
spring.jpa.generate-ddl=false
spring.jpa.hibernate.ddl-auto=none
#spring.hibernate.show-sql=true

## Your microservice specific datasource ##
myservice.datasource.url="jdbc:h2:file:./ginas.ix/h2/myservicedb;AUTO_SERVER=TRUE"
myservice.datasource.driverClassName="org.h2.Driver"
myservice.datasource.username="sa"
myservice.datasource.password=""
myservice.jpa.database-platform="org.hibernate.dialect.H2Dialect"
### !!!! CAREFUL !!!! ####
### Hibernate ddl auto (none, create, create-drop, validate, update) ###
myservice.jpa.generate-ddl=false
myservice.jpa.hibernate.ddl-auto=none
#myservice.hibernate.show-sql=true
```
Note that your microservice datasource is configured in a spring starter module java configuration class. In this case, `myservice` in the datasource configuration corresponds to the `PERSIST_UNIT` value in your `MyServiceDataSourceConfig` class. That perist unit value should be all lower case. The `spring` value is the default `PERSIST_UNIT`. The default datasource is configured in the GSRS Spring Boot stater in the `DefaultDataSourceConfig` class.      

To get your microservice running you also have to specify some paths in the gateway service `application.yml`. These paths tell the Gateway how to route traffic to your microservice's entity services. Let’s say your microservice has two entities, MyWidget and MyThingy; and your server.port defined above is 8999. Assuming an embedded tomcat context, your paths would look like this:
```
zuul:
  routes: 
    my_widgets:
      path: /api/v1/mywidgets/**
      url: http://localhost:8999/api/v1/mywidgets
      serviceId: my_widgets
    my_widgets_alt:
      path: /api/v1/mywidgets(**)/**
      url: http://localhost:8999/api/v1/mywidgets
      serviceId: my_widgets

    my_thingies:
      path: /api/v1/mythingies/**
      url: http://localhost:8999/api/v1/mythingies
      serviceId: my_thingies
    my_thingies_alt:
      path: /api/v1/mythingies(**)/**
      url: http://localhost:8999/api/v1/mythingies
      serviceId: my_thingies
```
While an entity class `MyWidget` is singular, the url uses the plural `CONTEXT` value as defined in something like `MyWidgetEntityService.java`. The `_alt` values are necessary to handle certain ODATA-like patterns not captured by the standard route.     

## Single Tomcat Deployment with WAR files for Core and Frontend


FDA currently uses the Single Tomcat WAR files deployment strategy in production for the GSRS core and additional microservices. The steps here have similarities to the local embedded testing deployment strategy, so please review that section in this document before proceeding. These steps, however, are also quite different in several important ways. [FDA has also provided a detailed deployment guide in the docs folder](./docs) which goes into some more specifics.
 
One difference is that Tomcat (running on port 8080) routes traffic to executed war file instances, all running on the same port. In contrast, in the embedded case, the gateway routes traffic to executable jar files, and each jar contains its own webserver and runs on its own port. 

Another difference is data written to disk, such as indexes and caches, are kept in folders separate from the code. In addition, a copy of each microservice configuration is also kept separate from the code.  All edits to the configuration are made separately from the code. You will copy those edited files and use them to overwrite the ones that were generated (at packaging time) inside the WAR files.

Note, the following was elaborated on Tomcat9, and should be adjusted for Tomcat10. In version 10, Tomcat automatically makes a transformation of WAR files when they are copied to the folder: `webapps-javaee`. At FDA, even on version 10, the WAR files are copied to the `webapps` folder instead, and the transformation is made there explicitly. More on that later.

**1. Start by cloning the gsrs3-main-deployment and other optional repositories**
 
This gsrs3-main-deployment repository contains the small wrappers needed to build the WAR files needed for this deployment strategy. There are configurations in the repository for reference as well, but those configurations are usually made with the local testing deployment strategy in mind.  

Note that gsrs3-main-deployment also houses the raw compiled frontend artifacts which are needed to assemble the frontend.  
  
Clone gsrs3-main-deployment repository.

```
git clone https://github.com/ncats/gsrs3-main-deployment
```

Optionally, you can clone and install these repositories if you need the very latest code. If you do not, maven will download the published repositories as opposed to those on github.
 
https://github.com/ncats/gsrs-spring-starter (master)
https://github.com/ncats/gsrs-spring-module-substances (master)
https://github.com/ncats/GSRSFrontend/tree/development_3.0

At this time, you may also need to clone and install the applications (starter branch) and drug products repositories (starter branch). That is because the substance starter module has some dependendencies on applications and products.   

**2. Prepare your environment for this tutorial**
 
On your server, create some helpful environment variables for this tutorial and then create folders where configurations and runtime time data can be written. These folders should be separate from the code so they can be reused without getting erased.  

Run the following in your Linux terminal. Use can use `git bash` on windows.  

  ```
  # These export statements should be run each time you open a new terminal. 
  export gsrs_ci_repo_dir=/path/to/your/gsrs3-main-deployment/repository 	
  export webapps=/path/to/tomcat/webapps 
  export config_dir=/path/to/gsrs_configs/ 

  # The following need to be done once. 
  sudo mkdir $webapps/gsrs_substances.ix
  sudo mkdir $webapps/gsrs_substances.ix/h2
  sudo mkdir $webapps/gsrs_substances.ix/sequence
  sudo mkdir $webapps/gsrs_substances.ix/structure

  sudo mkdir $webapps/gsrs_frontend.ix 
  mkdir -p $config_dir
  ```

**3. Prepare your Frontend configs** 

Create a file `$config_dir/frontend_application.conf` and add the following.
``` 
# Set the gateway address
application.host="http://localhost:8080" 
```

Create a file `$config_dir/frontend_config.json` and add the following.

Copy the contents of `$webapps/frontend/src/main/resources/static/assets/data/config.json` to this file. Modify it to have the "apiBaseUrl" and other properties point to the correct  endpoints. In this case that endpoint should be the full path you will use for the gateway, including a terminal slash ("/"). The JSON property "apiBaseUrl" may not be present in the JSON file, if it is not, add it as the first JSON property. In the Single Tomcat configuration where the gateway is on localhost port 8080. Follow the same logic for "gsrsHomeBaseUrl" and optionally "apiSSG4mBaseUrl".

  ```
  "apiBaseUrl": "http://localhost:8080/",
  "gsrsHomeBaseUrl": "http://localhost:8080/ginas/app/beta/",
  # optional
  "apiSSG4mBaseUrl": "http://localhost:8080/",
  ```

**4. Prepare your Substances configs** 

Create a file `$config_dir/substances_application.conf` and include the following. 
  ```
  include "substances-core.conf"

  # This says to use this folder for indexes, etc.
  # Must be an absolute path in in tomcat case?
  # Must be in webapps? 
  ix.home="/var/lib/tomcat9/webapps/gsrs_substances.ix"

  # Set the gateway address 
  application.host="http://localhost:8080" 

  spring.application.name="substances"

  # Must be an absolute path in tomcat case?
  ix.h2 {
          base = ${ix.home}/h2
        }
        
  # Set the default Datasource, example H2 configuration

  spring.datasource.url="jdbc:h2:file:${ix.h2.base}/sprinxight;AUTO_SERVER=TRUE" 
  spring.datasource.driverClassName="org.h2.Driver"
  spring.jpa.database-platform="org.hibernate.dialect.H2Dialect" 
  ### !!!! CAREFUL  !!!! ####
  ### Hibernate ddl auto (none, create, create-drop, validate, update) ### 
  # if your db is not created automatically while testing set to true temporarily
  spring.jpa.generate-ddl=false  
  # if your db is not created automatically while testing set to create temporarily
  spring.jpa.hibernate.ddl-auto=none
  spring.hibernate.show-sql=true

  # NEED THIS for Applications-api and Products-api
  gsrs.microservice.applications.api.baseURL="http://localhost:8080/"
  gsrs.microservice.products.api.baseURL="http://localhost:8080/"
```

**5. Prepare your Gateway configs**

Create the file `$config_dir/gateway_application.yml` and add the following:   
```
  spring:
    application:
      name: gateway

  debug: true

  zuul:
    # This sets sensitiveHeaders to empty list so cookies and auth headers are passed through both ways
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
      legacy:
        path: /**
        url: http://localhost:8080/substances
        serviceId: substances
    ignored-patterns:
        - "/actuator/health"

  ribbon:
    eureka:
      enabled: false

  # server.port: 8081
  # management.endpoints.web.exposure.include: *
  management.endpoints.web.exposure.include: 'routes,filters'

  eureka.client.enabled:  false

  zuul.host.socket-timeout-millis: 300000
```

**6. Package your WAR files, then copy to Tomcat and rewrite configs** 
 
Next, do or run the following on command-line:  
  ``` 
  # Stop your tomcat, if not yet done

  For the Frontend, run these commands in the command-line:  

  cd $gsrs_ci_repo_dir/frontend

  mvn package -DskipTests # to generate frontend.war

  # Extract the war file into webapps folder

  sudo unzip $gsrs_ci_repo_dir/frontend/target/frontend.war -d $webapps/frontend

  sudo cp -rf ${config_dir}/frontend_config.json ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

  sudo chmod a+r  ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

  sudo chown tomcat:tomcat  ${webapps}/frontend/WEB-INF/classes/static/assets/data/config.json

  sudo cp -rf ${config_dir}/frontend_application.conf ${webapps}/frontend/WEB-INF/classes/application.conf

  sudo chmod a+r ${webapps}/frontend/WEB-INF/classes/application.conf

  sudo chown tomcat:tomcat ${webapps}/frontend/WEB-INF/classes/application.conf
```

For Substances, run these commands on the command-line:  
  ```
  cd $gsrs_ci_repo_dir/substances

  mvn package -DskipTests # to generate substances.war

  sudo unzip $gsrs_ci_repo_dir/substances/target/substances.war -d $webapps/substances

  sudo cp -rf ${config_dir}/substances_application.conf ${webapps}/substances/WEB-INF/classes/application.conf

  sudo chmod a+r ${webapps}/substances/WEB-INF/classes/application.conf

  sudo chown tomcat:tomcat ${webapps}/substances/WEB-INF/classes/application.conf
  ```

For the Gateway, run these commands on the command-line:  

  ``` 
  # Notice that the gateway is written to ROOT in the Tomcat webapps folder

  cd $gsrs_ci_repo_dir/gateway

  mvn package -DskipTests # to generate gateway.war

  sudo unzip $gsrs_ci_repo_dir/gateway/target/gateway.war -d $webapps/ROOT

  sudo cp -rf ${config_dir}/gateway_application.yml ${webapps}/ROOT/WEB-INF/classes/application.yml

  sudo chmod a+r ${webapps}/ROOT/WEB-INF/classes/application.yml

  sudo chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/application.yml
```

Now, you're ready to run the application in Tomcat. Do the following: 
  ```
  # Start your tomcat

  # Check this log $webapps/logs/catalina...log

  # Try to hit these Urls
  http://localhost:8080/api/v1/substances
  http://localhost:8080/ginas/app/beta/

  # Again, check this log $webapps/logs/catalina...log
  ```


## Turning on an Additional Entity Services in a Single Tomcat Instance

An additional microservice works with two main parts. First, a starter package that establishes microservice entities, repositories, controllers, indexers, etc. Next, there is an executing implementation in the `gsrs3-main-deployment` that imports the starter package and sets configuration properties. The `gsrs3-main-deployment` implementation for the microservice also has a main() method that runs the service. 

An additional service like Clinical Trials already exists, for example. The entities present in the Clinical Trials starter package are ClinicalTrialUS and ClinicalTrialEurope.  In the `gsrs3-main-deployment`, you'll see a folder `gsrs3-main-deployment/clinical-trials`. To make it work in the Single Tomcat instance scenario described above, take the following steps.
 
**1. Prepare your environment for this additional microservice tutorial.**
  ``` 
  # These export statements should be run each time you open a new terminal. 

  export gsrs_ci_repo_dir=/path/to/your/gsrs3-main-deployment/repository 	
  export webapps=/path/to/tomcat/webapps 
  export config_dir=/path/to/gsrs_configs/ 

  # The following need to be done once.
  sudo mkdir $webapps/gsrs_clinical-trials.ix
  sudo mkdir $webapps/gsrs_substances.ix/h2
  ```

**2. Prepare your Clinical Trials configs**
 
Create a file `$config_dir/clinical-trials_application.conf` and include the following.

  ```
  # This includes only the bare essentials. See gsrs3-main-deployment/clinical-trials

  include "gsrs-core.conf"

  ix.home="/var/lib/tomcat9/webapps/gsrs_clinical-trials.ix" 

  ix.ginas.export.path="/var/lib/tomcat9/webapps/gsrs_exports"

  application.host= "http://localhost:8080"

  # Leave commented out for Single Tomcat Instance
  # server.port=8080

  # H2 Database Connection
  spring.datasource.url="jdbc:h2:file:../substances/ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE"
  spring.datasource.driverClassName="org.h2.Driver"
  spring.jpa.database-platform="org.hibernate.dialect.H2Dialect"
  ### !!!! CAREFUL  !!!! ####
  spring.jpa.generate-ddl=false
  # Hibernate ddl auto (none, create, create-drop, validate, update)
  spring.jpa.hibernate.ddl-auto=none
  spring.hibernate.show-sql=true

  clinicaltrial.datasource.url="jdbc:h2:file:./ginas.ix/h2/ctdb;AUTO_SERVER=TRUE"
  clinicaltrial.datasource.driverClassName="org.h2.Driver"
  clinicaltrial.datasource.username="sa"
  clinicaltrial.datasource.password=""
  clinicaltrial.jpa.database-platform="org.hibernate.dialect.H2Dialect"
  ### !!!! CAREFUL  !!!! ####
  # clinicaltrial.jpa.generate-ddl=false
  # For testing
  # Hibernate ddl auto (none, create, create-drop, validate, update)
  clinicaltrial.jpa.hibernate.ddl-auto=update
  clinicaltrial.hibernate.show-sql=true
  # For commit
  # clinicaltrial.jpa.hibernate.ddl-auto=none
  # clinicaltrial.hibernate.show-sql=true
  ```
**3. Modify your Gateway configs** 
 
In $configs_dir/gateway_application.yml, add the following: 
  ``` 
  # Notice that In the Single Tomcat scenario, urls contain the gsrs3-main-deployment folder name of the microservice (e.g. clinical-trial) 

  zuul:
    routes:
      # Put below already present routes
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
  ```
**4. Package your WAR files, then copy to Tomcat and rewrite configs**  
 
Do or run the following on command-line:
```
# Stop your tomcat, if not yet done 
```

For Clinical Trials, run these commands on the command-line:   
  ```
  cd $gsrs_ci_repo_dir/clinical-trials 

  mvn package -DskipTests # to generate clinical-trials.war 

  sudo unzip $gsrs_ci_repo_dir/clinical-trials/target/clinical-trials.war -d $webapps/clinical-trials 

  sudo cp -rf ${config_dir}/clinical-trials_application.conf ${webapps}/clinical-trials/WEB-INF/classes/application.conf 

  sudo chmod a+r ${webapps}/clinical-trials/WEB-INF/classes/application.conf 

  sudo chown tomcat:tomcat ${webapps}/clinical-trials/WEB-INF/classes/application.conf 
  ```
 
**5. For the Gateway, update application.yml**
  ```
  sudo cp -rf ${config_dir}/gateway_application.yml ${webapps}/ROOT/WEB-INF/classes/application.yml 

  sudo chmod a+r ${webapps}/ROOT/WEB-INF/classes/application.yml 

  sudo chown tomcat:tomcat ${webapps}/ROOT/WEB-INF/classes/application.yml
  ```  

Now, you're ready to run the application in tomcat. Do the following:  
  ```
  # Start your tomcat 

  # Check this log $webapps/logs/catalina...log 

  # Try to hit these Urls 

  http://localhost:8080/api/v1/clinical-trials 

  http://localhost:8080/ginas/app/beta/browse-clinical-trials 

  # Again, check this log $webapps/logs/catalina...log
  ```

## Adding a New Frontend Submodule for a New microservice

When developers add a new microservice to the GSRS, they may also want to create a frontend module to interact with the backend service. The frontend code is all separate from the backend and currently in a single Angular project.  Typically, each entity service has its own folder where Angular code and templates are stored. To date, all non-core folders are located in the folder: `src/app/fda`    
 
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
     if (configName === '...' || configName === 'clinicaltrialsus' ...
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
