
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES (38, 'FCOI_REQUEST_WITHDRAWAL', '8', '0', 'Y', 'Disclosure Request Withdrawal', now(), 'quickstart');

INSERT INTO MQ_ROUTER_ACTION_CONFIGURATION(ACTION_TYPE, IS_ACTIVE, MODULE_CODE, QUEUE_NAME, SUB_MODULE_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES('FCOI_REQUEST_WITHDRAWAL', 'Y', 8, 'Q_NOTIFICATION', 0, now(), 'quickstart');


INSERT INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE)
VALUES(8039, 8, 0, 'Disclosure Request Withdrawal', 'Action Required: withdrawal request has been submitted  {COI_DISCLOSURE#REPORTER_NAME} ', '<p>Disclosure was submitted by {COI_DISCLOSURE#REPORTER_NAME} on {COI_DISCLOSURE#CERTIFICATION_DATE} is Withdrawn for the following reason: {COI_DISCL_OTHER#WITHDRAWAL_REASON}</p><p>Department : {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p>Disclosure Status: {COI_DISCLOSURE#DISCLOSURE_STATUS}</p><p><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">Please follow</span><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><a href="{COI_DISCL_URL#DISCLOSURE_URL}"><span style="font-family:Arial, Helvetica, sans-serif;">this link</span></a><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>', 'N', 'Y', 'quickstart', now(), 'willsmith', now(), 'N', NULL);


INSERT INTO notify_action_type_map(NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER)
VALUES(8039,38,now(),'quickstart');

INSERT INTO notification_recipient(NOTIFICATION_TYPE_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES(8039,56,'quickstart',now(),'quickstart',now(),'TO','COI Primary Administrator');
INSERT INTO notification_recipient(NOTIFICATION_TYPE_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES(8039,54,'quickstart',now(),'quickstart',now(),'TO','COI Admin Group');

INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES (39, 'FCOI_REQ_WITHDRAWAL_DENY', '8', '0', 'Y', 'Disclosure Request Withdrawal Deny', now(), 'quickstart');

INSERT INTO MQ_ROUTER_ACTION_CONFIGURATION(ACTION_TYPE, IS_ACTIVE, MODULE_CODE, QUEUE_NAME, SUB_MODULE_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES('FCOI_REQ_WITHDRAWAL_DENY', 'Y', 8, 'Q_NOTIFICATION', 0, now(), 'quickstart');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2', 'DECLINE_REASON', 'Disclosure Decline Reason', now(), 'quickstart');

INSERT INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE)
VALUES(8040, 8, 0, 'Disclosure Request Withdrawal Deny', ' Disclosure Withdrawal Request Submitted by {COI_DISCLOSURE#REPORTER_NAME} Declined by {COI_DISCLOSURE#ADMINISTRATOR_NAME}', '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Your request to withdraw the disclosure has been declined for the following </p><p>Reason<strong>:</strong> {COI_DISCL_OTHER#DECLINE_REASON}</p><p>Department : {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">Please follow</span><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><a href="{COI_DISCL_URL#DISCLOSURE_URL}"><span style="font-family:Arial, Helvetica, sans-serif;">this link</span></a><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>', 'N', 'Y', 'quickstart', now(), 'willsmith', now(), 'N', NULL);

INSERT INTO notify_action_type_map(NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER)
VALUES(8040,39,now(),'quickstart');

INSERT INTO notification_recipient(NOTIFICATION_TYPE_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES(8040,53,'quickstart',now(),'quickstart',now(),'TO','COI Reporter');
INSERT INTO notification_recipient(NOTIFICATION_TYPE_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES(8040,55,'quickstart',now(),'quickstart',now(),'CC','COI Reviewers');

INSERT INTO `MESSAGE` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('159', 'Disclosure  withdraw request', now(), 'quickstart');

INSERT INTO `disclosure_action_type` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('32', "{FCOI /Project /Travel} Disclosure <b>withdrawal requested</b>", 'Disclosure Withdrawal Request', now(), 'quickstart');

INSERT INTO `disclosure_action_type` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('33', "{FCOI /Project /Travel} Disclosure <b>withdrawal request denied</b>", 'Disclosure Withdrawal Request Denied', now(), 'quickstart');

INSERT INTO `MESSAGE` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('160', 'Withdrawal Request Denied', now(), 'quickstart');
