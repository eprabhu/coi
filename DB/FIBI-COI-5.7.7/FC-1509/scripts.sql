INSERT IGNORE INTO `NOTIFICATION_TYPE` (`NOTIFICATION_TYPE_ID`,`MODULE_CODE`,`SUB_MODULE_CODE`,`DESCRIPTION`,`SUBJECT`,`MESSAGE`,`PROMPT_USER`,`IS_ACTIVE`,`CREATE_USER`,`CREATE_TIMESTAMP`,`UPDATE_USER`,`UPDATE_TIMESTAMP`,`IS_SYSTEM_SPECIFIC`,`SHOW_TEMPLATE_IN_MODULE`,`SENT_TO_INITIATOR`) VALUES (8087,8,0,'FCOI Disclosure Review Location Assign without Reviewer.','Action required: FCOI disclosure Submitted by {COI_DISCLOSURE#REPORTER_NAME} waiting for review at {COI_DISCL_REVIEW#REVIEW_LOCATION}.','<p><span style=\"color:hsl(0,0%,0%);\">Hello Reviewer,</span></p><p><span style=\"color:hsl(0,0%,0%);\">On {COI_DISCL_REVIEW#REVIEW_ASSIGNED_DATE}, COI Administrator {COI_DISCLOSURE#ADMINISTRATOR_NAME} assigned you to review the FCOI Disclosure submitted on </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">{COI_DISCLOSURE#CERTIFICATION_DATE}</span><span style=\"color:hsl(0,0%,0%);\"> by {COI_DISCLOSURE#REPORTER_NAME}.</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Department</strong>: </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">{COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Disclosure Status</strong>: </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">{COI_DISCLOSURE#DISCLOSURE_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Status</strong>: {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,'N');

INSERT INTO `NOTIFICATION_RECIPIENT` 
(`NOTIFICATION_TYPE_ID`, `ROLE_TYPE_CODE`, `CREATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 8087, 56, UTC_TIMESTAMP(), 'TO', 'COI Primary Administrator'
) AS TMP
WHERE NOT EXISTS (
    SELECT 1 FROM `NOTIFICATION_RECIPIENT` 
    WHERE `NOTIFICATION_TYPE_ID` = 8087
      AND `ROLE_TYPE_CODE` = 56
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'COI Primary Administrator'
);


INSERT INTO `NOTIFICATION_RECIPIENT` 
(`NOTIFICATION_TYPE_ID`, `ROLE_TYPE_CODE`, `CREATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 8087, 52, UTC_TIMESTAMP(), 'CC', 'COI Administrators'
) AS TMP
WHERE NOT EXISTS (
    SELECT 1 FROM `NOTIFICATION_RECIPIENT` 
    WHERE `NOTIFICATION_TYPE_ID` = 8087
      AND `ROLE_TYPE_CODE` = 52
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'COI Administrators'
);

INSERT IGNORE INTO `MODULE_ACTION_TYPE` (`MODULE_ACTION_TYPE_ID`,`ACTION_TYPE`,`MODULE_CODE`,`SUB_MODULE_CODE`,`IS_ACTIVE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATE_USER`) VALUES (86,'FCOI_LOC_ASSIGNED_NO_REVIEWER',8,0,'Y','FCOI Review Location added without reviewer',UTC_TIMESTAMP(),'admin');

INSERT INTO `NOTIFY_ACTION_TYPE_MAP` 
(`NOTIFICATION_TYPE_ID`, `MODULE_ACTION_TYPE_ID`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT * FROM (
    SELECT 8087, 86, UTC_TIMESTAMP(), 'admin'
) AS TMP
WHERE NOT EXISTS (
    SELECT 1 FROM `NOTIFY_ACTION_TYPE_MAP` 
    WHERE `NOTIFICATION_TYPE_ID` = 8087
      AND `MODULE_ACTION_TYPE_ID` = 86
);

INSERT INTO `MQ_ROUTER_ACTION_CONFIGURATION` 
(`ACTION_TYPE`, `IS_ACTIVE`, `MODULE_CODE`, `QUEUE_NAME`, `SUB_MODULE_CODE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT * FROM (
    SELECT 'FCOI_LOC_ASSIGNED_NO_REVIEWER', 'Y', 8, 'Q_NOTIFICATION', 0, UTC_TIMESTAMP(), 'admin'
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `MQ_ROUTER_ACTION_CONFIGURATION` 
    WHERE `ACTION_TYPE` = 'FCOI_LOC_ASSIGNED_NO_REVIEWER'
      AND `MODULE_CODE` = 8
      AND `SUB_MODULE_CODE` = 0
);
