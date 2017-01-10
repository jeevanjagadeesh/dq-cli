
D:\Informatica\102_20\isp\bin\infacmd.bat oie exportObjects -dn Domain_20 -un Administrator -pd Administrator -sdn Native -rs MRS_20 -pn CLU_PROJECT -fp "oie_mapping_export_1.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cp "oie_export_ctl_1.xml" >> D:\Projects\dq-cli\logs\oie.log

D:\Informatica\102_20\isp\bin\infacmd.bat oie exportObjects -dn Domain_20 -un Administrator -pd Administrator -sdn Native -rs MRS_20 -pn CLU_PROJECT -fp "oie_mapping_export_2.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cp "oie_export_ctl_2.xml" >> D:\Projects\dq-cli\logs\oie.log


D:\Informatica\102_20\isp\bin\infacmd.bat oie importObjects -dn Domain_20 -un Administrator -pd Administrator -rs MRS_20 -tp PAM -sp PAM_910 -fp oie_mapping_export.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr replace >> D:\Projects\dq-cli\logs\oie.log

D:\Informatica\102_20\isp\bin\infacmd.bat oie importObjects -dn Domain_20 -un Administrator -pd Administrator -rs MRS_20 -tp PAM -sp PAM_910 -fp run_dq_sanity.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr rename >> D:\Projects\dq-cli\logs\oie.log

D:\Informatica\102_20\isp\bin\infacmd.bat oie importObjects -dn Domain_20 -un Administrator -pd Administrator -rs MRS_20 -tp PAM -sp PAM_910 -fp oie_mapping_export_2.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr replace >> D:\Projects\dq-cli\logs\oie.log

D:\Informatica\102_20\isp\bin\infacmd.bat oie importObjects -dn Domain_20 -un Administrator -pd Administrator -rs MRS_20 -tp PAM -sp PAM_910 -fp run_dq_sanity_2.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr rename >> D:\Projects\dq-cli\logs\oie.log

