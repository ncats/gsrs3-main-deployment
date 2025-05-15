# Quick start, run Frontend UI in development mode and pair with remote backend 

Date at last update: 2025-05-15

Version at last update: 3.1.2

It can be convient to test a local copy of the frontend while using a remote backend to access a system with full functionality or data. 

However, please note that this recipe currently only works fully for the substances service. For other services, you will run into CORS errors if you try to post/update data. 

### Laying the groundwork 

a) The GSRS team uses Visual Studio Code to edit the frontend, so you'll want that. Community Edition is fine.

https://code.visualstudio.com

b) Clone the GRSFrontend repository 

The latest code is on the development_3.0 branch.

```
git clone https://github.com/ncats/GRSFrontend 
```

### Run and serve the Angular code locally. 

```
cd GSRSFrontend 
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

If using, http://localhost:4200 directly in your browser, then in visual studio, edit this file: `src/index.html` 

This tag should have this value:

```
  <base href="/">
```

### Try it

Try running loading your site in your browser via http://localhost:4200/ 


### More common approach to local frontend in development mode. 

When doing local development, it is more likely that you are running GSRS Spring Boot services locally.

In this case, <b>skip</b> running the gsrs3-main-deployment frontend service. 

But, do run services gsrs3-main-deployment gateway and substances (and maybe clinical trials, products, etc.) 

Go to your gateway service folder and edit the file `gsrs3-main/deployment/src/main/resources/gateway-env.conf` 

Uncomment these to lines to route traffic for the frontend to you local develoment mode frontend. 

```
MS_URL_FRONTEND="http://localhost:4200"
GATEWAY_FRONTEND_ROUTE_URL="http://localhost:4200"
 ```

Next, go to your GSRSFrontend repository to run/server it.

```
cd GSRSFrontend 
npm run start:fda:local
```


In visual studio, edit this file: `src/app/fda/config/config.json` to add these configs, changing the port if your GATEWAY port is different. 

"apiBaseUrl": "http://localhost:8081/ginas/app/",
"gsrsHomeBaseUrl": "http://localhost:8081/ginas/app/ui/",
"apiSSG4mBaseUrl": "http://localhost:8081/ginas/app/",
"occasionalApiBasePath": "/ginas/app",  
"restApiPrefix": "/ginas/app",


In visual studio, edit this file: `src/index.html` 

Normally, when using the default gateway configuration, this should be the value for this tag

```
  <base href="/ginas/app/ui/">
```

### Try it through the gateway on 8081 

In your browser, go to http://localhost:8081/ginas/app/ui
 










