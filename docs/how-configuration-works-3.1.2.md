# How configuration works starting with 3.1.2

Last Edited: 2025-01-07

GSRS version at last edit: GSRS 3.1.2


By default SpringBoot configuration files are located in the `src/main/resources` folder of a microservice.

In a SpringBoot microservice, the default configuration filenames are usually `application.properties` or `application.yml`.  The extension indicates the format.  Property files have a long history in Java compared to YAML. GSRS adds a third format called **HOCON** (Human-Optimized Config Object Notation).  The following links provide more information on the three formats.

- [Properties](https://www.baeldung.com/java-properties)
- [HOCON](http://github.com/lightbend/config/blob/main/HOCON.md)
- [YAML](https://www.baeldung.com/spring-yaml)


## Activating HOCON

HOCON is already specified as a dependency in most modules and services. If you need to add it to a new service, there are two steps involved.

First, edit or create the file: `src/main/resources/META-INF/spring.factories`. Add the line:

```
org.springframework.boot.env.PropertySourceLoader=com.github.zeldigas.spring.env.HoconPropertySourceLoader
```

If the service does not import the `gsrs-spring-boot-autoconfigure` module from the `gsrs-spring-starter`, we must add the dependency.

We add this to our the `pom.xml` file:  

```
    <dependency>
        <groupId>com.github.zeldigas</groupId>
        <artifactId>spring-hocon-property-source</artifactId>
        <version>0.4.0</version>
    </dependency>
```

With that done, our microsevice configuration file `src/main/resources/application.conf` will be loaded automatically. In fact, what happens in the background when we `build` or `package` is that `application.conf` is added to the `classes` folder of a jar or war file. Since it's in the class path, SpringBoot finds it and loads it automatically .

The benefit of HOCON is that it: 
- provides a more readable format;
- allows for easier environment varariable substitutions;
- allows for more flexible overrides; and
- allows for more flexible file includes. 

One pitfall of HOCON relative to Yaml is that order is not presevered in maps whereas it might be preserved with SpringBoot and specifially Zuul when loading Yaml files. 

In GSRS, we solve this problem in two ways in two different contexts where it matters. 

For Gateway routes, we name the Zuul route keys in ways that can be sorted alphabetically. However, this load behavior can be disabled -- and should be if you chose to use Yaml to configure the Gateway. See the Gateway section of this document for more detail. 

For `extension` configurations, we add an order field in extension configruation object properties. This allows for sorting the extension config objects after the properties are loaded. See the Extensions section of this document for more detail. 

If one uses HOCON for the application.conf, it is proabably the best practice to omit any `application.properties` or `application.yml` files as all these files would be loaded automatically and cause strange behavior. 

## Learn more about HOCON format 

http://github.com/lightbend/config/blob/main/HOCON.md

## HOCON transformed into Java properites

When we use HOCON, the HOCON plugin loads the configuration. Then it transforms the HOCON code into Java properties.  SpringBoot then loads the properties into into the application context/environment.

For example, this: 

```
application.name = "substances"
application.host = "http://localhost:8081"
debug = true
gsrs.config.knownServices = ["substances", "applications", "products" ]

ix.ginas.export.exporterfactories.substances.list=null
ix.ginas.export.exporterfactories.substances.list.FDACodeExporterFactory = {
  "exporterFactoryClass" : "fda.gsrs.substance.exporters.FDACodeExporterFactory",
  "parameters": {
      approvalID: UNII
   }  
}
```

... would get transformed into this: 

```
application.name = "substances"
application.host = "http://localhost:8081"
debug = true
gsrs.config.knowServices[0]=substances
gsrs.config.knowServices[1]=applications
gsrs.config.knowServices[2]=products
ix.ginas.export.exporterfactories.substances.list.FDACodeExporterFactory.exporterFactoryClass=fda.gsrs.substance.exporters.FDACodeExporterFactory
ix.ginas.export.exporterfactories.substances.list.FDACodeExporterFactory.parameters.approvalID=UNII

```

In the microservice's Java code, we could then gain access to the properties like this, for example: 

```
class xyz { 
  @Autowired
  Environment env;
  public void printOneProperty { 
    System.out.println("Application Name:" + env.getProperty("spring.application.name")); 
  }
}
```

## Be careful with case sensitivity 

Spring Boot property libraries tend to be flexible when it comes to case sensitivty.  When looking to match a java variable with a property, the framework will attempt various matches including snake-case, lowerCamelCase, and CamelCase. When combined with HOCON, there can be confusion if the same variable name appears in different cases. For example,  

```
# __aw__ VERIFY this

entityprocessors.test1 = { a = 1, b = 2 }
entityProcessors.test2 = { a = 1, b = 2 }
entityprocessors = null

entityprocessors2 = ["a", "b"]
entityProcessors2 = ["a", "b"]
entityprocessors2 = []

# result when translated into Java properites

entityProcessors.test2.a=1
entityProcessors.test2.b=2
entityProcessors2[0]=a
entityProcessors2[1]=b
entityprocessors2=
```

To avoid gotchas, the solution is to be consistent about case when writing properites.

When in doubt try to use the case conventions found in the gsrs-spring-starter (gsrs-core.conf) and in substances moudule (substances-core.conf).   

## Environment variables

HOCON also allows for us to use environment variables that are set before runtime. 

In Unix/Linux/BSD/GitBash, environment variables are set in the terminal with an `export` statement. 

In Windows, the `set` command has the same effect

(e.g.)

```
# *nix
export APPLICATION_HOST="http://my.site.com" 

# Windows
set APPLICATION_HOST="http://my.site.com" 
```

In our HOCON configuration, we could keep the default value and only override when the environment variable is been defined. 

```
application.host = "http://localhost:8081"
application.host = ${?APPLICATION_HOST} # if APPLICATION_HOST not defined then value above is kept.
```

If we did this without the question mark "?", the result would be that application host become blank or null.  
```
application.host = "http://localhost:8081"
application.host = ${APPLICATION_HOST}  # if not defined, then null
```

## Configuration in GSRS starter modules and include statements 

We've mentioned `application.conf` in GSRS micoservices. In those files, you may see `include` statements at the top.  In the substances microservice, we see: 

```
include "gsrs-core.conf"         # from gsrs-spring-starter 
include "substances-core.conf"   # from gsrs-spring-module-substances 
```

Those include statements add in configurations that were set up in the upstream "starter" module dependencies. 

Ideally, the bulk of configuration is set upstream, and we only have to specify things that normally change from deployment to deployment, or things that we'd like to remove, add or override at runtime.    

Let's say we want to redefine the list of known services. There is a default value for that in `gsrs-core.conf`. 

In application.conf, we reset it to a null list. Then, repopulate the the list. 

```
gsrs.config.knownServices = null
gsrs.config.knownServices = ["substances", "applications"]
```

We decide to add a new knownService further down in `application.conf`.  We can do this with the `+=` operator:

```
gsrs.config.knownServices += "adverse-events"  
```

Maps are a bit more flexible. Consider `mymap`.   

```
mymap = {
    "foo" : { "a" : 42 },
    "foo" : { "b" : 43 },
    "bar" : { "c" : 35 },
    "bar" : { "d" : 26 },
}
```

It could be modified downstream like this: 

```
mymap.foo.a = 25
```

If we wanted to reset the `bar` submap,  completely eliminate the older values, and then add a new value, we'd do: 

```
mymap.bar = null 
mymap.bar = {"z", "18"} 
```

Somewhat counterintuitively, if we next do this: 

```
mymap.bar = {"y", "15"}
```

... then, the `y` key-value pair gets added to the previously existing map.

The result would be: 

```
# __aw__ VERIFY this
mymap.bar = {
   {"z", "18"},
   {"y", "15"}
}
```

## Extension configurations

Processors, Validators, Exporters, and Index Value Makers are all examples of "Extensions" in GSRS. 

When you create or update a substance on GSRS, a set of validators is run to ensure data quality before persisting the data.  When the substance is persisted, this triggers a set of processors to be run on the persisted data.  Also, index value makers are run to update Lucene indexes in custom ways. 

Extension configurations are fairly complex.

Starting in GSRS 3.1.2, the configurations for each type of extension are stored in a "map of maps" instead of "list of maps."  The distinction being that the former are randomly ordered, whereas the latter are ordered by the time of insertion. With a map of maps, each extension config has a `parentKey`.  

This step was taken to make it much easier to override or remove elements in a collection of configurations. 

In moving to a "map of maps", we could no longer rely on the order in which a configuration was inserted into the collection. 

Thus, we now have an `order` field in each config and a `disabled` field in each config. When the GSRS loads these configurations, it peforms a sort on `order` and filters to remove those where `disabled==true`. Here is an example of a collection of two validator configurations in the new style. 

```
  gsrs.validators.substances.list.IgnoreValidator =
    {
     "validatorClass" = "ix.ginas.utils.validation.validators.IgnoreValidator",
     "newObjClass" = "ix.ginas.models.v1.Substance",
     "configClass" = "SubstanceValidatorConfig"
     "order": 100,
     "disabled: false
    }
  gsrs.validators.substances.list.NullCheckValidator =
    {
     "validatorClass" = "ix.ginas.utils.validation.validators.NullCheckValidator",
     "newObjClass" = "ix.ginas.models.v1.Substance",
     "order": 200,
     "disabled: false

    }
  gsrs.validators.substances.list.AutoGenerateUuidIfNeeded =
    {
     "validatorClass" = "ix.ginas.utils.validation.validators.AutoGenerateUuidIfNeeded",
     "newObjClass" = "ix.ginas.models.v1.Substance",
     "order": 300,
     "disabled: false
    }
```

In the case of validators, the entity/service has its own namespace or context: `substances`.  All the substances validators are grouped together in the map collection. Each config has a parentKey. In the first case, we see `IgnoreValidator`. This key may have any name as long as it is unique. So far, the practice has been to use the validator's class name. 

Lets say you don't like the default `IgnoreValdiator` and write another validator class.  You you could disable IgnoreValidator like this. 

```
  gsrs.validators.substances.list.IgnoreValidator.disabled=true
```

And add a new configuration for your new validator.  

```
  gsrs.validators.substances.list.MyIgnoreValidator =
    {
     "validatorClass" = "ix.ginas.utils.validation.validators.MyIgnoreValidator",
     "newObjClass" = "ix.ginas.models.v1.Substance",
     "configClass" = "SubstanceValidatorConfig"
     "order": 100
    }
 ```

## How SpringBoot loads extension configurations 

It may help to point out how GSRS together with SpringBoot loads this configuration.  

The GSRS starter has class named GsrsFactoryConfiguration. It has a special annotation `@ConfigurationProperties("gsrs")`.  When a GSRS service loads, SpringBoot looks in the context's properties and creates objects with all the properties that are prefixed with `gsrs`, such as gsrs.validators.* ...

```
@Component
@ConfigurationProperties("gsrs")
public class GsrsFactoryConfiguration {
    ...
    private Map<String, Map<String, Map<String, Map<String, Object>>>> validators; 
    ... 
```

SpringBoot automatically assigns the variable `validators` to a collection of objects made from the children of `gsrs.validators`. The map structure is a little complicated because of the name pattern used:  `substances (context) > list > parentKey`. 

The method:  

```
    public List<? extends ValidatorConfig> getValidatorConfigByContext(String context) { ... } 
```

... processes the data in the map list/collection getting only validator properites in the substance context.

It refines the data and creates an <u>ordered</u> list of `ValidatorConfig` objects. This list is then <u>reordered</u> and filtered to produce a final config list that will be made available to the GSRS application.

The above method is called when `ConfigBasedGsrsValidatorFactory` is instantiated.

In some cases, the sorted/filtered list extension config objects are stored in a "Cached Supplier."  This is a type of Java Class wherein, if the list of configs is not yet stored in the cache, the code to generate the list of configs is run; and then the data is stored in the cache.  The next time the list of configs is needed, the code won't have to run, and the list is retrieved directly from the cache.  See `GsrsExportConfiguration.java` in the starter module, for an example. 

In some other cases, once the list of configs is sorted and filtered, the configs are registed via SpringBoot's `autowire` facility.  See `LambdaParseRegistry.java` for an example.

```
    for (RegisteredFunctionConfig config : configs) {
        try {
	        RegisteredFunction rf = AutowireHelper.getInstance().autowireAndProxy(
		        (RegisteredFunction) config.getRegisteredFunctionClass().getDeclaredConstructor().newInstance()
	        );
    ... 
```           
 
## Practical steps in configuring deployments

Starting in 3.1.2, the GSRS team made a concerted effort to streamline configuration and moreover allow for the use of environment variables in deployments.  Configuration has been crafted in such a way that developers and admins should hopefully not need to touch the standard `application.conf` files.  Instead, they can rely on environment variables or includes having quasi-environment variables.  

Two deployment strategies are accommodated: 1) Single Tomcat; and 2) Embedded Tomcat.  The former is considered the default.  The second requires more presets or environment variables. 

In the `gsrs3-main-deployement` Github repository, you can see how this works by examining the Products microservice `application.conf` file. 
...

Note that the file has these two statments toward the top: 

```
include "products-env.conf"
include "products-env-db.conf"
```

Toward the bottom, notice these include statements: 

```
include "products.conf" 
include "conf/products.conf" 
```

These top files allow one to preset variables that are used in the `application.conf` file of the microservice. 

For example, if we're running in embedded Tomcat, we'd want to override the default `server.port` value. 


In products-env.conf for embedded Tomcat in the products microservice, we see:  

```
MS_SERVER_PORT_PRODUCTS=8084
```

In `application.conf`, we see this configuration code: 
 
```
server.port="" # Only used in ebedded Tomcat 
server.port=${?MS_SERVER_PORT_PRODUCTS}
```

By preseting MS_SERVER_PORT_PRODUCTS in `products-env.conf` which is included at the top of `application.conf`, the default `server.port` value is overridden.

We don't have to use `*-env.conf` files, we could also set an enviornment variable in terminal before running the microservice. 

```
export MS_SERVER_PORT_PRODUCTS=8084
mvn clean -U spring-boot:run  
```

If all presets occur as session environment variables, then the `*-env.conf` files should be blank or deleted. Or you could remove the include statment from the `application.conf` file.

## Database Presets

If you examine the `application.conf` for products, you'll also see that there is a database configuration section.

The way it is written is meant to allow you to set values for one specific microservice, all microservices, or one set of values for 
`_SUBSTANCES` and one set of values for all other microservices datasources (`_SRSCID`).   

If you are doing local development and using the default H2, you probably only need use one (environment) variable for all microservices and that is DB_DDL_AUTO="update".  This overrides the default value for  "none". The default is set that way to prevent accidental loss of data or changes in a database.  

```
product.jpa.hibernate.ddl-auto=none
   product.jpa.hibernate.ddl-auto=${?DB_DDL_AUTO}
   product.jpa.hibernate.ddl-auto=${?DB_DDL_AUTO_PRODUCTS}
   product.jpa.hibernate.ddl-auto=${?DB_DDL_AUTO_SRSCID}
```

If DB_DDL_AUTO is preset to "update" it will override the "none" and set the value to update.

If however, DB_DDL_AUTO_PRODUCTS, is also preset, then this will override the value set by DB_DDL_AUTO. In other words, the last one wins. 


## Bottom includes 

The bottom includes in application.conf look like this. 

```
include "conf/products.conf"
include "products.conf"
```

Since they are at the bottom, they allow us to override any previously set properties. Here we would override the Java properties directly.  For example, lets say that we don't want to risk that ddl-auto was somehow set to "create" or "update" in production by some environment variable. If so then, on production in conf/products.conf we could explicitly set the value: 

```
product.jpa.hibernate.ddl-auto=none 
```

### Full example database with mariadb 

In the case of the products microservice, we need to configure both the substances datasource and products datasource.

Again, these values could be set as environment variables, or the could be included in the products-env-db.conf file. That would depend on how you set up your deployment.

```
# products' datasources configurations
# 1) connect to the substances default datasource
 
DB_URL_SUBSTANCES="jdbc:mysql://localhost:3306/gsrslocalsubstances"
DB_USERNAME_SUBSTANCES="root"
DB_PASSWORD_SUBSTANCES="yourpassword"
DB_DRIVER_CLASS_NAME_SUBSTANCES="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_SUBSTANCES=12000
DB_MAXIMUM_POOL_SIZE_SUBSTANCES=50
DB_DIALECT_SUBSTANCES="org.hibernate.dialect.MariaDB103Dialect"
DB_DDL_AUTO_SUBSTANCES=none

# 2 connect to the products' datasource
# We assume that products has its own database but shares the same 
# username and password as all other microervices using the SRSCID datasource.
# If we wanted products to use its own username and password, 
# We would set an environment variable for DB_USERNAME_PRODUCTS 
# and DB_PASSWORD_PRODUCTS.
DB_URL_PRODUCTS="jdbc:mysql://localhost:3306/gsrslocalproduct"
DB_USERNAME_SRSCID="root"
DB_PASSWORD_SRSCID="yourpasword"
DB_DRIVER_CLASS_NAME_SRSCID="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_SRSCID=12000
DB_MAXIMUM_POOL_SIZE_SRSCID=50
DB_DIALECT_SRSCID="org.hibernate.dialect.MariaDB103Dialect"
```

## Use Spring boot datasource configuration properties directly instead.  

If you prefer not to set environment variables for the datasource configuration, you can instead put the following in your conf/products.conf file. This file will be included at the bottom of the Products microservice application.conf file and therefore act to override properties.  

```
# default datasource
spring.datasource.driver-class-name="org.mariadb.jdbc.Driver"
spring.datasource.url="jdbc:mysql://localhost:3306/gsrslocalsubstances"
spring.datasource.username="root"
spring.datasource.password="yourpassword"
spring.jpa.hibernate.ddl-auto="update"
spring.jpa.database-platform="org.hibernate.dialect.MariaDB103Dialect"
spring.jpa.hibernate.use-new-id-generator-mappings="false"

# products datasource
product.datasource.driver-class-name="org.mariadb.jdbc.Driver"
product.datasource.url="jdbc:mysql://localhost:3306/gsrslocalproducts"
product.datasource.username="root"
product.datasource.password="yourpassword"
product.jpa.hibernate.ddl-auto="update"
product.jpa.database-platform="org.hibernate.dialect.MariaDB103Dialect"
product.jpa.hibernate.use-new-id-generator-mappings="false"
```

## The ./conf folder Embedded Tomcat

This folder should be created to allow for a convenient location where the custom configuration can be placed.  Hopefully, admins won't have to change the application.conf file and all the custom values can be set using environment variables, top-level presets, or bottom-level overrides. 

But to use the ./conf folder, it must be added to the class path. 

Locally, using embedded Tomcat, we can achieve the same on the command line or in your IDE Build/Run configuration for the microservice.  

On the command line it would look like this: 

```
gsrs3-main-deployment/substances>  mvn clean -U spring-boot:run -Dspring-boot.run.directories=./conf
```
In Intellij, you can use the menu Run > Edit Configuration.

If needed, click on "modify options"  and then "add VM options".  Add this to any prexisting VM options:  -cp $Classpath$:./conf 

A similar measure would likely work in Eclipse.

## The ./conf folder Single Tomcat

The src/main/webapps/META-INF/context.xml file provides a vehicle for adding the ./conf to the class path. 

Let's look at the products context.xml file
 
```
<Context path="/products" docBase="products">
    <Valve className="org.apache.catalina.valves.RemoteAddrValve" allow="${gateway.allow.pattern:-.*}"/>
    <Resources allowLinking="true" className="org.apache.catalina.webresources.StandardRoot">
        <PreResources className="org.apache.catalina.webresources.DirResourceSet" base="${user.dir}/conf" internalPath="/" webAppMount="/WEB-INF/classes" />
    </Resources>
</Context>
```

The user.dir variable is automatically populated when Tomcat loads the war file and runs GSRS.  The `products.war` file would be located in the path/to/tomcat/webapps/products folder and user.dir would equal that folder.  If using Docker, the user.dir folder may be set by the Dockerfile's `WORDIR` setting.  


As a side note, you can set gateway.allow.pattern in the setenv.sh script of your tomcat like this: 

```
    export CATALINA_OPTS="$CATALINA_OPTS -Dgateway.allow.pattern='\d+\.\d+\.\d+\.\d+' "
```

... or in other ways such as: in a docker compose file. 


# Configuring the gateway

The main function of the gateway is to route traffic to microservices.  Previous to 3.1.2, the gateway included an application.yml file.  Since 3.1.2 we include an application.conf file that takes advantage of HOCON.

We don't encourage it, but you can still use Yaml provided you set the property `gsrs.config.gateway.sortRoutes: false` and you use the name application.yml and remove all .conf files from the gateway service. Check older version 3.1 for an application.yml file example. 


# Gateway and single Tomcat

The application.conf file in 3.1.2 assumes HOCON fromat.  Single tomcat strategy is assumed by default, and in this case very little by way of presets is necessary. 

```
API_BASE_PATH="/ginas/app"
```

The base path is important 


# Gateway and embedded Tomcat. 

Embbedded Tomcat is the most likely scenario for local development.  The GSRS team has included default presets in gateway-env.conf that look like this. 

```
API_BASE_PATH=""
APPLICATION_HOST="http://localhost:8081"
APPLICATION_HOST=${?GATEWAY_HOST}
APPLICATION_HOST=${?OVERRIDE_APPLICATION_HOST}
APPLICATION_HOST_PORT=8081
APPLICATION_HOST_PORT=${?GATEWAY_HOST_PORT}
APPLICATION_HOST_PORT=${?OVERRIDE_APPLICATION_HOST_PORT}
MS_SERVER_PORT_GATEWAY=8081
MS_SERVER_PORT_GATEWAY=${?OVERRIDE_MS_SERVER_PORT_GATEWAY}

# Use this when running the Frontend service
MS_URL_FRONTEND="http://localhost:8082"

# Use these two lines for Frontend development mode, otherwise comment out both lines
# MS_URL_FRONTEND="http://localhost:4200"
# GATEWAY_FRONTEND_ROUTE_URL="http://localhost:4200"

MS_URL_ADVERSE_EVENTS="http://localhost:8086"
MS_URL_APPLICATIONS="http://localhost:8083"
MS_URL_CLINICAL_TRIALS_US="http://localhost:8089"
MS_URL_CLINICAL_TRIALS_EUROPE="http://localhost:8089"
MS_URL_IMPURITIES="http://localhost:8085"
MS_URL_INVITRO_PHARMACOLOGY="http://localhost:8090"
MS_URL_PRODUCTS="http://localhost:8084"
MS_URL_SUBSTANCES="http://localhost:8080"
MS_URL_SSG4M="http://localhost:8088"
```

The `OVERRIDE_*` variables are not necessary. They are included for conevenience if the default 8081 is not available on your system. For example, `export OVERRIDE_APPLICATION_HOST=9081` could be included in your `.bash_profile`. Then `9081` would be used without having to edit `*-env.conf` files in your microservices.   

In any case, the gateway-env.conf file is meant to be an example.  You may include your own values, or if you prefer, you can delete the contents of this file and set values as environment variables.  


### API calls to check configuration 

Starting in 3.1.2, there are new API endpoints to check the contents of GSRS configuration.  These are disabled by default. To enable, use these settings in each **individual** microservice.  Allowing these resources could be a security risk, although most of the endpoints require an `admin` role.  This is not true however for services like the frontend, gateway, or discovery. The latter services minimize dependencies and therefore do not import GSRS security libraries.  In production or even a test server that is available on the online, We don't recommend that you enable the API endpoints in these slim microservices such as the gateway. In such cases there are also `@log*` endpoints. You can enable these only so as to print the information to the log rather than to an API response.


### API configuration and endpoints for properties information         

Remember that HOCON configuration is tranlated into Java properities in each microservice.  To see this output, these properites should be set as`true`:   

```
gsrs.services.config.properties.report.api.enabled=true  # consider security  
gsrs.services.config.properties.report.log.enabled=true  # consider security 
```

Then, hit these url paths substituting the service name for the `{context}`. Note that the **service name** is not always the same as the entity context.    

```
/service-info/api/v1/{context}/@configurationProperties?fmt=text # or json 
/service-info/api/v1/{context}/@logConfigurationProperties?fmt=text # or json 
```
### API configuration and endpoints for Gateway routes       

These properties are also avaiable for the Gateway microservice.
```
gsrs.services.config.gatewayProcessedRouteConfigs.report.api.enabled=true  # consider security
gsrs.services.config.gatewayProcessedRouteConfigs.report.log.enabled=true  # consider security
```

Then, hit these url paths.  

```
# Gateway only
/service-info/api/v1/gateway/@processedRouteConfigs?fmt=text # or json; 
/service-info/api/v1/gateway/@logProcessedRouteConfigs?fmt=text  # or json
```


### API calls to get extension configuration information

Set this property in the the major microservices to see config data that has been **loaded** by the GSRS. 

gsrs.extensions.config.report.api.enabled=true # consider security

These configs are used by "extensions" such as validators, processors, indexers and scheduled tasks.  They are typically loaded on demand and into a cached supplier or autowire value so sometime the configs will not be set until needed. For example, Registered Functions configs will be populated after viewing a chemical substance detail. Validator configs will be populated once you try to validate a substances.   ExporterFactory configs will be populated once you try to run an export or view export options associated with an "etag".  Check these API paths found in ExtensionConfigsInfoController.java.

```
/service-info/api/v1/{serviceContext}/@validatorConfigs/{entityContext}
/service-info/api/v1/{serviceContext}/@entityProcessorConfigs
/service-info/api/v1/{serviceContext}/@importAdapterFactoryConfigs/{entityContext}
/service-info/api/v1/{serviceContext}/@exporterFactoryConfigs
/service-info/api/v1/{serviceContext}/@matchableCalculationConfigs/{entityContext}
/service-info/api/v1/{serviceContext}/@scheduledTaskConfigs
/service-info/api/v1/{serviceContext}/@registeredFunctionConfigs
```

Some extension configs are stored in separate buckets by entity.  Others are stored in one big list.  

In this case, we provide both the service and an entity to get the specific list of validators assoicated with the clinicaltrialsus entity.   

`/service-info/api/v1/clinical-trials/@validatorConfigs/clinicaltrialsus`
     
Where as for entity processors, we'd do: 

`/service-info/api/v1/clinical-trials/@entityProcessorConfigs`


### Actuator Routes

Another resource that can be helpful for checking configuration is the actuator.  GSRS has configuration to make the actuator available when when running the application as a whole.  So far that works for Embedded Tomcat. In the embedded case, the actuator should also be avialable when running individual microservices and hitting a Url with the services `server.port'  

To enable actuator endpoints in each service, set this environment variable as in these examples:  

```
export MS_ACTUATOR_EXPOSE_ENDPOINTS_SUBSTANCES="health,env"  # consider security 

export MS_ACTUATOR_EXPOSE_ENDPOINTS_GATEWAY="health,env,routes"  # consider security 
```

Then hit url paths like this 

```
/service-info/api/v1/gateway/actuator/health
/service-info/api/v1/gateway/actuator/env
/service-info/api/v1/gateway/actuator/routes
```

### Examine code related to configuration information endpoints  

If you would like to examine the code associated with these endpoints check in these places: 

- gsrs-service-utilities (starter submodule)
- gsrs-basic-service-utilities (starter submodule) 
- ExtensionConfigsInfoController (starter module) 
- GatewayServiceInfoController (gateway microservice) 


   
### Some other important configuration changes as of GSRS 3.1.2 
```

gsrs.entityProcessers  is now gsrs.entityProcessors.list 
you must now use entityClassName rather than "class" 



gsrs.validators.<context> is now gsrs.validators.<context>.list



The old option of defining exporters will no longer work.  For example change 

THIS: 

ix.ginas.export.factories.products = [
    "gov.hhs.gsrs.products.product.exporters.ProductExporterFactory"
]

TO THIS:

ix.ginas.export.exporterfactories.products.list.ProductExporterFactory =
  {
    "exporterFactoryClass" = "gov.hhs.gsrs.products.product.exporters.ProductExporterFactory",
    "order" =  10100,
    "parameters":{
  }
ix.ginas.export.exporterfactories.products.list.ProductTextExporterFactory =
  {
    "exporterFactoryClass" = "gov.hhs.gsrs.products.product.exporters.ProductTextExporterFactory",
    "order" =  10200,
    "parameters":{
  }



```	
 
