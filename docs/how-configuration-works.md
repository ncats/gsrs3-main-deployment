# How configuration works

Last Edited: 2024-10-31

GSRS version at last edit: GSRS 3.1.1

## Get Started

A good way to get started is to examine some GSRS Spring Boot service configuration files.

- [Substances application.conf](../substances/src/main/resources/application.conf)
- [Products application.conf](../products/src/main/resources/application.conf)
- [Gateway application.yml](../gateway/src/main/resources/application.yml)
- [Frontend application.properties](../frontend/src/main/resources/application.properties)
- [More services](../)

When you run or package a Spring Boot microservice, Spring Boot looks for configuration in a default folder. The location is the `src/main/resources/` folder, and the most critical file is `application.conf`.  

The `application.conf` file is the one you are most likely edit when deploying services.

Looking at the Substance's service `application.conf` file, notice this statement at the top: `include "substances-core.conf"`.  

This refers to a configuration file that is found in the Substances **module**. The file included from the module has an extensive set of defaults that the substance service ends up using. However, properties in the `application.conf` can be set to override the properties from the `substances-core.conf` when pratical and necessary.

The Substances service uses the HOCON format, as do the other entity services, such as Products.

When you run the Substances or Products services, Spring Boot loads the configuration, and the HOCON is transformed into standard Java properties. Spring Boot then loads these values into the Java context. If you make changes, you'll need to restart the application to activate the updates.

The HOCON format allows us to specify relatively complex configuration data structures, in addition to simple strings or booleans.

The above `application.conf` files provide many examples of "map" and "list" structures. Nevertheless, here are some simple illustrations, just in case HOCON is a new format for you.

A map looks like this:
```
shapesMap = {
  "twoDimensional": true,
  "maxDimensions": 2,
  "circle": { "radius": 2 }
  "rectangle" : { length: 2, width: 4 }
}
# Add one more
shapesMap.triangle = { base: 2, height: 4 }
```

A simple list looks like this:
```
colors = ["red", "blue", "green"]
# Add one more
colors += "yellow"
```

A list (of maps) looks like this:
```
vehiclesList = [
  { "skateboard": { "wheels": 4 } },
  { "bicycle": { "wheels": 2 } }
]
# Add one more
vehiclesList+= { "segway": { "wheels": 2} }
```

HOCON allows us to make substitutions from environment variables that might be defined in the terminal session. A coder can selectively override defaults if this or that environment variable is defined. 

Here `my.prop` is equal to "some value" unless at least one of the environment variables is defined.  Be aware that the question mark indicates a check to see if the variable is set. The effect would be different without the question mark.

```
my.prop='some value'
# Overrides only if defined
my.prop=${?MY_ENV_VAR}
# The last one defined wins
my.prop=${?MY_OTHER_ENV_VAR}
```

## Other configuration formats

The Gateway service uses the YAML format; the Frontend uses standard Java properties. In the next GSRS version, we expect to implement HOCON for all services.

## Get help on configuration formats

The following links provide more information on the three formats used in GSRS.

- [Properties](https://www.baeldung.com/java-properties)
- [HOCON](http://github.com/lightbend/config/blob/main/HOCON.md)
- [YAML](https://www.baeldung.com/spring-yaml)

## Activating HOCON

HOCON is already specified as a dependency in most GSRS modules and services.

To add HOCON to a new module, add or edit the `spring.factories` file in the module's `-auto-configure` submodule. The file should be added in the submodule's `src/main/resources/META-INF` folder.

In a service, add the file in the service's `src/main/resources/META-INF` folder.

In both cases, add the line:

```
org.springframework.boot.env.PropertySourceLoader=com.github.zeldigas.spring.env.HoconPropertySourceLoader
```

You may have to add this dependency to your `pom.xml`.

```
    <dependency>
        <groupId>com.github.zeldigas</groupId>
        <artifactId>spring-hocon-property-source</artifactId>
        <version>0.4.0</version>
    </dependency>
```

## Annotations

Several Spring Boot annotations are important for configuration.

A `@ConfigurationProperties` class can be structured to read simple or complex values. For example, the following code would load the configuration below it.

```
@Configuration
@ConfigurationProperties("gsrs.scheduled-tasks")
public class GsrsSchedulerTaskPropertiesConfiguration {
    private List<ScheduledTaskConfig> list = new ArrayList<>();
    ...
}    
```

```
# application.conf
gsrs.scheduled-task.list = [
    { "taskProperty": 1 }, 
    { "taskProperty": 2 } 
]
```

A `@Value` annotation can inject a value defined in a configuration file into a Java class's property and indicate a default.

```
 @Value("#{new Boolean('${gsrs.substances.molwitch.enabled:true}')}")
    private boolean enabled = true;
```

Configuration `@Beans` provide a strategy for flexibly injecting dependencies.  Imagine there are multiple classes that could be used for fetching build information. Writing a bean like this allows us to specify the one to use and make it available to the application context.

```
@Configuration
public class BuildInfoConfiguration {
    @Bean
    @Order
    @ConditionalOnMissingBean(BuildInfoFetcher.class)
    public BuildInfoFetcher defaultBuildInfoFetcher(){
        return new VersionFileBuildInfoFetcher();
    }
}
```

## What happens to configuration files at run/build/packaging time?

- In embedded Tomcat, `mvn spring-boot:run` creates a folder, `target/classes`. It copies configuration files that are in the `resources` folder to the `classes` folder.
- For single Tomcat, we issue the command `mvn package`, and this creates a `.war` file. Maven copies the configuration files present in `resources` folder into the War's `/WEB-INF/classes` folder.  Next, you deploy the War file in a Tomcat application webapps folder. After deployment, you can update the configuration file as needed in the webapps folder; it will be activated when you restart Tomcat.  Still, you should keep the source configuration in a separate location, so it is not lost when you periodically redeploy with newly generated War files.
