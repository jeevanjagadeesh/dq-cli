module.exports = function(config) {
  config.logpattern = {
    // success grep string
    success: ['Command ran successfully.',
      'test'
    ],
    // failure grep strings
    failure: [
	        '[ICMD_10033] Command [exportObjects] failed with error [[OIECMD_10006] Error occurred during export function. See previous error.]',
			'[ICMD_10033] Command [importObjects] failed with error [[OIECMD_10007] Error occurred during import function. See previous error.]',
			'[ICMD_10033] Command [createproject] failed with error [[PRSCMD_20000]',
			'[ICMD_10033] Command [importObjects] failed with error [[OIECMD_10007] Error occurred during import function. See previous error.]',
			'[ICMD_10033] Command [export] failed with error [[RefTblCmd_0055] Some Reference Tables failed to export correctly. Please check the log file for details]',
			'[ICMD_10033] Command [runmapping] failed with error [[MPSVCCMN_10003] The Mapping Service Module [MappingService] application',
			'Error exporting content ["null"]',
			'Unable to import content',
			'[ICMD_10033] Command [runmapping] failed with error [[MPSVCCMN_10094] The Mapping Service Module failed to run the job with ID',
			'[ICMD_10033] Command [export] failed with error [[RefTblCmd_0003] Invalid folder specified.Please check if user has access permission or if the specified folder location exists]',
    ],
    logpath: '/logs/',
    // Use Regex - get upto 3 decimal val
    ExecutionTime: /Execution time: (\d+(\.\d{1,3})?)/
  }
};