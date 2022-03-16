## Backend Login Process, Command Line Demo

Here are some tips on the GSRS backend login process that will be helpful for debugging, testing and automation. 

This demonstrates how to login via curl by creating a session, getting a session key, and possibly getting and using a token.  

We assume you're working on local host without SSL.

if you are on SSL you'll want to add `-k` switch to your curl commands to prevent it from checking the validity of SSL certificates. However, please be warned that the `-k` switch should only be used in a testing or an otherwise secure/safe scenario.  

The command-line scripting strategy below requires that you use Bash, a bit of Perl, and Curl. On windows Git-Bash will work.    


### Authenticating 

Unless there is some security layer preventing it, you can generally hit GSRS resource endpoints in the REST API with user credentials, like so: 

```
curl -X GET -H 'auth-password: admin' -H 'auth-username: admin' http://localhost:8081/api/v1/substances  
```

### Session 

To make that authentication more lasting, you could use authentication and ALSO get a session key.

Then, you would not need to pass credentials with each request. You could instead pass a session id in a cookie header. 

Create this file: 
```
# extract_session_key.sh 
curl -s --head -X GET -H 'auth-password: admin' -H 'auth-username: admin' -i http://localhost:8081/api/v1/whoami | grep 'Set-Cookie: ix.session=' | perl -lne  'chomp; if(/Set-Cookie: ix.session=(.*?);/) {  print $1; }'
````

This gets the response headers from the `api/v1/whoami` endpoint, and it extracts the a cookie `ix.session` key value.    

In your terminal, use the above script to temporarily set a GSRS session key.  
```
export SESSION_KEY=$(bash extract_session_key.sh)

echo $SESSION_KEY # optional

```

Now, you can see if you're logged in and have a session using a cookie header. 
```
curl -s 'http://localhost:8081/api/v1/whoami' -H "Cookie: ix.session=$SESSION_KEY"
```

You should get back JSON that looks like this: 

```
{
	"id": 1,
	"version": 1,
	"created": 1647383742786,
	"modified": 1647383742787,
	"deprecated": false,
	"user": {
		"id": 1,
		"version": 0,
		"created": 1647383742786,
		"modified": 1647383742786,
		"deprecated": false,
		"username": "ADMIN",
		"email": "admin@example.com",
		"admin": false
	},
	"active": true,
	"systemAuth": false,
	"properties": [],
	"roles": ["Query", "DataEntry", "SuperDataEntry", "Updater", "SuperUpdate", "Approver", "Admin"],
	"tokenTimeToExpireMS": 3314399,
	"roleQueryOnly": false,
	"identifier": "ADMIN",
	"computedToken": "e16dca0cbef21cc03968a3bbc72e37a03a76a5a9",
	"groups": []
}
```

You can use the session id in requests to the REST API, assuming authentication is required. 

```
curl -s -X GET 'http://localhost:8081/api/v1/substances' -H "Cookie: ix.session=$SESSION_KEY"
```



### Session Configuration Details. 

The application.conf of the the microservice handling authentication (currently substances) has a property gsrs.sessionExpirationMS. 

You can set this to 60000 milliseconds. To test whether sessions are expired as expected. 

These files in the `gsrs-spring-starter` repo may be of interest to those wanting to dig deeper.

- GsrsLogoutHandler.java
- LoginController.java
- LoginAndLogoutEventListener.java
- LegacyGsrsAuthenticationSuccessHandler.java 

### Token (this section needs to be verified)  

You may be able to use a token for REST API requests instead of the session id or credentials.    

Create this file:
```
# extract_computed_token.sh
curl -s 'http://localhost:8081/api/v1/whoami' -H "Cookie: ix.session=$SESSION_KEY" | perl  -MJSON -n0777 -E '$r = decode_json($_); say $r->{computedToken}'
```

This gets the `api/v1/whoami` endpoint, and it extracts the `computedToken` value from the response JSON.


Run this command to temporarily set the token value in your terminal.
```
export COMPUTED_TOKEN=$(bash extract_session_key.sh)

echo $COMPUTED_TOKEN # optional

````

You can now interact with the GRSR REST API via curl and a token (needs to be verified). 

```
curl -s -X GET 'http://localhost:8081/api/v1/substances' -H 'auth-user: admin' -H "auth-key: $COMPUTED_TOKEN"  
```

### H2 Sessions Table 

Session records are stored in the `ix_core_session` table. 

If you are debugging locally and your app is using an H2 database. You can use these scripts to list/clear sessions as needed. 


First `cd ./gsrs-main-deployment/substances`, then create these files:

```

# list_sessions.sh
echo "select * from ix_core_session;" > list_sessions.sql 
java -cp ~/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.RunScript -url 'jdbc:h2:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE' -script 'list_sessions.sql'  -user '' -password '' -showResults
rm list_sessions.sql 

# clear_sessions.sh
echo "delete from ix_core_session;" > clear_sessions.sql 
java -cp ~/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.RunScript -url 'jdbc:h2:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE' -script 'clear_sessions.sql'  -user '' -password '' -showResults
rm clear_sessions.sql 
```
