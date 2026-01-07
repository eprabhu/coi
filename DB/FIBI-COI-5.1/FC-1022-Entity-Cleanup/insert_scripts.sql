

INSERT INTO `entity_stage_batch_source_type` (`SRC_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Sponsor', now(), '10000000001', 'Y');
INSERT INTO `entity_stage_batch_source_type` (`SRC_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Organization', now(), '10000000001', 'Y');

INSERT INTO `ENTITY_STAGE_REVIEW_STATUS_TYPE` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Pending', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_REVIEW_STATUS_TYPE` (`REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Completed', now(), '10000000001', 'Y');

INSERT INTO `ENTITY_STAGE_BATCH_STATUS_TYPE` (`BATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Initialized', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_BATCH_STATUS_TYPE` (`BATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Cleanup In Progress', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_BATCH_STATUS_TYPE` (`BATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('3', 'Completed', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_BATCH_STATUS_TYPE` (`BATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('4', 'Aborted', now(), '10000000001', 'Y');


INSERT INTO `ENTITY_STAGE_ADMIN_ACTION_TYPE` (`ADMIN_ACTION_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Marked As Duplicate', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_ADMIN_ACTION_TYPE` (`ADMIN_ACTION_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Source Selected', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_ADMIN_ACTION_TYPE` (`ADMIN_ACTION_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('3', 'Created entity with duns', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_ADMIN_ACTION_TYPE` (`ADMIN_ACTION_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('4', 'Marked As Exclude', now(), '10000000001', 'Y');
INSERT INTO `ENTITY_STAGE_ADMIN_ACTION_TYPE` (`ADMIN_ACTION_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('5', 'Created entity without duns', now(), '10000000001', 'Y');

INSERT INTO `entity_stage_admin_review_type` (`ADMIN_REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Pending', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_admin_review_type` (`ADMIN_REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Completed', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_admin_review_type` (`ADMIN_REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('3', 'Error In Process', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_admin_review_type` (`ADMIN_REVIEW_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('4', 'Processing', now(), 'quickstart', 'Y');


INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('1', 'Yet To Match', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('2', 'Duplicate', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('3', 'Exact Match', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('4', 'Multiple Matches', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('5', 'No Match', now(), 'quickstart', 'Y');
INSERT INTO `entity_stage_match_status_type` (`MATCH_STATUS_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATED_BY`, `IS_ACTIVE`) VALUES ('6', 'Error In Match', now(), 'quickstart', 'Y');

INSERT INTO `parameter` (`PARAMETER_NAME`, `VALUE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('ENTITY_MIGRATION_PHASE', 'Y', 'If value is Y import entity section will be enabled', now(), 'quickstart');

INSERT INTO `ENTITY_ADDRESS_TYPE` (`ADDRESS_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('3', 'Sponsor Address', 'Y', now(), '10000000001');
INSERT INTO `ENTITY_ADDRESS_TYPE` (`ADDRESS_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('4', 'Organization Address', 'Y', now(), '10000000001');


INSERT INTO `dyn_section_config` (`SECTION_CODE`, `MODULE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('GE2608', 'GE26', 'Entity Batch', 'Y', now(), 'admin');

INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2627', 'GE2608', 'Batch Duplicate Step', 'Y', now(), 'admin');

INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2628', 'GE2608', 'System Duplicate Step', 'Y', now(), 'admin');

INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2629', 'GE2608', 'Duns Match Step', 'Y', now(), 'admin');

INSERT INTO `dyn_subsection_config` (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('2630', 'GE2608', 'Batch Bulk Action', 'Y', now(), 'admin');


INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-dup-rev-slider-hdr', 'Batch Duplicate Review Slider Header', '2627', 'GE2608', 'Duplicate records found in batch', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-dup-rev-link-conf', 'Batch Duplicate Review Link Confirmation', '2627', 'GE2608', 'The entity will be marked as a duplicate and linked', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-dup-rev-excl-conf', 'Batch Duplicate Review Exclude Confirmation', '2627', 'GE2608', 'The entity will be marked as a duplicate and excluded', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-db-dup-rev-slider-hdr', 'Entity Database Duplicate Review Slider Header', '2628', 'GE2608', 'Duplicate records found in database', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-db-dup-rev-link-conf', 'Entity Database Duplicate Review Link Confirmation', '2628', 'GE2608', 'The entity will be linked as a duplicate in the database', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-db-dup-rev-excl-conf', 'Entity Database Duplicate Review Exclude Confirmation', '2628', 'GE2608', 'The entity will be excluded as a duplicate', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-duns-rev-slider-hdr', 'Entity DUNS Match Review Slider Header', '2629', 'GE2608', 'Select a DnB match for the entity', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-duns-no-conf', 'DUNS Match Without Confirmation', '2629', 'GE2608', 'The entity will be created without using a DnB match', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-duns-yes-conf', 'DUNS Match With Confirmation', '2629', 'GE2608', 'A DnB match will be used to create the entity', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-duns-excl-conf', 'DUNS Match Exclude Confirmation', '2629', 'GE2608', 'The entity will be excluded from creation', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-bulk-rev-no-duns-conf', 'Bulk Review Without DUNS Confirmation', '2630', 'GE2608', 'The selected entities will be created without a DnB match', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-bulk-rev-yes-duns-conf', 'Bulk Review With DUNS Confirmation', '2630', 'GE2608', 'The selected entities will be created using a DnB match', 'admin', now());

INSERT INTO `dyn_element_config` (`UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`)
VALUES ('coi-GE-bulk-rev-excl-conf', 'Bulk Review Exclude Confirmation', '2630', 'GE2608', 'The selected entities will be excluded from creation', 'admin', now());

INSERT INTO entity_stage_integration_status_type (`INTEGRATION_STATUS_CODE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATED_BY`,`IS_ACTIVE`) VALUES ('ERR','Error','2024-09-20 17:18:07','100000001','I');
INSERT INTO entity_stage_integration_status_type (`INTEGRATION_STATUS_CODE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATED_BY`,`IS_ACTIVE`) VALUES ('SCM','Successfully Matched','2024-09-20 17:18:07','100000001','I');
INSERT INTO entity_stage_integration_status_type (`INTEGRATION_STATUS_CODE`,`DESCRIPTION`,`UPDATE_TIMESTAMP`,`UPDATED_BY`,`IS_ACTIVE`) VALUES ('SUM','Successfully Unmatched','2024-09-20 17:18:07','100000001','I');
