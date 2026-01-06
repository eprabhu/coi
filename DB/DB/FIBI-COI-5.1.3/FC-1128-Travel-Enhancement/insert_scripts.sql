
INSERT INTO PARAMETER  (PARAMETER_NAME,VALUE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('TRAVEL_DISCL_SUBMISSION_DUE_DAYS','30','This parameter determains the Travel disclosure submission due days',NOW(),'fibi_admin');

INSERT INTO PARAMETER  (PARAMETER_NAME,VALUE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('TRAVEL_REIMBURSED_COST_THRESHOLD','5000','Travel disclosure reimbused cost threshold applies to a trip',NOW(),'fibi_admin');

INSERT INTO PARAMETER  (PARAMETER_NAME,VALUE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('TRAVEL_REIMBURSED_THRESHOLD_PERIOD','12','Travel disclosure reimbused cost threshold period applies to a entity',NOW(),'fibi_admin');


INSERT INTO `form_builder_prog_element` (`PROG_ELEMENT_NUMBER`, `VERSION_NUMBER`, `VERSION_STATUS`, `PROG_ELEMENT_NAME`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('1005', '1', 'ACTIVE', 'CoiTravelDestinationComponent', 'For Travel Disclosure', 'Y', now(), 'quickstart');

INSERT INTO `LOOKUP_WINDOW` (`LOOKUP_WINDOW_NAME`, `DESCRIPTION`, `TABLE_NAME`, `COLUMN_NAME`, `OTHERS_DISPLAY_COLUMNS`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('Travel Funding Agency', 'Travel Funding Agency', 'COI_TRAVEL_FUNDING_AGENCY_TYPE', 'FUNDING_AGENCY_CODE', 'DESCRIPTION', now(),  'admin');

INSERT INTO `LOOKUP_WINDOW` (`LOOKUP_WINDOW_NAME`, `DESCRIPTION`, `TABLE_NAME`, `COLUMN_NAME`, `OTHERS_DISPLAY_COLUMNS`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `DATA_TYPE_CODE`)
VALUES ('Traveller relationship type', 'Traveller relationship type', 'VALID_PERSON_ENTITY_REL_TYPE', 'VALID_PERS_ENTITY_REL_TYP_CODE', 'DESCRIPTION', now(),  'admin', '8');

INSERT INTO `COI_TRAVEL_FUNDING_TYPE` (`FUNDING_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`)
VALUES ('1', 'Internal', now(), 'admin', 'Y');

INSERT INTO `COI_TRAVEL_FUNDING_TYPE` (`FUNDING_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`)
VALUES ('2', 'External', now(), 'admin', 'Y');

INSERT INTO `coi_travel_funding_agency_type` (`FUNDING_AGENCY_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'NIH', now(), '10000000001', 'Y');

INSERT INTO `coi_travel_funding_agency_type` (`FUNDING_AGENCY_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Ministry of Defence', now(), '10000000001', 'Y');

INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('162', 'COI Annual disclosure Creation/Renewal Required', now(), 'quickstart');

INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES (43, 'TRAVEL_REIMBU_COST_EXCEEDED', '24', '0', 'Y', 'Travel Disclosure Reimbursed cost exceeded', now(), 'quickstart');

INSERT INTO `notification_type` (`NOTIFICATION_TYPE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `SUBJECT`, `MESSAGE`, `PROMPT_USER`, `IS_ACTIVE`, `CREATE_USER`, `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_SYSTEM_SPECIFIC`)
VALUES ('8044', '24', '0', 'Travel Disclosure Reimbursed cost limit exceeded', 'Action Required: COI Annual Disclosure create/revise.', '<p>Dear ,</p><p>Your Travel Disclosures Reimbursed cost limit is exceeded against engagement {TRAVEL_OTHER#ENGAGEMENT_NAME}. Please create or revise COI Annual Disclosure.</p><p>No. of Travels : {TRAVEL_OTHER#NO_OF_TRAVELS}</p><p>Total Reimbursed cost : {TRAVEL_OTHER#TOTAL_REIMBURSED_COST}</p><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>', 'N', 'Y', 'quickstart', now(), 'willsmith', now(), 'N');


INSERT INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('60', 'Engagement Person', now(), 'quickstart', 'Y');

INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID,RECIPIENT_PERSON_ID,ROLE_TYPE_CODE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES(8044,NULL,60,'quickstart',now(),'quickstart',now(),'TO','Engagement Person');

INSERT INTO notify_placeholder_header (NOTIFY_PLACEHOLDER_HEADER_ID,MODULE_CODE,SUB_MODULE_CODE,QUERY_DEFINITION,QUERY_TYPE,ELEMENT_NAME,ELEMENT_TYPE,IS_ACTIVE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER,UNIQUE_DISPLAY_NAME)
VALUES(12,24,0,null,'S','','S','Y','',now(),'quickstart','TRAVEL_OTHER');

INSERT INTO notify_placeholder_columns (NOTIFY_PLACEHOLDER_HEADER_ID,QUERY_COLUMN_NAME,LABEL_NAME,UPDATE_TIMESTAMP,UPDATE_USER,BASE_URL_ID,URL_PATH) VALUES
	 (12,'ENGAGEMENT_NAME','Travel Engagement Name',now(),'quickstart',NULL,NULL),
	 (12,'NO_OF_TRAVELS','No of Travels',now(),'quickstart',NULL,NULL),
	 (12,'TOTAL_REIMBURSED_COST','Total Reimbursed Cost',now(),'quickstart',NULL,NULL);

INSERT INTO `MQ_ROUTER_TRIGGER_CONFIGURATION` (`TRIGGER_TYPE`, `IS_ACTIVE`, `QUEUE_NAME`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('TRAVEL_REIMBU_COST_EXCEEDED', 'Y', 'Q_NOTIFICATION', 'Travel Disclosure Reimbursed cost exceeded', now(), 'quickstart');

INSERT INTO scheduler_job_info
(CRON_EXPRESSION, IS_CRON_JOB, JOB_CLASS, JOB_GROUP, JOB_NAME, REPEAT_TIME, DESCRIPTION, CRON_STATUS, UPDATE_USER, UPDATE_TIMESTAMP, IS_ACTIVE)
VALUES('0 0 0 * * ?', 'Y', 'com.polus.fibicomp.quartzscheduler.TravelDisclScheduler', 'coi', 'Travel Reminder Notification', NULL, 'This job is to sent reminders', 'SCHEDULED', 'admin', now(), 'Y');
