
call C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat oie exportObjects -dn Domain_46 -un Administrator -pd Administrator -sdn Native -rs MRS_46 -pn CLU_PROJECT -fp "D:\Projects\dq-cli\cli_results\output\oieexportobjects_m.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="D:\Projects\dq-cli\cli_results\output\oieexportobjects_m.zip"" -cp "D:\Projects\dq-cli\cli_results\output\oieimportobjects_ctl.xml" >> C:\Projects\dq-cli\logs\oie.log


call C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat oie importObjects -dn Domain_46 -un Administrator -pd Administrator -rs MRS_46 -tp CLU_PROJECT -sp CLU_PROJECT -fp D:\Projects\dq-cli\cli_results\input\oieimportobjects_m.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="D:\Projects\dq-cli\cli_results\input\oieimportobjects_m.zip"" -cr replace >> C:\Projects\dq-cli\logs\oie.log


