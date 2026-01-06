INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('36','FCOI Award Disclosure marked as void due to a new FCOI revision created','Award disclosure marked as void by revision',utc_timestamp(),'admin');
INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('37','FCOI Award Disclosure marked as void due to a new FCOI revision required based on engagement with an SFI','Award disclosure marked as void by an engagement',utc_timestamp(),'admin');
INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('38','FCOI Development Proposal disclosure marked as void due to the Proposal  Certification questionnaire response not meeting COI disclosure requirements.','PD disclosure marked as void based on questionnaire',utc_timestamp(),'admin');
INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('39','FCOI {DISCLOSURE_TYPE} disclosure marked as void due to the associated project being deactivated/closed','Project disclosure marked as void based on deactivate/close action',utc_timestamp(),'admin');
INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('40','FCOI {DISCLOSURE_TYPE} disclosure marked as void due to the key person being removed from the associated project','Project disclosure marked as void based on a key person removal',utc_timestamp(),'admin');
INSERT IGNORE INTO disclosure_action_type (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('41','FCOI {DISCLOSURE_TYPE} disclosure marked as void due to a change in the key person’s role','Project disclosure marked as void based on a key person\'s role change',utc_timestamp(),'admin');


INSERT INTO mq_router_trigger_configuration (TRIGGER_TYPE,IS_ACTIVE,QUEUE_NAME,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) SELECT 'NOTIFY_PROJECT_DISCLOSURE_MARKED_AS_VOID','Y','Q_NOTIFICATION','Project Disclosure marked as void',utc_timestamp(),'admin' 
FROM DUAL
WHERE NOT EXISTS (SELECT 1
					FROM mq_router_trigger_configuration
					WHERE TRIGGER_TYPE = 'NOTIFY_PROJECT_DISCLOSURE_MARKED_AS_VOID');

INSERT IGNORE INTO notification_type (NOTIFICATION_TYPE_ID,MODULE_CODE,SUB_MODULE_CODE,DESCRIPTION,SUBJECT,MESSAGE,PROMPT_USER,IS_ACTIVE,CREATE_USER,CREATE_TIMESTAMP,UPDATE_USER,UPDATE_TIMESTAMP,IS_SYSTEM_SPECIFIC,SENT_TO_INITIATOR)
	VALUES (8122,8,0,'Project Disclosure marked as void by fcoi revision','{COI_DISCL_OTHER#PROJECT_TYPE} Marked as Void','<p>Dear {COI_DISCL_OTHER#REPORTER_NAME},</p><p>Your pending {COI_DISCL_OTHER#PROJECT_TYPE}{COI_DISCL_OTHER#VOID_REASON}</p><p>The following FCOI {COI_DISCL_OTHER#PROJECT_TYPE} Disclosure(s) have been marked as void:</p>{COI_DISCL_OTHER#HTML_CONTENT}<p>Thank you.</p><p>Note: This is a system-generated email. Please do not reply to this message.</p>','N','Y','admin',utc_timestamp(),'admin',utc_timestamp(),'N','Y');

INSERT INTO notify_placeholder_columns (NOTIFY_PLACEHOLDER_HEADER_ID,QUERY_COLUMN_NAME,LABEL_NAME,UPDATE_TIMESTAMP,UPDATE_USER)	
SELECT 2,'VOID_REASON','Void Reason',utc_timestamp(),'admin'
FROM DUAL
WHERE NOT EXISTS
(SELECT 1
FROM notify_placeholder_columns
WHERE NOTIFY_PLACEHOLDER_HEADER_ID = 2
AND QUERY_COLUMN_NAME = 'VOID_REASON');
