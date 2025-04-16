API_BASE_URL='http://localhost:8081/ginas/app'
AUTH_H1='auth-username: admin'
AUTH_H2='auth-password: XXXXXX'

# This assumes that you have rep18.gsrs populating the substances service

curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-01-FR", "title": "This is trial 1","clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-02-FR", "title": "This is trial 2","clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-03-FR", "title": "This is trial 3"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-04-FR", "title": "This is trial 4"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-05-FR", "title": "This is trial 5"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-06-FR", "title": "This is trial 6"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-07-FR", "title": "This is trial 7"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-08-FR", "title": "This is trial 8"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-09-FR", "title": "This is trial 9"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}], "clinicalTrialEuropeMeddraList":
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-10-FR", "title": "This is trial 10"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-11-FR", "title": "This is trial 11"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-12-FR", "title": "This is trial 12"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}]
}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2"  -i $API_BASE_URL/api/v1/clinicaltrialseurope --data '
{"trialNumber":"2022-000001-13-FR", "title": "This is trial 13"
,"clinicalTrialEuropeProductList":[{"impSection":"impSection1","productName":"productName1","tradeName":"tradeName1","impRole":"impRole1","impRoutesAdmin":"impRoutesAdmin1","pharmaceuticalForm":"pharmaceuticalForm1","clinicalTrialEuropeDrugList":[{"substanceKey":"b67893b0-68f0-4924-9ebb-3ebb932db965","substanceKeyType":"UUID"}]}], "clinicalTrialEuropeMeddraList": [{"meddraTerm": "meddraTerm1"}, {"meddraTerm": "meddraTerm2"},{"meddraTerm": "meddraTerm3"},{"meddraTerm": "meddraTerm4"}]
}
'

