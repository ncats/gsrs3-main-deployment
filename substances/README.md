# GSRS 3 Substances

This is the central GSRS microservice.  It contains the facilities that manage information about substances and contains the most critical and complicated functionality of the whole project.

## Core Dependency Repos

- <https://github.com/ncats/gsrs-spring-starter>
- <https://github.com/ncats/gsrs-spring-module-substances>

These dependencies are Spring-boot "starters." You don't have to do anything; these dependencies are alredy part of the POM file.

## CDK

The Substances service works with a chemoinfomatics toolkit to perform specialized chemistry related routines. As of 3.1.1, only CDK is supported. Our architecture supports plugging in other chemistry development kits, but this is a fairly large undertaking.

 These default configuration values are used with CDK.

```
ix.structure-hasher = "ix.core.chem.InchiStructureHasher"
ix.structure-standardizer = "ix.core.chem.InchiStandardizer"
```

## Requirements

### Java

We are targeting the Java 11 runtime for this project although the code can be built using Java 8, 11, 17.

### RAM

This microservice probably needs lots of RAM.  The team recommends about 32GB of RAM for about 100 simulataneous users. Most of the RAM use is because GSRS has user-specific in-memory caching.  The team knows this is not ideal and will reconsider this in a future release.

### Disk Space

This microservice needs several GB of diskspace for file caches and lucene indexes, and user created files.

### Database

This microservice requires a SQL database loaded with the GSRS database schema and optionally populated.  The database requires several GB of space. Some database systems require a hibernate 'dialect' class to work with GSRS.  (See <https://www.educba.com/hibernate-dialect/> for more information.)

```
# PostGreSQL
spring.jpa.database-platform=gsrs.repository.sql.dialect.GSRSPostgreSQLDialectCustom

# Oracle
spring.jpa.database-platform=org.hibernate.dialect.Oracle10gDialect

# MariaDB
spring.jpa.database-platform=org.hibernate.dialect.MariaDB103Dialect

# MySQL:
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# H2:
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### Lucene Upgrade in Release 3.0.3

In release 3.0.3, Lucene version is upgraded from 4.10.0 to 5.5.0. If you are doing a fresh new installation of GSRS from scratch, you can skip this section.

Lucene version 5.5.0 has a different format from version 4.10.0. So, we included the lucene-backward-codecs.jar in the project. A full reindexing is needed to make it work.
In very rare cases, you may need to remove the whole indexes directory, and then do a full reindexed.
``

## Build Instructions

This entity microservice can be built into a war file for deployment in a J2EE web container.

The simplest way to do this is:

```
./mvnw clean package -DskipTests
```

To include the tests, remove `-DskipTests` from the command.

This will create a file `target/substances.war`

## Running and Debugging

You can run the microservice locally for testing and debugging by running the following command, optionally skipping tests:

```
./mvnw clean spring-boot:run -DskipTests
```

## Configuration

The [./src/main/resources/application.conf](./src/main/resources/application.conf) file orchestrates configuration. Our hope is that you will not need to change it.

If you find that GSRS cannot run without a change to application.conf, please let the GSRS team know!

Therefore, instead use environment variables and/or the top and/or bottom include files to influence the orchestration.

- substances-env.conf (top)
- substances-env-db.conf (top)
- substances.conf (bottom)

The default [./src/main/resources/substances-env.conf](./src/main/resources/substances-env.conf) file contains key:value pairs that make the service work for embedded Tomcat, which is what most developers and most admins evaluating GSRS will use locally.

In single Tomcat, this file is more sparse since since `application.conf` assumes single Tomcat.

```
# Single Tomcat: substances-env.conf

# Application host url should have no trailing slash
APPLICATION_HOST="https://my.server:8080"
APPLICATION_HOST_PORT=8080
MS_SERVER_PORT_SUBSTANCES=8080
MS_LOOPBACK_PORT_SUBSTANCES=8080
IX_HOME="/path/to/data/substances/ginas.ix"

# Share same export and download folder with substances.
MS_EXPORT_PATH_SUBSTANCES="/path/to/data/substances/exports"
MS_ADMIN_PANEL_DOWNLOAD_PATH_SUBSTANCES="/path/to/data/substances"


# API URLs have slash
# Since both services are on same server, we can use localhost here without SSL.
API_BASE_URL_APPLICATIONS="http://localhost:8080/applications/"
API_BASE_URL_CLINICAL_TRIALS_US="http://localhost:8080/clinical-trials/"
API_BASE_URL_CLINICAL_TRIALS_EUROPE="http://localhost:8080/clinical-trials/"
API_BASE_URL_PRODUCTS="http://localhost:8080/products/"

# The default works on single Tomcat
MS_SERVLET_CONTEXT_PATH_SUBSTANCES="substances/"

```

The bottom include, `substances.conf`, file can be used to override undesirable values that might be set in the `application.conf` or upstream. This file is blank/missing by default.

Core configuration values for the substances service include:

- `application.host`
- `server.port=8080` (required for embedded Tomcat only)
- `server.servlet.context-path` should be `/` for embedded; and `substances/` for single Tomcat

If running as single Tomcat, the server.port is not used since all service are running under Tomcat's port, usually 8080.

## Database Configuration

H2 testing databases are configured by default in `application.conf`.  The substances H2 database is written to disk in the folder: `${ix.home}/h2`.

The easiest way to override the default H2 and set an alternative database such as Mariadb or Postgresql is to set quasi-environment variables in `substances-env-db.conf`.  For example, Mariadb would look something like this:

```
DB_URL_SUBSTANCES="jdbc:mysql://localhost:3306/substances"
DB_USERNAME_SUBSTANCES="yourusername"
DB_PASSWORD_SUBSTANCES="XXXXXX"
DB_DRIVER_CLASS_NAME_SUBSTANCES="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_SUBSTANCES=12000
DB_MAXIMUM_POOL_SIZE_SUBSTANCES=50
DB_DIALECT_SUBSTANCES="org.hibernate.dialect.MariaDB103Dialect"
DB_DDL_AUTO_SUBSTANCES=none
```

In the above, we set `DB_DDL_AUTO_SUBSTANCES=none` to avoid SpringBoot creating or changing the database. In production, you would want the "none" value. Change to "update" if you want SpringBoot to create or update the database schema.

## Export the datasource schema

It's worth looking at `application.conf` to see the Java properties that correspond to the above HOCON settings.  Note that the `PERSIST_UNIT` for the default (substances) database is "spring". That's helpful to know if you want to export the schema to SQL statements in a text file. Putting these lines in your configuration will result in the exported file: `substances.sql`.

```
spring.jpa.properties.javax.persistence.schema-generation.create-source=metadata
spring.jpa.properties.javax.persistence.schema-generation.scripts.action=create
spring.jpa.properties.javax.persistence.schema-generation.scripts.create-target=substances.sql
```

## Configure the Gateway

See the Gateway service README.md file to see how that service forwards requests to the substances microservice.
