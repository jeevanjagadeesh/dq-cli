//Load all required libraries
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

//Create logger
var log = logger.createLogger({
  name: "dq_cli"
});
log.level('debug');

//Initialze excel to json convertors
var excel = require('./lib/excel2Json.js');
var excel2Json = new excel(log);
var baseDir = __dirname;

//Load log reader
var dqLog = require('./lib/dqCliLogReader.js');
var email = require('./lib/sendEmail.js');

var DEFAULT_PARAMS = {
  src: "oie",
  gp: "config.json",
  se: 'No'
};

//Initialize excel input directories
var plugin_input_dir = path.join(baseDir, 'input', 'testSuite');
var plugin_input_extn = '.xlsx';

//Initialize log files
var infacmd_op_file = path.join(baseDir, 'output', 'executables');
var infacmd_log_file = path.join(baseDir, 'output', 'cli_logs');
var infacmd_op_file_dir = path.join(baseDir, 'output', 'executables');
var infacmd_log_file_dir = path.join(baseDir, 'output', 'cli_logs');

//Initialize plugin template directories
var templates_dir = path.join(baseDir, 'input', 'templates');
var template_extn = '.txt';

var windowsComment = ":: ";
var linuxComment = "# ";
var platform_type = 'unknown';

//Initialize execution time tracker
var timeTracker = '';

/**
 * Parses the parameters:
 * @param {String[]} consoleParams
 */
function parseParams(consoleParams) {
  var params = _.clone(DEFAULT_PARAMS);
  var key, val;
  do {
    key = consoleParams.shift();
    val = consoleParams.shift();
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
log.info({params: cParams}, 'Using following params');

function handleError(log, sendEmailObj) {
  log.info('ERROR, sending email and Exiting');
  var data = {
    'subject': "CLI Automation report - Build Failure",
    'text': "<p>Hi,</p><p>&nbsp;</p><p>&nbsp; &nbsp; Error Occured during the execution Process, Please check log for more info. <p>&nbsp;</p><p>Regards,</p><p>CLI&nbsp;Automation Team</p>"
  };
  sendEmailObj.sendMail(data, function(err, msg) {
    log.info({ err: err, msg: msg }, 'Send Email handleError ***');
    process.exit(1);
  });
}

function writeToExecutable(fileName, data) {
  fs.appendFileSync(fileName, data);
}

function stringReplace(str, replaceString, newString) {
  if (str.indexOf(replaceString) > -1) {
    str = str.replace(replaceString, newString);
  }
  return str;
}

function main() {
  log.debug(' ******** Starting ******** ');
  var timeid = moment().format('YYYYMMDD[_]hmm');
  log.info(' Current timestamp: ' + timeid);
  log.info(' OS Type: ' + os.type() + ' & OS Platform: ' + os.platform() + ' & OS arch: ' + os.arch());
  var plugin = cParams.src;
  var configFile = cParams.gp;
  var se = cParams.se;
  var config = require('./properties/' + configFile);
  var dqCliLogReader = new dqLog(log, config);
  var sendEmailObj = new email(log, config);

  if (os.platform().toLowerCase().includes('win')) {
    platform_type = 'windows';
  } else {
    platform_type = 'non-windows';
  }

  //log.info(' Windows? : ' + os.platform().includes('win'));
  var backup_infacmd_op_file, infacmd_type;
  if (platform_type === 'windows') {
    infacmd_op_file = path.join(infacmd_op_file_dir, plugin.concat('.bat'));
    infacmd_log_file = path.join(infacmd_log_file_dir, plugin.concat('.log'));
    //Initialize variables to take backup files
    backup_infacmd_op_file = path.join(infacmd_op_file_dir, plugin.concat('_').concat(timeid).concat('.bat'));
    infacmd_type = 'infacmd.bat';
    timeTracker = 'ptime';
  } else {
    infacmd_op_file = path.join(infacmd_op_file_dir, plugin.concat('.sh'));
    infacmd_log_file = path.join(infacmd_log_file_dir, plugin.concat('.log'));
    //Initialize variables to take backup files
    backup_infacmd_op_file = path.join(infacmd_op_file_dir, plugin.concat('_').concat(timeid).concat('.sh'));
    infacmd_type = './infacmd.sh';
    timeTracker = '/usr/bin/time -f "Execution time: %e s"';
  }

  var isFileExist = fs.existsSync(infacmd_op_file);
  log.info(' isFileExist: ' + isFileExist);
  log.info(' infacmd_op_file, backup_infacmd_op_file: exists- ' + infacmd_op_file + ' : ' + backup_infacmd_op_file);
  if (isFileExist) {
    log.info(' infacmd_op_file, backup_infacmd_op_file: exists- ' + infacmd_op_file + ' : ' + backup_infacmd_op_file);
    mv(infacmd_op_file, backup_infacmd_op_file, function (err) {});
  }

  var inputFile = path.join(plugin_input_dir, plugin.concat(plugin_input_extn));
  var workbook = excel2Json.readExcelFile(inputFile);
  var xlsData;
  excel2Json.to_json(workbook, function (result) {
    xlsData = result;
    log.info({ result: result }, 'result of excel read');
    if (se.toUpperCase() === 'Y' || se.toUpperCase() === 'YES') {
      generateReport(dqCliLogReader, sendEmailObj, xlsData, plugin, config, function(err, done) {
        if (err) {
          log.error({ err: err }, 'Error generateReport');
          return handleError(log, sendEmailObj);
        }
        process.exit(0);
      });
    } else {
      async.forEachOf(result, function (value, key, callback) {
        console.log('key == ' + key);
        if(key === 'Utils') return callback();
        var fileName = key + template_extn;
        var filePath = path.join(templates_dir, fileName);
        if (!fs.existsSync(filePath)) {
          console.log("File not found");
          return callback('File Not Found');
        }
        var template = fs.readFileSync(filePath, 'utf8');
        if (template) {
          //console.log('fileName == '+fileName);

          async.forEach(value, function (elementOfArray, callback) {
            var data = template;
            var cli_prefix = '';
            var cli_project_home_path = '';
            var INFACMD_PATH;

            //Only the rows with ExecuteOption as "Skip" will be ignored. All other options(including blank) are accepted.
            if ((elementOfArray.ExecuteOption).toUpperCase() !== 'SKIP') {
              // replace command template arguments with program variables

              // replace command template arguments with config.json properties
              _.forEach(config, function (value, key) {
                data = stringReplace(data, '<<' + key + '>>', value);

                if (key === 'cli_project_home_path') {
                  cli_project_home_path = value;
                }
                if (key === 'INFACMD_PATH') {
                  INFACMD_PATH = value;
                }
              });
              // replace cli_prefix essential for command execution
              if (platform_type === 'windows') {
                cli_prefix = cli_project_home_path + timeTracker + ' ' + INFACMD_PATH + infacmd_type + ' ';
              } else {
                cli_prefix = timeTracker + ' ' + INFACMD_PATH + infacmd_type + ' ';
              }

              data = stringReplace(data, '<<cli_prefix>>', cli_prefix + ' ');

              // replace command template arguments with TestSuite Inputs
              _.forEach(elementOfArray, function (value, key) {
                console.log('key : ' + key + ' and value : ' + value);

                //Replace <<LogFileName>>
                if (key === 'TestCaseID') {

                  var logFileName = infacmd_log_file_dir + path.sep + value + '.log';
                  var backup_logFileName = infacmd_log_file_dir + path.sep + value + '_' + timeid + '.log';

                  //Take backup of Log file
                  var isLogFileExist = fs.existsSync(logFileName);
                  log.info(' isLogFileExist: ' + isLogFileExist);
                  if (isLogFileExist) {
                    log.info(' logFileName, backup_logFileName: - ' + logFileName + ' : ' + backup_logFileName);
                    mv(logFileName, backup_logFileName, function (err) {});
                  }
                  if (platform_type === 'non-windows') {
                    data = stringReplace(data, '<<LogFileName>>', ' >& ' + logFileName);
                  } else {
                    data = stringReplace(data, '<<LogFileName>>', ' > ' + logFileName);
                  }
                }

                //Skip argument option from the command, if value found to be {N/A,n/a,na or NA}
                if (value.toUpperCase() === 'N/A' || value.toUpperCase() === 'NA' || value.toUpperCase() === 'NULL') {
                  console.log('This option is skipped  : ' + '-' + key + ' ' + '<<' + key + '>>');
                  data = stringReplace(data, '-' + key + ' ' + '<<' + key + '>>', '');
                }
                data = stringReplace(data, '<<' + key + '>>', value);
              });

              //log.info({data: data}, 'command output');
              var commentData = (platform_type === 'windows') ? windowsComment : linuxComment;
              commentData = commentData + elementOfArray.TestCaseID + "\n";
              writeToExecutable(infacmd_op_file, commentData);
              writeToExecutable(infacmd_op_file, data);
            }
            callback();
          }, function (err) {
            if (err) {
              log.error({ err: err }, 'Error from async array looping');
              return handleError(log, sendEmailObj);
            }
            // for every worksheet completed- add line break
            writeToExecutable(infacmd_op_file, "\n");
            log.info("processing all elements completed");
            callback();
          });
        }
      }, function (err) {
        if (err) {
          log.error({err: err }, 'Error JSON array looping');
          return handleError(log, sendEmailObj);
        }
        // File creation complete, invoke the script
        log.info(infacmd_op_file, ' :infacmd_op_file');

        //Individual read + write + execute (full access to an individual)
        if (platform_type === 'non-windows') {
          fs.chmod(infacmd_op_file, '0700', function (err) {
            if (err) {
              log.error({err: err }, 'Error changing permission for executable file');
              return handleError(log, sendEmailObj);
            }
          });

          childProcess.exec('dos2unix ' + infacmd_op_file, function (err, stdout, stderr) {
            log.info({stdout: stdout, stderr: stderr }, ' Execution done');
            if (err) {
              log.error({err: err }, 'ERROR Executing dos2unix command');
              return handleError(log, sendEmailObj);
            }
          });
        }
        log.info({timeout: config.ExecutionTimeout, infacmd_op_file: infacmd_op_file}, 'Just log the timeout');
        // THIS is not correct, it must be sync.. TODO-Change code to synchrounous Execution
        
        childProcess.exec(infacmd_op_file, {
          timeout: config.ExecutionTimeout
        }, function (err, stdout, stderr) {
          if (err) {
            log.error({err: err}, 'Error in executing file');
            return handleError(log, sendEmailObj);
          }
          log.info({stdout: stdout, stderr: stderr }, ' Execution done');
          generateReport(dqCliLogReader, sendEmailObj, xlsData, plugin, config, function(err, done) {
            if (err) {
              log.error({ err: err }, 'Error generateReport');
              return handleError(log, sendEmailObj);
            }
            process.exit(0);
          });
        });
      });
  }
  });
}

function generateReport(dqCliLogReader, sendEmailObj, xlsData, plugin, config, cb) {
  dqCliLogReader.generateExecutionXml(xlsData, plugin, function (err, trackerXml) {
    if (err) {
      console.log('Error in generating Xml');
      return cb(err);
    }
    // XML generated invoke the service
    console.log(config.qatrackurl, ' :qatrackurl');
    var req = request.post({
      url: config.qatrackurl,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        return cb(err);
      }

      if (config.sendEmail) {
        console.log('response body == ' + body);
        var emailContent = sendEmailObj.composeMail(body);
        sendEmailObj.sendMail(emailContent, function (err, msg) {
          console.log('Send Email ***');
          cb(null, 'Done Exit');
        });
      } else {
        console.log('*** Send Email turned off - Email not sent ***');
        cb(null, 'Done Exit');
      }
    });
    var form = req.form();
    form.append('xml', trackerXml);
    form.append('module', 'ATBB');
  });
}
main();

process.on('uncaughtException', function (err) {
  log.error({ err: err }, 'uncaughtException ');
  process.exit(1);
});
