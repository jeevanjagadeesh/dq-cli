#!/bin/sh
export APP_CP=./QATrackImport.jar:./lib/apache-mime4j-0.6.jar:./lib/commons-codec-1.3.jar:./lib/commons-logging-1.1.1.jar:./lib/httpclient-4.0.1.jar:./lib/httpcore-4.0.1.jar:./lib/httpmime-4.0.1.jar:./lib/commons-cli-1.0.jar:.
$JAVA_HOME/bin/java -server -classpath ${APP_CP} com.informatica.qatrack.ImportTestNG $*