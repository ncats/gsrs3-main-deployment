# GSRS Gateway Module

This microservice uses Spring Cloud Gateway as a microservice to
route HTTP requests to other microservices.


## Requirements
### Java 
We are targeting the Java 11 runtime for this project although the code can be built using Java 8

#### RAM
This microservice will run fine with the default memory allocation.

### Discovery Service
GSRS can run with Eureka, a service that maintains a list of all running microservice.  Applications 
or services that require one of the microservices can look it up via Eureka rather than having to
keep a list of their own. 
Using the Discovery Service with GSRS is optional.  If the Discovery Service is not used, information 
for each service must present in the Gateway's yml configuration file.

#### Disk Space
This microservice requires little disk space.

### Database
This microservice uses no databases.

## Configuration

To modify configuration, change [./src/main/resources/application.yml](./src/main/resources/application.yml)


Set the port on which the service will run to an available port number:
```
server.port=8081
```

Next, set the URL for the substance service. Note: substance is not listed as `substances` but as `legacy`
```
legacy:
      path: /**
      url: http://localhost:8080
      serviceId: substances
```

Make sure the timeout on the gateway is sufficient, especially relevant on production servers.  
```
zuul.host.socket-timeout-millis: 300000 
```

Next, set the routes for other services. 

A) For **embedded Tomcat**, these are shown and already set here in the default [application.yml](./src/main/resources/application.yml) file.

B) Otherwise, for **single Tomcat** the routes are different.  The service name is included in the target path and the port is the same for all services. 

```
zuul:
  ... 

  # The routes listed below are for additional services only (excludes internal gateway, frontend, substances, legacy)

  routes:
  ... 

    adverseeventpt:
      path: ${api.base.path}/api/v1/adverseeventpt/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
      serviceId: adverseeventpt
    adverseeventpt_alt:
      path: ${api.base.path}/api/v1/adverseeventpt(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventpt
      serviceId: adverseeventpt
    adverseeventdme:
      path: ${api.base.path}/api/v1/adverseeventdme/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
      serviceId: adverseeventdme
    adverseeventdme_alt:
      path: ${api.base.path}/api/v1/adverseeventdme(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventdme
      serviceId: adverseeventdme
    adverseeventcvm:
      path: ${api.base.path}/api/v1/adverseeventcvm/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
      serviceId: adverseeventcvm
    adverseeventcvm_alt:
      path: ${api.base.path}/api/v1/adverseeventcvm(**)/**
      url: http://localhost:8080/adverse-events/api/v1/adverseeventcvm
      serviceId: adverseeventcvm

    applications_core:
      path: ${api.base.path}/api/v1/applications/**
      url: http://localhost:8080/applications/api/v1/applications
      serviceId: applications_core
    applications_core_alt:
      path: ${api.base.path}/api/v1/applications(**)/**
      url: http://localhost:8080/applications/api/v1/applications
      serviceId: applications_core_alt
    applications_all:
      path: ${api.base.path}/api/v1/applicationsall/**
      url: http://localhost:8080/applications/api/v1/applicationsall
      serviceId: applications_all
    applications_all_alt:
      path: ${api.base.path}/api/v1/applicationsall(**)/**
      url: http://localhost:8080/applications/api/v1/applicationsall
      serviceId: applications_all_alt
    applications_darrts:
      path: ${api.base.path}/api/v1/applicationsdarrts/**
      url: http://localhost:8080/applications/api/v1/applicationsdarrts
      serviceId: applications_darrts
    applications_darrts_alt:
      path: ${api.base.path}/api/v1/applicationsdarrts(**)/**
      url: http://localhost:8080/applications/api/v1/applicationsdarrts
      serviceId: applications_darrts_alt
    applications_searchcount:
      path: ${api.base.path}/api/v1/searchcounts/**
      url: http://localhost:8080/applications/api/v1/searchcounts
      serviceId: applications_searchcount
    applications_searchcount_alt:
      path: ${api.base.path}/api/v1/searchcounts(**)/**
      url: http://localhost:8080/applications/api/v1/searchcounts
      serviceId: applications_searchcount

    clinical_trials_us:
      path: ${api.base.path}/api/v1/clinicaltrialsus/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us
    clinical_trials_us_alt:
      path: ${api.base.path}/api/v1/clinicaltrialsus(**)/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialsus
      serviceId: clinical_trials_us
    clinical_trials_europe:
      path: ${api.base.path}/api/v1/clinicaltrialseurope/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe
    clinical_trials_europe_alt:
      path: ${api.base.path}/api/v1/clinicaltrialseurope(**)/**
      url: http://localhost:8080/clinical-trials/api/v1/clinicaltrialseurope
      serviceId: clinical_trials_europe  

    impurities:
      path: ${api.base.path}/api/v1/impurities/**
      url: http://localhost:8080/impurities/api/v1/impurities
      serviceId: impurities
    impurities_alt:
      path: ${api.base.path}/api/v1/impurities(**)/**
      url: http://localhost:8080/impurities/api/v1/impurities
      serviceId: impurities

    invitropharmacology_core:
      path: ${api.base.path}/api/v1/invitropharmacology/**
      url: http://localhost:8080/invitro-pharmacology/api/v1/invitropharmacology
      serviceId: invitropharmacology_core

    products_core:
      path: ${api.base.path}/api/v1/products/**
      url: http://localhost:8080/products/api/v1/products
      serviceId: products_core
    products_core_alt:
      path: ${api.base.path}/api/v1/products(**)/**
      url: http://localhost:8080/products/api/v1/products
      serviceId: products_core

    ssg4m_core:
      path: ${api.base.path}/api/v1/ssg4m/**
      url: http://localhost:8080/ssg4m/ssg4m
      serviceId: ssg4m_core
    ssg4m_core_alt:
      path: ${api.base.path}/api/v1/ssg4m(**)/**
      url: http://localhost:8080/ssg4m/ssg4m
      serviceId: ssg4m_core_alt





```


Eureka configuration must be set, even if you are not using Eureka.  
```
eureka:
  client:
    registerWithEureka: false
    fetch-registry: true
    serviceUrl:
      defaultZone: ${EUREKA_SERVER:http://localhost:8761/eureka}
  enabled: false
```

To turn ON Eureka, change the enabled line:
```
  enabled: true
```
Otherwise, leave it
```
   enabled: false
```

## Building and Deploying
Currently, this microservice uses the latest version of Spring Boot Cloud
but that uses a Reactive framework for handling requests that goes beyond
the Servlet specification.  Therefore it can not be used inside a war file.

To keep things consistent. We might downgrade the version of Spring Boot to an earlier version so it can be deployed as a war file
in a Tomcat instance.
```
./mvnw clean package
```

