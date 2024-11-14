# GSRS 3 Front End Microservice

This microservice serves up the static content of the GSRS 3 front end (ui browser).


## Core Dependency Repos

https://github.com/ncats/GSRSFrontend/tree/development_3.0


## Run/Build instructions

Starting in GSRS 3.1.1, the Frontend service `pom.xml` file includes automatic scripts to generate the Angular UI distribution/build.  When you issue a Maven `spring-boot:run` or `package` command, the default option is for the script to download the Frontend code from the GSRSFrontend repository and then use Node JS to create an Angular build. There are many workflow options discussed in this [how-to document](../docs/how-the-frontend-microservice-auto-build-works-and-options.md)

```
# Building 
export FRONTEND_TAG=development_3.0
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests

# Running/debugging
export FRONTEND_TAG=development_3.0
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests
```
See also:

[Frontend auto-build how-to](../docs/how-the-frontend-microservice-auto-build-works-and-options.md)


## Configuration

When you `run` the service, the default configuration file will be located here: 
```
frontend/target/classes/static/assets/data/config.json 
```
When you `package` the service, the default configuration file will be located in the `target/frontend.war` file. If you unzip the War file, the configuration file will be located here:
```
./WEB-INF/classes/static/assets/data/config.json
``` 

This JSON file can be configured both prior to build, or after the build and deployment.  The "how-to" document mentioned above also has examples showing how you can override this configuration file at runtime.  Locally, finding a way to override the configuration file at runtime makes sense because the `target` folder is frequently overwritten.  When running on a Tomcat server, you can overwrite the config.json file in the webapps folder before starting Tomcat. 

The config.json file needs to point to the API base URL for the gateway in a given deployment with a line like this

```
"apiBaseUrl" : "http://localhost:8081/",
```

* There are many UI options that are configured in this file including which entity microservices are active. One such example is the ability to enable components such as applications, products and clinical trials. This can be done by altering the `loadedComponents` config variable like so: 
 ```
 "loadedComponents": {
    "applications": true,
    "products": true,
    "clinicaltrials": true,
    "adverseevents": true,
    "impurities": true
    },
```
* to change the route prefix (by default 'ginas/app/ui/'), change the `route.prefix` value in the `resources/application.conf` file and the `base href` value in the `resources/static/index.html` file

The default approval code displayed can be changed from the default 'UNII' by setting the `approvalCodeName` value in the front-end config file. The same can be done with the default 'BDNUM` primary code by setting the `primaryCode` config value.

and primary code can now be changed in the front-end config by setting the `approvalCodeName` and `primaryCode`

Please see GSRS Frontend documentation for more information.

## Configure the Gateway

The gateway needs to know how to route traffic to and from the microservice.  As above, there are different configuration patterns depending on how the GSRS is deployed. 

For the local embedded context, these properties should be added to other routes in the gateway `src/main/resources/application.yml`  You want to be sure to set the port and path to the same `server.port` and `route.prefix` that you've set in the frontend `applications.properties` file.

```
  
zuul:
  #this sets sensitiveHeaders to empty list so cookies and auth headers are passed through both ways
  sensitiveHeaders:
  routes:
    ui:
      path: /ginas/app/ui/**
      url: http://localhost:8082
      serviceId: frontend
      stripPrefix: false

```

## To Generate the Front End Files
All web content is located in the `src/main/resources/static` folder and each
release will completely overwrite the files located there.

The directory is populated from the `GSRSFrontEnd` repository. First clone the https://github.com/ncats/GSRSFrontend repo and follow the installation instructions found in the readme. After everything is installed, run these commands:
```
$ cd /path/to/GSRSFrontEnd
$ npm run build:fda:prod
$ rm -rf /path/to/fronted/src/main/resources/static/*
$ cp -rf dist/browser/* /path/to/fronted/src/main/resources/static/.
```

## Compile Requirements

Starting with GSRS 3.0.1, the Angular version is 13.  

For GSRS 3.0.1 or higher: we recommend a recent Node JS Version, such as version 17 or higher to compile.  

GSRS 3.0 used Angular 8. Compile with Node JS 13.


