# GSRS Backend Login Process, How to Login on the Command Line

Here are some notes on the GSRS backend login process that will be helpful for debugging, testing and automation.

The intent here is to provide you with tools to work through the login process on the command line so you understand how to interact with the GSRS backend REST API without a front end application.  This will be helpful for those who want to learn how to automate data loading with with a command line application like `curl` or with scripts.

We start with some background information. If you want to skp that click [get started with curl](/docs/the-backend-login-process.md#getting-started-with-curl). 

## 1. Background

### Basic Authentication Logic

Each request to the REST API is evaluated for authentication. The following list delineates how requests are evaluated.  

1. A Single Sign-on (SSO) proxy adds headers and restricts acccess to users not recognized by the SSO host.
2. The GSRS authentication layer looks for a session cookie. If the cookie exists, the authentication layer honors that session, and the user is logged in. The request is considered to be from the user associated with the session. All other steps are skipped.
3. If no session, the GSRS header-based authentication sets the user profile.
4. If the expected HTTP headers are not found, GSRS token-based authentication sets the user profile.
5. If token authentication fails, api-key based authentication sets the user profile.
6. If the api-key based authentication fails, username + password based authentication sets the user profile.
7. If authentication worked (3-6), then GSRS finds the first active session for that user, and sets a cookie for it.
8. If there was no active session for that user, GSRS makes a new session and sets a cookie for it.
9. If no authentication worked at all, then GSRS display the authentication failure page or JSON.

### Authentication Constructs

- Username 
  - Stored in the user profile database table.
  - Called `auth-username` in the HTTP header.
- API-key
  - Stored in the user profile database table in the `apikey` column. 
  - Called `key` in `api/v1/whoami` JSON.
  - Called `auth-key` in the HTTP header.
- Password
  - Salted hash stored in the user profile table, as well as salt.
  - Called `auth-password` in the HTTP header.
- Session ID
  - Stored in the `ix_core_session` database table. 
  - Stored in an `ix.session` key=>value inside the HTTP Cookie. 
- User token
  - Not stored anywhere, computed as-needed.
  - A function of (date + username + key) where the date is a partial that is constant for a period of time.   
- Whoami
  - REST `GET` endpoint `api/v1/whoami`.  
  - Provides JSON with most of these constructs' values. 
  - Is good for testing because a successful response requires one of the above authentication strategies to work. 


### Spring Boot Configuration Properties
```
gsrs.sessions.sessionCookieName="ix.session"

# For testing set to a low number as needed; one minute = 60000 milliseconds.
# 6 hours 6*60*60*1000 = 21600000 milliseconds.
gsrs.sessions.sessionExpirationMS=60000

# Secure session off for dev, but if using HTTPS it's better to have it on
gsrs.sessions.sessionCookieSecure=false

# Tokens expire in 3600L*1000L*24L, about 24 hours
gsrs.tokens.timeResolutionMS=86500000

# To be elaborated on, cross-microservice API calls.
gsrs.microservice.substances.api.headers = { }

```

### Java Session Configuration Details

Currently, the substance microservice handles authentication. The substances `application.conf` may have a property named `gsrs.sessions.sessionExpirationMS`.  You can set this to 60000 milliseconds to test whether sessions expire as expected. 

These backend source code files in the `gsrs-spring-starter` repository may be of interest to those wanting to dig deeper.

- GsrsLogoutHandler.java
- LoginController.java
- LoginAndLogoutEventListener.java
- LegacyGsrsAuthenticationSuccessHandler.java 
- LegacyAuthenticationFilter.java
- SessionConfiguration.java
- TokenConfiguration.java


## 2. Authenticated REST API calls with Curl

### Getting Started with Curl

This guide demonstrates how to login via `curl` by creating a session, getting a session key, and optionally getting and using a token.  

We assume you're working on a local host without SSL.

if you are on SSL you'll want to add the `-k` switch to your curl commands to prevent it from checking the validity of SSL certificates. However, please be warned that the `-k` switch should only be used in a testing or an otherwise secure/safe scenario.  

The command-line scripting strategy below requires that you use Bash, a bit of Perl, and Curl. On windows Git-Bash will work.    


### Authenticating 

Unless there is some security layer preventing it, you can generally hit GSRS resource endpoints in the REST API with user credentials, like so: 

```
curl -X GET -H 'auth-password: admin' -H 'auth-username: admin' http://localhost:8081/api/v1/substances  
```

### Create a Session 

To make that authentication more lasting in your computer terminal session, you could use authentication and ALSO get a session key.

Then, with this method, you would not need to pass credentials with each request. You could instead pass a session id in a cookie header. Here's how: 

Create this file: 
```
# extract_session_key.sh 
PORT="${PORT:-8081}"
curl -s --head -X GET -H 'auth-password: admin' -H 'auth-username: admin' -i http://localhost:$PORT/api/v1/whoami | grep 'Set-Cookie: ix.session=' | perl -lne  'chomp; if(/Set-Cookie: ix.session=(.*?);/) {  print $1; }'
````

This gets the response header from the `api/v1/whoami` endpoint, and it extracts the `ix.session` cookie's key value.    

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

```{
	"id": 1,
	"version": 2,
	"created": 1647468672083,
	"modified": 1647468672239,
	"deprecated": false,
	"user": {
		"id": 1,
		"version": 0,
		"created": 1647468672083,
		"modified": 1647468672083,
		"deprecated": false,
		"username": "ADMIN",
		"email": "admin@example.com",
		"admin": false
	},
	"active": true,
	"systemAuth": false,
	"key": "BPwnt6sw8yTSfOqjjhNr",
	"properties": [],
	"roles": ["Query", "DataEntry", "SuperDataEntry", "Updater", "SuperUpdate", "Approver", "Admin"],
	"tokenTimeToExpireMS": 6303835,
	"roleQueryOnly": false,
	"identifier": "ADMIN",
	"computedToken": "4e4a2617ba81b740960f463b3eedf63c52642ab1",
	"groups": []
}
```

You can use the session id in requests to the REST API, assuming authentication is required. 

```
curl -s -X GET 'http://localhost:8081/api/v1/substances' -H "Cookie: ix.session=$SESSION_KEY"
```

Now that we have a valid SESSION_KEY, this opens up two more possibilites. We can use the SESSION_KEY to get an API key and/or an API computed token. Either one will allow us to make REST API calls without using a password credential.  The API KEY is more long lasting. The computed token will be good for a period of time such as 24 hours, depending on configuration.

### Authentication Key  

You may be able to use an `auth-key` for REST API requests instead of the session id or credentials. This key corresponds to the UserProfile model's `apikey` field.      

Create this file:
```
# extract_auth_key.sh
PORT="${PORT:-8081}"
curl -s "http://localhost:$PORT/api/v1/whoami" -H "auth-username: admin" -H "Cookie: ix.session=${SESSION_KEY}" | perl  -MJSON -n0777 -E '$r = decode_json($_); say $r->{key}'
```

This gets the `api/v1/whoami` endpoint, and it extracts the `key` value from the response JSON.

Run this command to temporarily set the key value in your terminal.
```
export AUTH_KEY=$(bash extract_auth_key.sh)

echo $AUTH_KEY # optional

````

You can now interact with the GRSR REST API via curl and the `auth-key`. Try doing a POST or PUT too.
```
curl -s -X GET 'http://localhost:8081/api/v1/substances' -H 'auth-user: admin' -H "auth-key: $AUTH_KEY"  
```

### Token  

You may be able to use a token for REST API requests instead of the session id or credentials.    

Create this file:
```
# extract_computed_token.sh
PORT="${PORT:-9081}"
curl -s "http://localhost:$PORT/api/v1/whoami" -H "Cookie: ix.session=$SESSION_KEY" | perl  -MJSON -n0777 -E '$r = decode_json($_); say $r->{computedToken}'
```

This gets the `api/v1/whoami` endpoint, and it extracts the `computedToken` value from the response JSON.


Run this command to temporarily set the token value in your terminal.
```
export COMPUTED_TOKEN=$(bash extract_computed_token.sh)

echo $COMPUTED_TOKEN # optional

````

You can now interact with the GSRS REST API via curl and a token. Try doing a POST or PUT too. 

```
curl -s -X GET 'http://localhost:8081/api/v1/substances' -H "auth-token: $COMPUTED_TOKEN"  
```

## 3. Checking the H2 Database Sessions Table 

Session records are stored in the `ix_core_session` table. 

If you are debugging locally and your app is using an H2 database. You can use these scripts to list/clear sessions as needed. 


First `cd ./gsrs-main-deployment/substances`, then create these files:

```

# list_sessions.sh
echo "select * from ix_core_session;" > list_sessions.sql 
java -cp ~/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.RunScript -url 'jdbc:h2:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE' -script 'list_sessions.sql'  -user '' -password '' -showResults
rm list_sessions.sql 


## 4. Helpful aliases 

```
alias do_extract_session_key="export SESSION_KEY="$(bash extract_session_key.sh)" && echo "\$SESSION_KEY"" 

alias do_extract_auth_key="export AUTH_KEY="$(bash extract_auth_key.sh)" && echo "\$AUTH_KEY"" 

alias do_extract_computed_token="export COMPUTED_TOKEN="$(bash extract_computed_token.sh)" && echo "\$COMPUTED_TOKEN"" 


```

# clear_sessions.sh
echo "delete from ix_core_session;" > clear_sessions.sql 
java -cp ~/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.RunScript -url 'jdbc:h2:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE' -script 'clear_sessions.sql'  -user '' -password '' -showResults
rm clear_sessions.sql 
```
