module.exports = function(config) {
  config.logpattern = {
    // success grep string
    success: 'Command ran successfully.',
    // failure grep strings
    failure: ['[ICMD_10033] Command [exportObjects] failed with error [[OIECMD_10006] Error occurred during export function. See previous error.]',
        '[ICMD_10033] Command [importObjects] failed with error [[OIECMD_10007] Error occurred during import function. See previous error.]',
    ],
    logpath: '/logs/',
    ExecutionTime: 'Execution time:'
  }
};