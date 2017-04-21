=======================================================================================================================
Instructions:
=======================================================================================================================

1) Copy project "dqcli" to the server where infacmd can be run
    As a best practice, keep the project in "home" directory of linux machine and root directory of "C:\" drive in windows machine.

2) Copy platform specific node executable application file from "node_executable_apps" folder to project home locatin of "dqcli"
    "dqcli" project supports only Windows,Linux,Solaris & AIX
    [Please note that you can skip this step on irl64dqd04, inmurano, indqperf and INKSUSE12QA4 because node program is installed on these machines]

3) Configure domain properties
    i) Go to dqcli->properties->config.json
   ii) Modify domain & email properties

4) Modify Test-Suite
    i) Go to dqcli->input->testSuite->TestSuiteOIERTM.xls
   ii) Navigate to "Utils" worksheet tab
        a)Replace runtime properties based on domain services and dqcli project location
              (If there are any FOLDER PATH variables, then please append file separator at end of the location. Example: C:\dqcli\input\dq_artifacts\  )
        b)Replace has to be done for all the data in all worksheets. To do this use below option to make it easier.
             *Presss CTRL+H
             *Click "Options>>"
             *Select "Workbook" in drop-down field "Within"
             *Use "Replace All" options 

5) The control files present as part of default project xmls in dqcli\input\dq_artifacts is configured with source connection staging name as "STAGE" and target connection staging name as "STAGE". So if there is any change in staging connection name in your domain, kindly modify the control files accordingly.

6) Execute node command
   i)Go to dqcli
  ii)Execute below command
     node dq_cli.js -src <suite_xlsx_without_extn> -gp <override_config.json>
        Our default project has testsuite "TestSuiteOIERTM.xls", so the command would look like below
            node dq_cli.js -src TestSuiteOIERTM -gp config.json
	

=======================================================================================================================