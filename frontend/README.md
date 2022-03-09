# GSRS 3 Front End Microservice

This microservice serves up the static content of the GSRS 3 front end (beta browser).


## Core Dependency Repos

https://github.com/ncats/GSRSFrontend/tree/development_3.0


## Build instructions
```
./mvnw clean package
```

## Running and Debugging
```
./mvnw clean spring-boot:run
```

## Configuration
The most important configuration file is located `src/main/resources/static/assets/data/config.json`.  
* This JSON file can be configured both prior to build or after the build and deployment.
* This config file needs to point to the API base URL for the gateway in a given deployment with a line like this
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
* to change the route prefix (by default 'ginas/app/beta/'), change the `route.prefix` value in the `resources/application.conf` file and the `base href` value in the `resources/static/index.html` file

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
      path: /ginas/app/beta/**
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


