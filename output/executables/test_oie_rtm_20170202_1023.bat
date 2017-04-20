

C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   oie importObjects -DomainName Domain_102 -UserName Administrator -Password Administrator -RepositoryService MRS_102   -SourceProject CLU_PROJECT -ImportFilePath "C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.xml" -OtherOptions "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.zip"" -ControlFilePath C:\Projects\dqcli_v1\input\dq_artifacts\ctl_dq_sanity_oie_import.xml -ConflictResolution replace -SkipCRC TRUE -SkipCnxValidation FALSE  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-oie_ImportObjects-case1.log
C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   oie importObjects -DomainName Domain_102 -UserName Administrator -Password Administrator -RepositoryService MRS_102 -TargetProject CLU_PROJECT -TargetFolder oie_import_no_ctl -SourceProject CLU_PROJECT -ImportFilePath "C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.xml" -OtherOptions "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.zip""  -ConflictResolution replace -SkipCRC TRUE -SkipCnxValidation FALSE  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-oie_ImportObjects-case2.log








