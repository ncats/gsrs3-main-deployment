GSRS 3 Application Microservice

This microservice is an entity service for storing, retrieving, searching and mapping Application to substances.

## Core Dependency Repos

- https://github.com/ncats/gsrs-spring-starter
- https://github.com/ncats/gsrs-spring-module-substances
- https://github.com/ncats/gsrs-spring-module-drug-applications

The three dependencies are Spring-boot "starters." This `gsrs-main-deployment/applications` service includes these starter libraries to actually create an executable runnable deployment.    


## Important: A Note on Schema

This module is currently designed with FDA systems in mind. This module can be used by systems outside of FDA, but should be used more for evaluation than for production systems. The module is likely to change in the near future.

As designed there are currently 4 entity end points:

1. Applications Core (intended to be backed by real tables, and supporting CRUD operations)
2. Applications DARRTs (intended to be backed by views that serve up FDA-specific application data)
3. Applications All (intended to be backed by views that serve a union of BOTH darrts and core applications)
4. Search Counts (intended to be backed by views that serve up summary count information across applications, products, clinical trials, etc)


The entry forms, edit forms, advanced search and "Browse Applications" UI elements are set up to update the core applications (#1), and should work reasonably well on their own. However, summaries of applications within the substance details view, as well as some indexing and export features are built around the special "All" views. Similarly, the search count summaries found in substance browse views require additional configuration. Building the SQL table schemas from ddl will not automatically configure the views in such a way these features will be supported. A version of the SQL used for establishing the necessary views is found in the sql subdirectory here, and is presented for an oracle database. Some configuration changes are likely needed to use this setup in a non-FDA environment.

This schema design is likely to change in a near future release of GSRS modules.


## Build Instructions

This entity microservice can be built into a war file for deployment in a J2EE web container. The simplest way to do this is:

```
./mvnw clean package -DskipTests
```

To include the tests, remove `-DskipTests` from the command. 

This will create a file `target/applications.war` 

## Running and Debugging

You can run the microservice locally for testing and debugging by running the following command, optionally skipping tests:

```
./mvnw clean spring-boot:run -DskipTests
```

## Configuration

Configuration will be affected by the default configurations included in the core dependencies. These will be supplemented by configuration in  [./src/main/resources/application.conf](./src/main/resources/application.conf).  

Examine this file.  It contains example properties, but you may need to change several properties to run locally as an embedded instance during debugging and development, or to deploy for production

For local embedded Tomcat deployment, each microservice needs its own port. Here we use port 8083 but it could be another port unique port number not used by any other microservice.   

```
## Local embedded Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="./ginas.ix"
# Should be the port the gateway runs on.
application.host= "http://localhost:8081"
# The port your microservice runs on
server.port=8083
``` 

In production, you may be running the GSRS as a single Tomcat instance.  If so, the `application.host` will use the same port as your gateway port. Also, your `ix.home` folder needs to be unique to the application microservice.  For example, `ix.home="/path/to/tomcat/webapps/gsrs_applications.ix"`

```
## Production Single Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="/path/to/tomcat/webapps/gsrs_applications.ix
# Should be the port the gateway runs on.
application.host= "http://localhost:8080"
# Not needed, so comment out.
# server.port=8080
``` 



Configuration can be modifed before or after building or running the deployed microservice.  The main thing to note is that this configuration will be copied during packaging to a location in the war file, and the war file will be unzipped when placed in the Tomcat `webapps` folder.  Since different configurations are needed for development and production, one approach to take is to have an alternative copy of `application.conf` in a secure location on the server. This can then copied to the deployed location on the production server before run time.  Once tomcat unzips your war file, you will find the configuration here:    

```
path/to/webapps/applications/WEB-INF/classes/application.conf
```

Overwrite this file with your production version of your configuration.

## Configure the Gateway

The gateway needs to know how to route traffic to and from the microservice.  As above, there are different configuration patterns depending on how the GSRS is deployed. 

For the local embedded context, these properties should be added to other routes in the gateway `src/main/resources/application.yml`  Here we use port 8083 as we configured this `server.port` in `applications/src/java/main/resources/application.conf`

```
zuul:
  routes:

    ...
    
    #############################
    #START applications section
    #############################
    applications_core:
      path: /api/v1/applications/**
      url: http://localhost:8083/api/v1/applications
      serviceId: applications_core
    applications_core_alt:
      path: /api/v1/applications(**)/**
      url: http://localhost:8083/api/v1/applications
      serviceId: applications_core_alt
    applications_all:
      path: /api/v1/applicationsall/**
      url: http://localhost:8083/api/v1/applicationsall
      serviceId: applications_all
    applications_all_alt:
      path: /api/v1/applicationsall(**)/**
      url: http://localhost:8083/api/v1/applicationsall
      serviceId: applications_all_alt
    applications_darrts:
      path: /api/v1/applicationsdarrts/**
      url: http://localhost:8083/api/v1/applicationsdarrts
      serviceId: applications_darrts
    applications_darrts_alt:
      path: /api/v1/applicationsdarrts(**)/**
      url: http://localhost:8083/api/v1/applicationsdarrts
      serviceId: applications_darrts_alt
    applications_searchcount:
      path: /api/v1/searchcounts/**
      url: http://localhost:8083/api/v1/searchcounts
      serviceId: applications_searchcount
    applications_searchcount_alt:
      path: /api/v1/searchcounts(**)/**
      url: http://localhost:8083/api/v1/searchcounts
      serviceId: applications_searchcount

    #############################
    #END applications section
    #############################

```

For a single Tomcat instance approach, these properties below should be included with other routes.  In this case we use port 8080 because that is the port Tomcat is running on.    

```
zuul:
  routes:
    ...
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
      

```
## Starting out
When you first use this module, your database will be empty.  In fact,
you might not even have the tables necessary to hold the data.  
That is to be expected.  
Make sure to set the Hibernate configuration parameters that end in `hibernate.ddl-auto` to `update`
for example,
```
application.jpa.hibernate.ddl-auto=update
```
That way, the first time you run this service, Hibernate will create the data structures necessary 
to hold your data.  As a test, you can hit the URL `http://localhost:8083/api/v1/applications` in your browser.
It should show 
```
{"total":0,"count":0,"skip":0,"top":10,"content":[]}
```
Without error.  
Once the tables have been created, change the settings to 
```
application.jpa.hibernate.ddl-auto=none
```
Then, use the GSRS user interface to create some data. (From the hamburger menu, select 'Register|Product')  
  
Note: 'Hibernate' is part of the Spring Boot technology stack used by GSRS.
