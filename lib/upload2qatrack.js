var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('qatrack.txt', { flags: 'w' });
var logStdout = process.stdout;


var exec = require('child_process').exec;
var child = exec('C:\\Projects\dq-cli\\QATrackImport\\importxml.bat http://psrlxpamqa1:8080/qatrack/servlet/ImportXMLServlet C:\\Projects\dq-cli\\QATrackImport\\QATrackerReport.xml', function(err, stdout, stderr) {
  console.log(stdout);
});
console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}