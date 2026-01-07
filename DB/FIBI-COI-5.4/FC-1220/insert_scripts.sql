
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('44', 'TRAVEL_CREATION', '24', '0', 'Y', 'Travel Creation', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('45', 'TRAVEL_ASSIGN_ADMIN', '24', '0', 'Y', 'Travel Assign Admin', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('46', 'TRAVEL_REASSIGN_ADMIN', '24', '0', 'Y', 'Travel Reassign Admin', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('47', 'TRAVEL_SUBMIT', '24', '0', 'Y', 'Travel Submit', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('48', 'TRAVEL_RESUBMIT', '24', '0', 'Y', 'Travel Resubmit', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('49', 'TRAVEL_WITHDRAW', '24', '0', 'Y', 'Travel Withdraw', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('50', 'TRAVEL_RETURN', '24', '0', 'Y', 'Travel Return', now(), 'quickstart');
INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('51', 'TRAVEL_ADMIN_APPROVE', '24', '0', 'Y', 'Travel Admin Approval', now(), 'quickstart');

INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_CREATION', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_ASSIGN_ADMIN', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_REASSIGN_ADMIN', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_SUBMIT', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_RESUBMIT', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_WITHDRAW', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_RETURN', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');
INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_ADMIN_APPROVE', 'Y', '24', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');

INSERT INTO `notify_placeholder_header` (`MODULE_CODE`, `SUB_MODULE_CODE`, `QUERY_DEFINITION`, `QUERY_TYPE`, `ELEMENT_TYPE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `UNIQUE_DISPLAY_NAME`) VALUES ('24', '0', 'GET_TRAVEL_DETAILS', 'P', 'P', 'Y', 'Travel Details', now(), 'quickstart', 'TRAVEL_DETAILS');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'REPORTER_NAME', 'Travel Reporter Name', now(), 'quickstart');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'CERTIFICATION_DATE', 'Travel Certification Date', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'DEPARTMENT_NUMBER', 'Department Number', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'DEPARTMENT_NAME', 'Department Name', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'ENTITY_NAME', 'Entity Name', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'TRAVEL_START_DATE', 'Travel Start date', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('14', 'TRAVEL_END_DATE', 'Travel End Date', now(), 'quickstart');


INSERT INTO `notify_placeholder_header` (`MODULE_CODE`, `SUB_MODULE_CODE`, `ELEMENT_TYPE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `UNIQUE_DISPLAY_NAME`) VALUES ('24', '0', 'U', 'Y', 'Travel Urls', now(), 'quickstart', 'TRAVEL_URL');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
VALUES ('16', 'TRAVEL_URL', 'Travel url', now(), 'quickstart', '1', '/travel-disclosure/summary?disclosureId={TRAVEL_DETAILS#TRAVEL_DISCLOSURE_ID}');

INSERT INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('61', 'Travel Administrators', now(), 'quickstart', 'Y');
INSERT INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('62', 'Travel Admin Group', now(), 'quickstart', 'Y');
INSERT INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('63', 'Travel Primary Administrator', now(), 'quickstart', 'Y');
INSERT INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('64', 'Travel Reporter', now(), 'quickstart', 'Y');




INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('12', 'ADMIN_ASSIGNED_BY', 'Administrator Assigned By', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('12', 'ADMIN_ASSIGNED_TO', 'Administrator Assigned To', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('12', 'ADMINISTRATOR_NAME', 'Administrator Name', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('12', 'WITHDRAWAL_REASON', 'Withdrawal Reason', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('12', 'RETURN_REASON', 'Return Reason', now(), 'quickstart');


INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8046,24,0,'Travel Disclosure Submission','Action required: Approval for Travel Disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME}.','<p>A Travel Disclosure was submitted by {TRAVEL_DETAILS#REPORTER_NAME} on {TRAVEL_DETAILS#CERTIFICATION_DATE}.</p><p>Department : {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href="{TRAVEL_URL#TRAVEL_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8047,24,0,'Travel Disclosure Withdrawal','Withdrawal of Travel Disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME}','<p>A Travel Disclosure was submitted by {TRAVEL_DETAILS#REPORTER_NAME} on {TRAVEL_DETAILS#CERTIFICATION_DATE} is Withdrawn for the following reason “{TRAVEL_OTHER#WITHDRAWAL_REASON}”</p><p>Department : {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href="{TRAVEL_URL#TRAVEL_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8048,24,0,'Travel Disclosure Return','Action Required: Travel Disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME} has been returned by the admin {TRAVEL_OTHER#ADMINISTRATOR_NAME}','<p>Dear {TRAVEL_DETAILS#REPORTER_NAME},</p><p>Your Travel disclosure submitted on {TRAVEL_DETAILS#CERTIFICATION_DATE} was returned for the following reason {TRAVEL_OTHER#RETURN_REASON}.</p><p>Department : {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href="{TRAVEL_URL#TRAVEL_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8049,24,0,'Travel Assign Admin','Action required: You are assigned as an Administrator for the Travel disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME}','<p>Hello {TRAVEL_OTHER#ADMIN_ASSIGNED_TO},</p><p>COI Administrator {TRAVEL_OTHER#ADMIN_ASSIGNED_BY} assigned you as the Administrator of the Travel Disclosure submitted on {TRAVEL_DETAILS#CERTIFICATION_DATE} by {TRAVEL_DETAILS#REPORTER_NAME}.</p><p>Department: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href="{TRAVEL_URL#TRAVEL_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8050,24,0,'Travel Reassign admin','Review reassigned for Travel Disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME}','<p>Hello {TRAVEL_OTHER#ADMINISTRATOR_NAME},</p><p>The COI Administrator {TRAVEL_OTHER#ADMIN_ASSIGNED_BY} removed you as a Administrator for the Travel Disclosure submitted on {TRAVEL_DETAILS#CERTIFICATION_DATE} by {TRAVEL_DETAILS#REPORTER_NAME}.</p><p>Department: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>You are no longer responsible for reviewing this disclosure.</p><p>You can access the COI Dashboard at <a href=" {TRAVEL_URL#TRAVEL_URL}">link</a>.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE)
VALUES (8051,24,0,'Travel Reassign admin & Assign Admin','Action required: You are assigned as an Administrator for the Travel disclosure Submitted by {TRAVEL_DETAILS#REPORTER_NAME}','<p>Hello {TRAVEL_OTHER#ADMIN_ASSIGNED_TO},</p><p>COI Administrator {TRAVEL_OTHER#ADMIN_ASSIGNED_BY} assigned you as the Administrator of the Travel Disclosure submitted on {TRAVEL_DETAILS#CERTIFICATION_DATE} by {TRAVEL_DETAILS#REPORTER_NAME}.</p><p>Department: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href="{TRAVEL_URL#TRAVEL_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','quickstart',now(),'',NULL,'N',NULL);

INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8046,NULL,61,'quickstart',now(),'quickstart',now(),'TO','Travel Administrators');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8047,NULL,61,'quickstart',now(),'quickstart',now(),'TO','Travel Administrators');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8049,NULL,61,'quickstart',now(),'quickstart',now(),'TO','Travel Administrators');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8049,NULL,63,'quickstart',now(),'quickstart',now(),'TO','Travel Primary Administrator');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8050,NULL,62,'quickstart',now(),'quickstart',now(),'TO','Travel Admin Group');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8051,NULL,62,'quickstart',now(),'quickstart',now(),'TO','Travel Admin Group');
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME) VALUES (8048,NULL,64,'quickstart',now(),'quickstart',now(),'TO','Travel Reporter');

INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8046,47,now(),'quickstart');
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8047,49,now(),'quickstart');
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8048,50,now(),'quickstart');
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8049,45,now(),'quickstart');
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8050,46,now(),'quickstart');
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8051,46,now(),'quickstart');

