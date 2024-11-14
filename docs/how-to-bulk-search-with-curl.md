# How to do a bulk query with Curl 

Last updated: 2024-05-24
GSRS version at last update: 3.1.1

The bulk search facility in GSRS is conveniently managed in the Frontend UI. However, some may want to automate bulk searches or understand the anyncronous process involved in a bulk search.  

To follow along with this example, please use a linux or mac terminal. Or for windows please use Git Bash. There are some Perl utilities used below such as `json_pp`. These aren't absolutely necessary.   

The first step is to make a query. This doesn't actually perform a search, it just sets up the query with search terms. 

```
curl -sk  -X  POST -H "Content-Type: text/plain"  http://localhost:8081/api/v1/substances/@bulkQuery --data "
Sodium Chloride
Potassium Chloride
"
```
This returns a JSON response: 

```
{
  "id" : 153,
  "total" : 2,
  "count" : 2,
  "top" : 1000,
  "skip" : 0,
  "queries" : [ "Sodium Chloride", "Potassium Chloride" ],
  "_self" : "http://localhost:8080/api/v1/substances/@bulkQuery?top=1000&skip=0"
}
```

Now we can use the query when initiating a bulk search by using the query "id". 

```
curl -s -k -X  GET 'http://localhost:8081/api/v1/substances/bulkSearch?bulkQID=153&searchOnIdentifiers=true&searchEntity=substances' | json_pp
```

The bulkSearch has been initiated, and we get a JSON response: 

```
{
   "context" : "substances",
   "count" : 2,
   "determined" : true,
   "finished" : true,
   "generatingUrl" : "http://localhost:8081/api/v1/substances/bulkSearch?bulkQID=153&searchOnIdentifiers=true&searchEntity=substances",
   "id" : "zubrfeapnp",
   "key" : "df645fbe0527cd8b98a220232a7a97d29573774b",
   "results" : "http://localhost:8081/api/v1/status(df645fbe0527cd8b98a220232a7a97d29573774b)/results",
   "start" : 1712243591846,
   "status" : "Determined",
   "stop" : 1712243591846,
   "total" : 2,
   "url" : "http://localhost:8081/api/v1/status(df645fbe0527cd8b98a220232a7a97d29573774b)"
}
```

The "id" here is an `etag`.  

The "key" is the general search's id. 

At this point, the bulkSearch is running or has finished, and is iterating or has iterated over the list of query search terms to find matches, once the matches are found the results are provided in a paged response that works similarly to other types of GSRS searches. 

We can poll to see if "finished" is true, and we see if the whole process is done by hitting this endpoint:   

```
curl -s -k -X GET 'http://localhost:8081/api/v1/status(df645fbe0527cd8b98a220232a7a97d29573774b)' 
```

When "finished" is `true` we can get the results by hitting this end point: 

```
curl -s -k -X GET 'http://localhost:8081/api/v1/status(df645fbe0527cd8b98a220232a7a97d29573774b)/results' | json_pp
```

At the top of the response we see meta information about the search in a paged response.

We see "total" which respresents the total number of substances associated with query matches. 

Like other GSRS searches we see an "etag". 

We see "skip", and that is the number of substances that will be shown in a paged response.  

To get all results we would have to iterate over the paged-results incrementing `skip`, and keeping `top` constant. We iterate until the sum of top values used iteratively is equal to or greater than the "total" field.   

The response also contains "summary" information about the queries.  

"qTotal" shows the total number of queries performed. 

"qTop" is the number of queries to show on a paged response. 

"qSkip" is the number of rows to skip before listing the next top rows. 

"qMatchTotal" is the number of queries that matched. 

... and so on. 

The "queries" field contains meta information about the queries and the "records" that may have been found. 

The "content" field shows the substance entities associated with the matches found by the query. 

This whole results page, is a paged response. It will show "top" substances at a time.   

To see the next page in the response we would increment "skip" to see the next "top" substances, for example. 

```
curl -s -k -X GET 'http://localhost:8081/api/v1/status(df645fbe0527cd8b98a220232a7a97d29573774b)/results?skip=10&top=10' 
``` 
However, there may not be a sufficient number of results for these skip and top values. If so, "count" will be zero. 

