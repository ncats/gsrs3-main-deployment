# GSRS 3 Clinical Trials Microservice

This microservice is an entity service for storing, retrieving, searching and indexing US and European clinical trials. It especially focuses on mapping those trials to substances within a GSRS system.

## Core Dependency Repos

- https://github.com/ncats/gsrs-spring-starter
- https://github.com/ncats/gsrs-spring-module-substances
- https://github.com/ncats/gsrs-spring-module-clinical-trials

The three dependencies are Spring-boot "starters." This `gsrs-main-deployment/clinical-trials` service includes these starter libraries to actually create an executable runnable deployment.

## Requirements

### Java

We are targeting the Java 11 runtime for this project although the code can be built using Java 8, 11, 17.

#### RAM

This microservice will run fine with the default memory allocation.

#### Disk Space

This microservice requires little disk space.

#### Database

This microservice assumes two datasources. Use the same configuration as is used for substances for the "default" datasource.  This datasource has general non-clinical-trials specific data.  The clinical trials datasource is used to capture information specific to clinical trials.

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

The [./src/main/resources/application.conf](./src/main/resources/application.conf) file orchestrates configuration, Our hope is that you will not need to change it. Instead use environment variables and/or the top and/or bottom include files to influence the orchestration.

- clinical-trials-env.conf (top)
- clinical-trials-env-db.conf (top)
- clinical-trials.conf (bottom)

The default [./src/main/resources/clinical-trials-env.conf](./src/main/resources/clinical-trials-env.conf) file contains key:value pairs that make the service work for embedded Tomcat, which is what most developers and most admins evaluating GSRS will use locally.

In single Tomcat, this file is more sparse since since `application.conf` assumes single Tomcat.

```
# Single Tomcat: clinical-trials-env.conf

# Application host url should have no trailing slash
APPLICATION_HOST="https://my.server:8080"
APPLICATION_HOST_PORT=8080
MS_SERVER_PORT_CLINICAL_TRIALS=8080
MS_LOOPBACK_PORT_CLINICAL_TRIALS=8080
IX_HOME="/path/to/data/clinical-trials/ginas.ix"

# Share same export and download folder with substances.
MS_EXPORT_PATH_CLINICAL_TRIALS="/path/to/data/substances/exports"
MS_ADMIN_PANEL_DOWNLOAD_PATH_CLINICAL_TRIALS="/path/to/data/substances"


# API URLs have slash
# Since both services are on same server, we can use localhost here without SSL.
API_BASE_URL_SUBSTANCES="http://localhost:8080/substances/"

# The default works on single Tomcat
MS_SERVLET_CONTEXT_PATH_CLINICAL_TRIALS="clinical-trials/"

```

The bottom include, `clinical-trials.conf`, file can be used to override undesirable values that might be set in the `application.conf` or upstream. This file is blank/missing by default.

Core configuration values for the Gateway include:

- `application.host`
- `server.port=8089` (required for embedded Tomcat only)
- `server.servlet.context-path` should be `/` for embedded; and `clinical-trials/` for single Tomcat

If running as single Tomcat, the server.port is not used since all service are running under Tomcat's port, usually 8080.

## Database Configuration

H2 testing databases are configured by default in `application.conf`.  The clinical trials H2 database is written to disk in the folder: `${ix.home}/h2`. As noted above, the configuration must also point the substances datasource. In local development, the default configuration points back to the substances service with a relative database path set in `${ix.home_substances}`.

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

DB_URL_SRSCID="jdbc:mysql://localhost:3306/clinical_trials"
DB_USERNAME_CLINICAL_TRIALS="drugs"
DB_PASSWORD_CLINICAL_TRIALS="eeR1pood"
DB_DRIVER_CLASS_NAME_CLINICAL_TRIALS="org.mariadb.jdbc.Driver"
DB_CONNECTION_TIMEOUT_CLINICAL_TRIALS=12000
DB_MAXIMUM_POOL_SIZE_CLINICAL_TRIALS=20
DB_DIALECT_CLINICAL_TRIALS="org.hibernate.dialect.MariaDB103Dialect"
DB_DDL_AUTO_CLINICAL_TRIALS=none
```

In the above, we set `DB_DDL_AUTO_CLINICAL_TRIALS=none` to avoid SpringBoot creating or changing the database. In production, you would want the "none" value. Change to "update" if you want SpringBoot to create or update the database schema.


## Export the datasource schema

It's worth looking at `application.conf` to see the Java properties that correspond to the above HOCON settings.  Note that the `PERSIST_UNIT` for the default (substances) database is "spring", whereas for clinical trials it is "clinicaltrial". That's helpful to know if you want to export the schema to SQL statements in a text file. Putting these lines in your configuration will result in the exported file: `clinical-trials.sql`.

```
clinicaltrial.jpa.properties.javax.persistence.schema-generation.create-source=metadata
clinicaltrial.jpa.properties.javax.persistence.schema-generation.scripts.action=create
clinicaltrial.jpa.properties.javax.persistence.schema-generation.scripts.create-target=clinical-trials.sql
```

## Configure the Gateway

See the Gateway service README.md file to see how that service forwards requests to the clinical-trials microservice.

## Indexing

To index clinical trials during development, do the following via curl:

```
curl -X POST -H "auth-username: admin" -H "auth-password: admin"  http://localhost:8081/api/v1/clinicaltrialsus/@reindex&wipeIndex=true
curl -X POST -H "auth-username: admin" -H "auth-password: admin" http://localhost:8081/api/v1/clinicaltrialseurope/@reindex&wipeIndex=false
```

In GSRS, the entities within one microservice are considered an indexing group. Including the query key value parameter, `wipeIndex=true`, will cause all indexes within the microservice to be erased. Therefore only use `wipeIndex=true` on the first entity you reindex. On the following entities use `wipeIndex=false`.

## Cross Indexing

*Advanced Topic* Starting in GSRS 3.0.1, cross indexing between the substances microservice and the clinical trials microservice is possible.  That is, when browsing substances, there are some clinical trials facets that may be useful.  To include this functionality, one must add some entries to the GSRS substance microservice configuration and to the clinical trials microservice configuration. This feature depends on the `gsrs-fda-substance-extension` found in the `gsrs-spring-module-substances` repository.

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

gsrs.indexers.list.SubstanceClinicalUSTrialIndexValueMaker =
{
   "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalUSTrialIndexValueMaker",
   "order" = 5200,
   "disabled" = false
}
gsrs.indexers.list.SubstanceClinicalEuropeTrialIndexValueMaker =
{
   "indexer" = "fda.gsrs.substance.indexers.SubstanceClinicalEuropeTrialIndexValueMaker",
   "order" = 5300,
   "disabled" = false
}
```

In clinical-trials/src/main/resources/application.conf add the following:

The cross indexers are added by default to the clinical-trial-core.conf file in the clinical trials starter module.

```
gsrs.indexers.list.ClinicalTrialUSEntityLinkIndexValueMaker =
  {
    "indexer" = "gov.hhs.gsrs.clinicaltrial.us.indexers.ClinicalTrialUSEntityLinkIndexValueMaker",
    "class" = "",
    "order" = 300
  }
gsrs.indexers.list.ClinicalTrialEuropeEntityLinkIndexValueMaker =
  {
    "indexer" = "gov.hhs.gsrs.clinicaltrial.europe.indexers.ClinicalTrialEuropeEntityLinkIndexValueMaker",
    "class" = "",
    "order" = 400
  }
```

if you wish to disable them, you could add these lines to your `clinical-trials.conf` (bottom include)

```
gsrs.indexers.list.ClinicalTrialUSEntityLinkIndexValueMaker.disabled = true
gsrs.indexers.list.ClinicalTrialEuropeEntityLinkIndexValueMaker.disabled  = true
```

For the above API resources to work, you may need to run the `installExtraJars.sh` file found in the root folder of the `gsrs-spring-module-substances` repository. This depends on how you installed the GSRS.

## Exports

*Advanced Topic* Starting in GSRS 3.0.1, US Clinical Trial exports are  available when browsing substances or viewing an individual substance detail. To include this functionality, one must add some entries to the gsrs substance microservice configuration AND to the clinical trials microservice configuration.

In the substances service's `substances-env.conf`, set these key:value pairs to false. Also also examine the substancess service's `application.conf` file to check for special related notes.

```
MS_DISABLE_EXCEL_SUBSTANCE_RELATED_CLINICAL_TRIALS_US_EXPORTER_FACTORY=false
MS_DISABLE_EXCEL_SUBSTANCE_RELATED_CLINICAL_TRIALS_EUROPE_EXPORTER_FACTORY=false
```

These configurations are set by default in `clinical-trial-core.conf` in the Clinical trials starter module.

```
ix.ginas.export.exporterfactories.clinicaltrialsus.list.ClinicalTrialUSExporterFactory =
  {
    "exporterFactoryClass" = "gov.hhs.gsrs.clinicaltrial.us.exporters.ClinicalTrialUSExporterFactory",
    "order" =  100,
    "parameters":{
    }
  }

ix.ginas.export.exporterfactories.clinicaltrialseurope.list.ClinicalTrialEuropeExporterFactory =
  {
    "exporterFactoryClass" = "gov.hhs.gsrs.clinicaltrial.europe.exporters.ClinicalTrialEuropeExporterFactory",
    "order" =  100,
    "parameters":{
    }
  }
```

Other variables to check if things aren't working properly include these:

```
- gsrs.loopback.port
- ix.ginas.export.path
```

## Controlled Vocabulary

In GSRS 3.1, a "substance roles" field was added to the Clinical Trials US model; and a select box was added to the front end. The select options are populated with controlled vocabulary for flexibility. You can add controlled vocabulary into a database via the `vocabuarlies` end point, as shown below. Currently, `vocabularies` is part of the substances service.

```
curl -k -X POST -H 'Content-Type: application/json' -H 'auth-username: admin' -H 'auth-password: XXXXXX' -i http://localhost:8081/api/v1/vocabularies --data '
{"id":null,"domain":"CTUS_SUBSTANCE_ROLES","vocabularyTermType":"ix.ginas.models.v1.ControlledVocabulary","editable":true,"filterable":false,"terms":[{"id":null,"value":"ADJUVANT","display":"ADJUVANT","filters":[],"hidden":false,"selected":false}, {"id":null,"value":"BIOMARKER","display":"BIOMARKER","filters":[],"hidden":false,"selected":false}, {"id":null,"value":"COMPARATOR","display":"COMPARATOR","filters":[],"hidden":false,"selected":false}, {"id":null,"value":"CONTROL REGIMEN","display":"CONTROL REGIMEN","filters":[],"hidden":false,"selected":false},{"id":null,"value":"ENHANCER","display":"ENHANCER","filters":[],"hidden":false,"selected":false},{"id":null,"value":"PLACEBO","display":"PLACEBO","filters":[],"hidden":false,"selected":false}, {"id":null,"value":"TREATMENT REGIMEN","display":"TREATMENT REGIMEN","filters":[],"hidden":false,"selected":false}]}
'
```
