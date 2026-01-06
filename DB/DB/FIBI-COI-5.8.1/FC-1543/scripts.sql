INSERT IGNORE INTO `MESSAGE` (`MESSAGE_TYPE_CODE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATE_USER`) VALUES ('8035','OPA disclosure Renewal Required',UTC_TIMESTAMP(),'admin');

INSERT IGNORE INTO `NOTIFICATION_TYPE` (`NOTIFICATION_TYPE_ID`,`MODULE_CODE`,`SUB_MODULE_CODE`,`DESCRIPTION`,`SUBJECT`,`MESSAGE`,`PROMPT_USER`,`IS_ACTIVE`,`CREATE_USER`,`CREATE_TIMESTAMP`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`IS_SYSTEM_SPECIFIC`,`SHOW_TEMPLATE_IN_MODULE`,`SENT_TO_INITIATOR`) VALUES (8090,23,0,'OPA Disclosure Renewal Reminder Notification','Your OPA Disclosure will Expire in {COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE} days.','<p>Dear {OPA_DETAILS#REPORTER_NAME},</p><p>Your OPA disclosure will Expire in <strong>{OPA_OTHER#DAYS_LEFT_TO_EXPIRE}</strong> days. Please revise and submit it if needed.</p><p>Please find the details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status</strong>: {OPA_DETAILS#DISPOSITION_STATUS}</p><p><strong>Expiration Date:</strong> <span style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\">{OPA_DETAILS#EXPIRATION_DATE}</span></p><p>Please renew your annual disclosure as soon as possible.</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{OPA_URL#OPA_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p> </p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL);

INSERT INTO `NOTIFICATION_RECIPIENT` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, `CREATE_TIMESTAMP`, 
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8090 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        68 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'OPA Reporter' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `NOTIFICATION_RECIPIENT` 
    WHERE `NOTIFICATION_TYPE_ID` = 8090
      AND `ROLE_TYPE_CODE` = 68
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'OPA Reporter'
);

UPDATE `NOTIFICATION_TYPE` SET `SUBJECT` = 'Your COI Annual Disclosure will Expire in {COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE} days.\n', `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Your COI Annual disclosure will Expire in <strong>{COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE}</strong> days. Please revise and submit it if needed.</p><p>Please find the details below:</p><p><strong>Department</strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status</strong>: {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><strong>Expiration Date</strong>: {COI_DISCLOSURE#EXPIRATION_DATE}</p><p>Please renew your annual disclosure as soon as possible.</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p> </p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>' WHERE (`NOTIFICATION_TYPE_ID` = '8022');

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, 
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        20 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'DAYS_LEFT_TO_EXPIRE' AS QUERY_COLUMN_NAME,
        'No of Days for OPA Disclosure Expiration' AS LABEL_NAME,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 20
      AND `QUERY_COLUMN_NAME` = 'DAYS_LEFT_TO_EXPIRE'
);

UPDATE `REMINDER_NOTIFICATION` 
SET `PROCEDURE_NAME` = NULL 
WHERE `NOTIFICATION_TYPE_ID` = 8022;

INSERT IGNORE INTO `REMINDER_NOTIFICATION` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'OPA Disclosure reminder for Renewal',8090,1,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `REMINDER_NOTIFICATION` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'OPA Disclosure reminder for Renewal',8090,7,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `REMINDER_NOTIFICATION` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'OPA Disclosure reminder for Renewal',8090,30,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `REMINDER_NOTIFICATION` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'OPA Disclosure reminder for Renewal',8090,60,NULL,'Y','admin',NULL,NULL,NULL);

INSERT IGNORE INTO `notify_placeholder_header` (`NOTIFY_PLACEHOLDER_HEADER_ID`,`MODULE_CODE`,`SUB_MODULE_CODE`,`QUERY_DEFINITION`,`QUERY_TYPE`,`ELEMENT_NAME`,`ELEMENT_TYPE`,`IS_ACTIVE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATE_USER`,`UNIQUE_DISPLAY_NAME`) VALUES (26,8,0,NULL,NULL,NULL,'U','Y','Project Dashboard Url',UTC_TIMESTAMP(),'admin','PROJ_DASHBOARD_URL');

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, 
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        26 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'PROJ_DASHBOARD_URL' AS QUERY_COLUMN_NAME,
        'Project Dashboard Url' AS LABEL_NAME,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        1 AS BASE_URL_ID,
        '/project-dashboard' AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 26
      AND `QUERY_COLUMN_NAME` = 'PROJ_DASHBOARD_URL'
);
