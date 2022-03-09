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
Next, set the URLs for the applications service, if you are using applications.  
```
#############################
#START applications section
#############################
    applications_core:
      path: /api/v1/application/**
      url: http://localhost:8083/api/v1/application
      serviceId: applications_core
    applications_all:
      path: /api/v1/applicationall/**
      url: http://localhost:8083/api/v1/applicationall
      serviceId: applications_all
    applications_searchcount:
      path: /api/v1/searchcount/**
      url: http://localhost:8083/api/v1/searchcount
      serviceId: applications_searchcount

    applications_darrts:
      path: /api/v1/applicationdarrts/**
      url: http://localhost:8083/api/v1/applicationdarrts
      serviceId: applications_darrts
#############################
#END applications section
#############################
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

