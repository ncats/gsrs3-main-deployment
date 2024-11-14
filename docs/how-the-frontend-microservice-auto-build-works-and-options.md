# How the Frontend microservice auto-build works and options

Last updated: 2024-10-01

GSRS Version at last update: 3.1.1

[Quick version](#section-a----quick-version)

[Longer version](#section-b----longer-version)


## Section A -- Quick version 

This section is meant for the admin or developer who is running a local instance GSRS services using embedded Tomcat and needs immediate answers.  

It can be jarring to learn that each time you run `mvn spring-boot:run ...`  on the Frontend service, Maven will go through a lengthy process of downloading and building a distribution of the whole Angular project.  This tends to take about 3-7 minutes, but feels longer.  

With this quick aproach, you'll still need to do a first build.  But you can avoid the subsequent ones. For a more comprehensive discussion of the many ways you can package or run the service, see "Section B" of this document. 

### Quick version

Step 1 -- "Package" the frontend service and build the Angular UI.

```
export FRONTEND_TAG=development_3.0
mvn clean -U package -Dfrontend.tag=$FRONTEND_TAG  -Dwithout.visualizer -DskipTests
```
```
# FRONTEND_TAG can be a branch or a tag of the ncats/GSRSFrontend Github repository. 
# Commonly used values might be like:
# - development_3.0 -- the latest code in development.
# - GSRSv3.1.1PUB -- We tag versions like this.
# - mybranch -- A branch you've pushed to ncats Github.
```

Step 2 -- "Run" with java (assuming embedded tomcat)

```
java -cp "target/frontend.war:/path/to/custom" -Dserver.port=8082 org.springframework.boot.loader.WarLauncher
```
```
# On Windows CMD console and even Windows GitBash, use semicolon `;` as class path (-cp) delimiter.
# Also on Windows CMD, use `set` instead of `export` in Step 1.
# The port can be any number that corresponds to the port the frontend service runs on.
# If you have server.port defined in application.conf the port option is not needed.
# Step #1 results in the ./target/frontend.war file.
# The war includes the Angular Frontend distribution.
# Step #2 above assumes that you have custom files that you want to add to the classpath.
# These override files must occur in the same file structure found in frontend.war.

# For example, create this file before running Step #2:
# /path/to/custom/static/assets/data/config.json
# It will override the config.json file of the war file.
# It is not important that you use the folder name "custom"
```

## Section B -- Longer version 


### Changes to Frontend microservice build

Starting in 3.1.1 The frontend is built automatically when running or packaging the frontend service. This is implemented by using Maven plugin code in the service's `pom.xml` file.  

```
mvn clean -U spring-boot:run 
mvn clean -U package 
```

### The Maven plugins

**frontend-maven-plugin**
https://github.com/eirslett/frontend-maven-plugin
This plugin adds the necesary npm components to compile the GsrsFrontend Angular frontend.

**maven-antrun-plugin**
https://maven.apache.org/plugins/maven-antrun-plugin/
This plugin allows one to write scripts within the XML to download resources from Github, perform housekeeping, and copy compiled output to the target/classes folder so it is available to the GSRS frontend service at runtime. 

One can set pass Maven options to guide the behavior of the scripts. 


### Choosing a Frontend version/tag  

Logic set in the `pom.xml` file will try to find a reference to an archive, deployable binaries, or branch based on the value of the Maven options.  The main option `-Dfrontend.tag` (or the default) is used to perform a prioritized search on GIT or local file resources.   

The search is based on the following priorities; once a match is found, the rest are skipped. 

```
(Precompiled client from specific GIT release)
https://github.com/ncats/GSRSFrontend/releases/download/${frontend.tag}/${frontend.tag}.zip 

(Precompiled client from specific GIT release, but with fixed file name)
https://github.com/ncats/GSRSFrontend/releases/download/${frontend.tag}/deployable_binaries.zip 

(Sources for Any Tag)
https://github.com/ncats/GSRSFrontend/archive/refs/tags/${frontend.tag}.zip 

(Sources for specific Commit)
https://github.com/ncats/GSRSFrontend/archive/${frontend.tag}.zip 

(The development_3.0 branch)
https://github.com/ncats/GSRSFrontend/archive/refs/heads/development_3.0.zip 

(Local zip option)
In addition, there is the option of passing a local file zip instead.
```

### Build properties

```
frontend.repo - Path to the GSRSFrontend repository (default: https://github.com/ncats/GSRSFrontend)
frontend.tag - Git Tag or Commit (default: GSRSv${project.version}PUB)
without.visualizer - do not include visualizer files (default: false)
without.static - do not download frontend code and do not include browser static files (default: false)
node.disable - do not install node. Use only with precompiled client (default: false)
```

### Packaging or Running the service 
```
# Example, with Git reference pointing to latest source code (no pre-built binaries) 
./mvnw clean package -Dfrontend.tag=development_3.0 -Dwithout.visualizer -DskipTests
```

```
# Example, with Git reference pointing to a pre-built binaries
./mvnw clean package -Dfrontend.tag=buildRelease -Dnode.disable -Dwithout.visualizer -DskipTests
```

If you want to force #5 above, you could set -Dfrontend.tag=development_3.0 

After download, the following senario may occur depending on the options: 
- node/npm are installed  
- the resource is copied to the file frontend.zip
- frontend.zip is unzipped
- the contents are moved to target/GsrsFrontend
- the npm program builds a distribution if needed
- the distribution is copied to the target/classes/static 
- maven runs or packages the service. 


### Adjusting config.json 

If you have a custom configuration, you may wish to create a complementary class path to override the one found in target/classes/static/assets/data/config.json 

```
mkdir -p ../../my/frontend/classes/static/assets/data
# edit as needed and save
nano ../../my/frontend/classes/static/assets/data/config.json 
```

Then, in Spring Boot 2.4.5 you can next do this: 

```
> mvn spring-boot:run -Dspring-boot.run.folders=../../my/frontend/classes
```

Or, in Spring Boot higher versions do:

```  
> mvn spring-boot:run -Dspring-boot.run.directories=../../my/frontend/classes
```

### Running the Frontend service again after packaging

Once the Frontend service has been packaged and the Angular frontend has been compiled to a distribution, you can run it like this without the risk of launching a time consuming rebuild.


```
# Place a config.json in the class path if needed
mkdir -p /path/to/your/conf/static/assets/data 
cp config.json /path/to/your/conf/static/assets/data 

# Run the package 
mvn clean -U package [ ... options ... ]  -DskiptTests 
java -cp "target/frontend.war:/path/to/your/conf" -Dserver.port=8080 org.springframework.boot.loader.WarLauncher
``` 

### Run by pointing to your own (uncompressed) pre-compiled Angular distribution

This assumes you've created an Angular distribution in the `dist/browser` folder of your local clone of GSRSFrontend. 

```
# Do this once
mkdir -p /path/to/my/classes

# Do this anytime you update the distribution
cp -r /path/to/GSRSFrontend/dist/browser  /path/to/my/classes/static
# Update the static/assets/data/config.json file as needed

# Then run the frontend service like this:
./mvnw clean -U spring-boot:run  \
-Dspring-boot.run.folders=/path/to/my/classes \
-Dnode.disable \
-Dwithout.visualizer \
-Dwithout.static \
-DskipTests  
```


### Using a local deployable distribution binaries zip file

In situations where you don't wish to install node and to build an Angular distribution at each run/package time, you can skip these steps and place a distribution file in local folder. For example:

```
mkdir -p /path/to/my/dist/archive # you must have use  `archive` as the last folder name here. 

# Assuming you name for zip file local_deployable_binaries.zip 
cp /some/folder/local_deployable_binaries.zip /path/to/my/dist/archive/local_deployable_binaries.zip  

# Then run or package the frontend service like this:  

./mvnw clean -U package \
-Dfrontend.repo=file:///path/to/my/dist \ 
-Dfrontend.tag=local_deployable_binaries \
-Dnode.disable \
-Dwithout.visualizer \
-DskipTests

```
 
As a side note, a `deployable_binaries.zip` is a zip file having a folder `dist/browser`. This is the folder structure that is generated when building a distribution of the GSRSFrontend repository with the command `npm run build:fda:prod`. See the README for the Frontend service for more information on how to build such a distribution. 

### Package the service without generating a static folder containing the Angular frontend 

This can be accomplished with options like this: 

```
./mvnw clean -U package \
-Dnode.disable \
-Dwithout.visualizer \
-Dwithout.static 
-DskipTests
```

### Package the service using a forked GSRS Frontend Angular repository 

This can be accomplished with options like this: 

```
./mvnw clean -U package \
-Dfrontend.repo=http://github.com/myuser/myreponame \ 
-Dfrontend.tag=myreference
-Dnode.disable \
-DskipTests
```

### Doing things the old way and skipping automation 

Before automation, the old approach was to compile a Frontend distribution and copy that into the **Frontend service**, in the folder `frontend/src/main/resources/static` Since spring-boot adds this folder into the class path, it will be included when running or packaging the service.

Some people or organizations may choose to continue this approach for local development or embedded Tomcat situations. If so here is a way that it might work. 

```
# if you want to override the config.json, prepare to use this option `-Dspring-boot.run.folders=../../my/frontend/classes`
# mkdir -p ../../my/frontend/classes/static/assets/data
# move my-config.json ../../my/frontend/classes/static/assets/data/config.json 
# Otherwise don't use the option 

mvn clean -U spring-boot:run \
-Dspring-boot.run.folders=../../my/frontend/classes  \
-Dnode.disable \
-Dwithout.static \
-Dwithout.visualizer \
-DskipTests
```
