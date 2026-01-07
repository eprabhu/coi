INSERT INTO disclosure_action_type (ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('29', 'Conflict Status <b>changed</b> from <b>{OLD}</b> to <b>{NEW}</b> by <b>{ADMIN_NAME}</b> ', 'Conflict status change', now(), 'quickstart');
INSERT INTO disclosure_action_type (ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('30', 'Conflict Status <b>updated</b> to <b>{NEW}</b> by <b>{REPORTER}</b> ', 'Adding Conflict Status', now(), 'quickstart');

INSERT INTO RIGHTS (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE) 
VALUES ((SELECT A.ID FROM (SELECT MAX(RIGHT_ID) + 1 AS ID FROM RIGHTS ) AS A), 'MANAGE_PROJECT_DISCLOSURE_OVERVIEW', 'To manage projects in COI application', 'quickstart', now(), '1');

INSERT INTO coi_project_comment_type (COMMENT_TYPE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATED_BY)
VALUES ('1', 'General', 'Y', now(), 'quickstart');

INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('1', 'In Progress', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('2', 'Approval In Progress', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('3', 'Returned', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('4', 'Approved', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('5', 'Submitted', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('6', 'Post-Submission Approval', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('7', 'Post-Submission Return', now(), 'quickstart', 'Y');
INSERT INTO coi_int_stage_dev_proposal_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('8', 'Recalled', now(), 'quickstart', 'Y');