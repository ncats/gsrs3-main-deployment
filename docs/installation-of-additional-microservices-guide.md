# Installation of additional microservices, guide

Date last edited: 2024-10-08

Version at last edit: GSRSv3.1.1

Most organizations new to GSRS begin with the substances service.  When the organization has gotten that far, system administrators (admins) will likely have become familiar with three services: the Substances service, the Frontend Service, and the Gateway Service. In addition to those, FDA and NCATS have together created the following services:

- [Adverse Events](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/adverse-events)
- [Applications](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/applications)
- [Clinical Trials](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/clinical-trials)
- [Impurities](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/impurities)
- [Invitro Pharmacology](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/invitro-pharmacology)
- [Products](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/products)
- [SSG4m](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/ssg4m)

Before running the additional service, the admin has decided on a deployment strategy.  The main README for [gsrs3-main-deployment](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment)
outlines the differences between embedded Tomcat and single Tomcat. Such deployments could also be running under something like Docker and/or Kubernetes.  Most people becoming familiar with GSRS services probably start with embedded Tomcat.

An admin should also go to the [gsrs3-main-deployment](https://github.com/ncats/gsrs-ci/tree/gsrs-example-deployment/) repository and become familiar with several files or features that are present in each of the microservices.  

- README.md
- pom.xml
- src/main/resource/application.conf
- EntityNameApplication.java (e.g. ProductApplication.java) 
- installExtraJars.sh (if applicable)

### README.md

The README provides essential information about the Entity class managed by the service and details about configuration.  The links above provide convenient access to each README.

### pom.xml

This file includes all the Java dependencies required to run the service, and it has important properties that specify the version of critical GSRS "starter modules".  GSRS is a modular application, thus most of the technical logic is actually found upstream from the service deployment itself.

Most centrally, the services depend on an their own entity-specific starter module. For example, the Products service depends on a **Products module**, which in turn depends on a general GSRS Spring starter module, and to a lesser extent, the Substances module. Therefore, in the Products service `pom.xml` file, you will see three properties that specify versions for those resources.

```
<properties>
    ...
    <gsrs.product.version>3.1.1-SNAPSHOT</gsrs.product.version>
    <gsrs.starter.version>3.1.1</gsrs.starter.version>
    <gsrs.substance.version>3.1.1.1</gsrs.substance.version>
</properties>
 ```
Keep in mind that those are the versions that Maven will look for when you run or package the service. 

### application.conf 

This is the main configuration file that is used to run the service.  The repository, gsrs3-main-deployment, includes an application.conf file for each service. The files default toward embedded Tomcat.  

Several configuration elements or properties are salient when getting started:

**include ____-core.conf**: This statement imports configuration from upstream starter module(s).  Developers try to put the most common or default configurations in the upstream modules. Then, configuration can be tweaked as needed at the service level.

**application.host**: This the URL of the of the application.  If running the Products service as a standalone under embedded Tomcat, we might have the value: `http://localhost:8084`, assuming the `service.port` is equal to this number in the `conf` file. If running together with other microservices, then in practice, this `application.host` would be equal to the $GATEWAY_HOST.

**server.port:** Relevant if using embedded Tomcat. This the port the service runs on.  In embedded Tomcat, each service has its own port.  If using single Tomcat, all services share the port specified in the Tomcat configuration, 8080 by default. 

**Entity-specific datasource**: For example, Products puts product-specific data in its own database.

**Default (GSRS) datasource**:  For example, Products will look for GSRS user records in the default datasource.  In practice, the default data source contains substance entity data and also all data tables common to all microservices.  If you are running the Substances service, the configuration in your additional microservice should point to the same datasource as in the application.conf of the Substances service.

**ix.home**: The disk location where the service will write data such as the Lucene index, and the H2 database for testing.

**ix.home_substances**:
This may also be defined to indicate where the service should find the default datasources's H2 data files.

### application.conf (continued) 

Other features addressed in the configuration include:

**substanceApiBaseUrl**: Most services need to interact with the Substances service.  This property tells a service such as Products where it can find the Substances REST API endpoints.   

**api.headers**: If the service makes REST API calls to another service and user access settings are strict, you may need to set up a query user. Then, use its user profile name (auth-username) and user profile key (auth-key) to make backend-to-backend cross entity data queries. To communicate from the backend of Clinical Trials to the Substances service backend, you would need to set the `gsrs.microservice.substances.api.headers` property in the **CT** application.conf file. 

**Linking KeyType** Developers make choices regarding the substances linking field.  A service may use the substance UUID or an organization specific `CodeSystem` as a unique identifier used to find substances in the Substances service. Most important to remember is that a service's main entity parent data table has a field for `substance_key` and for `substance_key_type`.  Some organizations may opt to change the KeyType in the configuration and database. That depends on the organization's needs.

Notwithstanding, it's also worth noting that the GSRS Rest API has mechanisms to find entities flexibly, using different identifiers whether it be a UUID, UNII, Display Name, or a code like a "BDNUM" in FDA's case.

**Extensions**: The configuration also includes properties for exports, scheduled tasks, entity processors, validators, index value makers, and cross entity index value makers. 

### Application.java file

This is the `main` Java file that executes the service.  It is short and mainly uses **annotations** that enable upstream resources from the GSRS starters, or more generally from Spring Boot. 

In each microservice, take note especially of the values associated with these two annotations:

- @EnableGsrsApi: tells the service about its Lucene index and datasource.
- @EntityScan: tells Spring Boot which Java packages to scan into Spring components.

### installExtraJars.sh

If a service depends on an external Java `jar` file that is not published on Maven Central, we put it in the `extraJars` folder.  At the root of each service wrapper in gsrs3-main-deployment you will **also** see an `installExtraJars.sh` Bash script that you can run.  If applicable, you should run this script before the **first time** you run or package the service.  You'd also need to rerun this script when making updates to GSRS code.

At this time, the only the Subtances service has extraJars to install. 

## Running 

You will run the service either in embedded Tomcat, OR under a fully functional Tomcat application. 

### Running the service (example Products)
```
cd gsrs3-main-deployment
cd products
bash installExtraJars.sh # Do this once, or as needed; if applicable
mvn clean -U spring-boot:run -DskipTests 
```

Maven creates a `target/products.jar` file and then runs it .

### Packaging the service

```
cd gsrs3-main-deployment
cd products
bash installExtraJars.sh # Do this once, or as needed; if applicable
mvn clean -U package -DskipTests 
```

Maven creates `target/products.war` file. Place this file in a Tomcat server's `webapps` folder to run it. 

## Related Services 

### Configuring the Gateway

In order for the a service to work with the rest of GSRS, you may need to configure Gateway routes.  The Routes are slightly different for Single Tomcat versus embedded Tomcat. See the README for the service you are interested in to find out how to specify the routes.

### Configuring the Angular Frontend

For the Frontend to work as expected, you may need to set certain values in the frontend config.json file. In particular, see the `loadedComponents`, `keyType` and facet elements.   


## Advanced topics

**Indexing**: Currently, there is no UI facility for indexing of non-substance microservices.  However, indexing endpoints work on the command line.  See the "Bulk indexing" document and look for an explanation of the @reindex REST API endpoint in relation to non-substance entities.

**gsrs-fda-substance-extension**: This is a **submodule** contained the Substances Module. The submodule was created so that the Substances service knows how to get information from other services such as Applications, Clinical Trials, or Products. Consider Clinical Trials.  This service has a relationship with the substances service.  The CT service lists substances that are included in clinical trial interventions. The Substances UUID is the linking `KeyType` and these UUIDs are indexed under each clinical trial.  On the flip-side, the Substances service wants to know which of its substances can be found in distinct Clinical Trials.  Since the Substances module contains code that can contact the REST API of the other services, it can query the Clinical Trials service. If you look in the Substances service `application.conf` file, you will see `api.baseURL` configuration values that tell Substances where to locate endpoints from other entity services.  The API urls are used in many important ways including reports or exports, where substance information is combined with data from another service. 

A mechanism used to achieve this **cross-linking** occurs at indexing time.  When clinical trials are indexed, a field called `entity_link_substances` is created for each of the substance UUIDs listed in the trial.  Then, when the Substances service searches on clinical trials, it queries the clinical trials index on that field. Here is some sample Java code from the Substance Module showing this idea in action.

```
# gsrs-fda-substance-extension 
# ExcelSubstanceRelatedClinicalTrialsUSExporter.java

public SearchResult<ClinicalTrialUSDTO> getClinicalTrialsUSRelatedToSubstance(Substance s) {
    try {
        SearchRequest searchRequest = SearchRequest.builder().q("entity_link_substances:\"" + s.uuid + "\"").top(1000000).simpleSearchOnly(true).build();
         return clinicalTrialsUSApi.search(searchRequest);
         ...
}
```

**Maven Central versus Git**  The public release in gsrs3-main-deployment should be able to find all dependencies other than the extraJars on Maven Central.  However, if you want load the source code for viewing or development you can clone dependencies` git repositories. The deployment README provides links to the upstream starter modules and instructions on how to install them.
