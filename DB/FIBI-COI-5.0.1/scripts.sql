SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `form_section_component_type` 
ADD COLUMN `SORT_ORDER` INT NULL AFTER `UPDATE_USER`;

TRUNCATE form_section_component_type;

INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('AS', 'Autosuggest', 'N', now(), 'quickstart', '7');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('BR', 'Context Break', 'Y', now(), 'quickstart', '2');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('CB', 'Check Box', 'Y', now(), 'quickstart', '8');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('CE', 'Custom Element', 'N', now(), 'quickstart', '5');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('DE', 'Date', 'Y', now(), 'quickstart', '9');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('ES', 'Elastic Search', 'N', now(), 'quickstart', '10');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('HL', 'Horizontal Line', 'Y', now(), 'quickstart', '1');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('NE', 'Number', 'Y', now(), 'quickstart', '11');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('PE', 'Programmed Element', 'Y', now(), 'quickstart', '6');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('QN', 'Questionnaire', 'Y', now(), 'quickstart', '4');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('RB', 'Radio Button', 'Y', now(), 'quickstart', '12');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('RT', 'Rich Textbox', 'Y', now(), 'quickstart', '3');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('SD', 'System Dropdown', 'N', now(), 'quickstart', '13');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('SE', 'String', 'Y', now(), 'quickstart', '14');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('TE', 'Text', 'Y', now(), 'quickstart', '15');
INSERT INTO `form_section_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `SORT_ORDER`) VALUES ('UD', 'User Dropdown', 'N', now(), 'quickstart', '16');

UPDATE DYN_ELEMENT_CONFIG SET `HELP` = 'Please select the Risk', `UPDATE_TIMESTAMP` = now() WHERE (`ELEMENT_ID` = '1538');
UPDATE DYN_ELEMENT_CONFIG SET `HELP` = 'Please provide the reason for your risk change', `UPDATE_TIMESTAMP` = now() WHERE (`ELEMENT_ID` = '1539');
UPDATE DYN_ELEMENT_CONFIG SET `HELP` = 'Please select the Risk', `UPDATE_TIMESTAMP` = now() WHERE (`ELEMENT_ID` = '1542');
UPDATE DYN_ELEMENT_CONFIG SET `HELP` = 'Please provide the reason for your risk change', `UPDATE_TIMESTAMP` = now() WHERE (`ELEMENT_ID` = '1543');

SET FOREIGN_KEY_CHECKS=1;

INSERT INTO `coi_project_type` (`COI_PROJECT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2', 'Institute Proposal', 'Y', now(), 'quickstart');

ALTER TABLE `coi_project_type`
ADD COLUMN `BADGE_COLOR` VARCHAR(100) NULL AFTER `UPDATE_USER`;

UPDATE `coi_project_type` SET `BADGE_COLOR` = '#c9a742' WHERE (`COI_PROJECT_TYPE_CODE` = '1');
UPDATE `coi_project_type` SET `BADGE_COLOR` = '#148582' WHERE (`COI_PROJECT_TYPE_CODE` = '2');
UPDATE `coi_project_type` SET `BADGE_COLOR` = '#7d9e32' WHERE (`COI_PROJECT_TYPE_CODE` = '3');
UPDATE `COI_DISCLOSURE_FCOI_TYPE` SET `DESCRIPTION` = 'Development Proposal' WHERE (`FCOI_TYPE_CODE` = '2');

UPDATE DYN_ELEMENT_CONFIG SET HELP = 'Please select the conflict status' WHERE (ELEMENT_ID = '1540');
UPDATE DYN_ELEMENT_CONFIG SET HELP = 'Please provide the reason for your conflict status selection' WHERE (ELEMENT_ID = '1541');
