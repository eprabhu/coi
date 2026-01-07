
INSERT INTO `ENTITY_STATUS_TYPE` (`ENTITY_STATUS_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`) VALUES ('3', 'Modification in Prigress', 'Y', now(), 'quickstart');

INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('2639', 'GE2609', 'Entity Version Modal', 'Y', now(), 'willsmith');
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-entity-version-view', 'Entity Version Modal', '2639', 'GE2609', 'Entity Version Modal', 'admin', now());
