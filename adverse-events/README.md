# GSRS 3 Adverse Event Microservice

This microservice is an entity service for storing, retrieving, searching and mapping Adverse Event to substances.

## Core Dependency Repos

- https://github.com/ncats/gsrs-spring-starter
- https://github.com/ncats/gsrs-spring-module-substances
- https://github.com/ncats/gsrs-spring-module-adverse-events

The three dependencies are Spring-boot "starters." This `gsrs-main-deployment/adverse-events` service includes these starter libraries to actually create an executable runnable deployment.    

## Build Instructions

This entity microservice can be built into a war file for deployment in a J2EE web container. The simplest way to do this is:

```
./mvnw clean package -DskipTests
```

To include the tests, remove `-DskipTests` from the command. 

This will create a file `target/adverse-events.war` 

## Running and Debugging

You can run the microservice locally for testing and debugging by running the following command, optionally skipping tests:

```
./mvnw clean spring-boot:run -DskipTests
```

## Configuration

Configuration will be affected by the default configurations included in the core dependencies. These will be supplemented by configuration in [./src/main/resources/application.conf](./src/main/resources/application.conf).  

Examine this file.  It contains example properties, but you may need to change several properties to run locally as an embedded instance during debugging and development, or to deploy for production

For local embedded Tomcat deployment, each microservice needs its own port. Here we use port 8086 but it could be another port unique port number not used by any other microservice.   

```
## Local embedded Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="./ginas.ix"
# Should be the port the gateway runs on.
application.host= "http://localhost:8081"
# The port your microservice runs on
server.port=8086
``` 

In production, you may be running the GSRS as a single Tomcat instance.  If so, the `application.host` will use the same port as your gateway port. Also, your `ix.home` folder needs to be unique to the adverse events microservice.  For example, `ix.home="/path/to/tomcat/webapps/gsrs_adverse_events.ix"`

```
## Production Single Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="/path/to/tomcat/webapps/gsrs_clinical-trials.ix
# Should be the port the gateway runs on.
application.host= "http://localhost:8080"
# Not needed, so comment out.
# server.port=8080
``` 



Configuration can be modifed before or after building or running the deployed microservice.  The main thing to note is that this configuration will be copied during packaging to a location in the war file, and the war file will be unzipped when placed in the Tomcat `webapps` folder.  Since different configurations are needed for development and production, one approach to take is to have an alternative copy of `application.conf` in a secure location on the server. This can then copied to the deployed location on the production server before run time.  Once tomcat unzips your war file, you will find the configuration here:    

```
path/to/webapps/adverse-events/WEB-INF/classes/application.conf
```

Overwrite this file with your production version of your configuration.

## Configure the Gateway

The gateway needs to know how to route traffic to and from the microservice.  As above, there are different configuration patterns depending on how the GSRS is deployed. 

For the local embedded context, these properties should be added to other routes in the gateway `src/main/resources/application.yml`  Here we use port 8086 as we configured this `server.port` in `adverse-events/src/java/main/resources/application.conf`

```
zuul:
  routes:

    ...
  
    #############################
    #START adverse-events section
    #############################
    adverseeventpt_core:
       path: /api/v1/adverseeventpt/**
       url: http://localhost:8086/api/v1/adverseeventpt
       serviceId: adverseeventpt_core
    adverseeventpt_core_alt:
       path: /api/v1/adverseeventpt(**)/**
       url: http://localhost:8086/api/v1/adverseeventpt
       serviceId: adverseeventpt_core
    adverseeventdme_core:
       path: /api/v1/adverseeventdme/**
       url: http://localhost:8086/api/v1/adverseeventdme
       serviceId: adverseeventdme_core
    adverseeventdme_core_alt:
       path: /api/v1/adverseeventdme(**)/**
       url: http://localhost:8086/api/v1/adverseeventdme
       serviceId: adverseeventdme_core
    adverseeventcvm_core:
       path: /api/v1/adverseeventcvm/**
       url: http://localhost:8086/api/v1/adverseeventcvm
       serviceId: adverseeventcvm_core
    adverseeventcvm_core_alt:
       path: /api/v1/adverseeventcvm(**)/**
       url: http://localhost:8086/api/v1/adverseeventcvm
       serviceId: adverseeventcvm_core
    #############################
    #END adverse-events section
    #############################
    
    ```

For a single Tomcat instance approach, these properties below should be included with other routes.  In this case we use port 8080 because that is the port Tomcat is running on.    

```
zuul:
  routes:
    ...
    
    adverseeventpt_core:
       path: /api/v1/adverseeventpt/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
       serviceId: adverseeventpt_core
    adverseeventpt_core_alt:
       path: /api/v1/adverseeventpt(**)/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
       serviceId: adverseeventpt_core
    adverseeventdme_core:
       path: /api/v1/adverseeventdme/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
       serviceId: adverseeventdme_core
    adverseeventdme_core_alt:
       path: /api/v1/adverseeventdme(**)/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
       serviceId: adverseeventdme_core
    adverseeventcvm_core:
       path: /api/v1/adverseeventcvm/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
       serviceId: adverseeventcvm_core      
    adverseeventcvm_core_alt:
       path: /api/v1/adverseeventcvm(**)/**
       url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
       serviceId: adverseeventcvm_core

```



