# GSRS Specified Substance Group 4 Manufacturing Microservice

This microservice is an entity service for storing, retrieving, searching and mapping SSG4M entities.

## Core Dependency Repos

- https://github.com/ncats/gsrs-spring-module-ssg4

The one dependency is a Spring-boot "starter."  This `gsrs3-main-deployment/ssg4m` service includes this starter library to actually create an executable deployment.

This service and its starter module are currently designed with FDA systems in mind. This module can be used by systems outside of FDA, but should be used more for evaluation than for production systems. Case in point, this module does not contain authentication and, thus, if used in production, the route should be secured in another way. The module is likely to change in the near future.

## Important: A Note on Schema

This schema design is likely to change in a near future release of GSRS modules.

## Build Instructions

This entity microservice can be built into a war file for deployment in a J2EE web container. The simplest way to do this is:
```
./mvnw clean package -DskipTests
```

To include the tests, remove `-DskipTests` from the command.

This will create a file `target/ssg4m.war`

## Running and Debugging

You can run the microservice locally for testing and debugging by running the following command, optionally skipping tests:
```
./mvnw clean spring-boot:run -DskipTests
```

## Configuration
Configuration will be affected by the default configurations included in the core dependencies. These will be supplemented by configuration in [./src/main/resources/application.conf](./src/main/resources/application.conf).

Examine this file.  It contains example properties, but you may need to change several properties to run locally as an embedded instance during debugging and development, or to deploy for production.

For local embedded Tomcat deployment, each microservice needs its own port. Here we use port 8088, but it could be another unique port number not used by any other microservice.
```
## Local embedded Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="./ginas.ix"
# Should be the port the gateway runs on.
application.host= "http://localhost:8081"
# The port your microservice runs on
server.port=8088
``` 

In production, you may be running the GSRS as a single Tomcat instance.  If so, the `application.host` will use the same port as your gateway port. Also, your `ix.home` folder needs to be unique to the product microservice.  For example, `ix.home="/path/to/tomcat/webapps/gsrs_ssg4m.ix"`
```
## Production Single Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="/path/to/tomcat/webapps/gsrs_ssg4m.ix
# Should be the port the gateway runs on.
application.host= "http://localhost:8080"
# Not needed, so comment out.
# server.port=8080
```

Configuration can be modified before or after building or running the deployed microservice.  The main thing to note is that this configuration will be copied during packaging to a location in the war file, and the war file will be unzipped when placed in the Tomcat `webapps` folder.  Since different configurations are needed for development and production, one approach to take is to have an alternative copy of `application.conf` in a secure location on the server. This can then copied to the deployed location on the production server before run time.  Once tomcat unzips your war file, you will find the configuration here:
```
path/to/webapps/ssg4m/WEB-INF/classes/application.conf
```

Overwrite this file with your production version of your configuration.

## Configure the Gateway

The gateway needs to know how to route traffic to and from the microservice.  As above, there are different configuration patterns depending on how the GSRS is deployed.

For the local embedded context, these properties should be added to other routes in the gateway `src/main/resources/application.yml` file.  Here we use port 8088 in the routes as we configured this `server.port` in `ssg4m/src/java/main/resources/application.conf`
```
zuul:
  routes:
    ...
  
    #############################
    #START SSG4 section
    #############################
    ssg4m_core:
      path: /api/v1/ssg4m/**
      url: http://localhost:8088/ssg4m
      serviceId: ssg4m_core
    #############################
    #END SSG4 section
    #############################
```

For a single Tomcat instance approach, these properties below should be included with other routes.  In this case we use port 8080 because that is the port (single) Tomcat is running on.
```
zuul:
  routes:
    ...
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
```

## Starting out

When you first use this module, your database will be empty.  In fact,
you might not even have the tables necessary to hold the data.  
That is to be expected. Make sure to set the Hibernate configuration parameters that end in `hibernate.ddl-auto` to `update`
for example,
```
spring.jpa.hibernate.ddl-auto=update
```

That way, the first time you run this service, Hibernate will create the data structures necessary to hold your data.  As a test, you can hit the URL `http://localhost:8088/ssg4m` in your browser.

If there is no error, it should show:
```
{"status":"OK"}
```

If you have the gateway running try the following rule to see if you get the same result.
```
http://localhost:8081/api/v1/ssg4m
```

Once the tables have been created, change the settings to
```
spring.jpa.hibernate.ddl-auto=none
```

Then, use the GSRS user interface to create some data. (From the hamburger menu, select 'Register SSG4')

Note: 'Hibernate' is part of the Spring Boot technology stack used by GSRS.
