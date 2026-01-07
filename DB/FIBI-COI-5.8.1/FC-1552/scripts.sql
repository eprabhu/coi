INSERT IGNORE INTO `reminder_notification` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'FCOI Legacy Disclosure reminder for Renewal',8092,1,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `reminder_notification` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'FCOI Legacy Disclosure reminder for Renewal',8092,7,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `reminder_notification` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'FCOI Legacy Disclosure reminder for Renewal',8092,30,NULL,'Y','admin',NULL,NULL,NULL);
INSERT IGNORE INTO `reminder_notification` (`REMINDER_NOTIFICATION_ID`,`REMINDER_NAME`,`NOTIFICATION_TYPE_ID`,`DAYS_TO_DUE_DATE`,`PROCEDURE_NAME`,`IS_ACTVE`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`PLACEHOLDER_VALUES`,`REMINDER_TYPE_FLAG`) VALUES ((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM REMINDER_NOTIFICATION ) AS A),'FCOI Legacy Disclosure reminder for Renewal',8092,60,NULL,'Y','admin',NULL,NULL,NULL);

INSERT IGNORE INTO `notification_type` (`NOTIFICATION_TYPE_ID`,`MODULE_CODE`,`SUB_MODULE_CODE`,`DESCRIPTION`,`SUBJECT`,`MESSAGE`,`PROMPT_USER`,`IS_ACTIVE`,`CREATE_USER`,`CREATE_TIMESTAMP`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`IS_SYSTEM_SPECIFIC`,`SHOW_TEMPLATE_IN_MODULE`,`SENT_TO_INITIATOR`) VALUES (8091,8,0,'Legacy Financial COI Disclosure Expired Notification','Your Legacy FCOI Disclosure Has Expired.','<p style=\"margin-left:0px;\"><strong>Dear </strong>{COI_DISCLOSURE#REPORTER_NAME},</p><p style=\"margin-left:0px;\"><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Your legacy disclosure has expired.</span></p><p style=\"margin-left:0px;\"><strong>Department: </strong>{COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p style=\"margin-left:0px;\"><strong>Certification Date:</strong> <span style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\">{COI_DISCLOSURE#CERTIFICATION_DATE}</span></p><p style=\"margin-left:0px;\"><strong>Expiration Date:</strong> <span style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\">{COI_DISCLOSURE#EXPIRATION_DATE}</span></p><p style=\"margin-left:0px;\"><strong>Disposition Status</strong>: {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p style=\"margin-left:0px;\"><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please </span><a href=\"{COI_HOME_PAGE_URL#HOME_PAGE_URL}\">Click this link</a><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\"> and create your disclosure in the latest COI application to stay compliant.</span></p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL);
INSERT IGNORE INTO `notification_type` (`NOTIFICATION_TYPE_ID`,`MODULE_CODE`,`SUB_MODULE_CODE`,`DESCRIPTION`,`SUBJECT`,`MESSAGE`,`PROMPT_USER`,`IS_ACTIVE`,`CREATE_USER`,`CREATE_TIMESTAMP`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`IS_SYSTEM_SPECIFIC`,`SHOW_TEMPLATE_IN_MODULE`,`SENT_TO_INITIATOR`) VALUES (8092,8,0,'Legacy Disclosure Renewal Reminder Notification','Your legacy disclosure will Expire in {COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE} days.','<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Your legacy disclosure is going to expire in <strong>{COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE}</strong> days. Please revise and submit it if needed.</p><p>Please find the details below:</p><p><strong>Department</strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status</strong>: {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><strong>Expiration Date</strong>: {COI_DISCLOSURE#EXPIRATION_DATE}</p><p>Please <a href=\"{COI_HOME_PAGE_URL#HOME_PAGE_URL}\">Click this link</a> and create your disclosure in the latest COI application before the expiry date.</p><p>Thank You.</p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, `CREATE_TIMESTAMP`, 
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8091 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        53 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Reporter' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8091
      AND `ROLE_TYPE_CODE` = 53
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'COI Reporter'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, `CREATE_TIMESTAMP`, 
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8091 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        54 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'COI Admin Group' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8091
      AND `ROLE_TYPE_CODE` = 54
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'COI Admin Group'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, `CREATE_TIMESTAMP`, 
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8092 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        53 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Reporter' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8092
      AND `ROLE_TYPE_CODE` = 53
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'COI Reporter'
);
