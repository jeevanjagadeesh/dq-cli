require("./config.js");
var logger = require('bunyan');
var path = require("path");
var fs = require('fs');
var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var logPatternConfig = require('./config.js').logpattern;

var log = logger.createLogger({
  name: "dqCliLogReader"
});
log.level('debug');

var excel = require('./lib/excel2Json.js');
var excel2Json = new excel(log);
var config = require('./properties/config.json');
var baseDir = __dirname;

var mixinStr = fs.readFileSync(baseDir + '/mixins/QATrackerReport.pug', 'utf8')
var xmlTemplate = pug.compile(mixinStr, {
  pretty: true
});

var DEFAULT_PARAMS = {
  src: "oie"
};

/**
 * Parses the parameters:
 * @param {String[]} consoleParams
 */
function parseParams(consoleParams) {
  var params = _.clone(DEFAULT_PARAMS);
  do {
    var key = consoleParams.shift();
    var val = consoleParams.shift();
    if (!_.isString(key) || key.lastIndexOf('-', 0) !== 0 || !_.isString(val)) {
      log.warn('Error parsing key / value pair', key, ':', val);
    } else {
      key = key.substr(1);
      params[key] = val;
    }
  } while (consoleParams.length > 0);
  return params;
}

// load console parameters
var cParams = parseParams(process.argv.slice(2));
log.info({ params: cParams }, 'Using following params');

main();

function main() {
  log.debug(' ******** Starting Log Reading ******** ');
  var jsonData = _.cloneDeep(config);
  var testCases = [];
  var plugin = cParams.src;
  jsonData.pluginName = plugin;
  var xlspath = path.join(baseDir, 'input', plugin.concat('.xlsx'));
  var workbook = excel2Json.readExcelFile(xlspath);
  excel2Json.to_json(workbook, function(result) {
    // iterate each worksheet
    async.forEachOf(result, function(value, key, callback1) {
      async.forEach(value, function(elementOfArray, callback2) {
        if (elementOfArray.ExecuteOption !== 'Skip') {
          var logName = path.join(baseDir, 'logs', elementOfArray.TestCaseID + '.log');
          var testCase = {};
          searchLog(logName, function(err, status, timeTaken, failureMsg) {
            if (!err) {
              testCase.Name = elementOfArray.TestCaseID;
              testCase.status = status;
              testCase.exceptionMessage = failureMsg;
              testCase.timeTaken = timeTaken;
              testCases.push(testCase);
            }
            callback2(err);
          });
        } else callback2();

      }, function(err) {
        if (err) {
          log.error({err: err}, 'Error from async worksheet row looping');
        }
        callback1();
        log.info("processing all elements completed");

      });
    }, function(err) {
      if (err) {
        log.error({err: err}, 'Error xls worksheet looping');
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
      var xmlpath = path.join(baseDir, 'uploadToReport', "QATrackerReport-" + plugin + '.xml');
      fs.writeFile(xmlpath, trackerXml, function (err) {
	    if (err)
	      return console.log(err);
	      console.log('File written succesfully!!!');
      });
    });
  });
}

function searchLog(filename, cb) {
  //var success, failure;
  // grep is better???
  //console.log(filename);
  fs.readFile(filename, "utf-8", function(err, data) {
    if (err) {
      return cb(err);
    }

    var timeTaken = data.match(logPatternConfig.ExecutionTime);
	timeTaken =  timeTaken ? parseFloat(timeTaken[1]) : 0;
    if (data.indexOf(logPatternConfig.success) > -1) {
      return cb(err, 'Passed', timeTaken);
    } else {
      var failMsg;
      _.forEach(logPatternConfig.failure, function(failureMsg) {
        if (data.indexOf(failureMsg) > -1) {
          failMsg = failureMsg;
          // break the loop, if error found
          return false;
        }
      });
      return cb(err, 'Failed', timeTaken, failMsg);
    }
  });
}

process.on('uncaughtException', function(err) {
  log.error({ err: err }, 'uncaughtException ');
  process.exit(1);
});