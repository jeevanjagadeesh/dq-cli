
infacmd.bat rtm export -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -f "/export/home/dq90_qa/clu_test/clu_project/output" -pf CLU_PROJECT/RTM_EXPORT -r TRUE -sdg FALSE >> C:\Projects\dq-cli\logs\rtm.log

infacmd.bat rtm export -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -f "/export/home/dq90_qa/clu_test/clu_project/output3" -pf CLU_PROJECT/RTM_EXPORT -r TRUE -sdg FALSE >> C:\Projects\dq-cli\logs\rtm.log


infacmd.bat rtm import -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -it replace -f "/export/home/dq90_qa/clu_test/clu_project/output" -pf CLU_PROJECT/RTM_IMPORT >> C:\Projects\dq-cli\logs\rtm.log

infacmd.bat rtm import -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -it replace -f "/export/home/dq90_qa/clu_test/clu_project/output1" -pf CLU_PROJECT/RTM_IMPORT >> C:\Projects\dq-cli\logs\rtm.log

infacmd.bat rtm import -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -it replace -f "/export/home/dq90_qa/clu_test/clu_project/output3" -pf CLU_PROJECT/RTM_IMPORT >> C:\Projects\dq-cli\logs\rtm.log

infacmd.bat rtm import -dn Domain_116 -un Administrator -pd Administrator -sdn Native -rs MSR_DQ -cp UTF-8 -it replace -f "/export/home/dq90_qa/clu_test/clu_project/output4" -pf CLU_PROJECT/RTM_IMPORT >> C:\Projects\dq-cli\logs\rtm.log

