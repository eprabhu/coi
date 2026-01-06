INSERT INTO `MESSAGE` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('8026', 'A new version has been created for Entity as part of the D&B entity update. Please review the changes.', now(), 'quickstart');

INSERT INTO `ENTITY_ACTION_TYPE` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('23', 'Entity Modified as part of D&B entity updates by the System', 'Entity Modified(Refresh version) by system', now(), 'quickstart');

INSERT INTO `ENTITY_ACTION_TYPE` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('24', 'Entity Confirmed by the System', 'Entity verified(Refresh version) by system', now(), 'quickstart');

INSERT INTO `MQ_ROUTER_TRIGGER_CONFIGURATION` (`TRIGGER_TYPE`, `IS_ACTIVE`, `QUEUE_NAME`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('NOTIFY_DUNS_REFRESH_REPORT', 'Y', 'Q_NOTIFICATION', 'Duns Refresh Report send', now(), 'quickstart');

INSERT INTO `NOTIFY_PLACEHOLDER_COLUMNS` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8', 'DUNS_REFRESH_DETAILS', 'Duns Refresh Process Details', now(), 'quickstart');

INSERT INTO `NOTIFY_PLACEHOLDER_COLUMNS` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
VALUES ('9', 'ALL_ENTITIES_DASH_URL', 'All entities dashboard', now(), 'quickstart', '1', '/entity-dashboard');

INSERT INTO NOTIFICATION_TYPE(NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE,SENT_TO_INITIATOR)
VALUES (8061,26,0,'Duns Monitoring Report','Duns Refresh Updates','<p>Dear Admin,<br><br>The entities have been updated with D&amp;B data.<br><br>{GLOBAL_ENTITY_OTHER#DUNS_REFRESH_DETAILS}<br><br>Please follow <a href="{GLOBAL_ENTITY_URL#ALL_ENTITIES_DASH_URL}">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email.<br> </p>','N','Y','quickstart',now(),'quickstart',now(),'N',NULL,NULL);

INSERT INTO NOTIFICATION_RECIPIENT (NOTIFICATION_TYPE_ID,ROLE_TYPE_CODE,CREATE_TIMESTAMP,RECIPIENT_TYPE,RECIPIENT_NAME)
VALUES (8061,58,now(),'TO','Entity Admins');
