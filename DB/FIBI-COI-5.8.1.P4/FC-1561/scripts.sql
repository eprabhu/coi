SET SQL_SAFE_UPDATES = 0;
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME}</p><p>Your COI annual disclosure submitted on {COI_DISCLOSURE#CERTIFICATION_DATE} is approved.</p><p>Details are given below:</p><p>Department : {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p>Disclosure Status: {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8003');
SET SQL_SAFE_UPDATES = 1;
INSERT INTO `mq_router_trigger_configuration` 
(`TRIGGER_TYPE`, `IS_ACTIVE`, `QUEUE_NAME`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT * FROM (
    SELECT 
        'NOTIFY_DISCLOSURE_CREATION' AS TRIGGER_TYPE,
        'Y' AS IS_ACTIVE,
        'Q_NOTIFICATION' AS QUEUE_NAME,
        'Create Award Disclosure or Fcoi Disclosure Notification' AS DESCRIPTION,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `mq_router_trigger_configuration` 
    WHERE `TRIGGER_TYPE` = 'NOTIFY_DISCLOSURE_CREATION'
);
