var request = require('request');
var fs = require('fs');
var path = require('path');
var body1 = '<?xml version="1.0" encoding="utf-8" ?><DSTAutomationReport xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="buildreport.xsd"><buildNumber>46</buildNumber><branchName>ML</branchName><productVersion>10.2.0</productVersion><executionMode></executionMode><operatingSystem></operatingSystem><databaseType>ORACLE</databaseType><databaseVersion></databaseVersion><buildURL></buildURL><moduleName>DQT</moduleName><buildDate>16-August-2011</buildDate><Installation_Status></Installation_Status><testSuite><name>oie</name><totalTestCaseCount>2</totalTestCaseCount><passedTestCaseCount>1</passedTestCaseCount><failedTestCaseCount>1</failedTestCaseCount><skippedTestCaseCount>0</skippedTestCaseCount><timeTaken>11.694</timeTaken><TestCase><Name>oie-oieexportobjects_1-case1</Name><description></description><status>Failed</status><timeTaken>9.862</timeTaken><exceptionMessage>[ICMD_10033] Command [exportObjects] failed with error [[OIECMD_10006] Error occurred during export function. See previous error.]</exceptionMessage><runLog></runLog></TestCase><TestCase>  <Name>oie-oieimportobjects-case1</Name>   <description></description>   <status>Passed</status>    <timeTaken>1.832</timeTaken>    <exceptionMessage></exceptionMessage>    <runLog></runLog>   </TestCase> </testSuite></DSTAutomationReport>';

var xmlData = path.join(__dirname, 'uploadToReport', '/QATrackerReport-oie.xml');
console.log(xmlData);
var formData = {
  module: 'ATBB',
  xml: fs.createReadStream(xmlData),
};
//console.log(formData);
request.post({
  url: 'http://psrlxpamqa1:8080/qatrack/servlet/ImportXMLServlet',
  formData: formData
}, function(error, response, body) {
  if (error) {
    console.log(error);
    process.exit(1);
  }
  //if (response.statusCode < 200 || response.statusCode > 300) {
    console.log('statusCode === ' + response.statusCode);
    console.log('response body == ' + body);
    process.exit(0);
  //}
});