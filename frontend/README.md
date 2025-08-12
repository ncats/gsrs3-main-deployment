# GSRS 3 Frontend Microservice

This SpringBoot Java microservice serves up the GSRS static content of the GSRS 3 Frontend UI.  
The UI is an Angular-framework application.

## Core Dependency Repositories

<https://github.com/ncats/GSRSFrontend/tree/development_3.0>

## Configuration

The [./src/main/resources/application.conf](./src/main/resources/application.conf) file orchestrates configuration. Our hope is that you will not need to change it.

If you find that GSRS cannot run without a change to application.conf, please let the GSRS team know!

Therefore, instead, we recommend that you use environment variables and/or the top and/or bottom include files to influence orchestration.

- frontend-env.conf (top)
- frontend.conf (bottom)

The default [./src/main/resources/frontend-env.conf](./src/main/resources/frontend-env.conf) file contains key:value pairs that make the Frontend work for embedded Tomcat (which is the deployment type that most developers and most admins evaluating GSRS will use locally).

In a single Tomcat deployment, you can probably make `frontend-env.conf` a blank file so as to rely on the defaults contained in `application.conf`.  

The bottom include, `frontend.conf`, file can be used to override undesirable values that might be set in the `application.conf` or upstream. By default, this file is either blank or missing.

Core configuration values for the Frontend include file:

- `gsrs.frontend.prefix` (manage an API prefix like the default "ginas/app/" context path)
- `server.port=8082` (required for embedded Tomcat only)
- `server.servlet.context-path` should be `/` for embedded Tomcat; and `/frontend` for single Tomcat

If running in single-Tomcat deplyment, the `server.port` is not used since all GSRS microservices are running under Tomcat's port, usually 8080. On single Tomcat, a blank/missing frontend-env.conf file will probably work based on the defaults in the `application.conf` file.

## Run/Build instructions

Starting in GSRS 3.1.1, the SpringBoot Frontend service `pom.xml` file includes automatic scripts to generate the Angular UI distribution/build.  When you issue a `./mvnw spring-boot:run` or `./mvnw package` command, the default option is for the script to download the Frontend code from the GSRSFrontend repository and then use Node JS to create an Angular build.

There are many workflow options discussed in this [how-to](../docs/how-the-frontend-microservice-auto-build-works-and-options.md) document.

When you build or run, set at `FRONTEND_TAG` environment variable so that the Maven `pom.xml` knows from which repository to pull the Angular UI code. For example:

```
export FRONTEND_TAG=GSRSv3.1.2PUB # (Tagged public version)
export FRONTEND_TAG=development_3.0 # (Latest development code)
```

### Building

```
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests
```

### Running

```
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests
```

See also:

[Frontend auto-build how-to](../docs/how-the-frontend-microservice-auto-build-works-and-options.md)

## UI Configuration file (config.json)

When you `run` the service, after the Angular has been built and placed in the deployment's static directory (under Tomcat's webapps/), the default configuration file for the UI will be located at:

```
frontend/target/classes/static/assets/data/config.json 
```

When you `package` the service, the default configuration file will be located in the `target/frontend.war` file. If you unzip the WAR file, the configuration file will be located at:

```
./WEB-INF/classes/static/assets/data/config.json

```

This JSON file can be configured prior to build or after the build and deployment. Either way, your changes risk being overwritten when you subsequently pull the code from Github for a new build and deployment cycle. 

For this reason, we recommend that you devise a way to save your conficuration file locally to avoid having your build `target` directory be overwritten by the `./mvnw spring-boot:run` command. See the [how-to](../docs/how-the-frontend-microservice-auto-build-works-and-options.md) document to learn how to separate building and running, and to learn how to tweak your config.json file without having to rebuild the Angular distribution.

UI Developers should also see these [instructions](https://github.com/ncats/gsrs3-main-deployment/blob/main/README.md#optionally-use-development-mode-for-the-frontend-in-the-local-embedded-deployment) on how to run the GSRS Frontend UI in "development mode".

## Typical changes to the UI's config.json

When running on a Tomcat server, you can overwrite the config.json file in the deployment webapps/ directory before starting Tomcat.

The config.json file usually points to the GSRS (a.k.a. "ginas") API base URL for the gateway in a given deployment. 

```
"apiBaseUrl": "http://localhost:8081/ginas/app/",
"gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
```

Depending on your configuration choices, set to a prefix or `/`  

```
"occasionalApiBasePath": "/ginas/app",
"restApiPrefix": "/ginas/app",
```

There are many UI options configured in this file. These include which GSRS entities (i.e. which component microservices) are active. One such example is the ability to enable entity components such as applications, products and clinical trials. This can be done by altering the `loadedComponents` config variable like so:

```
"loadedComponents": {
  "applications": true,
  "products": true,
  "clinicaltrials": true,
  "adverseevents": true,
  "impurities": true
  },
```

The default approval code displayed can be changed from the default 'UNII' by setting the `approvalCodeName` value in the front-end config file. The same can be done with the default 'BDNUM` primary code by setting the `primaryCode` config value.

Please see the GSRS Frontend documentation for more information.

## Configure the Gateway microservice

The Gateway routes traffic to the frontend. Review that service's [README](https://github.com/ncats/gsrs3-main-deployment/blob/main/frontend/README.md) for more information.

## Changing the Gateway's route prefix

The Java service and Angular UI use a route prefix, by default "ginas/app/ui/".

To modify the prefix in the Java service, set the Java property `gsrs.frontend.prefix`, used in the class: `MvcConfiguration.java`.

In the Angular UI, base adjustments should be made in:

- [environment files](https://github.com/ncats/GSRSFrontend/tree/development_3.0/src/environments).
- the config.json (apiBaseUrl value).

In the Gateway service configuration, set the `api.base.path` property, perhaps using the `API_BASE_PATH` environment variable. See the Gateway `application.conf` to observe how this works.

## Manually Generate the Frontend Files

The directory is populated from the `GSRSFrontEnd` repository. First clone the (<https://github.com/ncats/GSRSFrontend>) repository and follow the installation instructions found in the README. After everything is installed, run these commands after substituting the proper path for the placeholder `/path/to/fronted/src/main/resources/`:

```
cd /path/to/GSRSFrontEnd
npm run build:fda:prod
rm -rf /path/to/fronted/src/main/resources/static/*
cp -rf dist/browser/* /path/to/fronted/src/main/resources/static/.
```

## Compile Requirements

Starting with GSRS 3.0.1, the Angular version is 13.  

To compile GSRS 3.0.1 or higher: we recommend a recent NodeJS version, such as version 17 or higher.

GSRS 3.0 used Angular 8. Compile it with NodeJS v13.
