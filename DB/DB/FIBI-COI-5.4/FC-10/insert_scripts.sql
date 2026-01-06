INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('1', 'UPDATED_USER_FULL_NAME', 'Updated User full name', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('1', 'UPDATE_TIMESTAMP', 'Updated Timestamp', now(), 'quickstart');

INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('52', 'ENTITY_MODIFY_NOTIFY', '26', '0', 'Y', 'Entity Modify : Notify to Reporters', now(), 'quickstart');

INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('ENTITY_MODIFY_NOTIFY', 'Y', '26', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8', 'PERSON_ENTITY_ID', 'Engagement Id', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8', 'ENGAGEMENT_PERSON', 'Engagement Person Name', now(), 'quickstart');
INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8', 'PERSON_ENTITY_NUMBER', 'Engagement Number', now(), 'quickstart');

UPDATE `module_action_type` SET `DESCRIPTION` = 'Entity Modify' WHERE (`MODULE_ACTION_TYPE_ID` = '34');
UPDATE `module_action_type` SET `DESCRIPTION` = 'Entity Inactivate' WHERE (`MODULE_ACTION_TYPE_ID` = '35');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
VALUES ('9', 'ENGAGEMENT_URL', 'Engagement url', now(), 'quickstart', '1', '/entity-details/entity?personEntityId={GLOBAL_ENTITY_OTHER#PERSON_ENTITY_ID}&personEntityNumber={GLOBAL_ENTITY_OTHER#PERSON_ENTITY_NUMBER}');

INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE) VALUES (8052,26,0,'Entity Modification: Notify Engagement Reporters','Entity : {GLOBAL_ENTITY#PRIMARY_NAME} is Modified','<p>Dear User,</p><p>The following Entity has been Modified. Please take necessary action in your entity/disclosures.</p><p>Entity Name: {GLOBAL_ENTITY#PRIMARY_NAME}</p><p>Entity details : {GLOBAL_ENTITY#PRIMARY_ADDRESS_LINE_1} {GLOBAL_ENTITY#CITY} {GLOBAL_ENTITY#STATE} {GLOBAL_ENTITY#POST_CODE} {GLOBAL_ENTITY#COUNTRY_NAME}</p><p><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">Please follow</span><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><a href="{GLOBAL_ENTITY_URL#ENGAGEMENT_URL}"><span style="font-family:Arial, Helvetica, sans-serif;">this link</span></a><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL);
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER) VALUES (8052,52,now(),'quickstart');

INSERT INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('53', 'ENTITY_INACTIVATE_REP_NOTIFY', '26', '0', 'Y', 'Entity Inactivate : Notify to Reporters', now(), 'quickstart');

INSERT INTO `mq_router_action_configuration` (`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('ENTITY_INACTIVATE_REP_NOTIFY', 'Y', '26', 'Q_NOTIFICATION', '0', NOW(), 'quickstart');

INSERT INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE) VALUES (8053,26,0,'Entity Inactivation : Notify Reporters','Entity : {GLOBAL_ENTITY#PRIMARY_NAME} is Inactivated','<p>Dear user,</p><p>The following Entity has been inactivated. Please take necessary action in your entity/disclosures.</p><p>Entity Name: {GLOBAL_ENTITY#PRIMARY_NAME}</p><p>Entity details : {GLOBAL_ENTITY#PRIMARY_ADDRESS_LINE_1} {GLOBAL_ENTITY#CITY} {GLOBAL_ENTITY#STATE} {GLOBAL_ENTITY#POST_CODE} {GLOBAL_ENTITY#COUNTRY_NAME}</p><p><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">Please follow</span><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><a href="{GLOBAL_ENTITY_URL#ENGAGEMENT_URL}"><span style="font-family:Arial, Helvetica, sans-serif;">this link</span></a><span style="color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;"> </span><span style="color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;">to review the application.</span></p><p><span style="color:hsl(0,0%,0%);">Note: This is a system-generated email. Please do not reply to this email.</span></p>','N','Y','quickstart',now(),'',NULL,'N',NULL);

INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID,MODULE_ACTION_TYPE_ID,UPDATE_TIMESTAMP,UPDATE_USER)
VALUES (8053,53,NOW(), 'quickstart');

INSERT INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('6', 'PROJECT_TYPE', 'FCOI Project Type', now(), 'quickstart');
