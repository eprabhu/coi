
INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('147', 'COI Annual disclosure submitted for review', now(), 'quickstart');
INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('148', 'COI Annual disclosure Returned for Revision', now(), 'quickstart');
INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('149', 'COI Annual disclosure waiting for Administrator review ', now(), 'quickstart');
INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('150', 'COI Annual disclosure waiting for review', now(), 'quickstart');
INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('151', 'COI Annual disclosure Renewal Required', now(), 'quickstart');

INSERT INTO scheduler_job_info (JOB_ID, CRON_EXPRESSION, IS_CRON_JOB, JOB_CLASS, JOB_GROUP, JOB_NAME, DESCRIPTION, CRON_STATUS, UPDATE_USER, UPDATE_TIMESTAMP, IS_ACTIVE) 
VALUES ((SELECT A.ID FROM (SELECT MAX(JOB_ID) + 1 AS ID FROM scheduler_job_info ) AS A), '0 0 0 * * ?', 'Y', 'com.polus.fibicomp.quartzscheduler.COIScheduler', 'coi', 'Disclosure expiration action list', 'This job is to update the action list of reporters with their expired FCOI disclosures', 'SCHEDULED', 'admin', now(), 'Y');
