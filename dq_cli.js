var logger = require('bunyan');
var path = require("path");
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var mv = require('mv');
var moment = require('moment');
var os = require('os');
var childProcess = require('child_process');

var log = logger.createLogger({
  name: "dq_cli"
});
log.level('debug');

var excel = require('./lib/excel2Json.js');
var config = require('./properties/config.json');
var excel2Json = new excel(log);
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
log.info({params: cParams}, 'Using following params');

main();

function main() {
  log.debug(' ******** Starting ******** ');
  var timeid = moment().format('YYYYMMDD[_]hmm');
  log.info(' Current timestamp: ' + timeid);
  log.info(' OS Type: ' + os.type() +' & OS Platform: ' + os.platform() + ' & OS arch: ' + os.arch());
  var plugin = cParams.src;
  var xlspath = path.join(baseDir, 'input', plugin.concat('.xls'));
  var uploadToQaTrackExec = path.join(baseDir, 'QATrackImport', 'importxml.bat');
  var qatrackimportxml = path.join(baseDir, 'QATrackImport', 'QATrackerReport.xml');
  var qatrackurl = 'http://psrlxpamqa1:8080/qatrack/servlet/ImportXMLServlet'  
  
  //log.info(' Windows? : ' + os.platform().includes('win'));
  if (os.platform().toLowerCase().includes('win')){
  var infacmd_op_file = path.join(baseDir, 'output', plugin.concat('.bat'));
  var infacmd_log_file = path.join(baseDir, 'logs', plugin.concat('.log'));
  var infacmd_type = 'infacmd.bat';
  }
  else{
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

			// replace infacmd_type attributes in templates
              data = stringReplace(data, '<<infacmd_type>>', infacmd_type);
			  data = stringReplace(data, '<<LogFileName>>', infacmd_log_file);
			
			//log.info({data: data}, 'command output');
			
            writeToExecutable(infacmd_op_file, data);
          }
          callback();
        }, function(err) {
          if (err) {
            log.error({err: err}, 'Error from async array looping');
          }
          // for every worksheet complete, add line break
          writeToExecutable(infacmd_op_file, "\n");
          log.info("processing all elements completed");
        });
      });
    }, function(err) {
      if (err) {
        log.error({err: err}, 'Error JSON array looping');
      }
      // File creation complete, invoke the script
	  log.info(infacmd_op_file,' :infacmd_op_file');
	  
      childProcess.exec(infacmd_op_file, function(err, stdout, stderr) {
        if (err) {
          log.error({err: err}, 'Error in executing file');
        }
        log.info({stdout: stdout, stderr: stderr }, ' Execution done');
        log.info("processing JSON Array done");
		
		log.info(uploadToQaTrackExec,' :uploadToQaTrackExec');
		log.info(qatrackurl,' :qatrackurl');
		log.info(qatrackimportxml,' :qatrackimportxml');
		
			  childProcess.exec(uploadToQaTrackExec +' '+ qatrackurl +' '+ qatrackimportxml, function(err, stdout, stderr) {
        if (err) {
          log.error({err: err}, 'Error in executing file');
        }
        log.info({stdout: stdout, stderr: stderr }, ' Execution of QA Track Upload done');
        log.info("processing JSON Array done");
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
  log.error({err: err}, 'uncaughtException ');
  process.exit(1);
});