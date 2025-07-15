# How to run GSRSFrontend UI in development mode

Date at last update: 2025-05-15

Version at last update: 3.1.2

## SCENARIO 1: Using a remote backend

It can be convenient to test a local copy of the GSRSFrontend while using a remote backend. This way you can access a system with full functionality or data.

However, please note that this Scenario 1 recipe currently only works fully for the Substances service. For other services, you will run into CORS errors if you try to post/update data. 

### Groundwork

a) The GSRS team uses Visual Studio Code to edit the Frontend, so you'll want that. Community Edition is fine.

https://code.visualstudio.com

b) Install node.js if not yet installed.

GSRS team members use varying versions. The author of this document is using v20.5.1 on Mac. By default, our automated build procedure currently uses v14.17.0. You can install node by downloading from this site (https://nodejs.org/en) site, or possibly with a package manager on Linux or Mac.

c) Clone the GRSFrontend repository

The latest code is on the development_3.0 branch.

```
git clone https://github.com/ncats/GRSFrontend
cd GSRSFrontend 

```
d) Run `build.sh` on the project

This is necessary once, or after a new code pull.

We recommend you use "Git bash" Terminal if on Windows. Otherwise, please translate the bash script to Windows a DOS batch file. Git Bash usually comes free if you installed Git on Windows (https://git-scm.com/).  And Bash comes already installed on Linux or Mac.  

```
bash build.sh 
```

### Run and serve the Angular code locally

```
npm run start:fda:local
```

You can access the frontend in your browser at the http://localhost:4200 URL.

### Some edits

In Visual Studio, edit this file: `src/app/fda/config/config.json`

Add these configs. It's possible that `your-remote-host.net` does not use the /ginas/app prefix. If that is the case, change as needed. 

```
"apiBaseUrl": "https://your-remote-host.net/ginas/app/",
"gsrsHomeBaseUrl": "https://your-remote-host.net/ginas/app/ui/",
"apiSSG4mBaseUrl": "https://your-remote-host.net/ginas/app/",
"occasionalApiBasePath": "/ginas/app",  
"restApiPrefix": "/ginas/app",
```

If using `http://localhost:4200` directly in your browser, then in Visual Studio, edit this file: `src/index.html`

This tag should have this value:

```
  <base href="/">
```

### Try it

Try running loading your site in your browser via http://localhost:4200/

## SCENARIO 2: Use local microservices for backend

As in Scenario 1, you will need node.js and Visual Studio.  Follow the instructions under the header "Groundwork" above if you haven't yet installed these resources. 

When doing local development, it is more likely that you are running GSRS Spring Boot services locally with Maven and Java.

To do this, you clone the gsrs3-main-deployment (or similar) repository and look for instructions in that repo's README.md file.

```
git clone https://github.com/ncats/gsrs3-main-deployment
cd gsrs3-main-deployment
```

Because we are using GSRSFrontend in development mode, we <b>skip</b> running the gsrs3-main-deployment/frontend service.

But, we do run services gsrs3-main-deployment gateway and substances (and maybe clinical-trials, products, etc.) 

### Gateway configs

Edit the file: `gateway/src/main/resources/gateway-env.conf`

Uncomment these two lines to route traffic for the frontend to you local develoment mode GSRSFrontend.

```
MS_URL_FRONTEND="http://localhost:4200"
GATEWAY_FRONTEND_ROUTE_URL="http://localhost:4200"
 ```

Then, restart the gateway service.


### GSRSFrontend configs

Next, go to your GSRSFrontend repository in Visual Studio.

Edit this file: `src/app/fda/config/config.json` to add these configs, changing.  (The default gateway port is 8081.)

```
"apiBaseUrl": "http://localhost:8081/ginas/app/",
"gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
"apiSSG4mBaseUrl": "http://localhost:8081/ginas/app/",
"occasionalApiBasePath": "/ginas/app",  
"restApiPrefix": "/ginas/app",
```

Now, in visual studio, edit this file: `src/index.html`

Normally, when using the default gateway configuration, this should be the value for this tag:

```
  <base href="/ginas/app/ui/">
```

Finally, run/serve GSRSFrontend in development mode with this command.

```
cd path/to/GSRSFrontend 
npm run start:fda:local
```

When it is compiled and still running, you can make edits to the GSRSFrontend code. The code will be recompiled automatically on each edit. Most of the time, your browser will also auto-reload.

### Try it through the Gateway on 8081

In your browser, go to http://localhost:8081/ginas/app/ui/

In the background, the gateway service is rerouting all traffic for "/ginas/app/ui/*" to GSRSFrontend in development mode on http://localhost:4200/.
