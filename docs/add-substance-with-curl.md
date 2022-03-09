# Use Curl to Add a Substance


These examples add two substance concept for DEMONSTRATION purposes only.

This is a very simplified example.   

We assume:
   - You are usnig the embedded Tomcat gsrs-main-deployment on a local computer.
   - You have the Gateway and Substances microservices running.
   - You have not removed the default "admin" **username** after installation, nor changed the default **password**, "admin"
   - You won't keep these substances in your system. 

A Substance "concept" is a very non-specific  substance class or possibly a reference to a collection of substances.  

We are using concepts in this example, only because they have the least requirements in terms of specification. 

We recommend you use "**bash**" to run this comamnd on the comamnd line.  If you use windows you can install **Git Bash**.

Alternatively, you can use a program linke "Postman" or install the "Rest Client" extension on **Firefox**.    

The POST command will work only once when **creating** a substance. If you wanted to make a change to the substance after creating it, you would change from POST to a PUT. However, before doing that you should GET the substance from GSRS first, copy the JSON, make a change, and finally do the PUT. 

In fact you might want to do a GET first before proceding to make sure the substances don't already exist (see below) 


### Create Two Substances

```
curl -X POST -H 'Content-Type: application/json' -H 'auth-username: admin' -H 'auth-password: admin' -i http://localhost:8081/api/v1/substances --data '
        {
          "definitionType": "PRIMARY",
          "definitionLevel": "COMPLETE",
          "substanceClass": "concept",
          "status": "non-approved",
          "uuid":"de5303d9-9423-436c-8e53-d17e19226da1",
          "names": [
            {
              "deprecated": false,
              "name": "DRINKING WATER EXAMPLE",
              "type": "cn",
              "preferred": false,
              "displayName": true,
              "references": [
                "e7dcc059-7f47-4815-8444-2157381b8f17"
              ],
              "access": []
            }
          ],
          "references": [
            {
              "uuid": "e7dcc059-7f47-4815-8444-2157381b8f17",
              "citation": "Some Citatation for Drinking Water Example",
              "docType": "WEBSITE",
              "publicDomain": true,
              "tags": [
                "PUBLIC_DOMAIN_RELEASE"
              ],
              "access": []
            }
          ],
          "access": [
            "protected"
          ]
        }
'
```

```
curl -X POST -H 'Content-Type: application/json' -H 'auth-username: admin' -H 'auth-password: admin' -i http://localhost:8081/api/v1/substances --data '
      {
          "definitionType": "PRIMARY",
          "definitionLevel": "COMPLETE",
          "substanceClass": "concept",
          "status": "non-approved",
          "uuid":"f6391de8-19ad-489c-a6e8-c156fdfbf91b",
          "names": [
            {
              "deprecated": false,
              "name": "FRESH AIR EXAMPLE",
              "type": "cn",
              "preferred": false,
              "displayName": true,
              "references": [
                "e28d1ea0-3b51-4321-9f3f-2c002ed6a728"
              ],
              "access": []
            }
          ],
          "references": [
            {
              "uuid": "e28d1ea0-3b51-4321-9f3f-2c002ed6a728",
              "citation": "Some Citatation 2 for Fresh Air Example",
              "docType": "WEBSITE",
              "publicDomain": true,
              "tags": [
                "PUBLIC_DOMAIN_RELEASE"
              ],
              "access": []
            }
          ],
          "access": [
            "protected"
          ]
        }
       
'

```

### You can now GET a substance like this: 




```
curl -X GET -H 'auth-username: admin' -H 'auth-password: admin' -i http://localhost:8081/api/v1/substances/f6391de8-19ad-489c-a6e8-c156fdfbf91b

```

```
curl -X GET -H 'auth-username: admin' -H 'auth-password: admin' -i http://localhost:8081/api/v1/substances/de5303d9-9423-436c-8e53-d17e19226da1

```





