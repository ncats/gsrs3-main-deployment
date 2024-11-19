# Profiles in microservice pom.xml files and JDBC dependencies. 

Last updated: 2024-05-02

GSRS version at last update: 3.1.1

GSRS entity microservices include Mariadb, Mysql, Oracle, Postgresql and H2 database dependencies. The H2 one is a standard dependency and will always be present.  The remaining database flavor dependencies are active by default but can be managed via profiles.   

A CDK **or** Jchem3 chemoinformatics dependency may also be selected in the **substances** microservice via a profile. CDK is active by default. 

If the default profiles are OK you can run or package a microservice like this:   

```
mvn clean -U spring-boot:run -DskipTests
mvn clean -U package -DskipTests
```

If you want different choices, and you can use the -P flag with a parameter. In this case, `activeByDefault` XML tags will be ignored, and you have to include or exclude profiles explicitly.  If we want just CDK and mysql and oracle we would do: 

```
mvn clean -U spring-boot:run -Pcdk,mysql,oracle -DskipTests
```
We can also check profile behavior using the `mvn help:active-profiles` command. 

For example this command shows the following output:  

```
> mvn help:active-profiles -P"cdk,mysql,oracle" # on windows maybe quote

Active Profiles for Project 'gov.nih.ncats:substances:war:3.1.1-SNAPSHOT':
The following profiles are active:
 - maven-https (source: external)
 - cdk (source: gov.nih.ncats:substances:3.1.1-SNAPSHOT)
 - mysql (source: gov.nih.ncats:substances:3.1.1-SNAPSHOT)
 - oracle (source: gov.nih.ncats:substances:3.1.1-SNAPSHOT)
```

Alternatively you can activate the desired profiles with properties by setting environment variables like this.

```
> export DB_POSTGRESQL_DEPENDENCY=ADD
> export MOLWITCH_FLAVOR=CDK
```

Now we don't have to use the -P flag and we see the following output. 

```
> mvn help:active-profiles 

The following profiles are active:
 - maven-https (source: external)
 - cdk (source: gov.nih.ncats:substances:3.1.1-SNAPSHOT)
 - postgresql (source: gov.nih.ncats:substances:3.1.1-SNAPSHOT)
```

In new versions of Spring Boot it may be that `activeByDefault` will be supplemented by the -P flag rather than ignored.  If this is the case, it is also possible to negate a profile with the minus sign like so: 

```
 mvn help:active-profiles -P"cdk,mysql,-postgresql"
```

In this case, postgresql is not an active profile even if it is `activeBydefault` or the environment variable is set.  

