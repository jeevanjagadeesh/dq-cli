require("../properties/config.js");
var path = require("path");
var fs = require('fs');
var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var logPatternConfig = require('../properties/config.js').logpattern;
var config = require('../properties/config.json');
var baseDir = __dirname;
var mixinPath = path.join(baseDir, '../properties/QATrackerReport.pug');
var mixinStr = fs.readFileSync(mixinPath, 'utf8')

var xmlTemplate = pug.compile(mixinStr, {
  pretty: true
});
var qaTrackerXMLPath = path.join(baseDir, '../output','uploadToReport');

var logSearchPatterns = [
  logPatternConfig.success,
  logPatternConfig.failure
];

exports = module.exports = dqCliLogReader;

function dqCliLogReader(logger) {
  this.logger = logger;
}

dqCliLogReader.prototype.generateExecutionXml = function(result, plugin, cb) {
  var jsonData = _.cloneDeep(config);
  var testCases = [];
  jsonData.pluginName = plugin;
  var _this = this;
  _this.logger.info(' ******** Iterating EXCEL file ******** ');
  // iterate each worksheet
  async.forEachOf(result, function(value, key, callback1) {
    async.forEach(value, function(elementOfArray, callback2) {
      if (elementOfArray.ExecuteOption !== 'Skip') {
        var logName = path.join(baseDir, '../output','cli_logs', elementOfArray.TestCaseID + '.log');
        var testCase = {};
        searchLog(logName, function(err, status, timeTaken, msg) {
          if (!err) {
            testCase.Name = elementOfArray.TestCaseID;
            testCase.status = status;
            testCase.exceptionMessage = msg;
            testCase.timeTaken = timeTaken;
            testCases.push(testCase);
          }
          callback2(err);
        });
      } else callback2();
    }, function(err) {
      if (err) {
        _this.logger.error({ err: err }, 'Error from async worksheet row looping');
      }
      callback1();
      _this.logger.info("processing all elements completed");
    });
  }, function(err) {
    if (err) {
      _this.logger.error({ err: err }, 'Error xls worksheet looping');
      return cb(err);
    }
    jsonData.testCases = testCases;
    var countBy = _.countBy(testCases, 'status');
    var testSuiteTimeTaken = _.sum(_.map(testCases, 'timeTaken'));
    jsonData.testSuiteTimeTaken = testSuiteTimeTaken;
    jsonData.passedTestCaseCount = countBy.Passed;
    jsonData.failedTestCaseCount = countBy.Failed;
    jsonData.totalTestCaseCount = jsonData.testCases.length;
    var trackerXml = xmlTemplate(jsonData);
    console.log(trackerXml);
    var xmlpath = path.join(qaTrackerXMLPath, "QATrackerReport-" + plugin + '.xml');
    fs.writeFile(xmlpath, trackerXml, function(err) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      console.log('File written succesfully!!!');
      cb(null, trackerXml);
    });
  });
}

function searchLog(filename, cb) {
  // grep is better???
  //console.log(filename);
  fs.readFile(filename, "utf-8", function(err, data) {
    if (err) {
      return cb(err);
    }
    var timeTaken = data.match(logPatternConfig.ExecutionTime);
    timeTaken = timeTaken ? parseFloat(timeTaken[1]) : 0;

    var logMsg;
    var dataFound = false;
    var status;
    // loop thr array, if found exit loop
    logSearchPatterns.some(function(searchPattern, i) {

      _.forEach(searchPattern, function(msg) {
        //console.log(msg);
        if (data.indexOf(msg) > -1) {
          logMsg = msg;
          dataFound = true;
          // break the loop, if msg found
          return false;
        }
      });

      if (dataFound) {
        // This is not best way :(
        status = (i === 0) ? 'Passed' : 'Failed';
        // exception message is not required for Success case
        //logMsg
        return true;
      }
    });
    return cb(err, status, timeTaken, logMsg);
  });
}
