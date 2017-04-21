
C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   mrs createfolder -DomainName Domain_102 -UserName Administrator -Password Administrator -SecurityDomain Native -ServiceName MRS_102 -ProjectName CLU_PROJECT -Path /oie_import -CreatePath TRUE  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-CreateFolder-case1.log
C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   mrs createfolder -DomainName Domain_102 -UserName Administrator -Password Administrator -SecurityDomain Native -ServiceName MRS_102 -ProjectName CLU_PROJECT -Path /rtm_import -CreatePath TRUE  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-CreateFolder-case2.log
C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   mrs createfolder -DomainName Domain_102 -UserName Administrator -Password Administrator -SecurityDomain Native -ServiceName MRS_102 -ProjectName CLU_PROJECT -Path /dq_sanity -CreatePath TRUE  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-CreateFolder-case3.log

C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   oie importObjects -DomainName Domain_102 -UserName Administrator -Password Administrator -RepositoryService MRS_102 -TargetProject CLU_PROJECT -SourceProject CLU_PROJECT -ImportFilePath "C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.xml" -OtherOptions "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.zip"" -ConflictResolution replace  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-oie_ImportObjects-case1.log
C:\Projects\dqcli_v1\ptime C:\Informatica\10.2.0\clients\DeveloperClient\infacmd\infacmd.bat   oie importObjects -DomainName Domain_102 -UserName Administrator -Password Administrator -RepositoryService MRS_102  -SourceProject CLU_PROJECT -ImportFilePath "C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.xml" -OtherOptions "adapter:pluginCheck=false;rtm:codePage=UTF-8,refDataFile="C:\Projects\dqcli_v1\input\dq_artifacts\m_dq_sanity.zip"" -ConflictResolution replace  > C:\Projects\dqcli_v1\output\cli_logs\test_oie_rtm-oie_ImportObjects-case2.log








