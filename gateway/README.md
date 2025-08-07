# GSRS Gateway Module

The GSRS Gateway module is designed as a Java Spring Boot microservice that uses the Spring Cloud Gateway API to route HTTP requests to other GSRS microservices.

## Requirements

### Java

As for GSRS v3.1.2, the GSRS core application development team targets the Java 11 runtime although the GSRS code can alternatively be built using Java 8

#### RAM

The GSRS Gateway microservice will run without a problem with the default memory allocation.

#### Disk Space

The GSRS Gateway microservice requires little disk space.

#### Database

The GSRS Gateway microservice uses no databases.

## Configuration

The [./src/main/resources/application.conf](./src/main/resources/application.conf) file orchestrates the GSRS Gateway module's configuration. We hope that you will not need to change it. Instead, we recommend that you use environment variables and/or the top and/or bottom include files to influence the module's orchestration.

- gateway-env.conf (top)
- gateway.conf (bottom)

The default [./src/main/resources/gateway-env.conf](./src/main/resources/gateway-env.conf) file contains key:value pairs that make the Gateway work for embedded Tomcat, which is what most developers and most admins evaluating GSRS will use locally.

In a single Tomcat deployment, you can probably make this file blank in your deployment. However, this depends on your specific setup.

The bottom include, 1gateway.conf1, file can be used to override undesirable values that might be set in the `application.conf` or upstream. This file is blank/missing by default.

Core configuration values for the Gateway include:

- `api.base.path` (manage an API prefix like "/ginas/app")
- `server.port=8081` (required for embedded Tomcat deployments only)
- `server.servlet.context-path` should be `/` for both embedded and single Tomcat deployment types
- `zuul.routes` (sends requests to the Gateway' mapped service routes)

If running in single-Tomcat deployment, the `server.port` parameter is not used since all services would be running under Tomcat's port, usually 8080.

Make sure the timeout duration for the Gateway is sufficient. This is especially relevant on production servers.

```
zuul.host.socket-timeout-millis: 300000 
```

## Running the service (embedded Tomcat)

```
./mvnw clean -U spring-boot:run -DskipTests
```

## Building and Deploying

./mvnw clean -U package -DskipTests


## Discovery Service (experimental)

GSRS can run with Eureka, a service that maintains a list of all running microservices.

Using the Discovery Service with GSRS is experimental. We don't publicly distribute a service for that at this time. If you wish to experiment with a Discovery service, please contact the GSRS Team for sample code.
