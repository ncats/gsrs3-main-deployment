# GSRS 3 Clinical Trials Microservice

This microservice is an entity service for storing, retrieving, searching and indexing US and European clinical trials. It especially focuses on mapping those trialtos to substances within a GSRS system.

## Core Dependency Repos

- https://github.com/ncats/gsrs-spring-starter
- https://github.com/ncats/gsrs-spring-module-substances
- https://github.com/ncats/gsrs-spring-module-clinical-trials

The three dependencies are Spring-boot "starters." This `gsrs-main-deployment/clinical-trials` service includes these starter libraries to actually create an executable runnable deployment.    

## Build Instructions

This entity microservice can be built into a war file for deployment in a J2EE web container. The simplest way to do this is:

```
./mvnw clean package -DskipTests
```

To include the tests, remove `-DskipTests` from the command. 

This will create a file `target/clinical-trials.war` 

## Running and Debugging

You can run the microservice locally for testing and debugging by running the following command, optionally skipping tests:

```
./mvnw clean spring-boot:run -DskipTests
```

## The Substances and Gateway Microservices should also be Running

This service can run independently in a limited way. You can hit this url directly. `http://localhost:8089/api/v1/clinicaltrialsus` and possibly get results.  However, pratically speaking, the Substances microservice needs to be running so as to display substance information when displaying trials. In addition, mapping substances to trials will require a validation step where the substance's existence is checked. To coordinate this check the Gateway is also needed.

One quick way to load a small set of substances for testing in the Substances service is to use the loader. See [here](../README.md) under "Running the substances service".

## Configuration

Configuration will be affected by the default configurations included in the core dependencies. These will be supplemented by configuration in  [./src/main/resources/application.conf](./src/main/resources/application.conf).  

Examine this file.  It contains example properties, but you may need to change several properties to run locally as an embedded instance during debugging and development, or to deploy for production

For local embedded Tomcat deployment, each microservice needs its own port. Here we use port 8089 but it could be another port unique port number not used by any other microservice.   

```
## Local embedded Tomcat Instance
# Where indexes and other file resources are kept.
ix.home="ginas.ix"
# Should be the port the gateway runs on.
application.host= "http://localhost:8081"
# The port your microservice runs on.
server.port=8089
``` 

In production, you may be running the GSRS as a single Tomcat instance.  If so, the `application.host` will use the same port as your gateway port. Also, your `ix.home` folder needs to be unique to the clinical trials microservice.  For example, `ix.home="/path/to/tomcat/webapps/gsrs_clinical-trials.ix"`

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
path/to/webapps/clinical-trials/WEB-INF/classes/application.conf
```

Overwrite this file with your production version of your configuration.


## Database Configuration

Database configuration also takes place in `application.conf`.  The default configuration for testing assumes H2 in a development context. Two datasources are used.  The **default** datasource points to the SAME datasource used by substances. The clinical trials application will use that datasource to store bookkeeping information such as a record of edits and backups.  The clinical trials microservice also uses its own datasource where clinical trials entities are stored directly.  Because two services (substances and clinical trials) are sharing the default datasource needs to be configured as sharable in both microservices' application.conf files.  AUTO_SERVER=TRUE means that multiple processes can access the same database without having to start the server manually.

```
# H2 Database Connections

spring.datasource.url="jdbc:h2:file:../substances/ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE"
spring.datasource.driverClassName="org.h2.Driver"
spring.jpa.database-platform="org.hibernate.dialect.H2Dialect"
spring.jpa.generate-ddl=false
# Hibernate ddl auto (none, create, create-drop, validate, update)
spring.jpa.hibernate.ddl-auto=update
spring.hibernate.show-sql=false
# Uncomment when NOT testing
# spring.jpa.generate-ddl=false
# spring.jpa.hibernate.ddl-auto=none
# spring.hibernate.show-sql=false

clinicaltrial.datasource.url="jdbc:h2:file:./ginas.ix/h2/ctdb;AUTO_SERVER=TRUE"
clinicaltrial.datasource.driverClassName="org.h2.Driver"
clinicaltrial.datasource.username="sa"
clinicaltrial.datasource.password=""
clinicaltrial.jpa.database-platform="org.hibernate.dialect.H2Dialect"
clinicaltrial.jpa.generate-ddl=false
# Hibernate ddl auto (none, create, create-drop, validate, update)
clinicaltrial.jpa.hibernate.ddl-auto=update
clinicaltrial.hibernate.show-sql=true
# Uncomment when NOT testing
# clinicaltrial.jpa.generate-ddl=false
# clinicaltrial.jpa.hibernate.ddl-auto=none
# clinicaltrial.hibernate.show-sql=false

```

## Configure the Gateway

The gateway needs to know how to route traffic to and from the microservice.  As above, there are different configuration patterns depending on how the GSRS is deployed. 

For the local embedded context, these properties should be added to other routes in the gateway `src/main/resources/application.yml`  Here we use port 8089 as we configured this `server.port` in `clincial-trials/src/java/main/resources/application.conf`

```
zuul:
  routes:

    ...
  
    #############################
    #START clinical-trials section
    #############################
    clinical_trials_us:
      path: /api/v1/clinicaltrialsus/**
      url: http://localhost:8089/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us
    clinical_trials_us_alt:
      path: /api/v1/clinicaltrialsus(**)/**
      url: http://localhost:8089/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us

    clinical_trials_europe:
      path: /api/v1/clinicaltrialseurope/**
      url: http://localhost:8089/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe
    clinical_trials_europe_alt:
      path: /api/v1/clinicaltrialseurope(**)/**
      url: http://localhost:8089/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe
    #############################
    #END clinical-trials section
    #############################
```

For a single Tomcat instance approach, these properties below should be included with other routes.  In this case we use port 8080 because that is the port Tomcat is running on.    

```
zuul:
  routes:
    ...
    
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


## Indexing

To index clinical trials during development, do the following via curl:
```
curl -X POST -H "auth-username: admin" -H "auth-password: admin"  http://localhost:8081/api/v1/clinicaltrialsus/@reindex&wipe=1  
curl -X POST -H "auth-username: admin" -H "auth-password: admin" http://localhost:8081/api/v1/clinicaltrialseurope/@reindex&wipe=0
```
In GSRS, the entities within one microservice are considered an indexing group. Including the query key value parameter, `wipe=1`, will cause all indexes within the microservice to be erased. Therefore only use `wipe=1` on the first entity you reindex. On the following entities use `wipe=0`.

## Cross Indexing 

*Advanced Topic* Starting in GSRS 3.0.1, cross indexing between the substances microservice and the clinical trials microservice is possible.  That is, when browsing substances, there are some clinical trials facets that may be useful.  To include this functionality, one must add some entries to the gsrs substance microservice configuration and to the clinical trials microservice configuration. This feature depends on the `gsrs-fda-substance-extension` found in the `gsrs-spring-module-substances` repository.   

In substances/src/main/resources/application.conf add the following: 

```
# You many need this depending on your authentication scheme. 
# gsrs.microservice.clinicaltrialsus.api.headers= {
#                        "auth-username" ="YOURAPIQUERYUSER",
#                        "auth-key"="YOURAPIQUERYUSER's key"
# }
# gsrs.microservice.clinicaltrialseurope.api.headers= {
#                        "auth-username" ="YOURAPIQUERYUSER",
#                        "auth-key"="YOURAPIQUERYUSER's key"
# }

gsrs.microservice.clinicaltrialsus.api.baseURL="http://localhost:8081/"
gsrs.microservice.clinicaltrialseurope.api.baseURL="http://localhost:8081/"

gsrs.indexers.list += {
  "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalUSTrialIndexValueMaker"
}
gsrs.indexers.list += {
  "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalEuropeTrialIndexValueMaker"
}

```

In clinical-trials/src/main/resources/application.conf add the following: 
```
gsrs.indexers.list += {
  "indexer" = "gov.hhs.gsrs.clinicaltrial.us.indexers.ClinicalTrialUSEntityLinkIndexValueMaker"
}

gsrs.indexers.list += {
  "indexer" = "gov.hhs.gsrs.clinicaltrial.europe.indexers.ClinicalTrialEuropeEntityLinkIndexValueMaker"
}
``` 

For the above API resources to work, you may need to run the `installExtraJars.sh` file found in the root folder of the `gsrs-spring-module-substances` repository. This will install several jar files including API configurations for specific microservices.  This is not necessary if you have installed  the `gsrs-spring-module-clinical-trials` repository.  


## Exports

*Advanced Topic* Starting in GSRS 3.0.1, US Clinical Trial exports are  available when browsing substances or viewing an individual substance detail. To include this functionality, one must add some entries to the gsrs substance microservice configuration and to the clinical trials microservice configuration. This feature depends on the `gsrs-fda-substance-extension` found in the `gsrs-spring-module-substances` repository.   

The following item is already included in `gsrs-main-deployment` substances/src/main/resources/fda-extension.conf. Therefore, this setting should be active when running an Embedded Tomcat instance. In other cases, you may need to add it to your substances application.conf file.
     
```
ix.ginas.export.factories.substances = ${ix.ginas.export.factories.substances}[
    # add this to bottom of list in addition to those there
   "fda.gsrs.substance.exporters.ExcelSubstanceRelatedClinicalTrialsUSExporterFactory"
]
```


In clinical-trials/src/main/resources/application.conf add the following: 

```

# This is needed for RestTemplate/Export things to work well
gsrs.loopback.port=${server.port}

# Should be same folder as substances' exports
ix.ginas.export.path="../substances/exports"


ix.ginas.export.factories.clinicaltrialsus = [
	"gov.hhs.gsrs.clinicaltrial.us.exporters.ClinicalTrialUSExporterFactory"
]
```

  


