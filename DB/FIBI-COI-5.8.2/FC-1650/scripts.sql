INSERT IGNORE INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`)
VALUES ('2', 'HTML_CONTENT', 'Custom html content');
INSERT IGNORE INTO `notify_placeholder_columns` (`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`)
VALUES ('20', 'HTML_CONTENT', 'Custom html content');

SET SQL_SAFE_UPDATES = 0;
UPDATE REMINDER_NOTIFICATION SET PROCEDURE_NAME = 'FCOI_DISCLOSRE_RENEWAL_REMINDER' WHERE NOTIFICATION_TYPE_ID = 8022;
UPDATE REMINDER_NOTIFICATION SET PROCEDURE_NAME = 'OPA_DISCL_RENEWAL_REMINDER' WHERE NOTIFICATION_TYPE_ID = 8090;
SET SQL_SAFE_UPDATES = 1;

INSERT IGNORE INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE, SENT_TO_INITIATOR)
VALUES(8097, 8, 0, 'FCOI Disclosure Expiring Summary Notification', 'ACTION REQUIRED: COI disclosures expire in {COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE} days on {COI_DISCL_OTHER#EXPIRATION_DATE}', '<p>Dear Admins,</p><p>The following people have disclosures which will expire in the <u>next {COI_DISCL_OTHER#DAYS_LEFT_TO_EXPIRE} days on {COI_DISCL_OTHER#EXPIRATION_DATE}.</u> Sponsors require that this information be updated annually. Failure to comply with this requirement will put their active awards which required a COI disclosure in <u>"restricted" status and future charges will not be allowed</u>. In some cases we are required to report this delay in disclosure to the sponsor. We would appreciate your help in getting completion of these disclosures from the Investigators as soon as possible. The Investigators, AO and RAS contract administrator for all of the affected awards have also been informed.<br><br>{COI_DISCL_OTHER#HTML_CONTENT}<br> </p>', 'N', 'Y', 'admin', now(), 'willsmith', now(), 'N', NULL, NULL);

INSERT IGNORE INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE, SENT_TO_INITIATOR)
VALUES(8098, 23, 0, 'OPA Disclosure Expiring Summary Notification', 'ACTION REQUIRED: OPA disclosures expire in {OPA_OTHER#DAYS_LEFT_TO_EXPIRE} days on {OPA_OTHER#EXPIRATION_DATE}', '<p>Dear Admins,</p><p>The following people have disclosures which will expire in the <u>next {OPA_OTHER#DAYS_LEFT_TO_EXPIRE} days on {OPA_OTHER#EXPIRATION_DATE}.</u> Sponsors require that this information be updated annually. Failure to comply with this requirement will put their active awards which required a OPA disclosure in <u>"restricted" status and future charges will not be allowed</u>. In some cases we are required to report this delay in disclosure to the sponsor. We would appreciate your help in getting completion of these disclosures from the Investigators as soon as possible. The Investigators, AO and RAS contract administrator for all of the affected awards have also been informed.<br><br>{OPA_OTHER#HTML_CONTENT}<br> </p>', 'N', 'Y', 'admin', now(), 'willsmith', now(), 'N', NULL, NULL);

INSERT IGNORE INTO reminder_notification(REMINDER_NOTIFICATION_ID, REMINDER_NAME, NOTIFICATION_TYPE_ID, DAYS_TO_DUE_DATE, PROCEDURE_NAME, IS_ACTVE, UPDATE_USER, UPDATE_TIMESTAMP, PLACEHOLDER_VALUES, REMINDER_TYPE_FLAG, JOB_GROUP)
VALUES((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM reminder_notification ) AS A), 'FCOI Disclosure Renewal Summary Reminder', 8097, 30, 'FCOI_DISCL_RENWAL_REMNDR_SUMRY', 'Y', 'willsmith', now(), 'HTML_CONTENT,EXPIRATION_DATE', NULL, 'coi');

INSERT IGNORE INTO reminder_notification(REMINDER_NOTIFICATION_ID, REMINDER_NAME, NOTIFICATION_TYPE_ID, DAYS_TO_DUE_DATE, PROCEDURE_NAME, IS_ACTVE, UPDATE_USER, UPDATE_TIMESTAMP, PLACEHOLDER_VALUES, REMINDER_TYPE_FLAG, JOB_GROUP)
VALUES((SELECT A.ID FROM (SELECT MAX(REMINDER_NOTIFICATION_ID) + 1 AS ID FROM reminder_notification ) AS A), 'OPA Disclosure Renewal Summary Reminder', 8098, 30, 'OPA_DISCL_RENWAL_REMNDR_SUMRY', 'Y', 'willsmith', now(), 'HTML_CONTENT,EXPIRATION_DATE', NULL, 'coi');

INSERT IGNORE INTO notification_recipient
(NOTIFICATION_TYPE_ID, RECIPIENT_PERSON_ID, ROLE_TYPE_CODE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
VALUES(8097, NULL, 52, 'admin', now(), NULL, NULL, 'TO', 'COI Administrators');

INSERT IGNORE INTO notification_recipient
(NOTIFICATION_TYPE_ID, RECIPIENT_PERSON_ID, ROLE_TYPE_CODE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, RECIPIENT_TYPE, RECIPIENT_NAME)
VALUES(8098, NULL, 69, 'admin', now(), NULL, NULL, 'TO', 'OPA Admin Group');

INSERT IGNORE INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE, SENT_TO_INITIATOR)
VALUES(8099, 8, 0, 'FCOI Disclosure Expiring Summary Monthly Notification', 'Conflict of Interest disclosures scheduled to expire in one month', '<p>Dear Admins,</p><p>The following individuals must update their Conflict of Interest disclosure before the expiration date below. Failure to comply with this requirement will put their active awards which required a COI disclosure in <u>"restricted" status and future charges will not be allowed</u>.</p><p><br>{COI_DISCL_OTHER#HTML_CONTENT}<br> </p>', 'N', 'Y', 'admin', now(), 'willsmith', now(), 'N', NULL, NULL);

INSERT IGNORE INTO notification_type
(NOTIFICATION_TYPE_ID, MODULE_CODE, SUB_MODULE_CODE, DESCRIPTION, SUBJECT, MESSAGE, PROMPT_USER, IS_ACTIVE, CREATE_USER, CREATE_TIMESTAMP, UPDATE_USER, UPDATE_TIMESTAMP, IS_SYSTEM_SPECIFIC, SHOW_TEMPLATE_IN_MODULE, SENT_TO_INITIATOR)
VALUES(8100, 23, 0, 'OPA Disclosure Expiring Summary Monthly Notification', 'OPA disclosures scheduled to expire in one month', '<p>Dear Admins,</p><p>The following individuals must update their OPA disclosure before the expiration date below. Failure to comply with this requirement will put their active awards which required a OPA disclosure in <u>"restricted" status and future charges will not be allowed</u>.<br><br>{OPA_OTHER#HTML_CONTENT}<br> </p>', 'N', 'Y', 'admin', now(), 'willsmith', now(), 'N', NULL, NULL);

INSERT IGNORE INTO `scheduler_job_info` (`CRON_EXPRESSION`, `IS_CRON_JOB`, `JOB_CLASS`, `JOB_GROUP`, `JOB_NAME`, `DESCRIPTION`, `CRON_STATUS`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_ACTIVE`) VALUES ('0 0 0 1 * ?', 'Y', 'com.polus.fibicomp.quartzscheduler.COIMonthlyScheduler', 'coi', 'COI Monthly Scheduler for notifications', 'This job is to run COI Monthly Scheduler for notifications', 'SCHEDULED', 'admin', now(), 'Y');

INSERT IGNORE INTO `scheduler_job_info` (`CRON_EXPRESSION`, `IS_CRON_JOB`, `JOB_CLASS`, `JOB_GROUP`, `JOB_NAME`, `DESCRIPTION`, `CRON_STATUS`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `IS_ACTIVE`) VALUES ('0 0 0 1 * ?', 'Y', 'com.polus.fibicomp.quartzscheduler.OPAMonthlyScheduler', 'coi', 'OPA Monthly Scheduler for notifications', 'This job is to run OPA Monthly Scheduler for notifications', 'SCHEDULED', 'admin', now(), 'Y');
