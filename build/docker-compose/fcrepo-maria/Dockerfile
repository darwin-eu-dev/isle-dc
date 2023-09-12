FROM islandora/fcrepo6:${TAG:-latest}
RUN sed -i 's/jdbc:mysql/jdbc:mariadb/g' /opt/tomcat/bin/setenv.sh 
