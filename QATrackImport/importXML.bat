@echo off

SET CLASSPATH=.\QATrackImport\QATrackImport.jar;.\QATrackImport\lib\apache-mime4j-0.6.jar;.\QATrackImport\lib\commons-codec-1.3.jar;.\QATrackImport\lib\commons-logging-1.1.1.jar;.\QATrackImport\lib\httpclient-4.0.1.jar;.\QATrackImport\lib\httpcore-4.0.1.jar;.\QATrackImport\lib\httpmime-4.0.1.jar
"%JAVA_HOME%\bin\java" com.informatica.qatrack.ImportXML %*