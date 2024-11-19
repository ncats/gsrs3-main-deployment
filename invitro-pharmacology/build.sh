./mvnw clean package -DskipTests

cp target/invitro-pharmacology.war $webapps_deployment/.
chmod a+r $webapps_deployment/invitro-pharmacology.war
chown tomcat:tomcat $webapps_deployment/invitro-pharmacology.war
