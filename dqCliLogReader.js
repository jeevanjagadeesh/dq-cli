require("./config.js");
var logger = require('bunyan');
var path = require("path");
var fs = require('fs');
var _ = require('lodash');
var logPatternConfig = require('./config.js').logpattern;

var log = logger.createLogger({
  name: "dqCliLogReader"
});
log.level('debug');

var excel = require('./lib/excel2Json.js');
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
log.info({ params: cParams}, 'Using following params');

main();

function main() {
  log.debug(' ******** Starting Log Reading ******** ');
  log.info({ logPatternConfig: logPatternConfig.success }, 'logPatternConfig');
  var plugin = cParams.src;
  var xlspath = path.join(baseDir, 'input', plugin.concat('.xls'));
  var logName = path.join(baseDir, 'logs', 'oie-oieimportobjects-case1.log');
  searchLog(logName, function(err, success) {
    console.log(success);
  });
}

function searchLog(filename, cb) {
  //var success, failure;
  // grep is better???
  fs.readFile(filename, function(err, data) {
    if (err) {
      return cb(err);
    }
    if (data.indexOf(logPatternConfig.success) > -1) {
      return cb(err, 'success');
    }
    // TODO error logs
  });
}

process.on('uncaughtException', function(err) {
  log.error({ err: err }, 'uncaughtException ');
  process.exit(1);
});