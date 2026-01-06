INSERT IGNORE INTO `COI_DECL_ACTION_LOG_TYPE` (`ACTION_TYPE_CODE`, `ACTION_MESSAGE`, `DESCRIPTION`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES ('10', 'Declaration has been marked as <b>void</b> by <b>{REPORTER}</b>', 'Marked as void', 'admin', utc_timestamp(), utc_timestamp(), 'admin');

INSERT IGNORE INTO `COI_DECLARATION_STATUS` (`DECLARATION_STATUS_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `CREATED_BY`, `CREATE_TIMESTAMP`, `UPDATED_BY`, `UPDATE_TIMESTAMP`)
VALUES ('4', 'Void', 'Y', 'admin', utc_timestamp(), 'admin', utc_timestamp());
