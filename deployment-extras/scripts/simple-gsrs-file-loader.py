import requests
import os
import sys
import urllib3
import traceback


"""

# simple-gsrs-file-loader.py

This utility is meant load a SMALL amount of JSON data in ".gsrs" format to a GSRS entity service.

The .gsrs format is a gzipped file where each line contains two tabs followed by a JSON representation of an entity (with no unescaped line breaks)

HOW TO RUN? 

First set environment variables.

export DEBUG=FALSE 
export REQUEST_METHOD=POST # or PUT
export AUTH_USERNAME=admin
export AUTH_METHOD=password # or key
export AUTH_PASSWORD=XXXXXX
export AUTH_KEY=XXXXXX
export TARGET_URL="http://localhost:8081/ginas/app/api/v1/products"

Then pipe in data: 

> cat myfile.gsrs | gunzip | python3 simple-gsrs-file-loader.py

Or unzip the input file first do this:  

> gunzip --suffix=.gsrs myfile.gsrs

And then pipe in the text file: 

> cat myfile | python3 simple-gsrs-file-loader.py

Note that if you're loading a substances .gsrs file you will probably need to alter the configuration if your input JSON has substances with appoval ids.

"""

# This disables check url's SSL certificate. Consider if you want this.
sslVerify=False
# This disables warning on security check for SSL. Consider if you want this.
urllib3.disable_warnings(category=urllib3.exceptions.InsecureRequestWarning)

replace_all_nbsp=True;

_debug=debug=os.environ.get('DEBUG')
if (_debug==None): 
  _debug='FALSE' 
debug=False
if (_debug.upper()=='TRUE'):
   debug=True
request_method=os.environ.get('REQUEST_METHOD')
if (request_method==None): 
   request_method='POST'

auth_username=os.environ.get('AUTH_USERNAME')
auth_password=os.environ.get('AUTH_PASSWORD') 
auth_key=os.environ.get('AUTH_KEY')
auth_method=os.environ.get('AUTH_METHOD')
auth_credential=''
if (auth_method=='password'): 
   auth_credential={'auth-password': auth_password}
if (auth_method=='key'): 
   auth_credential={'auth-key': auth_key}
target_url=os.environ.get('TARGET_URL')
headers={'auth-username': auth_username, 'content-type': 'application/json'} 
headers.update(auth_credential)
config_vars = 'debug request_method auth_username auth_password auth_key auth_method target_url' 

if(debug): 
  print("=== Config vars ===") 
  for var in config_vars.split(" "): 
    print ("{}: {}".format(var,  str(locals()[var])))
  print("===")

c=0
for line in sys.stdin:
  c=c+1
  try: 
    parts = line.split('\t')
    try: 
      if (len(parts)>2):
        if (replace_all_nbsp): 
            parts[2] = parts[2].replace("\xa0", " ")
        try: 
          if (request_method=='PUT'):
            # print (parts[2])
            response = requests.put(target_url, data=parts[2], headers=headers, verify=False)
          else:
            # print (parts[2])
            response = requests.post(target_url, data=parts[2], headers=headers, verify=False)
          print ("input line: {} response status: {}".format(str(c), str(response.status_code)))
        except:
          if (debug): 
            print(traceback.format_exc())
          print ("input line: {} warning: {}".format(str(c), "Problem making request."))
    except:
       if (debug): 
         print(traceback.format_exc())
       print ("input line: {} warning: {}".format(str(c), "Problem with parts array."))
  except:
    if (debug): 
      print(traceback.format_exc())
    print ("input line: {} warning: {}".format(str(c), "Problem parsing line into parts array."))
