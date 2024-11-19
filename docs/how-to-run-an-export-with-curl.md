# How to run an export with Curl

Last edited: 2024-01-05 

### The Export API

Exports are typically run from the frontend, but you might want to automate this asynchronous process for frequently run exports. Or, you might want to get an understanding of the underlying backend export REST API process. 

You will generate an export from a GSRS search result. A search returns JSON response.  One critical element of the response is the “etag" id of the search.  Every search has a unique etag.  

The document assumes that you have access to a Linux, Mac or Windows Git Bash terminal. 

We assume you're testing locally on http localhost with port 8081, if you use a remote system and it uses SSL your URL would start with "https."  With SSL, you may need to use the Curl -k switch. This will omit a check for SSL certificate integrity, and this omission is useful if your certificate is self-signed.    

To complete an export we need to: 

1) Do the search.
2) Get the unique etag id from the JSON response.
3) Find available export file extensions from another API end point.
4) Find available scrubber/config settings and get an exportConfigId
5) Initiate the export using the etag id and a file extension identifier.
6) From #5, get the unique download id from the JSON response. 
7) Check the status of the export with the id.
8) When COMPLETE, download the export.

Here are the steps in more detail.

1) We can do the search by hitting a GSRS Search API endpoint like this:  
```
http://localhost:8081/api/v1/substances/search?q=root_names_name:"^sodium%20chlor*"
# The search looks for substances having names starting with "Sodium chlor"
# Use this encoded version to avoid errors: 
http://localhost:8081/api/v1/substances/search?q=root_names_name:%22%5Esodium%20chlor*%22

```

2) Looking at the JSON response, we see an etag element like this:  
```
{ ... "etag":"13db1189bcbddd19" ... }
```

3) We can find the export types and file extensions available for the search by visiting a URL like this: 
```
http://localhost:8081/api/v1/substances/export/YOUR_ETAG_VALUE
```

4) Find available scrubber/config settings and get a exportConfigId  
```
http://localhost:8081/api/v1/substances/export/configs

{ ... "configurationId":"-1", exporterKey: "ALL_DATA" ... }
```

5) Now an export can be initiated like this:
```  
http://localhost:8081/api/v1/substances/export/YOUR_ETAG_VALUE/EXTENSION?filename=export-28-09-2023_11-16-41.txt&exportConfigId=-1
```

The **EXTENSION** on the export URL (such as "txt") is used to tell the backend which export factory to invoke in the Substances service context and which file format to use. If we used “csv", we would get the report in a different format.  If we used “sdf", it would be a completely different type of report. The extension can be more verbose. For example, in substances, the “names.txt" extension tells the backend to run the names export (in TSV format). 

The **exportConfigId** is a value that typically corresponds to ALL_DATA or PUBLIC_DATA_ONLY in the frontend dialogue, depending on your configuration and what users may have selected in the frontend.  You’ll need to be careful about which exportConfigId you use from your specific GSRS deployment instance.


6) Submitting the #5 URL with a curl command results in a JSON response.

7) From #6, get the "id" value from the JSON. Use it to check the "status" of the download.
```
http://localhost:8081/app/api/v1/profile/downloads/YOUR_ID
```

8) When the status is COMPLETE, hit a URL like this:
``` 
http://localhost:8081/api/v1/profile/downloads(YOUR_ID)/download
```

This will download the export to Stdout showing in your terminal.

Append '> myfilename.ext' to the curl command to write it to a file instead.  

### Curl example

The following is a more concrete example.  We use "perl" to process the JSON and make it easy to grab the result from the JSON.  The perl program should be available to you if you use Git Bash or Linux.  If you prefer to see the full JSON response, just copy and paste everything before the pipe "|" character. 

```
# Do a search, in this case we are search for substances with names that begin with 'sodium chlor'
# without encoding the query term would be: q=root_names_name:"^sodium chlor*"

curl -k -s -X GET -H "auth-username: admin" -H "auth-password: admin" 'http://localhost:8081/api/v1/substances/search?q=root_names_name:%22%5Esodium%20chlor*%22' | perl  -MJSON -n0777 -E 'my $r = decode_json($_); say ">> etag: ", $r->{etag}'

# >> etag: de943680ba639037
```

```
# List available exports associated with the ETAG and their extensions 

curl  -k -s -X GET -H "auth-username: admin" -H "auth-password: admin"  'http://localhost:8081/api/v1/substances/export/de943680ba639037'  | perl  -MJSON -n0777 -E 'my $r = decode_json($_); say to_json($r, {utf8 => 1, pretty => 1});'
```

```
# List export scrubber/config settings for the GSRS instance and get an exportConfigId

curl  -k -s -X GET -H "auth-username: admin" -H "auth-password: admin" 'http://localhost:8081/api/v1/substances/export/configs'
```

```
# Make a url like http://{api-base-url}/api/v1/{entity-context}/export/{etag}/{extension}?filename={filename}&exportConfigId={exportConfigId} 

curl  -k -s -X GET -H "auth-username: admin" -H "auth-password: admin"  'http://localhost:8081/api/v1/substances/export/de943680ba639037/txt?filename=export-20-05-2022_21-43-41.txt&exportConfigId=-1'  | perl  -MJSON -n0777 -E 'my $r = decode_json($_); say ">> id: ", $r->{id}'

# >> id: ac9ab726-bc70-4ffd-9faa-1310c926d209
```

```
# Check status

curl  -k -s -X GET -H "auth-username: admin" -H "auth-password: admin"  'http://localhost:8081/api/v1/profile/downloads/ac9ab726-bc70-4ffd-9faa-1310c926d209'  | perl  -MJSON -n0777 -E 'my $r = decode_json($_); say ">> status: ", $r->{status}'

# >> status: COMPLETE
```

```
# if COMPLETE, then download the export
# You might want to append '> myfilename.txt" to this curl command to save to a file instead of stdout

curl -k -s -X GET  -H "auth-username: admin" -H "auth-password: admin"  'http://localhost:8081/api/v1/profile/downloads(ac9ab726-bc70-4ffd-9faa-1310c926d209)/download'
```
