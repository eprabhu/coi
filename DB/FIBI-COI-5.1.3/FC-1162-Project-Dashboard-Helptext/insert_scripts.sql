INSERT INTO dyn_section_config (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('COI804', 'COI8', 'Project dashboard', 'Y', now(), 'admin');

INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('807', 'COI804', 'Mandatory Confirmation Popup', 'Y', now(), 'admin');
INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('808', 'COI804', 'Mandatory History Slider', 'Y', now(), 'admin');
INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('809', 'COI804', 'Project DashBoard Comments', 'Y', now(), 'admin');
INSERT INTO dyn_subsection_config (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('810', 'COI804', 'Project DashBoard Notification', 'Y', now(), 'admin');

INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('disc-mandatory-popup-title', 'Project Dashboard', '807', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('disc-mandatory-popup-disc', 'Project Dashboard', '807', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('mandatory-history-slider-title', 'Project Dashboard', '808',   'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-comments-slider-title', 'Project Dashboard', '809', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-header', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-to-field', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-cc-field', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-bcc', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-template', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-subject', 'Project Dashboard', '810', 'COI804', 'admin', now());
INSERT INTO dyn_element_config (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP) VALUES ('project-notify-slider-msg-body', 'Project Dashboard', '810', 'COI804', 'admin', now());
