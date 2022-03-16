## THE LOGIN PROCESS

Here are some tips on the GSRS backend login process that will be helpful for debugging, testing and automation. 

This demonstrates how to login via curl by creating a session, getting a session key, and possibly getting and using an authentication token.  

We assume you're working on local host without SSL.

if you are on SSL you'll want to add `-k` switch to your curl commands to prevent it from checking the validity of SSL certificates. However, please be warned that the `-k` switch should only be used in a testing or an otherwise LOCKED DOWN/secure scenario).  

The command-line scripting strategy below requires that you use Bash, a bit of Perl, and Curl.  On windows Git-Bash will work.    


### Authenticating 

Unless there is some security layer preventing it, you can generally hit GSRS resource endpoints in the REST API with user credentials, like so: 

```
curl -X GET -H 'auth-password: admin' -H 'auth-username: admin' http://localhost:8081/api/v1/substances  
```

To make that authentication more durable, you could use authentication and ALSO get a session key.

Then, you would not need to pass credentials with each request. You could instead pass a session id. 

**Create this file**: 
```
# extract_session_key.sh 
curl -s --head -X GET -H 'auth-password: admin' -H 'auth-username: admin' -i http://localhost:8081/api/v1/whoami | grep 'Set-Cookie: ix.session=' | perl -lne  'chomp; if(/Set-Cookie: ix.session=(.*?);/) {  print $1; }'
````

This gets the response headers from the `api/v1/whoami` endpoint and it extracts the a cookie `ix.session` key value.    

In your terminal, use the above script to set a GSRS session key.  
```
export SESSION_KEY=$(bash extract_session_key.sh)
```

**Now, you can see if you're logged in using a cookie header** 
```
curl -s 'http://localhost:8081/api/v1/whoami' -H "Cookie: ix.session=$SESSION_KEY"
```

You should get back JSON that looks like this. 

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


### Using a Token (this section needs to be verified)  

You may be able to use a token for REST API requests instead of the session id or credentials.    

**Create this file:**
```
# extract_computed_token.sh
curl -s 'http://localhost:8081/api/v1/whoami' -H "Cookie: ix.session=$SESSION_KEY" | perl  -MJSON -n0777 -E '$r = decode_json($_); say $r->{computedToken}'
```

This gets the `api/v1/whoami` endpoint and it extracts the `computedToken` value from the response JSON.     


**Run this command to set the token value in your terminal**
```
export COMPUTED_TOKEN=$(bash extract_session_key.sh)
````

You can now interact with the GRSR REST API via curl and a token (needs to be verified). 
```
curl -s -X POST 'http://localhost:8081/api/v1/substances' -H 'auth-user: admin' -H "auth-key: $COMPUTED_TOKEN"  
```
