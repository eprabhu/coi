INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8027', 'OPA Disclosure Waiting for approval', now(), 'quickstart');

INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8028', 'OPA Disclosure Returned', now(), 'quickstart');

INSERT INTO `message` (`MESSAGE_TYPE_CODE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('8029', 'OPA disclosure submitted for review', now(), 'quickstart');

INSERT INTO `opa_action_log_type` (`ACTION_TYPE_CODE`, `MESSAGE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
VALUES ('20', 'Route Log review <b>completed</b>', 'Route Log review completed', now(), 'quickstart');
