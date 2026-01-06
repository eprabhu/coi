
UPDATE entity_action_type SET MESSAGE = 'Entity marked as <b>Active</b> by <b>{ADMIN_NAME}</b>' WHERE (ACTION_TYPE_CODE = '5');
UPDATE entity_action_type SET MESSAGE = 'Entity marked as <b>Inactive</b> by <b>{ADMIN_NAME}</b>' WHERE (ACTION_TYPE_CODE = '6');
UPDATE entity_action_type SET MESSAGE = 'Entity marked as <b>Duplicate</b> by <b>{ADMIN_NAME}</b>' WHERE (ACTION_TYPE_CODE = '7');

-- ALTER TABLE custom_data_element_usage
-- ADD COLUMN SUB_SECTION_CODE VARCHAR(5) NULL DEFAULT NULL AFTER ORDER_NUMBER,
-- ADD COLUMN IS_REQ_ADVANCE_SEARCH VARCHAR(1) NULL DEFAULT 'N' AFTER SUB_SECTION_CODE;

-- ALTER TABLE custom_data_elements
-- ADD COLUMN IS_MULTI_SELECT_LOOKUP VARCHAR(1) NULL DEFAULT NULL AFTER custom_element_name,
-- ADD COLUMN HELP_DESCRIPTION TEXT NULL DEFAULT NULL AFTER IS_MULTI_SELECT_LOOKUP,
-- ADD COLUMN HELP_LINK VARCHAR(500) NULL DEFAULT NULL AFTER HELP_DESCRIPTION;

-- Cross check the above query(Existing Fibi-Base)

INSERT INTO dyn_section_config (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('GE2609', 'GE26', 'Entity Actions', 'Y', now(), 'admin');
INSERT INTO dyn_subsection_config (`SUB_SECTION_CODE`, `SECTION_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('2631', 'GE2609', 'Status Change Modal', 'Y', now(), 'admin');
INSERT INTO dyn_element_config (`ELEMENT_ID`, `UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `HELP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('1759', 'coi-entity-status-change-type', 'Entity Status Change Modal Type', '2631', 'GE2609', '', 'admin', now());
INSERT INTO dyn_element_config (`ELEMENT_ID`, `UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('1760', 'coi-entity-status-change-desc', 'Entity Status Change Modal Description', '2631', 'GE2609', 'admin', now());
INSERT INTO dyn_element_config (`ELEMENT_ID`, `UI_REFERENCE_ID`, `DESCRIPTION`, `SUB_SECTION_CODE`, `SECTION_CODE`, `UPDATE_USER`, `UPDATE_TIMESTAMP`) VALUES ('1761', 'coi-status-change-entity', 'Entity Status Change Modal Entity', '2631', 'GE2609', 'admin', now());

INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('2632', 'GE2609', 'Entity Verify Modal', 'Y', now(), 'willsmith');
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-entity-verify-modal', 'Entity Verify Modal', '2632', 'GE2609', 'You are about to verify the entity', 'admin', now());
