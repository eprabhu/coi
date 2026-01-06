INSERT INTO `MESSAGE` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('8002', 'Project disclosure waiting for Submission', now(), 'quickstart');

INSERT INTO `NOTIFICATION_TYPE` (`NOTIFICATION_TYPE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `SUBJECT`, `MESSAGE`, `PROMPT_USER`, `IS_ACTIVE`, `CREATE_USER`, `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_SYSTEM_SPECIFIC`, `SENT_TO_INITIATOR`) 
VALUES ('8055', '8', '0', 'This notification will indicate that disclosure submission is required.', 'Action Required: Submit Your Development proposal disclosure - {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}', '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Project disclosure for {COI_DISCLOSURE#PROJECT_TYPE} : {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}, has been created for you in the COI system. Please review and submit the disclosure at your earliest convenience.</p><p><strong>Department:</strong> {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Create Date:</strong> {COI_DISCLOSURE#CREATE_DATE}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><strong>COI Review Status:</strong> {COI_DISCLOSURE#REVIEW_STATUS}</p><p><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">Please follow</span><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><a href="{COI_DISCL_URL#DISCLOSURE_URL}"><span style="font-family:Arial, Helvetica, sans-serif;">this link</span></a><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>', 'N', 'Y', 'quickstart', now(), 'quickstart', now(), 'Y', 'Y');

INSERT INTO `MQ_ROUTER_TRIGGER_CONFIGURATION` (`TRIGGER_TYPE`, `IS_ACTIVE`, `QUEUE_NAME`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('NOTIFY_DISCLOSURE_SUBMISSION', 'Y', 'Q_NOTIFICATION', 'Submit Proposal Disclosure Notification', now(), 'quickstart');

INSERT INTO `NOTIFY_PLACEHOLDER_COLUMNS` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('1', 'CREATE_DATE', 'Disclosure Created date', now(), 'quickstart');

INSERT INTO `NOTIFY_PLACEHOLDER_COLUMNS` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('1', 'DISPOSITION_STATUS', 'Disclosure Disposition Status', now(), 'quickstart');
