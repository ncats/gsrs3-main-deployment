#!/bin/bash
# curl_gsrs_indexer.sh
# This script allows you to call the GSRS indexer API endpoints for various services.
# INDEXER_BASE_URL will typically be the url used to reach the Gateway servive. 
# Pass the service as command argument.
# Run like so:
# bash curl_gsrs_indexer.sh <service> 
# For the substances service, the Scheduled Task manager in the UI is the better option. 

INDEXER_BASE_URL=${INDEXER_BASE_URL:-'http://localhost:8081/ginas/app'}
INDEXER_AUTH_H1=${INDEXER_AUTH_H1:-'auth-username: admin'} 
INDEXER_AUTH_H2=${INDXER_AUTH_H2:-'auth-password: admin'} 
INDEXER_DEBUG=${INDEXER_DEBUG:-"FALSE"}
INDEXER_USE_SILENT=${INDEXER_USE_SILENT:-'TRUE'}
INDEXER_SLEEPTIME=${INDEXER_SLEEPTIME:-'5'}

service=$1
silent=''

if [[ $INDEXER_USE_SILENT = "TRUE" ]]; then
    silent='-s'
fi

if [[ $INDEXER_DEBUG = "TRUE" ]]; then
    echo "INDEXER_BASE_URL: INDEXER__BASE_URL"
    echo "INDEXER_AUTH_H1: $INDEXER_AUTH_H1"
    echo "INDEXER_AUTH_H2: $INDEXER_AUTH_H2"
    echo "INDEXER_DEBUG: $INDEXER_DEBUG"
    echo "INDEXER_SILENT: $INDEXER_DEBUG" 
    echo "INDEXER_SLEEPTIME: $INDEXER_SLEEPTIME" 
    # sleep $INDEXER_SLEEPTIME
fi

if [[ $service = "adverse-events" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/adverseeventpt/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/adverseeventdme/@reindex?wipeIndex=false & disown
    sleep $INDEXER_SLEEPTIME 
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/adverseeventcvm/@reindex?wipeIndex=false & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "applications" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/applications/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "clinical-trials" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/clinicaltrialsus/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/clinicaltrialseurope/@reindex?wipeIndex=false & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "impurities" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/impurities/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "invitro-pharmacology" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/invitrophamacology/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "products" ]]; then
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/products/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "substances" ]]; then
    # Better to use scheduled task for substances
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/substances/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME 
elif [[ $service = "vocabularies" ]]; then
    # The Gateway will route this to the substances service
    echo "Indexing $service"
    curl $silent -X POST -H "$INDEXER_AUTH_H1" -H "$INDEXER_AUTH_H2" -i $INDEXER_BASE_URL/api/v1/vocabularies/@reindex?wipeIndex=true & disown
    sleep $INDEXER_SLEEPTIME
else
   echo "Invalid service passed to indexer script."
fi 
