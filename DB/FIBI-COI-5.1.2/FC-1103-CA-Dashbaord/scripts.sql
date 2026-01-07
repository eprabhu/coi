INSERT INTO `discl_component_type` (`COMPONENT_TYPE_CODE`, `DESCRIPTION`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('12', 'CA Comments', 'Y', now(), 'quickstart');

INSERT INTO `ENTITY_ACTION_TYPE` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('20', 'Entity <b>modified & Confirmed</b> by <b>{ADMIN_NAME}</b>', 'Modify & Confirmation', now(), '10000000001');
INSERT INTO `ENTITY_ACTION_TYPE` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`) VALUES ('21', 'Entity <b>created</b> as part of corporate family generation by the <b>{ADMIN_NAME}</b>', 'Creation From Corp family', now(), '10000000001');
