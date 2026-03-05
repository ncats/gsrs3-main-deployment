
# This script is used to check if Maven repostories for modules that we publish as snapshots are still present 
# on Maven central.  Maven policy is to expire all SNAPTSHOTS after 90 days.  Thus we have have to deploy them 
# again after 90 days. If the status returned is not 200 or the timestamp is approaching 90 days ago, then this
# script tells us what to redeploy.

function check_maven_snapshot_status { 

local version=$1
modules="
gsrs-module-adverse-events
gsrs-module-applications
gsrs-module-clinical-trials
gsrs-module-impurities
gsrs-module-products
gsrs-module-invitro-pharmacology
gsrs-module-ssg4
" 
echo "Modules:" 
echo ""
for module in $modules; do 
  url="https://central.sonatype.com/repository/maven-snapshots/gov/nih/ncats/${module}/${version}/maven-metadata.xml"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" -L $url)
  echo "$module: $status_code"
  echo $url
  if [ $status_code = 200 ]; then
    content=$(curl -s -L $url)
    timestamp=$(grep "timestamp" <<< "$content")
    echo $timestamp
  fi
  echo "======"
  echo ""
done

echo "Other:" 
echo ""
module="gsrs-services-common"
version=1.0-SNAPSHOT
url="https://central.sonatype.com/repository/maven-snapshots/gov/nih/ncats/${module}/${version}/maven-metadata.xml"
status_code=$(curl -s -o /dev/null -w "%{http_code}" -L $url)
echo "$module: $status_code"
echo $url
if [ $status_code = 200 ]; then
  content=$(curl -s -L $url)
  timestamp=$(grep "timestamp" <<< "$content")
  echo $timestamp
fi
echo "======"
echo ""
}



MODULES_VERSION=${MODULES_VERSION}
check_maven_snapshot_status $MODULES_VERSION 
