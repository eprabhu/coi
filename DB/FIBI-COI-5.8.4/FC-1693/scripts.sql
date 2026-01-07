
CREATE TABLE IF NOT EXISTS DECLARATION_REVIEW_STATUS_TYPE (
  REVIEW_STATUS_CODE varchar(3) NOT NULL,
  DESCRIPTION varchar(200) DEFAULT NULL,
  IS_ACTIVE varchar(1) DEFAULT 'Y',
  UPDATE_TIMESTAMP datetime DEFAULT NULL,
  UPDATE_USER varchar(60) DEFAULT NULL,
  SORT_ORDER int DEFAULT NULL,
  PRIMARY KEY (REVIEW_STATUS_CODE)
);

ANALYZE TABLE COI_DECLARATION;

-- Add ADMIN_GROUP_ID if it does not exist
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECLARATION'
          AND COLUMN_NAME = 'ADMIN_GROUP_ID'
    ),
    'DO 1',
    'ALTER TABLE `COI_DECLARATION` ADD COLUMN `ADMIN_GROUP_ID` INT NULL;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

-- Add ADMIN_PERSON_ID if it does not exist
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECLARATION'
          AND COLUMN_NAME = 'ADMIN_PERSON_ID'
    ),
    'DO 1',
    'ALTER TABLE `COI_DECLARATION` ADD COLUMN `ADMIN_PERSON_ID` VARCHAR(40) NULL;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

-- Add REVIEW_STATUS_CODE if it does not exist
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECLARATION'
          AND COLUMN_NAME = 'REVIEW_STATUS_CODE'
    ),
    'DO 1',
    'ALTER TABLE `COI_DECLARATION` ADD COLUMN `REVIEW_STATUS_CODE` VARCHAR(3) NULL;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

-- Add index if it does not exist
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECLARATION'
          AND INDEX_NAME = 'COI_DECLARATION_IDX3'
    ),
    'DO 1',
    'ALTER TABLE `COI_DECLARATION` ADD INDEX `COI_DECLARATION_IDX3` (`REVIEW_STATUS_CODE` ASC) VISIBLE;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

-- Add foreign key if it does not exist
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECLARATION'
          AND CONSTRAINT_NAME = 'COI_DECLARATION_FK3'
    ),
    'DO 1',
    'ALTER TABLE `COI_DECLARATION`
        ADD CONSTRAINT `COI_DECLARATION_FK3`
        FOREIGN KEY (`REVIEW_STATUS_CODE`)
        REFERENCES `DECLARATION_REVIEW_STATUS_TYPE`(`REVIEW_STATUS_CODE`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

ANALYZE TABLE COI_DECL_ACTION_LOG;

-- Add COMMENT column if not exists
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECL_ACTION_LOG'
          AND COLUMN_NAME = 'COMMENT'
    ),
    'DO 1;',
    'ALTER TABLE `COI_DECL_ACTION_LOG` ADD COLUMN `COMMENT` VARCHAR(4000) NULL;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

-- Add DECLARATION_NUMBER column if not exists
SET @SQL := IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'COI_DECL_ACTION_LOG'
          AND COLUMN_NAME = 'DECLARATION_NUMBER'
    ),
    'DO 1;',
    'ALTER TABLE `COI_DECL_ACTION_LOG` ADD COLUMN `DECLARATION_NUMBER` VARCHAR(20) NULL;'
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;



INSERT INTO `RIGHTS`
(`RIGHT_ID`, `RIGHT_NAME`, `DESCRIPTION`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RIGHTS_TYPE_CODE`)
SELECT COALESCE(MAX(RIGHT_ID), 0) + 1, 'MANAGE_MFTRP_DECLARATION', 'To maintain MFTRP(Declaration)', 'admin', UTC_TIMESTAMP(), '1'
FROM RIGHTS
WHERE NOT EXISTS (
    SELECT 1
    FROM RIGHTS
    WHERE RIGHT_NAME = 'MANAGE_MFTRP_DECLARATION'
);

UPDATE `COI_DECLARATION_STATUS` SET `DESCRIPTION` = 'Approved' WHERE (`DECLARATION_STATUS_CODE` = '2');
UPDATE `COI_DECLARATION_STATUS` SET `DESCRIPTION` = 'Rejected' WHERE (`DECLARATION_STATUS_CODE` = '3');


INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('1', 'Pending', 'Y', UTC_TIMESTAMP(), 'admin', '1');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('2', 'Submitted', 'Y', UTC_TIMESTAMP(), 'admin', '2');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('3', 'Review in progress', 'Y', UTC_TIMESTAMP(), 'admin', '3');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('4', 'Withdrawn', 'Y', UTC_TIMESTAMP(), 'admin', '4');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('5', 'Returned', 'Y', UTC_TIMESTAMP(), 'admin', '5');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('6', 'Review Completed', 'Y', UTC_TIMESTAMP(), 'admin', '6');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('7', 'Expired', 'Y', UTC_TIMESTAMP(), 'admin', '7');
INSERT IGNORE INTO `declaration_review_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`)
VALUES ('8', 'Review Not Required', 'Y', UTC_TIMESTAMP(), 'admin', '8');

INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('5', 'Declaration <b>withdrawn</b> by <b>{REPORTER}</b>', 'Withdrawn', 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('6', 'Declaration <b>returned</b> by <b>{ADMIN_NAME}</b>', 'Returned', 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('7', 'Primary Administrator <b>{CURRENT_ADMIN}</b> <b>assigned</b> by <b>{ADMIN_NAME}</b>', 'Assigned to admin /Admin Group', 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('8', 'Primary Administrator <b>{PREVIOUS_ADMIN}</b> <b>reassigned</b> to <b>{CURRENT_ADMIN}</b> by <b>{ADMIN_NAME}</b>', 'Re Assigned to admin /Admin Group', 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('9', 'Admin review <b>completed</b>', 'Admin Review Completed', 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'admin');


INSERT IGNORE INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8038', 'Declaration submitted for review', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8039', 'Declaration Returned', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8040', 'Declaration waiting for Administrator review', UTC_TIMESTAMP(), 'admin');


INSERT INTO notify_placeholder_header
(NOTIFY_PLACEHOLDER_HEADER_ID, MODULE_CODE, SUB_MODULE_CODE, QUERY_DEFINITION, QUERY_TYPE, ELEMENT_TYPE, IS_ACTIVE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER, UNIQUE_DISPLAY_NAME)
SELECT (SELECT MAX(NOTIFY_PLACEHOLDER_HEADER_ID) + 1 FROM notify_placeholder_header), '28', '0', 'GET_DECLARATION_DETAILS', 'P', 'P', 'Y', 'Declaration Placeholders', UTC_TIMESTAMP(), 'admin', 'DECLARATION_DETAIL'
WHERE NOT EXISTS (SELECT 1 FROM notify_placeholder_header WHERE UNIQUE_DISPLAY_NAME = 'DECLARATION_DETAIL');

INSERT INTO `notify_placeholder_columns`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT h.NOTIFY_PLACEHOLDER_HEADER_ID, 'DECLARATION_ID', 'Declaration Id', UTC_TIMESTAMP(), 'admin'
FROM notify_placeholder_header h
WHERE h.UNIQUE_DISPLAY_NAME = 'DECLARATION_DETAIL'
  AND NOT EXISTS (
      SELECT 1
      FROM notify_placeholder_columns c
      WHERE c.NOTIFY_PLACEHOLDER_HEADER_ID = h.NOTIFY_PLACEHOLDER_HEADER_ID
        AND c.QUERY_COLUMN_NAME = 'DECLARATION_ID'
  );
INSERT INTO `notify_placeholder_columns`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT h.NOTIFY_PLACEHOLDER_HEADER_ID, v.QUERY_COLUMN_NAME, v.LABEL_NAME, UTC_TIMESTAMP(), 'admin'
FROM notify_placeholder_header h
JOIN (SELECT 'DECLARATION_NUMBER' AS QUERY_COLUMN_NAME, 'Declaration Number' AS LABEL_NAME
      UNION ALL
      SELECT 'DECLARATION_TYPE', 'Declaration Type'
      UNION ALL
      SELECT 'DECLARATION_STATUS', 'Declaration Status'
      UNION ALL
      SELECT 'CERTIFICATION_DATE', 'Submission Date'
      UNION ALL
      SELECT 'EXPIRATION_DATE', 'Expiration Date'
      UNION ALL
      SELECT 'REVIEW_STATUS', 'Review Status'
      UNION ALL
      SELECT 'DEPARTMENT_NAME', 'Department Name'
      UNION ALL
      SELECT 'DEPARTMENT_NUMBER', 'Department Number'
      UNION ALL
      SELECT 'REPORTER_NAME', 'Reporter Name'
      UNION ALL
      SELECT 'ADMINISTRATOR_NAME', 'Administrator Name'
      UNION ALL
      SELECT 'UPDATED_USER_FULL_NAME', 'Update User Full Name') v
WHERE h.UNIQUE_DISPLAY_NAME = 'DECLARATION_DETAIL'
  AND NOT EXISTS (
      SELECT 1
      FROM notify_placeholder_columns c
      WHERE c.NOTIFY_PLACEHOLDER_HEADER_ID = h.NOTIFY_PLACEHOLDER_HEADER_ID
        AND c.QUERY_COLUMN_NAME = v.QUERY_COLUMN_NAME
  );

INSERT INTO `notify_placeholder_header`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `QUERY_TYPE`, `ELEMENT_TYPE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `UNIQUE_DISPLAY_NAME`)
SELECT (SELECT COALESCE(MAX(NOTIFY_PLACEHOLDER_HEADER_ID), 0) + 1 FROM notify_placeholder_header),
       '28', '0', 'S', 'S', 'Y', 'Declaration Static Placeholders', UTC_TIMESTAMP(), 'admin', 'DECLARATION_OTHER'
WHERE NOT EXISTS (
    SELECT 1
    FROM notify_placeholder_header
    WHERE UNIQUE_DISPLAY_NAME = 'DECLARATION_OTHER'
);

INSERT INTO `notify_placeholder_columns`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT h.NOTIFY_PLACEHOLDER_HEADER_ID, v.QUERY_COLUMN_NAME, v.LABEL_NAME, UTC_TIMESTAMP(), 'admin'
FROM notify_placeholder_header h
JOIN (
    SELECT 'WITHDRAWAL_REASON' AS QUERY_COLUMN_NAME, 'Withdraw Reason' AS LABEL_NAME
    UNION ALL
    SELECT 'WITHDRAWAL_DATE', 'Withdrawal Date'
    UNION ALL
    SELECT 'RETURN_REASON', 'Return Reason'
    UNION ALL
    SELECT 'ADMIN_ASSIGNED_BY', 'Administrator Assigned By'
    UNION ALL
    SELECT 'ADMIN_ASSIGNED_TO', 'Administrator Assigned To'
) v
WHERE h.UNIQUE_DISPLAY_NAME = 'DECLARATION_OTHER'
  AND NOT EXISTS (
      SELECT 1
      FROM notify_placeholder_columns c
      WHERE c.NOTIFY_PLACEHOLDER_HEADER_ID = h.NOTIFY_PLACEHOLDER_HEADER_ID
        AND c.QUERY_COLUMN_NAME = v.QUERY_COLUMN_NAME
  );

INSERT INTO `notify_placeholder_header`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `ELEMENT_TYPE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `UNIQUE_DISPLAY_NAME`)
SELECT (SELECT COALESCE(MAX(NOTIFY_PLACEHOLDER_HEADER_ID), 0) + 1 FROM notify_placeholder_header),
       '28', '0', 'U', 'Y', 'Declaration Urls', UTC_TIMESTAMP(), 'admin', 'DECLARATION_URL'
WHERE NOT EXISTS (
    SELECT 1
    FROM notify_placeholder_header
    WHERE UNIQUE_DISPLAY_NAME = 'DECLARATION_URL'
);

INSERT INTO `notify_placeholder_columns`
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT h.NOTIFY_PLACEHOLDER_HEADER_ID, 'DECLARATION_URL', 'Declaration Url', UTC_TIMESTAMP(), 'admin', 1, '/declaration/form?declarationId={DECLARATION_DETAIL#DECLARATION_ID}'
FROM notify_placeholder_header h
WHERE h.UNIQUE_DISPLAY_NAME = 'DECLARATION_URL'
  AND NOT EXISTS (
      SELECT 1
      FROM notify_placeholder_columns c
      WHERE c.NOTIFY_PLACEHOLDER_HEADER_ID = h.NOTIFY_PLACEHOLDER_HEADER_ID
        AND c.QUERY_COLUMN_NAME = 'DECLARATION_URL'
  );

INSERT INTO mq_router_action_configuration
(ACTION_TYPE, IS_ACTIVE, MODULE_CODE, QUEUE_NAME, SUB_MODULE_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT v.ACTION_TYPE, 'Y', '28', 'Q_NOTIFICATION', '0', UTC_TIMESTAMP(), 'admin'
FROM (
    SELECT 'DECLARATION_SUBMIT' AS ACTION_TYPE
    UNION ALL
    SELECT 'DECLARATION_RESUBMIT'
    UNION ALL
    SELECT 'DECLARATION_WITHDRAW'
    UNION ALL
    SELECT 'DECLARATION_RETURN'
    UNION ALL
    SELECT 'DECLARATION_ASSIGN_ADMIN'
    UNION ALL
    SELECT 'DECLARATION_REASSIGN_ADMIN'
    UNION ALL
    SELECT 'DECLARATION_ADMIN_REMOVE'
    UNION ALL
    SELECT 'DECLARATION_REVIEW_COMPLETED'
) v
WHERE NOT EXISTS (
    SELECT 1
    FROM mq_router_action_configuration m
    WHERE m.ACTION_TYPE = v.ACTION_TYPE
      AND m.MODULE_CODE = '28'
      AND m.SUB_MODULE_CODE = '0'
      AND m.QUEUE_NAME = 'Q_NOTIFICATION'
);


INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('87', 'DECLARATION_SUBMIT', '28', '0', 'Y', 'Declaration Submit', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('88', 'DECLARATION_RESUBMIT', '28', '0', 'Y', 'Declaration Resubmit', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('89', 'DECLARATION_WITHDRAW', '28', '0', 'Y', 'Declaration Withdraw', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('90', 'DECLARATION_RETURN', '28', '0', 'Y', 'Declaration Return', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('91', 'DECLARATION_ASSIGN_ADMIN', '28', '0', 'Y', 'Declaration Assign Admin', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('92', 'DECLARATION_REASSIGN_ADMIN', '28', '0', 'Y', 'Declaration Reassign Admin', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('93', 'DECLARATION_ADMIN_REMOVE', '28', '0', 'Y', 'Declaration Admin Remove', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `module_action_type` (`MODULE_ACTION_TYPE_ID`, `ACTION_TYPE`, `MODULE_CODE`, `SUB_MODULE_CODE`, `IS_ACTIVE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('94', 'DECLARATION_REVIEW_COMPLETED', '28', '0', 'Y', 'Declaration Admin Review Completed', UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('8066', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin', 'Y');
INSERT IGNORE INTO `person_role_type` (`ROLE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `IS_ACTIVE`)
VALUES ('8067', 'Declaration Primary Administrator', UTC_TIMESTAMP(), 'admin', 'Y');

INSERT IGNORE INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SHOW_TEMPLATE_IN_MODULE,SENT_TO_INITIATOR) VALUES
	 (8101,28,0,'Declaration Submit','Action required: Approval for Declaration  Submitted by {DECLARATION_DETAIL#REPORTER_NAME}','<p>Hello Admins,</p><p>A Declaration has been submitted for your review:</p><p><strong>Submitted By:</strong> {DECLARATION_DETAIL#REPORTER_NAME}</p><p><strong>Submission Date:</strong> {DECLARATION_DETAIL#CERTIFICATION_DATE}</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL),
	 (8102,28,0,'Declaration Withdraw','Recall of Declaration Submitted by {DECLARATION_DETAIL#REPORTER_NAME}.','<p>A Declaration was submitted by {DECLARATION_DETAIL#REPORTER_NAME} on {DECLARATION_DETAIL#CERTIFICATION_DATE} is Recalled for the following reason: <strong>“{DECLARATION_OTHER#WITHDRAWAL_REASON}”</strong></p><p><strong>Department</strong>: {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p>Please go to<strong> </strong><a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL),
	 (8103,28,0,'Declaration Resubmission','Action Required - Resubmitted Declaration','<p>Dear Declaration Admin,</p><p>Declaration was resubmitted by {DECLARATION_DETAIL#REPORTER_NAME} on <strong>{DECLARATION_DETAIL#CERTIFICATION_DATE} </strong>for your review.</p><p>Details are given below:</p><p><strong>Department </strong>: {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Declaration Status</strong>: {DECLARATION_DETAIL#DECLARATION_STATUS}</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL),
	 (8104,28,0,'Declaration Return','Action Required: Declaration Submitted by you has been returned by the admin {DECLARATION_DETAIL#ADMINISTRATOR_NAME}','<p>Dear {DECLARATION_DETAIL#REPORTER_NAME},</p><p>Your Declaration submitted on {DECLARATION_DETAIL#CERTIFICATION_DATE} has been returned for the following reason:<br><strong>“{DECLARATION_OTHER#RETURN_REASON}”</strong>.</p><p>Please take the necessary action as required.</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL),
	 (8105,28,0,'Declaration Assign Admin','Action required: You are assigned as an Administrator for the Declaration Submitted by {DECLARATION_DETAIL#REPORTER_NAME}','<p>Hello {DECLARATION_OTHER#ADMIN_ASSIGNED_TO},</p><p>Declaration Administrator {DECLARATION_OTHER#ADMIN_ASSIGNED_BY} assigned you as the Administrator of the Declaration submitted on {DECLARATION_DETAIL#CERTIFICATION_DATE} by {DECLARATION_DETAIL#REPORTER_NAME}. Please find the details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Declaration Status</strong>: {DECLARATION_DETAIL#REVIEW_STATUS}</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL),
	 (8106,28,0,'Declaration Reassign Admin: To notify previous Administrator','Review reassigned for Declaration submitted by {DECLARATION_DETAIL#REPORTER_NAME}','<p>Hello {DECLARATION_DETAIL#ADMINISTRATOR_NAME},</p><p>The Declaration  Administrator {DECLARATION_OTHER#ADMIN_ASSIGNED_BY} removed you as an Administrator for the Declaration submitted on {DECLARATION_DETAIL#CERTIFICATION_DATE} by {DECLARATION_DETAIL#REPORTER_NAME}.</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p>You are no longer responsible for reviewing this disclosure.</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'',NULL,'N',NULL,NULL),
	 (8107,28,0,'Declaration Reassign Admin: To newly assigned administrator',' Action required: You are assigned as an Administrator for the Declaration Submitted by {DECLARATION_DETAIL#REVIEWER_NAME}.','<p>Hello {DECLARATION_OTHER#ADMIN_ASSIGNED_TO},</p><p>Declaration Administrator {DECLARATION_OTHER#ADMIN_ASSIGNED_BY} assigned you as the Administrator of the Declaration submitted on {DECLARATION_DETAIL#CERTIFICATION_DATE} by {DECLARATION_DETAIL#REPORTER_NAME}. Please find the details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Declaration Status</strong>: {DECLARATION_DETAIL#REVIEW_STATUS}</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'',NULL,'N',NULL,NULL),
	 (8108,28,0,'Declaration Admin Review Completed(Approved/Rejected)','Your Declaration''s Admin Review Has Been Completed.','<p>Dear {DECLARATION_DETAIL#REPORTER_NAME},</p><p>Your Declaration submitted on <strong>{DECLARATION_DETAIL#CERTIFICATION_DATE}</strong> has been <strong>Review Completed </strong>by <strong>{DECLARATION_DETAIL#ADMINISTRATOR_NAME}</strong>.<br>Please find the key details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Expiration Date:</strong> {DECLARATION_DETAIL#EXPIRATION_DATE}</p><p><strong>Declaration Status:</strong> {DECLARATION_DETAIL#DECLARATION_STATUS}</p><p>Please go to <a href="{DECLARATION_URL#DECLARATION_URL}"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>','N','Y','admin',UTC_TIMESTAMP(),'admin',UTC_TIMESTAMP(),'N',NULL,NULL);

INSERT INTO notify_action_type_map (NOTIFICATION_TYPE_ID, MODULE_ACTION_TYPE_ID, UPDATE_TIMESTAMP, UPDATE_USER)
SELECT * FROM (
    SELECT 8101 AS NOTIFICATION_TYPE_ID, 87 AS MODULE_ACTION_TYPE_ID, UTC_TIMESTAMP() AS UPDATE_TIMESTAMP, 'admin' AS UPDATE_USER
    UNION ALL SELECT 8102, 89, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8103, 88, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8104, 90, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8105, 91, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8106, 92, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8107, 92, UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8108, 94, UTC_TIMESTAMP(), 'admin'
) AS tmp
WHERE NOT EXISTS (
    SELECT 1
    FROM notify_action_type_map m
    WHERE m.NOTIFICATION_TYPE_ID = tmp.NOTIFICATION_TYPE_ID
      AND m.MODULE_ACTION_TYPE_ID = tmp.MODULE_ACTION_TYPE_ID
);

INSERT INTO notification_recipient (NOTIFICATION_TYPE_ID, ROLE_TYPE_CODE, RECIPIENT_TYPE, RECIPIENT_NAME, CREATE_TIMESTAMP, CREATE_USER)
SELECT * FROM (
    SELECT 8101 AS NOTIFICATION_TYPE_ID, 8066 AS ROLE_TYPE_CODE, 'TO' AS RECIPIENT_TYPE, 'Declaration Administrators' AS RECIPIENT_NAME, UTC_TIMESTAMP() AS CREATE_TIMESTAMP, 'admin' AS CREATE_USER
    UNION ALL SELECT 8102, 8066, 'TO', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8103, 8066, 'TO', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8104, 72, 'TO', 'Declaration Reporter', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8105, 8067, 'TO', 'Declaration Primary Administrator', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8105, 8066, 'CC', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8106, 8066, 'CC', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8107, 8067, 'TO', 'Declaration Primary Administrator', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8107, 8066, 'CC', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8108, 72, 'TO', 'Declaration Reporter', UTC_TIMESTAMP(), 'admin'
    UNION ALL SELECT 8108, 8066, 'CC', 'Declaration Administrators', UTC_TIMESTAMP(), 'admin'
) AS tmp
WHERE NOT EXISTS (
    SELECT 1
    FROM notification_recipient r
    WHERE r.NOTIFICATION_TYPE_ID = tmp.NOTIFICATION_TYPE_ID
      AND r.ROLE_TYPE_CODE = tmp.ROLE_TYPE_CODE
);

SET SQL_SAFE_UPDATES= 0;
update notify_placeholder_columns set URL_PATH = '/declaration/form?declarationId={DECLARATION_DETAIL#DECLARATION_ID}' where QUERY_COLUMN_NAME = 'DECLARATION_URL';
SET SQL_SAFE_UPDATES= 1;

INSERT IGNORE INTO role (ROLE_ID,ROLE_NAME,DESCRIPTION,ROLE_TYPE_CODE,STATUS_FLAG,CREATE_TIMESTAMP,CREATE_USER,UPDATE_TIMESTAMP,UPDATE_USER) VALUES
	 (1384,'Declaration Administrator(MFTRP)','Declaration Administrator','1','Y',now(),'admin',now(),'admin');
