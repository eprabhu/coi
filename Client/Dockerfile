# Use Tomcat 9 as the base image
FROM tomcat:9-jdk17-openjdk-slim

# Remove the default Tomcat webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the Angular application from the dist folder to the Tomcat webapps folder
RUN mkdir /usr/local/tomcat/webapps/fibicoi
COPY ./dist/coi/ /usr/local/tomcat/webapps/fibicoi

# Expose the port on which Tomcat will run (default is 8080)
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]


