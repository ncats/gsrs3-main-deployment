# Bulk indexing

(Last updated: 2024-03-08)

### Background

The GSRS Text Indexer library uses Lucene Java libraries to create indexes.  Entity indexes are written to disk.  Each element of an entity is indexed in different ways. For example, a substance name has entries for full names as well as the parts of name strings split on certain characters, such as spaces and punctuation.

Indexes for a single entity are written each time an entity is created or updated.  They are also written when an indexing task is executed. Generally, tasks index the full set of a given entity as found in the entity database repository. 

Alternatively, if a backup of the entity exits in the **Backup** repository, the indexer instead reads a JSON representation of the entity from the backup table for quicker data access.  

Substance entity tasks are executable either on the command line or in the Frontend Admin Panel.  

Currently other microservices are indexed via the command line.  

Formal indexing tasks will likely be added for other entities in the near future, and these tasks will be the recommended approach. 

Starting in GSRS 3.1, bulk indexing can ALSO be performed on a subset of entities. By supplying a set of entity IDs to the @reindexBulk endpoint, we can instruct the GSRS API to index those specific entities. 

### Run indexing on the command line with Curl (May be deprecated in future)

To index the whole set of given entity from the command line, use the @reindex endpoint.  

This approach may soon be deprecated. However, it's worth summarizing since it is currently used in practice for microservices other than substances.
 
Use Curl and provide some kind of authentication with auth-password, auth-token or auth-key.  

In the case below the API base URL is: `http://localhost:8081/`.  The entity CONTEXT is clinicaltrialsus or clinicaltrialseurope.  There is one microservice that has two different **kinds** of entities.

When we use wipeIndex=true, ALL indexes for all related entities in a microservice will be erased. Therefore, if we want to rebuild the indexes for both entities in the same microservice, we first call with `wipeIndex=true`. Next, we call with `wipeIndex=false` to avoid erasing the just recently indexed related entity.

```
curl -s -X POST -H "auth-username: admin" -H "auth-password: admin" http://localhost:8081/api/v1/clinicaltrialsus/@reindex&wipeIndex=true  

curl  -s -X POST -H "auth-username: admin" -H "auth-password: admin" http://localhost:8081/api/v1/clinicaltrialseurope/@reindex&wipeIndex=false
```

It's not always the case that entities grouped in a module are "related." As an example. the Controlled Vocabulary entity is elaborated in the Substance Module but we don't need to worry about `wipeIndex` when indexing substances and then vocabularies even though they are controlled through same microservice. When in doubt, check the README for the different microservices. 


### Run indexing tasks from the Administrative Panel

An indexing task for substances is available in the Admin Panel. To index ALL substances, we may want to first run other tasks to prepare the data. This is because substances are usually indexed from the backup table rather than directly from the substance database repository. In addition, it may be necessary to generate standard names and chemical properties for the substances before indexing.  If so, perform those two tasks first, and then run the backup task. Finally run the index task.


### Bulk indexing

"Bulk indexing" in GSRS refers to indexing a subset of the whole collection of a given entity.

We submit a set of entity IDs to the `@reindexBulk` endpoint to create or update the indexes of the entities corresponding to the IDs.

The indexes are submitted in the HTTP request body with one ID on each line. 

```
curl -s -X POST -H 'auth-username: admin' -H 'auth-password: admin' -H 'Content-Type: text/plain' -s 'http://localhost:8081/api/v1/substances/@reindexBulk' --data '
306d24b9-a6b8-4091-8024-02f9ec24b705
90e9191d-1a81-4a53-b7ee-560bf9e68109
'
# FYI:
# 306d24b9-a6b8-4091-8024-02f9ec24b705 => UUID of Sodium Chloride 
# 90e9191d-1a81-4a53-b7ee-560bf9e68109 => UUID of Sodium Gluconate
```

Another way of submitting the IDs would be from a text file where each line contains one ID.  

```
curl -s -X POST -H 'auth-username: admin' -H 'auth-password: admin' -H 'Content-Type: text/plain' -s 'http://localhost:8081/api/v1/substances/@reindexBulk' --data-binary @IDS_TO_INDEX.txt 
```

Bulk indexing occurs asynchronously. The above Curl request initiates the indexing process. The immediate response shows the number `indexed=0`.  The reponse also  provides us with the `statusID`.

```
{ {"statusID":"77023dfb-c6ee-4938-a724-6c1e8af36bef","status":"indexing record 1 of 2","total":2,"indexed":0,"failed":0,"done":false,"start":1702184200435,"finshed":0,"ids":["306d24b9-a6b8-4091-8024-02f9ec24b705","90e9191d-1a81-4a53-b7ee-560bf9e68109"]}
```

If we know the `statusID`, we can check the progress periodically with the `@reindexBulk(statusID)` endpoint like so:

```
curl -s -X GET -H 'auth-username: admin' -H 'auth-password: admin' -H 'Content-Type: text/plain' -s 'http://localhost:8081/api/v1/substances/@reindexBulk(77023dfb-c6ee-4938-a724-6c1e8af36bef)'
```

Since we only had two IDs, the task finishes quickly, and we can see that `done=true`.

```
{"statusID":"77023dfb-c6ee-4938-a724-6c1e8af36bef","status":"finished","total":2,"indexed":2,"failed":0,"done":true,"start":1702184200435,"finshed":1702184204321,"ids":["306d24b9-a6b8-4091-8024-02f9ec24b705","90e9191d-1a81-4a53-b7ee-560bf9e68109"],"_self":"http://localhost:8080/api/v1/substances/@reindexBulk(77023dfb-c6ee-4938-a724-6c1e8af36bef)"}
```

### Checking index integrity

We can compare the count of entities in the database repository to the total returned by a search (with no query parameters). If all entities are indexed, the @count result should equal the number found in the search result. The following two Curl statements illustrate. 

```
# The @count endpoint returns the count from the database
curl -s -X GET -H 'auth-username: admin' -H 'auth-password: admin' 'http://localhost:8081/api/v1/substances/@count' && echo '' 

# the search endpoint returns data from the index
curl -s -X GET -H 'auth-username: admin' -H 'auth-password: admin' 'http://localhost:8081/api/v1/substances/search' | perl  -MJSON -n0777 -E  'say ">> total: ", decode_json($_)->{total}'   
```

### Bulk indexing all non-indexed entities  

The following Bash script will index entities found in the database that are not yet indexed.  This script does not, however, deal with stale indexes;  it does not consider that indexed data could reflect data that is older than what is currently present in the database.  One way this could happen is if a database administrator makes updates to the database with SQL rather than using the GSRS API. 

```
# index-non-indexed-entities.sh

#Change these sections with the appropriate entities,
#api URL and auth information

entity="substances"

api_url="http://localhost:8081/api/v1"

# while the variable is auth_key, the header value  can be auth-password, auth-key, or auth-token as desired
auth_key="auth-password: admin"

auth_username="auth-username: admin"

pageSize=18000


echo "Beginning selective reindexing of $entity"
echo "Step 1: Gathering the set of database IDs for $entity"
echo "====================================================="



rm -rf ALL_ENTS.txt

tot=`curl -k "$api_url/$entity/@count" \
          -H "$auth_key" \
          -H "$auth_username" \
          --compressed`
echo "Total number of $entity: $tot"

big=$((tot/pageSize + 1))
echo "Total number of pages for the API: $big"
dbTotal=0

# When this script was first written, this api endpoint could return non-sorted lists of the entity.  The while loop
# assured that the full list had been gathered. We will test if the while loop can be omitted.  
while  [ $((tot-dbTotal)) -gt 0 ]
do
	for (( i=0; i<=$big; i++ ))
	do
			skip=$((i*pageSize))
			echo "Fetching page $i of $big"
			echo "$api_url/$entity/?view=key&top=$pageSize&skip=$skip"
			curl -k "$api_url/$entity/?view=key&top=$pageSize&skip=$skip" \
			  -H "$auth_key" \
			  -H "$auth_username" \
			  --compressed | tr ',' '\n'|grep idString|sed 's/.*://g'|sed 's/[^0-9a-f\-]//g' >> ALL_ENTS.txt
	done
	cat ALL_ENTS.txt|sort|uniq > ALL_ENTS.sorted.txt
	mv ALL_ENTS.sorted.txt ALL_ENTS.txt
	dbTotal=`cat ALL_ENTS.txt|wc -l`
	echo "Total number of $entity IDs fetched from the database: $dbTotal of $tot"
	if [ $((tot-dbTotal)) -gt 0 ]; then
		echo "Some $entity records are missing, trying again"
	fi
done


echo "Step 2: Gathering the set of indexed IDs for $entity"
echo "====================================================="

rm -rf ALL_ENTS_INDEXED.txt
for (( i=0; i<=$big; i++ ))
do
        skip=$((i*pageSize))
        echo "Fetching page $i of $big"
        echo "$api_url/$entity/search?simpleSearchOnly=true&view=key&top=$pageSize&skip=$skip"
        curl -k "$api_url/$entity/search?simpleSearchOnly=true&view=key&top=$pageSize&skip=$skip" \
          -H "$auth_key" \
          -H "$auth_username" \
          --compressed | tr ',' '\n'|grep idString|sed 's/.*://g'|sed 's/[^0-9a-f\-]//g' >> ALL_ENTS_INDEXED.txt
done
indexTotal=`cat ALL_ENTS_INDEXED.txt|wc -l`
echo "Total number of $entity IDs fetched from the index: $indexTotal of $tot"


echo "Step 3: Compare the two lists of IDs"
echo "====================================================="
cat ALL_ENTS.txt ALL_ENTS_INDEXED.txt |sort|uniq -c > MATCH_REPORT.txt
doubleIndexed=`cat MATCH_REPORT.txt|grep -v " 2 "|grep -v " 1 "| wc -l`
nonIndexed=`cat MATCH_REPORT.txt|grep " 1 "| wc -l`
echo "Total number of DUPLICATE indexed $entity: $doubleIndexed"
echo "Total number of NOT indexed $entity: $nonIndexed"
cat MATCH_REPORT.txt|grep -v " 2 "|sed 's/^[ ]*[0-9]*[ ]//g' > BAD_INDEX.txt
reindexCount=`cat BAD_INDEX.txt|wc -l`
echo "Total number of $entity to be reindexed: $reindexCount"

echo "Step 4: Start bulk reindex for set needing reindexing"
echo "====================================================="

if [ $((reindexCount)) -gt 0 ]; then
	curl -k "$api_url/$entity/@reindexBulk" \
	          -H "$auth_key" \
	          -H "$auth_username" \
	  -H 'Content-Type: text/plain;charset=UTF-8' \
	  --data-binary @BAD_INDEX.txt \
	  --compressed > BULK_API_RESPONSE.txt

	statusID=`cat BULK_API_RESPONSE.txt|sed 's/,/\n/g'|grep "statusID"|awk -F\: '{print $2}'| sed 's/[^0-9a-f\-]//g'`
	echo "Job submitted with statusID: $statusID"
	echo "***the process can be monitored using the statusID above via the API***"

else
	echo "***$entity is already indexed completely***"
fi

```
