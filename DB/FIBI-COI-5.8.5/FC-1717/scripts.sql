-- Insert DECLARATION_REVIEW_APPROVED
INSERT INTO module_action_type (ACTION_TYPE, MODULE_CODE, SUB_MODULE_CODE, IS_ACTIVE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT 'DECLARATION_REVIEW_APPROVED', '28', '0', 'Y', 'Declaration Admin Review Approved', UTC_TIMESTAMP(), 'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM module_action_type
    WHERE ACTION_TYPE = 'DECLARATION_REVIEW_APPROVED'
      AND MODULE_CODE = '28'
      AND SUB_MODULE_CODE = '0'
);

-- Insert DECLARATION_REVIEW_REJECTED
INSERT INTO module_action_type (ACTION_TYPE, MODULE_CODE, SUB_MODULE_CODE, IS_ACTIVE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT 'DECLARATION_REVIEW_REJECTED', '28', '0', 'Y', 'Declaration Admin Review Rejected', UTC_TIMESTAMP(), 'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM module_action_type
    WHERE ACTION_TYPE = 'DECLARATION_REVIEW_REJECTED'
      AND MODULE_CODE = '28'
      AND SUB_MODULE_CODE = '0'
);

-- Insert DECLARATION_REVIEW_APPROVED
INSERT INTO mq_router_action_configuration (ACTION_TYPE, IS_ACTIVE, MODULE_CODE, QUEUE_NAME, SUB_MODULE_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT 'DECLARATION_REVIEW_APPROVED', 'Y', '28', 'Q_NOTIFICATION', '0', UTC_TIMESTAMP(), 'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM mq_router_action_configuration
    WHERE ACTION_TYPE = 'DECLARATION_REVIEW_APPROVED'
      AND MODULE_CODE = '28'
      AND SUB_MODULE_CODE = '0'
      AND QUEUE_NAME = 'Q_NOTIFICATION'
);

-- Insert DECLARATION_REVIEW_REJECTED
INSERT INTO mq_router_action_configuration (ACTION_TYPE, IS_ACTIVE, MODULE_CODE, QUEUE_NAME, SUB_MODULE_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT 'DECLARATION_REVIEW_REJECTED', 'Y', '28', 'Q_NOTIFICATION', '0', UTC_TIMESTAMP(), 'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM mq_router_action_configuration
    WHERE ACTION_TYPE = 'DECLARATION_REVIEW_REJECTED'
      AND MODULE_CODE = '28'
      AND SUB_MODULE_CODE = '0'
      AND QUEUE_NAME = 'Q_NOTIFICATION'
);

-- Insert notification types
INSERT IGNORE INTO `notification_type` (`NOTIFICATION_TYPE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `SUBJECT`, `MESSAGE`, `PROMPT_USER`, `IS_ACTIVE`, `CREATE_USER`, `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_SYSTEM_SPECIFIC`) VALUES ('8115', '28', '0', 'Declaration Admin Review Approved', 'Your Declaration\'s Admin Review Has Been Approved.', '<p>Dear {DECLARATION_DETAIL#REPORTER_NAME},</p><p>Your Declaration submitted on <strong>{DECLARATION_DETAIL#CERTIFICATION_DATE}</strong> has been <strong>Review Approved </strong>by <strong>{DECLARATION_DETAIL#ADMINISTRATOR_NAME}</strong>.<br>Please find the key details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Expiration Date:</strong> {DECLARATION_DETAIL#EXPIRATION_DATE}</p><p><strong>Declaration Status:</strong> {DECLARATION_DETAIL#DECLARATION_STATUS}</p><p>Please go to <a href=\"{DECLARATION_URL#DECLARATION_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', 'N', 'Y', 'admin', UTC_TIMESTAMP(), 'admin', UTC_TIMESTAMP(), 'N');
INSERT IGNORE INTO `notification_type` (`NOTIFICATION_TYPE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `SUBJECT`, `MESSAGE`, `PROMPT_USER`, `IS_ACTIVE`, `CREATE_USER`, `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_SYSTEM_SPECIFIC`) VALUES ('8116', '28', '0', 'Declaration Admin Review Rejected', 'Your Declaration\'s Admin Review Has Been Rejected.', '<p>Dear {DECLARATION_DETAIL#REPORTER_NAME},</p><p>Your Declaration submitted on <strong>{DECLARATION_DETAIL#CERTIFICATION_DATE}</strong> has been <strong>Review Rejected </strong>by <strong>{DECLARATION_DETAIL#ADMINISTRATOR_NAME}</strong>.<br>Please find the key details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Expiration Date:</strong> {DECLARATION_DETAIL#EXPIRATION_DATE}</p><p><strong>Declaration Status:</strong> {DECLARATION_DETAIL#DECLARATION_STATUS}</p><p>Please go to <a href=\"{DECLARATION_URL#DECLARATION_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>', 'N', 'Y', 'admin', UTC_TIMESTAMP(), 'admin', UTC_TIMESTAMP(), 'N');

-- Insert DECLARATION_REVIEW_APPROVED mapping
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID, MODULE_ACTION_TYPE_ID, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT '8115',
    (SELECT MODULE_ACTION_TYPE_ID FROM module_action_type WHERE ACTION_TYPE = 'DECLARATION_REVIEW_APPROVED'),
    UTC_TIMESTAMP(),
    'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notify_action_type_map nam
    JOIN module_action_type mat
      ON nam.MODULE_ACTION_TYPE_ID = mat.MODULE_ACTION_TYPE_ID
    WHERE nam.NOTIFICATION_TYPE_ID = '8115'
      AND mat.ACTION_TYPE = 'DECLARATION_REVIEW_APPROVED'
);

-- Insert DECLARATION_REVIEW_REJECTED mapping
INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID, MODULE_ACTION_TYPE_ID, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT '8116',
    (SELECT MODULE_ACTION_TYPE_ID FROM module_action_type WHERE ACTION_TYPE = 'DECLARATION_REVIEW_REJECTED'),
    UTC_TIMESTAMP(),
    'admin'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notify_action_type_map nam
    JOIN module_action_type mat
      ON nam.MODULE_ACTION_TYPE_ID = mat.MODULE_ACTION_TYPE_ID
    WHERE nam.NOTIFICATION_TYPE_ID = '8116'
      AND mat.ACTION_TYPE = 'DECLARATION_REVIEW_REJECTED'
);

-- Declaration Approved - TO (Reporter)
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID, ROLE_TYPE_CODE, CREATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
SELECT '8115', '72', UTC_DATE(), 'TO', 'Declaration Reporter'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notification_recipient
    WHERE NOTIFICATION_TYPE_ID = '8115'
      AND ROLE_TYPE_CODE = '72'
      AND RECIPIENT_TYPE = 'TO'
      AND RECIPIENT_NAME = 'Declaration Reporter'
);

-- Declaration Approved - CC (Administrators)
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID, ROLE_TYPE_CODE, CREATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
SELECT '8115', '8066', UTC_DATE(), 'CC', 'Declaration Administrators'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notification_recipient
    WHERE NOTIFICATION_TYPE_ID = '8115'
      AND ROLE_TYPE_CODE = '8066'
      AND RECIPIENT_TYPE = 'CC'
      AND RECIPIENT_NAME = 'Declaration Administrators'
);

-- Declaration Rejected - TO (Reporter)
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID, ROLE_TYPE_CODE, CREATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
SELECT '8116', '72', UTC_DATE(), 'TO', 'Declaration Reporter'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notification_recipient
    WHERE NOTIFICATION_TYPE_ID = '8116'
      AND ROLE_TYPE_CODE = '72'
      AND RECIPIENT_TYPE = 'TO'
      AND RECIPIENT_NAME = 'Declaration Reporter'
);

-- Declaration Rejected - CC (Administrators)
INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID, ROLE_TYPE_CODE, CREATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
SELECT '8116', '8066', UTC_DATE(), 'CC', 'Declaration Administrators'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM notification_recipient
    WHERE NOTIFICATION_TYPE_ID = '8116'
      AND ROLE_TYPE_CODE = '8066'
      AND RECIPIENT_TYPE = 'CC'
      AND RECIPIENT_NAME = 'Declaration Administrators'
);

-- Deactivate admin review complete notification type
UPDATE `notification_type` SET `IS_ACTIVE` = 'N' WHERE `NOTIFICATION_TYPE_ID` = '8108' AND `MODULE_CODE` = 28;
