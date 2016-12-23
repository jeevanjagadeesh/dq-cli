var logger = require('bunyan');
var path = require("path");
var excel = require('./excel2Json.js');
var util = require('util');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var excel2Json = new excel();
var config = require('./domaininfo/config.json');
var fileExists = require('file-exists');
var mv = require('mv');
var moment = require('moment');

main();

function main() {
  console.log(' ******** Starting ******** ');
  var timeid = moment().format('YYYYMMDD[_]hmm');
  console.log(' Current timestamp: '.concat(timeid));
  var myArgs = process.argv.slice(2);
  var plugin = myArgs[0];
  var xlspath = path.join(__dirname, 'input', plugin.concat('.xls'));
  var infacmd_op_file = path.join(__dirname, 'output', plugin.concat('.bat'));
  //Take backup of output file if already exists
  var backup_infacmd_op_file = path.join(__dirname, 'output', plugin.concat('_').concat(timeid).concat('.bat'));
  console.log(fileExists(infacmd_op_file));

  if (fileExists(infacmd_op_file)) {

    mv(infacmd_op_file, backup_infacmd_op_file, function(err) {});
  }

  var workbook = excel2Json.readExcelFile(xlspath);
  excel2Json.to_json(workbook, function(result) {
    //console.log('result == '+util.inspect(result));
    async.forEachOf(result, function(value, key, callback) {
      var fileName = key + '.txt';
      fs.readFile(path.join(__dirname, 'templates', fileName), 'utf8', function(err, template) {
        if (err) {
          console.log('No file --' + fileName);
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
            console.log(data);

            writeToExecutable(infacmd_op_file, data);
            console.log('\n');
          }
          callback();
        }, function(err) {
          if (err) {
            console.log(err);
          }
          console.log("processing all elements completed");
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

function deleteFile(backup_infacmd_op_file) {

  console.log("Going to delete an existing backup file :".concat(backup_infacmd_op_file));
  fs.unlink(backup_infacmd_op_file, function(err) {
    console.log("Inside deleteFile Function");
    if (err) {
      return console.error(err);
    }
    console.log("File deleted successfully!");
  });
}

function writeToExecutable(fileName, data) {
  var fs = require("fs");

  console.log("Going to write into existing file");
  fs.appendFile(fileName, data, function(err) {
    if (err) {
      return console.error(err);
    }

    console.log("Data written successfully!");
    console.log("Let's read newly written data");
    fs.readFile(fileName, function(err, data) {
      if (err) {
        return console.error(err);
      }
      console.log("Asynchronous read: " + data.toString());
    });
  });
}

function renameFile(oldFile, newFile) {
  fs.rename(oldFile, newFile, function(err) {
    if (err) throw err;
    fs.stat(oldFile, function(err, stats) {
      if (err) throw err;
      console.log('stats: ' + JSON.stringify(stats));
    });
  });
}

process.on('uncaughtException', function(err) {
  console.log('uncaughtException: ' + err);
  process.exit(1);
});
