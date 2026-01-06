UPDATE entity_status_type SET DESCRIPTION = 'Unconfirmed' WHERE (ENTITY_STATUS_TYPE_CODE = '2');
UPDATE entity_status_type SET DESCRIPTION = 'Confirmed' WHERE (ENTITY_STATUS_TYPE_CODE = '1');

UPDATE entity_action_type SET MESSAGE = 'Entity <b>created without DUNS</b> by the system and marked as <b>Unconfirmed</b>.', DESCRIPTION = 'Created without DUNS and unconfirmed' WHERE (ACTION_TYPE_CODE = '16');
UPDATE entity_action_type SET MESSAGE = 'Entity <b>created using DUNS {DUNS_NUMBER}</b> by the system and marked as <b>Unconfirmed</b>.', DESCRIPTION = 'Created using DUNS and unconfirmed' WHERE (ACTION_TYPE_CODE = '17');
UPDATE entity_action_type SET MESSAGE = 'Entity <b>created without DUNS</b> by the system and marked as <b>Confirmed</b>.', DESCRIPTION = 'Created without DUNS and confirmed' WHERE (ACTION_TYPE_CODE = '18');
UPDATE entity_action_type SET MESSAGE = 'Entity <b>created using DUNS {DUNS_NUMBER}</b> by the system and marked as <b>Confirmed</b>.', DESCRIPTION = 'Created using DUNS and confirmed' WHERE (ACTION_TYPE_CODE = '19');
UPDATE entity_action_type SET MESSAGE = 'Entity <b>Confirmed</b> by <b>{ADMIN_NAME}</b>', DESCRIPTION = 'Confirmation' WHERE (ACTION_TYPE_CODE = '4');
UPDATE entity_action_type SET MESSAGE = 'Entity <b>modified & Confirmed</b> by <b>{ADMIN_NAME}</b>' WHERE (ACTION_TYPE_CODE = '20');

UPDATE message SET DESCRIPTION = 'Entity Confirmation required' WHERE (MESSAGE_TYPE_CODE = '158');
