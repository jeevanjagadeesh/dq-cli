var logger = require('bunyan');
var path = require("path");
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var mv = require('mv');
var moment = require('moment');
var os = require('os');
var childProcess = require('child_process');
var request = require('request');

var log = logger.createLogger({
  name: "dq_cli"
});
log.level('debug');

var excel = require('./lib/excel2Json.js');
var config = require('./properties/config.json');
var excel2Json = new excel(log);
var dqLog = require('./dqCliLogReader.js');
var dqCliLogReader = new dqLog(log);
var baseDir = __dirname;

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
  log.debug(' ******** Starting ******** ');
  var timeid = moment().format('YYYYMMDD[_]hmm');
  log.info(' Current timestamp: ' + timeid);
  log.info(' OS Type: ' + os.type() + ' & OS Platform: ' + os.platform() + ' & OS arch: ' + os.arch());
  var plugin = cParams.src;
  var xlspath = path.join(baseDir, 'input', plugin.concat('.xlsx'));

  //log.info(' Windows? : ' + os.platform().includes('win'));
  if (os.platform().toLowerCase().includes('win')) {
    var infacmd_op_file = path.join(baseDir, 'output', plugin.concat('.bat'));
    var infacmd_log_file = path.join(baseDir, 'logs', plugin.concat('.log'));
    var infacmd_type = 'infacmd.bat';
  } else {
    var infacmd_op_file = path.join(baseDir, 'output', plugin.concat('.sh'));
    var infacmd_type = './infacmd.sh';
  }
  //Take backup of output file if already exists
  var backup_infacmd_op_file = path.join(baseDir, 'output', plugin.concat('_').concat(timeid).concat('.bat'));
  var backup_infacmd_log_file = path.join(baseDir, 'logs', plugin.concat('_').concat(timeid).concat('.log'));
  var isFileExist = fs.existsSync(infacmd_op_file);
  log.info(' isFileExist: ' + isFileExist);
  var isLogFileExist = fs.existsSync(infacmd_log_file);
  log.info(' isLogFileExist: ' + isLogFileExist);

  if (isFileExist) {
    mv(infacmd_op_file, backup_infacmd_op_file, function(err) {});
  }

  if (isLogFileExist) {
    mv(infacmd_log_file, backup_infacmd_log_file, function(err) {});
  }

  var workbook = excel2Json.readExcelFile(xlspath);
  var xlsData;
  excel2Json.to_json(workbook, function(result) {
    xlsData = result;
    //log.info({result: result}, 'result of excel read');
    async.forEachOf(result, function(value, key, callback) {
      var fileName = key + '.txt';
      fs.readFile(path.join(baseDir, 'templates', fileName), 'utf8', function(err, template) {
        if (err) {
          log.info({ fileName: fileName }, 'No file');
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

            // replace infacmd_type attributes in templates
            data = stringReplace(data, '<<infacmd_type>>', infacmd_type);
            data = stringReplace(data, '<<LogFileName>>', infacmd_log_file);
            //log.info({data: data}, 'command output');
            writeToExecutable(infacmd_op_file, data);
          }
          callback();
        }, function(err) {
          if (err) {
            log.error({ err: err }, 'Error from async array looping');
          }
          // for every worksheet complete, add line break
          writeToExecutable(infacmd_op_file, "\n");
          log.info("processing all elements completed");
        });
      });
    }, function(err) {
      if (err) {
        log.error({ err: err }, 'Error JSON array looping');
        // Uncomment the below line
        //process.exit(1);
      }
      // File creation complete, invoke the script
      log.info(infacmd_op_file, ' :infacmd_op_file');

      childProcess.exec(infacmd_op_file, {timeout:config.ExecutionTimeout}, function(err, stdout, stderr) {
        if (err) {
          log.error({ err: err }, 'Error in executing file');
          // Uncomment the below line
          //process.exit(1);
        }
        log.info({ stdout: stdout, stderr: stderr }, ' Execution done');
        dqCliLogReader.generateExecutionXml(xlsData, plugin, function(err, trackerXml) {
          if (err) {
            log.error({err: err }, 'Error in generating Xml');
            // must exit
            log.info('ERROR Exiting');
            process.exit(1);
          }
          // XML generated invoke the service
          log.info(config.qatrackurl, ' :qatrackurl');
          var req = request.post({
		    url: config.qatrackurl,
		    headers:{ 'Content-Type': 'multipart/form-data' }
		  }, function(error, response, body) {
		    if (error) {
		      console.log(error);
		      process.exit(1);
		    }
		      //console.log('statusCode === ' + response.statusCode);
		      console.log('response body == ' + body);
		      process.exit(0);
		  });
		   //req.pipe(process.stdout);
		   var form = req.form();
		   form.append('xml', trackerXml);
           form.append('module','ATBB');
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
  //log.info("Going to write into existing file");
  fs.appendFileSync(fileName, data);
  //log.info("Data written successfully!");
}

process.on('uncaughtException', function(err) {
  log.error({ err: err }, 'uncaughtException ');
  process.exit(1);
});