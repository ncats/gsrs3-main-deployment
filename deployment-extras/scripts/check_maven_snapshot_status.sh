check_maven_snapshot_status() { 

modules="
gsrs-module-adverse-events
gsrs-module-applications
gsrs-module-clinical-trials
gsrs-module-impurities
gsrs-module-products
gsrs-module-invitro-pharmacology
gsrs-module-ssg
" 
version=3.1.2-SNAPSHOT
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

check_maven_snapshot_status
