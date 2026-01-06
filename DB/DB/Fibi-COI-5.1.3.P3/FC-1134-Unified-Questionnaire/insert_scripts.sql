INSERT INTO `business_rule_variable` (`VARIABLE_NAME`, `MODULE_CODE`, `SUB_MODULE_CODE`, `DESCRIPTION`, `TABLE_NAME`, `COLUMN_NAME`, `SHOW_LOOKUP`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `LOOKUP_WINDOW_NAME`) VALUES ('Disclosure Type', '8', '801', 'Disclosure Type', 'PER_ENT_DISCL_TYPE_SELECTION', 'DISCLOSURE_TYPE_CODE', 'Y', now(), 'quickstart', 'COI_DISCLOSURE_TYPE_LOOKUP');

INSERT INTO `lookup_window` (`LOOKUP_WINDOW_NAME`, `DESCRIPTION`, `TABLE_NAME`, `COLUMN_NAME`, `OTHERS_DISPLAY_COLUMNS`, `UPDATE_TIMESTAMP`, `UPDATE_USER`, `DATA_TYPE_CODE`) VALUES ('COI_DISCLOSURE_TYPE_LOOKUP', 'Disclosure type dropdown', 'COI_DISCLOSURE_TYPE', 'DISCLOSURE_TYPE_CODE', 'DESCRIPTION', now(), 'quickstart', '8');

INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('163', 'COI Annual disclosure Creation Required', now(), 'quickstart');
INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('164', 'COI Annual disclosure Renewal Required', now(), 'quickstart');
INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('165', 'COI Annual disclosure Withdrawal Required', now(), 'quickstart');
INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('167', 'Travel disclosure Creation Required', now(), 'quickstart');
