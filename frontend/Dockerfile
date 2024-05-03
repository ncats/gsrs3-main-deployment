FROM ubuntu:latest
LABEL authors="Lucio Montero (lucioric2000@hotmail.com)"
WORKDIR /app
COPY . /app
RUN echo hi
RUN ls /
#RUN apt-get update && apt-get install -y openjdk-8-jdk
RUN apt-get update -y && apt-get install -y openjdk-11-jdk
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
RUN apt-get install -y maven
#RUN chmod +x /app/mvnw
EXPOSE 8082

ENTRYPOINT ["mvn",  "clean", "-U", "spring-boot:run"]
#To execute this container, run the following command:
#docker run -p 8082:8082 gsrs3-main-frontend
#or inside the docker-compose:
#docker-compose run --build