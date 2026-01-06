

DELETE FROM `notify_placeholder_columns` WHERE (`NOTIFY_PLACEHOLDER_HEADER_ID` = '4');
DELETE FROM `notify_placeholder_header` WHERE (`NOTIFY_PLACEHOLDER_HEADER_ID` = '4');

UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p> <p>We kindly request you to complete and submit your disclosure for the following:</p> <p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p> <p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#REVIEW_STATUS}</p> <p><br /><span >Please login to COI and access your disclosure at {APPLICATION_URL} to complete and submit your disclosure.</span></p> <p>&nbsp;</p>', `SHOW_TEMPLATE_IN_MODULE` = 'Y' WHERE (`NOTIFICATION_TYPE_ID` = '8014');

UPDATE DISCLOSURE_ACTION_TYPE SET MESSAGE = 'Revised Disclosure has been <b>amended</b> by <b>{REPORTER}</b>' WHERE (ACTION_TYPE_CODE = '28');

UPDATE coi_disclosure_fcoi_type SET DESCRIPTION = 'Project' WHERE (FCOI_TYPE_CODE = 2);

UPDATE `coi_disclosure_fcoi_type` SET `DESCRIPTION` = 'Initial' WHERE (`FCOI_TYPE_CODE` = '1');

ALTER TABLE COI_PROJECT_TYPE DROP COLUMN IS_ACTIVE;
INSERT INTO `coeus_sub_module` (`COEUS_SUB_MODULE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `REQUIRE_UNIQUE_QUESTIONNAIRE`, `IS_ACTIVE`) VALUES ('2601', '26', '1', 'Sponsor Questionnaire', now(), 'admin', 'N', 'Y');
INSERT INTO `coeus_sub_module` (`COEUS_SUB_MODULE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `REQUIRE_UNIQUE_QUESTIONNAIRE`, `IS_ACTIVE`) VALUES ('2602', '26', '2', 'Organization Questionnaire', now(), 'admin', 'N', 'Y');
INSERT INTO `coeus_sub_module` (`COEUS_SUB_MODULE_ID`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `REQUIRE_UNIQUE_QUESTIONNAIRE`, `IS_ACTIVE`) VALUES ('2603', '26', '3', 'Compliance Questionnaire', now(), 'admin', 'N', 'Y');

INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('2624', 'GE2602', 'Sponsor Questionnaire', 'Y', now(), 'admin');
INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('2625', 'GE2603', 'Subaward Organization Questionnaire', 'Y', now(), 'admin');
INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('2626', 'GE2604', 'Compliance Questionnaire', 'Y', now(), 'admin');

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('coi-sponsor-ques-head-2624', 'Entity Name', '2624', 'GE2602', 'entity sponsor questionnaire', 'admin', now());
INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('coi-sub-ques-head-2625', 'Entity Name', '2625', 'GE2603', 'entity organization questionnaire', 'admin', now());
INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('coi-compl-ques-head-2626', 'Entity Name', '2626', 'GE2604', 'entity sponsor questionnaire', 'admin', now());

ALTER TABLE COI_INT_STAGE_AWARD_PERSON 
ADD COLUMN DISCLOSURE_REQUIRED_FLAG VARCHAR(20) AFTER STATUS;

ALTER TABLE COI_INT_STAGE_AWARD 
ADD COLUMN DISCLOSURE_VALIDATION_FLAG VARCHAR(20) AFTER SRC_SYS_UPDATED_BY;