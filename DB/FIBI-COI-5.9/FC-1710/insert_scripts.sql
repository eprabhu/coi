INSERT IGNORE INTO coeus_module (MODULE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER, IS_ACTIVE)
VALUES ('29', 'CMP', UTC_TIMESTAMP(), 'admin', 'Y');

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights), 'MAINTAIN_CMP', 'To Maintain CMPs in the system', 'admin', UTC_TIMESTAMP(), '1'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM rights WHERE RIGHT_NAME = 'MAINTAIN_CMP');

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights), 'VIEW_CMP', 'To View CMPs in the system', 'admin', UTC_TIMESTAMP(), '1'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM rights WHERE RIGHT_NAME = 'VIEW_CMP');

INSERT IGNORE INTO coi_management_plan_counter (COUNTER_NAME, COUNTER_VALUE)
VALUES ('COI_MANAGEMENT_PLAN_NUMBER_COUNTER', 1);

INSERT IGNORE INTO attachment_number_counter (counter_name, counter_value) 
VALUES ('CMP_ATTACHMENT_COUNTER', '1');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE 
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, STATUS_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
(1, 'CMP <b>created</b> by <b>{USER}</b>', 'New CMP', 1, UTC_TIMESTAMP(), 'admin'),
(2, 'CMP draft <b>started</b> by <b>{USER}</b>', 'Start Drafting', 2, UTC_TIMESTAMP(), 'admin'),
(3, 'CMP has been <b>voided</b> by <b>{USER}</b>', 'Void', 7, UTC_TIMESTAMP(), 'admin'),
(4, 'CMP draft <b>finalized</b> by <b>{USER}</b>', 'Finalize Draft Plan', 3, UTC_TIMESTAMP(), 'admin'),
(5, 'CMP plan <b>executed</b> and marked Active by <b>{USER}</b>', 'Execute Plan', 4, UTC_TIMESTAMP(), 'admin'),
(6, 'CMP has been <b>reopened</b> for editing by <b>{USER}</b>', 'Edit Plan', 2, UTC_TIMESTAMP(), 'admin'),
(7, 'CMP plan <b>closed</b> by <b>{USER}</b>', 'Close Plan', 5, UTC_TIMESTAMP(), 'admin'),
(8, 'CMP draft <b>closed</b> without execution by <b>{USER}</b>', 'Close Draft Plan', 6, UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('1', 'Inprogress', '#ffc107', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('2', 'Draft', '#ffc107', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('3', 'Final Draft', '#4CB57D', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('4', 'Fully executed and Active', '#4CB57D', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('5', 'Fully executed and Closed', '#997404', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('6', 'Not Executed and Closed', '#e80202', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_status_type` (`STATUS_CODE`, `DESCRIPTION`, `BADGE_COLOR`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('7', 'Void', '#636363', 'Y', utc_timestamp(), 'admin');

INSERT IGNORE INTO `COI_MANAGEMENT_PLAN_TYPE` (`CMP_TYPE_CODE`, `DESCRIPTION`, `UPDATED_TIMESTAMP`) VALUES ('1', 'MIT Person', UTC_TIMESTAMP());
INSERT IGNORE INTO `COI_MANAGEMENT_PLAN_TYPE` (`CMP_TYPE_CODE`, `DESCRIPTION`, `UPDATED_TIMESTAMP`) VALUES ('2', 'Non-MIT Person / Sub-award Personnel', UTC_TIMESTAMP());

INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('1', '1', '2', 'admin', UTC_TIMESTAMP(), '2');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('2', '1', '3', 'admin', UTC_TIMESTAMP(), '3');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('3', '2', '3', 'admin', UTC_TIMESTAMP(), '4');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('4', '3', '3', 'admin', UTC_TIMESTAMP(), '5');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('5', '2', '4', 'admin', UTC_TIMESTAMP(), '6');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('6', '3', '5', 'admin', UTC_TIMESTAMP(), '7');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('7', '3', '6', 'admin', UTC_TIMESTAMP(), '8');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('8', '4', '7', 'admin', UTC_TIMESTAMP(), '9');
INSERT IGNORE INTO `coi_mgmt_plan_available_action` (`AVAILABLE_ACTION_ID`, `STATUS_CODE`, `ACTION_TYPE_CODE`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `SORT_ORDER`) VALUES ('9', '3', '8', 'admin', UTC_TIMESTAMP(), '10');

INSERT IGNORE INTO `coi_management_plan_atta_type` (`ATTA_TYPE_CODE`, `DESCRIPTION`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `IS_ACTIVE`) VALUES ('1', 'Management Plan Document', 'admin', UTC_TIMESTAMP(), 'Y');
INSERT IGNORE INTO `coi_management_plan_atta_type` (`ATTA_TYPE_CODE`, `DESCRIPTION`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `IS_ACTIVE`) VALUES ('2', 'Revision Document', 'admin', UTC_TIMESTAMP(), 'Y');
INSERT IGNORE INTO `coi_management_plan_atta_type` (`ATTA_TYPE_CODE`, `DESCRIPTION`, `UPDATED_BY`, `UPDATE_TIMESTAMP`, `IS_ACTIVE`) VALUES ('3', 'Supporting Document', 'admin', UTC_TIMESTAMP(), 'Y');

INSERT IGNORE INTO `coi_cmp_type_project_type_rel` (`CMP_PROJ_TYPE_REL_ID`, `CMP_TYPE_CODE`, `COI_PROJECT_TYPE_CODE`, `IS_INCLUDED`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('1', '1', '1', 'Y', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_cmp_type_project_type_rel` (`CMP_PROJ_TYPE_REL_ID`, `CMP_TYPE_CODE`, `COI_PROJECT_TYPE_CODE`, `IS_INCLUDED`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('2', '1', '3', 'Y', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_cmp_type_project_type_rel` (`CMP_PROJ_TYPE_REL_ID`, `CMP_TYPE_CODE`, `COI_PROJECT_TYPE_CODE`, `IS_INCLUDED`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('3', '2', '1', 'Y', 'admin', UTC_TIMESTAMP());

INSERT IGNORE INTO `coi_cmp_review_location_type` (`LOCATION_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('1', '3rd Party Location', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_cmp_review_location_type` (`LOCATION_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('2', 'Department', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_cmp_review_location_type` (`LOCATION_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('3', 'Legal', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_cmp_review_location_type` (`LOCATION_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('4', 'HOD', 'Y', utc_timestamp(), 'admin');

INSERT IGNORE INTO `coi_cmp_reviewer_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('1', 'Assigned', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_cmp_reviewer_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('2', 'In Progress', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_cmp_reviewer_status_type` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('3', 'Completed', 'Y', utc_timestamp(), 'admin');

INSERT IGNORE INTO `DISCL_COMPONENT_TYPE` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('17', 'CMP General Comments', 'Y', UTC_TIMESTAMP(), 'admin');
INSERT IGNORE INTO `DISCL_COMPONENT_TYPE` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('18', 'CMP Section Comments', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights),
       'MAINTAIN_CMP_PRIVATE_COMMENTS',
       'To add and view private comments in CMP',
       'admin',
       UTC_TIMESTAMP(),
       '2'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM rights WHERE RIGHT_NAME = 'MAINTAIN_CMP_PRIVATE_COMMENTS'
);

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights),
       'VIEW_CMP_PRIVATE_COMMENTS',
       'To view private comments tagged in CMP',
       'admin',
       UTC_TIMESTAMP(),
       '2'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM rights WHERE RIGHT_NAME = 'VIEW_CMP_PRIVATE_COMMENTS'
);

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights),
       'VIEW_CMP_COMMENTS',
       'To view all public comments on CMP',
       'admin',
       UTC_TIMESTAMP(),
       '2'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM rights WHERE RIGHT_NAME = 'VIEW_CMP_COMMENTS'
);

INSERT INTO rights (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE)
SELECT (SELECT IFNULL(MAX(RIGHT_ID),0) + 1 FROM rights),
       'MAINTAIN_CMP_COMMENTS',
       'To create/edit/delete public comments on CMP',
       'admin',
       UTC_TIMESTAMP(),
       '2'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM rights WHERE RIGHT_NAME = 'MAINTAIN_CMP_COMMENTS'
);


INSERT IGNORE INTO `coi_management_plan_section` (`SECTION_ID`, `SECTION_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('1', 'Disclosure Summary', 'High-level disclosure summary.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_section` (`SECTION_ID`, `SECTION_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('2', 'Management Strategies', 'Strategies to manage conflicts.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_section` (`SECTION_ID`, `SECTION_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('3', 'Certification', 'Final review and sign-off.', 'admin', UTC_TIMESTAMP());

INSERT IGNORE INTO `coi_management_plan_template` (`TEMPLATE_ID`, `TEMPLATE_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('1', 'Summary Text Block', 'Free text field for disclosure summary.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_template` (`TEMPLATE_ID`, `TEMPLATE_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('2', 'Risk Rating Field', 'Select field capturing risk level.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_template` (`TEMPLATE_ID`, `TEMPLATE_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('3', 'Strategy Checklist', 'Checklist of management actions.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_template` (`TEMPLATE_ID`, `TEMPLATE_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('4', 'Certification Checkbox', 'Confirmation checkbox for reviewer.', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_management_plan_template` (`TEMPLATE_ID`, `TEMPLATE_NAME`, `DESCRIPTION`, `UPDATED_BY`, `UPDATED_TIMESTAMP`) VALUES ('5', 'Reviewer Notes', 'Internal comments from reviewer.', 'admin', UTC_TIMESTAMP());

INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('6', '1', '1', 'Generic Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('7', '2', '1', 'Generic Template', '2', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('8', '3', '2', 'Generic Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('9', '5', '2', 'Generic Template', '2', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('10', '4', '3', 'Generic Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('11', '1', '1', 'FCOI Extension Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('12', '5', '1', 'FCOI Extension Template', '2', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('13', '2', '2', 'FCOI Extension Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('14', '3', '2', 'FCOI Extension Template', '2', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('15', '4', '3', 'FCOI Extension Template', '1', 'admin', UTC_TIMESTAMP());
INSERT IGNORE INTO `coi_mgmt_plan_tmpl_sec_mapping` (`TMPL_SEC_MAPPING_ID`, `TEMPLATE_ID`, `SECTION_ID`, `NAME`, `SORT_ORDER`, `UPDATED_BY`, `UPDATE_TIMESTAMP`) VALUES ('16', '5', '3', 'FCOI Extension Template', '2', 'admin', UTC_TIMESTAMP());

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('9',
 'Review modified and assigned to <b>{REVIEWER_NAME}</b> at <b>{LOCATION}</b> with status <b>{REVIEW_STATUS}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Modified with Reviewer',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('10',
 'Review modified and assigned at <b>{LOCATION}</b> with status <b>{REVIEW_STATUS}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Modified without Reviewer',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('11',
 'Assigned review <b>started</b> by <b>{ADMIN_NAME}</b> at <b>{LOCATION}</b>',
 'CMP Review Started by Admin with Reviewer',
 UTC_TIMESTAMP(),
 'admin');
 
 INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('12',
 'Assigned review <b>started</b> at <b>{LOCATION}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Started by Admin without Reviewer',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('13',
 'Assigned review <b>started</b> by <b>{REVIEWER_NAME}</b> at <b>{LOCATION}</b>',
 'CMP Review Started by Reviewer',
 UTC_TIMESTAMP(),
 'admin');
 
 INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('14',
 'Assigned review <b>completed</b> at <b>{LOCATION}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Completed by Admin without Reviewer',
 UTC_TIMESTAMP(),
 'admin');


INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('15',
 'Assigned review by <b>{REVIEWER_NAME}</b> at <b>{LOCATION}</b> <b>completed</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Completed by Admin with Reviewer',
 UTC_TIMESTAMP(),
 'admin');


INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('16',
 'Assigned review <b>completed</b> by <b>{REVIEWER_NAME}</b> at <b>{LOCATION}</b>',
 'CMP Review Completed by Reviewer',
 UTC_TIMESTAMP(),
 'admin');
 
 INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('17',
 'Assigned review at <b>{LOCATION}</b> <b>deleted</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Deleted without Reviewer',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('18',
 'Assigned review by <b>{REVIEWER_NAME}</b> at <b>{LOCATION}</b> <b>deleted</b> by <b>{ADMIN_NAME}</b>',
 'CMP Review Deleted with Reviewer',
 UTC_TIMESTAMP(),
 'admin');
 
INSERT IGNORE INTO `coi_mgmt_plan_action_type` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('19', 'Review assigned to <b>{REVIEWER_NAME}</b> at  <b>{LOCATION}</b> with status <b>{REVIEW_STATUS}</b> by Administrator <b>{ADMIN_NAME}</b>', 'Review Added with Reviewer', utc_timestamp(), 'admin');
INSERT IGNORE INTO `coi_mgmt_plan_action_type` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('20', 'Review assigned at <b>{LOCATION}</b> with status <b>{REVIEW_STATUS}</b> by <b>{ADMIN_NAME}</b>', 'Review Added without Reviewer', utc_timestamp(), 'admin');

INSERT IGNORE INTO coi_cmp_review_reviewer_status_type (REVIEW_STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATED_BY) VALUES ('1', 'Assigned', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO coi_cmp_review_reviewer_status_type (REVIEW_STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATED_BY) VALUES ('2', 'In Progress', 'Y', utc_timestamp(), 'admin');
INSERT IGNORE INTO coi_cmp_review_reviewer_status_type (REVIEW_STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATED_BY) VALUES ('3', 'Completed', 'Y', utc_timestamp(), 'admin');

INSERT IGNORE INTO coi_mgmt_plan_status_type (STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATED_BY) VALUES ('8', 'Fully executed and Active - Extended', 'Y', utc_timestamp(), 'admin');

INSERT IGNORE INTO coi_mgmt_plan_action_type (ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, STATUS_CODE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('21', 'CMP plan <b>extended</b> by <b>{USER}</b>', 'Extend CMP Plan', '8', '2025-12-13 14:21:22', 'admin');

INSERT IGNORE INTO coi_mgmt_plan_available_action (AVAILABLE_ACTION_ID, STATUS_CODE, ACTION_TYPE_CODE, UPDATED_BY, UPDATE_TIMESTAMP, SORT_ORDER) VALUES ('10', '4', '21', 'admin', '2025-12-13 15:49:01', '9');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('22',
 'Section <b>{SECTION_NAME}</b> <b>added</b> to CMP by <b>{ADMIN_NAME}</b>',
 'CMP Section Added',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('23',
 'Section <b>{SECTION_NAME}</b> <b>deleted</b> from CMP by <b>{ADMIN_NAME}</b>',
 'CMP Section Deleted',
 UTC_TIMESTAMP(),
 'admin');
 
  INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('24',
 'CMP document <b>generated</b> by <b>{ADMIN_NAME}</b>',
 'CMP Document Generated',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('25',
 'CMP document <b>regenerated</b> by <b>{ADMIN_NAME}</b>',
 'CMP Document Regenerated',
 UTC_TIMESTAMP(),
 'admin');
 
  INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('26',
 'CMP document <b>uploaded</b> by <b>{ADMIN_NAME}</b>',
 'CMP Document Uploaded by User',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO COI_MGMT_PLAN_ACTION_TYPE
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('27',
 'CMP document <b>replaced</b> by <b>{ADMIN_NAME}</b>',
 'CMP Document Replaced by User',
 UTC_TIMESTAMP(),
 'admin');

INSERT IGNORE INTO discl_component_type (COMPONENT_TYPE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('19', 'CMP Section Component Comments', 'Y', utc_timestamp(), 'admin');

INSERT INTO discl_component_type (COMPONENT_TYPE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('20', 'CMP Recipients Comments', 'Y', utc_timestamp(), 'admin');

INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('28',
 'Task <b>{TASK_TYPE}</b> <b>created</b> and assigned to <b>{ASSIGNEE_NAME}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Created',
 UTC_TIMESTAMP(),
 'admin');
 
 INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('29',
 'Task <b>{TASK_TYPE}</b> <b>updated</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Updated',
 UTC_TIMESTAMP(),
 'admin');
INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('30',
 'Task <b>{TASK_TYPE}</b> <b>reassigned</b> to <b>{ASSIGNEE_NAME}</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Reassigned',
 UTC_TIMESTAMP(),
 'admin');
INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('31',
 'Task <b>{TASK_TYPE}</b> <b>started</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Started',
 UTC_TIMESTAMP(),
 'admin');
INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('32',
 'Task <b>{TASK_TYPE}</b> <b>completed</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Completed',
 UTC_TIMESTAMP(),
 'admin');
INSERT INTO coi_mgmt_plan_action_type
(ACTION_TYPE_CODE, MESSAGE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER)
VALUES
('33',
 'Task <b>{TASK_TYPE}</b> <b>deleted</b> by <b>{ADMIN_NAME}</b>',
 'CMP Task Deleted',
 UTC_TIMESTAMP(),
 'admin');

