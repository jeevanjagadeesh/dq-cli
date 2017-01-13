var path = require("path");
var config = module.exports = {};

require('module').Module._initPaths();

require("./properties/logPattern.js")(config);
