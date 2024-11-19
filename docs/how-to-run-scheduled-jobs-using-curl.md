# How to run scheduled jobs using curl on a Linux command line

Last edited: 2024-07-23

GSRS version at last edit: v3.1.1

Substance service tasks, or *Scheduled Jobs*, can be be managed in the Admin panel of the GSRS front end (a.k.a. "Frontend") at the following url: 

```
http://localhost:8081/ginas/app/ui/admin/jobs
```

Currently, however, the Frontend only shows tasks that are available to the Substances microservice (and configured in the Substance microservice's application.conf file.) 

This constraint is due to the way the GSRS Gateway is configured and with limitations of the current Frontend design.

We expect this to be rectified in a coming version.

There can be situations where a GSRS administrator may prefer to interact with the the Scheduled Jobs API via curl rather than using the Frontend. 

This can be useful in testing and in automation, but also in running tasks built into GSRS microservices other than the core Substance module. 

In this tutorial, we assume that 8081 is the Gateway port. We also assume an **embedded** Tomcat deployment that has the following services running on these given ports: 

- Gateway (8081) 
- Frontend  (8082) 
- Substances (8080) 
- Clinical Trials (8089)

Let's see how we can run a task in the *Substances* service from a Curl command that routes through the Gateway.  

To see a list of tasks available, we execute the command: 

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' http://localhost:8081/api/v1/scheduledjobs | json_pp 
```

This returns a **list** of tasks under the `content` field in JSON like below. Note that each task has an `id` field in the JSON. For example: 

```
{
   "count" : 12,
   "skip" : 0,
   "top" : 1000,
   "total" : 12,
   "content" : [
      # ... other tasks ..., 
      {
         "@enable" : "http://localhost:8081/api/v1/scheduledjobs(12)/@enable",
         "@execute" : "http://localhost:8081/api/v1/scheduledjobs(12)/@execute",
         "cronSchedule" : "0 0/0 0 1 * ?",
         "description" : "Regenerate standardized names, force inconsistent standardized names to be regenerated",
         "enabled" : false,
         "id" : 12,
         "key" : "734719c9-5fd9-4e7c-84b1-b1fe62a3b029",
         "lastFinished" : 1721666651527,
         "lastStarted" : 1721666648566,
         "nextRun" : 1722484800000,
         "numberOfRuns" : 1,
         "running" : false,
         "url" : "http://localhost:8081/api/v1/scheduledjobs(12)?view=full"
      }
   ]
}
```

If we want to execute the task whose `id` is 12, we run:  

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' 'http://localhost:8081/api/v1/scheduledjobs(12)/@execute'  | json_pp
```

... and we receive this reponse: 

```
{
   "@enable" : "http://localhost:8081/api/v1/scheduledjobs(12)/@enable",
   "@execute" : "http://localhost:8081/api/v1/scheduledjobs(12)/@execute",
   "cronSchedule" : "0 0/0 0 1 * ?",
   "description" : "Regenerate standardized names, force inconsistent standardized names to be regenerated",
   "enabled" : false,
   "id" : 12,
   "key" : "734719c9-5fd9-4e7c-84b1-b1fe62a3b029",
   "lastFinished" : 1721670616120,
   "lastStarted" : 1721670613283,
   "nextRun" : 1722484800000,
   "numberOfRuns" : 2,
   "running" : false,
   "url" : "http://localhost:8081/api/v1/scheduledjobs(12)?view=full"
}
```

We can then check periodically to see whether the task has finished by polling at this url:  

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' 'http://localhost:8081/api/v1/scheduledjobs(12)' | json_pp 
```

In the response JSON, the `running`, `lastStarted` and `lastFinished` values allow us to verify the status of the job: 
  
  {                        
    "lastFinished" : 1721666651527,
    "lastStarted" : 1721666648566,
    "running" : false,         
    # ...
  }

### How to run a non-Substance service task 

Currently we run the task using the service's server port in embedded Tomcat or via a non-Gateway-mediated path on single Tomcat. 

NOTE: These workarounds may not work outside of a simple development environment. 

For Clinical Trials, in *embedded Tomcat* environment, we hit the following url as shown below to get a list of tasks available for the Clinical Trials US entity context. NOTE THE DIFFERENT PORT NUMBER. 

```  
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' http://localhost:8089/api/v1/scheduledjobs | json_pp 
```

Due to the way the `application.host` value is likely configured in your Clinical Trials microservice, it is likely that you will not see port 8089 in the urls included in the response JSON.  Nevertheless, you should use the port that corresponds to the `server.port` in the url. Again, here we assume 8089.  

Now, assuming that there is a task with `id` of 1 for Clinical Trials, we can execute it as follows: (again, note the port number for Clinical Trials) 

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' http://localhost:8089/api/v1/scheduledjobs(1)/@execute | json_pp
```

However, in a *single Tomcat* environment (rather than embedded tomcat), where all services use port 8080, we hit the following url to get a list of tasks available for the Clinical Trials US entity context. 

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' 'http://localhost:8080/clinicaltrialsus/api/v1/scheduledjobs' | json_pp
```

Assuming that there is a task with `id` of 1, we can execute it in a single-Tomcat environment as follows: 

```
curl -k -s -X GET -H 'auth-username: admin' -H 'auth-password: XXXXX' 'http://localhost:8080/clinicaltrialsus/api/v1/scheduledjobs(1)/@execute' | json_pp
```
