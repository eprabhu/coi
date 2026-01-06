INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('2645', 'GE2604', 'Compliance Details', 'Y', now(), 'admin');

INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-entity-compliance-details', 'Entity Compliance Details', '2645', 'GE2604', 'admin', now());

INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-GE-entity-type', 'GE entity type', '2645', 'GE2604', 'admin', now());
