
/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie exportObjects -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -pn CLU_PROJECT -fp "oie_mapping_export_1.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cp "oie_export_ctl_1.xml" >> C:\Projects\dq-cli\logs\oie.log

/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie exportObjects -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -pn CLU_PROJECT -fp "oie_mapping_export_2.xml" -ow true -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cp "oie_export_ctl_2.xml" >> C:\Projects\dq-cli\logs\oie.log


/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie importObjects -dn Domain_116 -un Administrator -pd Administrator -rs MSR_DQ -tp PAM -sp PAM_910 -fp oie_mapping_export.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr replace >> C:\Projects\dq-cli\logs\oie.log

/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie importObjects -dn Domain_116 -un Administrator -pd Administrator -rs MSR_DQ -tp PAM -sp PAM_910 -fp run_dq_sanity.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr rename >> C:\Projects\dq-cli\logs\oie.log

/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie importObjects -dn Domain_116 -un Administrator -pd Administrator -rs MSR_DQ -tp PAM -sp PAM_910 -fp oie_mapping_export_2.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr replace >> C:\Projects\dq-cli\logs\oie.log

/export/home/dq90_qa/Informatica/101_TO_1011_UPG/infacmd.bat oie importObjects -dn Domain_116 -un Administrator -pd Administrator -rs MSR_DQ -tp PAM -sp PAM_910 -fp run_dq_sanity_2.xml -oo "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="/"" -cr rename >> C:\Projects\dq-cli\logs\oie.log
