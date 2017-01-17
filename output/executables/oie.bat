C:\Projects\dq-cli\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat oie exportObjects -dn Domain_77 -un Administrator -pd Administrator -sdn Native -rs MRS_77 -pn CLU_PROJECT -fp "C:\Projects\dq-cli\output\dq_artifacts\oieexportobjects_m.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dq-cli\output\dq_artifacts\oieexportobjects_m.zip"" -cp "C:\Projects\dq-cli\input\dq_artifacts\oieimportobjects_ctl.xml" > C:\Projects\dq-cli\output\cli_logs\oie-oieexportobjects-case1.log


C:\Projects\dq-cli\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat oie importObjects -dn Domain_77 -un Administrator -pd Administrator -rs MRS_77 -tp CLU_PROJECT -sp CLU_PROJECT -fp C:\Projects\dq-cli\input\dq_artifacts\oieimportobjects_m.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dq-cli\input\dq_artifacts\oieimportobjects_m.zip"" -cr replace >  C:\Projects\dq-cli\output\cli_logs\oie-oieimportobjects-case1.log


