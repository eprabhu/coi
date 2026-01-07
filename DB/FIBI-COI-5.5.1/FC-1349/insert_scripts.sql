INSERT INTO DYN_SECTION_CONFIG (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('COI805', 'COI8', 'Admin Dashboard', 'Y', NOW(), 'admin' );

INSERT INTO DYN_SUBSECTION_CONFIG (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('811', 'COI805', 'Admin Dashboard Assign Admin', 'Y', NOW(), 'admin' );

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('assign-admin-header','Admin Dashboard','811', 'COI805', 'You are about to assign admin', 'admin', NOW() );
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-review-assign-to-me', 'Admin Dashboard', '811', 'COI805', 'You will be assigned as the administrator for this disclosure.', 'admin', now());
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-admin-tab-select-all', 'Admin Dashboard', '811', 'COI805', 'Click here to select all disclosures for bulk approval, or use the checkbox against each disclosure for individual  approval', 'admin', now());
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-entity-industry-update','Entity Name','2603', 'GE2601', 'You are about to update industry details', 'admin', NOW() );
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('coi-entity-industry-add','Entity Name','2603', 'GE2601', 'You are about to add industry details', 'admin', NOW() );
