SET SQL_SAFE_UPDATES = 0;

UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8004');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8005');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8006');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8010');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8011');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8012');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8013');
UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8087');

UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p><span style=\"color:hsl(0,0%,0%);\">Your FCOI annual disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> was returned for the following reason<strong> “{COI_DISCL_OTHER#RETURN_REASON}”.</strong></span></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8002');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello {COI_DISCL_OTHER#ADMIN_ASSIGNED_TO},</span></p><p><span style=\"color:hsl(0,0%,0%);\">The COI Administrator <strong>{COI_DISCL_OTHER#ADMIN_ASSIGNED_BY} </strong>assigned you as the Administrator of the FCOI Annual Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong>.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Details are given below:</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8004');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Dear {COI_DISCLOSURE#REPORTER_NAME},</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Your Project disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>was returned for the following reason <strong>“{COI_DISCL_OTHER#RETURN_REASON}”</strong>.</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Details are given below:</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Thank you.</span><br> </p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Note: This is a system-generated email. Please do not reply to this email.</span></p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8009');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {COI_DISCL_OTHER#ADMIN_ASSIGNED_TO},</p><p>COI Administrator<strong> {COI_DISCL_OTHER#ADMIN_ASSIGNED_BY} </strong>assigned you as the Administrator of the Project Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong>.</p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8010');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {PROJECT_DETAIL#PROJECT_PERSON_NAME},</p><p>You are required to complete a FCOI disclosure. If you have previously completed this task for the below-mentioned project, no further action is required.</p><p><strong>Project: {PROJECT_DETAIL#PROJECT_TYPE}: {PROJECT_DETAIL#PROJECT_MODULE_ITEM_KEY} - {PROJECT_DETAIL#PROJECT_TITLE}</strong></p><p><strong>Department: {PROJECT_DETAIL#DEPARTMENT_NUMBER} - {PROJECT_DETAIL#DEPARTMENT_NAME}</strong></p><p>Please log in to the COI system and submit the necessary disclosure at your earliest convenience.</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please find the list of awards by clicking </span><a href=\"{DASHBOARD_URL#MY_AWARDS_DASHBOARD_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a></p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8015');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Project disclosure for {COI_DISCLOSURE#PROJECT_TYPE} : {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}, has been created for you in the COI system. Please review and submit the disclosure at your earliest convenience.</p><p>If you have previously completed this task for the below-mentioned project, no further action is required.</p><p><strong>Department:</strong> {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Create Date:</strong> {COI_DISCLOSURE#CREATE_DATE}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><strong>COI Review Status:</strong> {COI_DISCLOSURE#REVIEW_STATUS}</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8055');
UPDATE `notification_type` SET `MESSAGE` = '<p style=\"margin-left:0px;\">Dear COI Admin</p><p style=\"margin-left:0px;\">All key personnel for <strong>{COI_DISCLOSURE#PROJECT_NUMBER}</strong> - <strong>{COI_DISCLOSURE#PROJECT_TITLE} </strong>have submitted their disclosures.</p><p style=\"margin-left:0px;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p style=\"margin-left:0px;\"><strong>Project </strong>: {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p style=\"margin-left:0px;\">Details are given below:</p><p style=\"margin-left:0px;\"><strong>Principal Investigator</strong> : {COI_DISCLOSURE#PRINCIPAL_INVESTIGATOR}</p><p style=\"margin-left:0px;\"><strong>Submission Status</strong> : {COI_DISCL_OTHER#PROJECT_SUBMISSION_STATUS}</p><p style=\"margin-left:0px;\"><strong>Overall Review Status</strong> : {COI_DISCL_OTHER#PROJECT_OVERALL_REVIEW_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{PROJ_DASHBOARD_URL#PROJ_DASHBOARD_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', `UPDATE_USER` = 'admin', `UPDATE_TIMESTAMP` = UTC_TIMESTAMP() WHERE (`NOTIFICATION_TYPE_ID` = '8059');


SET SQL_SAFE_UPDATES = 1;

DELETE FROM `notification_recipient` 
WHERE `NOTIFICATION_TYPE_ID` IN (8059,8055,8015,8010,8004,8002,8009);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8059 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        52 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8059
      AND `ROLE_TYPE_CODE` = 52
      AND `RECIPIENT_TYPE` = 'TO'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8002 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        53 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Reporter' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8002
      AND `ROLE_TYPE_CODE` = 53
      AND `RECIPIENT_TYPE` = 'TO'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8002 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        55 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'COI Reviewers' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8002
      AND `ROLE_TYPE_CODE` = 55
      AND `RECIPIENT_TYPE` = 'CC'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8004 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        56 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Primary Administrator' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8004
      AND `ROLE_TYPE_CODE` = 56
      AND `RECIPIENT_TYPE` = 'TO'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8009 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        53 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Reporter' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8009
      AND `ROLE_TYPE_CODE` = 53
      AND `RECIPIENT_TYPE` = 'TO'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8009 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        55 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'COI Reviewers' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8009
      AND `ROLE_TYPE_CODE` = 55
      AND `RECIPIENT_TYPE` = 'CC'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8010 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        56 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Primary Administrator' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8010
      AND `ROLE_TYPE_CODE` = 56
      AND `RECIPIENT_TYPE` = 'TO'
);
