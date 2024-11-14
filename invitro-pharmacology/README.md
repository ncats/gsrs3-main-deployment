# TO DO FOR INVITRO PHARMACOLOGY

# GSRS Substance Module Deployment

This is the "main" GSRS microservice and contains the most critical 
and complicated functionality of the whole project.

## Requirements
### Java 
  We are targeting Java 11 runtime for this project although the code can be built using java 8

### Memory
#### RAM
This microservice probably needs lots of RAM.  While we haven't tested the 3.0 codebase will a full dataset yet,
The 2.x codebase in production is run with about 90GB of RAM. Most of the RAM use is because GSRS has user specific 
in memory caching which is not ideal.

#### Disk Space
This microservice needs several GB of diskspace for file caches and lucene indexes, and user created files.
The root path for this is set in the config to use the variable `ix.home`. This should be able to be set as an environment variable.

### Database
This microservice requires a SQL database loaded with the GSRS database schema
and optionally populated.  The database requires several GB of space.
The database connection strings will be added to the configuration files
once we work out what they will be.

## Enviornment Variables used
* `EUREKA_SERVER` should be set to the url for the discovery server.  If not set defaults to `http://localhost:8761/eurkea`
* `IX_HOME` is the path to where GSRS should write out files for temp data and caches.  For now for testing
this can be erased after each build but production deployments probably want this to stay around across multiple deployments.
* `GATEWAY_HOST` is the host URL for the gateway 
  and all url link outs to self or other microservices in response json will use this.  if not set defaults to localhost.
  
## Building and Deploying
Currently, this microservice is set to be built as a war file and deployed inside a Tomcat instance.

```
./mvnw clean package
```
Will produce a war file in the `target/` directory

## Service Discovery
This module uses Eureka for Service Registration and will register itself as the module "substances".
To add load balancing support, multiple instances of this microservice either running on different
machines or the same machine on different ports can be run and they will all register themselves
as "substances".  And the Eureka system will load balance calls across all healthy instances.

However, for 3.0 we should keep the Substance module to a single instance because of caching issues
across substances

## Health Check
Spring Boot health checks use the url `actuator/info` and if the system is up will return a 200 status code and empty JSON `{}` 
however this can be configured to add other metadata should it be required.
