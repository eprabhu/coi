ALTER TABLE `form_builder_section_component` 
ADD COLUMN `IS_MANDATORY` VARCHAR(1) NULL AFTER `UPDATE_USER`,
ADD COLUMN `VALIDATION_MESSAGE` VARCHAR(2000) NULL AFTER `IS_MANDATORY`,
ADD COLUMN `LABEL` VARCHAR(300) NULL AFTER `VALIDATION_MESSAGE`;

ALTER TABLE `entity` 
CHANGE COLUMN `ENTITY_NAME` `ENTITY_NAME` VARCHAR(500) NULL DEFAULT NULL ;

ALTER TABLE `entity_action_log` 
CHANGE COLUMN `DESCRIPTION` `DESCRIPTION` VARCHAR(600) NULL DEFAULT NULL ;

/*
update `form_builder_section_component` set IS_MANDATORY = 'Y' where COMPONENT_TYPE_CODE = 'QN';
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in STAFF DATA RECORD' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '6');
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in STAFF CONSULTING OR RELATED PROFESSIONAL ACTIVITIES' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '9');
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in POTENTIAL CONFLICT OF INTEREST OR COMMITMENT' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '17');
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in OTHER ACTIVITIES' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '23');
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in FACULTY DATA RECORDS' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '25');
UPDATE `form_builder_section_component` SET `VALIDATION_MESSAGE` = 'Please complete the mandatory questionnaire in POTENTIAL CONFLICT OF INTEREST OR COMMITMENT' WHERE (`FORM_BUILDER_SECT_COMP_ID` = '31');
*/
