var XLSX = require('xlsx');

exports = module.exports = ExcelToJSON;

function ExcelToJSON(logger) {
  this.logger = logger;
}

ExcelToJSON.prototype.readExcelFile = function(file, cb) {
 this.logger.info(' ******** Reading EXCEL file ******** ' );
 return XLSX.readFile(file);
}

ExcelToJSON.prototype.to_json = function(workbook, cb) {
	var result = {};
	var i = 0;
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if(roa.length > 0){
			result[sheetName] = roa;
			i++;
		}
	});
	return cb(result);
}


