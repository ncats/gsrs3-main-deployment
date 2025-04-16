API_BASE_URL='http://localhost:8081/ginas/app'
AUTH_H1='auth-username: admin'
AUTH_H2='auth-password: XXXXXX'

# This assumes that you have rep18.gsrs populating the substances service

curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT001", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 1", "conditions": "conditionA1|conditionA2", "sponsor": "sponsorA1|sponsorA2"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT002", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 2", "conditions": "conditionB1|conditionB2", "sponsor": "sponsorB1|sponsorB2"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT003", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 3", "conditions": "conditionC1|conditionC2", "sponsor": "sponsorC1|sponsorC2"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT004", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 4","conditions": "conditionD1|conditionD2", "sponsor": "sponsorD1|sponsorD2"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT005", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 5"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT006", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 6"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT007", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 7"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT008", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 8"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT009", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 9"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT010", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 10"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT011", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 11"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT012", "clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch":false},{"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch":false}], "title": "This is trial 12", "status": "Not Complete"}
'
curl -X POST -H 'Content-Type: application/json' -H "$AUTH_H1" -H "$AUTH_H2" -i $API_BASE_URL/api/v1/clinicaltrialsus --data '
{"trialNumber":"NCT013","clinicalTrialUSDrug": [{"substanceKey":"90e9191d-1a81-4a53-b7ee-560bf9e68109","substanceKeyType":"UUID","protectedMatch": false}, {"substanceKey":"306d24b9-a6b8-4091-8024-02f9ec24b705","substanceKeyType":"UUID","protectedMatch": false,"substanceRoles": [{"substanceRole":"Comparator"}, {"substanceRole":"Adjuvant"}]}],"outcomeResultNotes": [ {"result":"Result 13.1","narrative":"result 13.1 narrative"}, {"result":"Result 13.2","narrative":"result 13.2 narrative"} ],"title":"This is trial 13","status":"Not Complete"}
'

