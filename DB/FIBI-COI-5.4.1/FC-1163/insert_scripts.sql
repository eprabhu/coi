
INSERT INTO NOTIFICATION_TYPE (NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC) 
VALUES ('8054', '8', '0', 'This notification will indicate that disclosure creation is required.', 'Action Required: Disclosure Needed for Your Engagement - {ENG_DIS_REQ#ENG_NAME}', '<p>Dear {ENG_DIS_REQ#REPORTER_NAME},</p><p>Based on the information provided for <b>{ENG_DIS_REQ#ENG_NAME}</b>, the following relationships have been identified: <b>{ENG_DIS_REQ#ENG_REL_TYPE}</b>.</p><p>To proceed, please create the necessary disclosures and associate the respective engagements with the disclosure. The required disclosures include: <b>{ENG_DIS_REQ#DISCLOSURE_TYPE}</b>.</p><p>Please log in to the COI system and submit the necessary disclosure at your earliest convenience.</p><p>For additional details regarding the engagements, please click the following link: <a href="{ENG_DIS_REQ#ENGAGEMENT_URL}" target="_blank">{ENG_DIS_REQ#ENGAGEMENT_URL}</a>.</p><p><i>Note: This is a system-generated email. Please do not reply to this email.</i></p>', 'N', 'Y', 'quickstart', now(), 'quickstart', now(), 'Y');

INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('54', 'ENG_DIS_CREATION', '8', '0', 'Y', 'Engagement Disclosure Creation', now(), 'willsmith');

INSERT INTO `MQ_ROUTER_ACTION_CONFIGURATION` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('ENG_DIS_CREATION', 'Y', '8', 'Q_NOTIFICATION', '0', now(), 'willsmith');

INSERT INTO `NOTIFY_ACTION_TYPE_MAP` (`NOTIFICATION_TYPE_ID`, `MODULE_ACTION_TYPE_ID`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) 
VALUES ('8054', '54', now(), 'willsmith');

INSERT INTO NOTIFY_PLACEHOLDER_HEADER (NOTIFY_PLACEHOLDER_HEADER_ID, MODULE_CODE, SUB_MODULE_CODE, QUERY_TYPE, ELEMENT_TYPE, IS_ACTIVE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER, UNIQUE_DISPLAY_NAME) 
VALUES ('17', '8', '0', 'S', 'S', 'Y', 'This notification will indicate that disclosure creation is required.', now(), 'quickstart', 'ENG_DIS_REQ');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'ENG_NAME', 'Engagement Name', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'REPORTER_NAME', 'Reporter Name', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'ENG_REL_TYPE', 'Engagement Relationship Type', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'DISCLOSURE_TYPE', 'Disclosure Type', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'PERSON_ENTITY_NUMBER', 'Engagement Number', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('17', 'PERSON_ENTITY_ID', 'Engagement Id', now(), 'quickstart');

INSERT INTO NOTIFY_PLACEHOLDER_COLUMNS (NOTIFY_PLACEHOLDER_HEADER_ID, QUERY_COLUMN_NAME, LABEL_NAME, UPDATE_TIMESTAMP, UPDATE_USER, BASE_URL_ID, URL_PATH) 
VALUES ('17', 'ENGAGEMENT_URL', 'Engagement URL', now(), 'quickstart', '1', '/entity-details/entity?personEntityId={ENG_DIS_REQ#PERSON_ENTITY_ID}&personEntityNumber={ENG_DIS_REQ#PERSON_ENTITY_NUMBER}');
