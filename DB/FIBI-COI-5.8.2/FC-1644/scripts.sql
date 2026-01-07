SET SQL_SAFE_UPDATES = 0;
UPDATE `notification_type` SET `MESSAGE` = '<p>Hi,</p><p>Your FCOI Travel Disclosure Reimbursed cost limit is exceeded against engagement <strong>{TRAVEL_OTHER#ENGAGEMENT_NAME}</strong>. Please create or revise FCOI Annual Disclosure.</p><p>Please find the details below:</p><p><strong>No. of Travels</strong>: {TRAVEL_OTHER#NO_OF_TRAVELS}</p><p><strong>Total Reimbursed cost</strong>: {TRAVEL_OTHER#TOTAL_REIMBURSED_COST}</p><p><strong>Department</strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date:</strong> {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please click <a href=\"{COI_HOME_PAGE_URL#HOME_PAGE_URL}\"><strong>this link</strong></a><strong> </strong>to view the details in the application.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', `UPDATE_USER` = 'admin',
    `UPDATE_TIMESTAMP` = UTC_TIMESTAMP()
WHERE `NOTIFICATION_TYPE_ID` = 8044;
SET SQL_SAFE_UPDATES = 1;

DELETE FROM notification_recipient WHERE NOTIFICATION_TYPE_ID = 8044;
INSERT INTO `notification_recipient` 
    (`NOTIFICATION_TYPE_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT 
    8044, 64, 'admin', UTC_TIMESTAMP(), 'admin', UTC_TIMESTAMP(), 'TO', 'Travel Reporter'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 
    FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8044 
      AND `ROLE_TYPE_CODE` = 64 
      AND `RECIPIENT_TYPE` = 'TO' 
      AND `RECIPIENT_NAME` = 'Travel Reporter'
);
