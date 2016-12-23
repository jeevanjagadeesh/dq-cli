var logger = require('bunyan');
var path = require("path");
var excel = require('./excel2Json.js');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var config = require('./domaininfo/config.json');
var mv = require('mv');
var moment = require('moment');

var log = logger.createLogger({
  name: "dq_cli"
});
log.level('debug');

var excel2Json = new excel(log);
var baseDir = __dirname;

main();

function main() {
  log.debug(' ******** Starting ******** ');
  var timeid = moment().format('YYYYMMDD[_]hmm');
  log.info(' Current timestamp: ' + timeid);
  var myArgs = process.argv.slice(2);
  var plugin = myArgs[0];
  var xlspath = path.join(baseDir, 'input', plugin.concat('.xls'));
  var infacmd_op_file = path.join(baseDir, 'output', plugin.concat('.bat'));
  //Take backup of output file if already exists
  var backup_infacmd_op_file = path.join(baseDir, 'output', plugin.concat('_').concat(timeid).concat('.bat'));
  var isFileExist = fs.existsSync(infacmd_op_file);
  log.info(' isFileExist: ' + isFileExist);

  if (isFileExist) {
    mv(infacmd_op_file, backup_infacmd_op_file, function(err) {});
  }

  var workbook = excel2Json.readExcelFile(xlspath);
  excel2Json.to_json(workbook, function(result) {
    //log.info({result: result}, 'result of excel read');
    async.forEachOf(result, function(value, key, callback) {
      var fileName = key + '.txt';
      fs.readFile(path.join(baseDir, 'templates', fileName), 'utf8', function(err, template) {
        if (err) {
          log.info({fileName: fileName}, 'No file');
          return callback('No file -- ' + fileName);
        }
        callback(err, template);
        async.forEach(value, function(elementOfArray, callback) {
          var data = template;
          if (elementOfArray.ExecuteOption !== 'Skip') {
            // replace xls values
            _.forEach(elementOfArray, function(value, key) {
              data = stringReplace(data, '<<' + key + '>>', value);
            });

            // replace config values
            _.forEach(config, function(value, key) {
              data = stringReplace(data, '<<' + key + '>>', value);
            });
            //log.info({data: data}, 'command output');

            writeToExecutable(infacmd_op_file, data);
          }
          callback();
        }, function(err) {
          if (err) {
            log.error({err: err}, 'Error from async array looping');
          }
          log.info("processing all elements completed");
        });
      });
    });
  });
}

function stringReplace(str, replaceString, newString) {
  if (str.indexOf(replaceString) > -1) {
    str = str.replace(replaceString, newString);
  }
  return str;
}

function writeToExecutable(fileName, data) {

  log.info("Going to write into existing file");
  fs.appendFile(fileName, data, function(err) {
    if (err) {
      log.error({err: err}, "Error while file append");
      return;
    }

    log.info("Data written successfully!");
    log.info("Let's read newly written data");
    // why read??
    fs.readFile(fileName, function(err, data) {
      if (err) {
        log.error({err: err}, "Error in file read");
        return;
      }
      log.info({data: data.toString()}, "Asynchronous read");
    });
  });
}

process.on('uncaughtException', function(err) {
  log.error({err: err}, 'uncaughtException ');
  process.exit(1);
});
