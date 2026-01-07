INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('1', 'Active', now(), 'willsmith', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('11', 'Withdrawn', now(), 'willsmith', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('12', 'Inactive', now(), 'admin', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('13', 'Terminated', now(), 'admin', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('14', 'Expired', now(), 'willsmith', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('3', 'Pending', now(), 'admin', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('5', 'Closed', now(), 'admin', 'Y');
INSERT INTO coi_int_stage_award_status (STATUS_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('6', 'Hold', now(), 'admin', 'Y');

INSERT INTO RIGHTS (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE) 
VALUES ((SELECT A.ID FROM (SELECT MAX(RIGHT_ID) + 1 AS ID FROM RIGHTS) AS A), 'CONTRACT_ADMINISTRATOR', 'Contract administrator', 'quickstart', now(), 1);
