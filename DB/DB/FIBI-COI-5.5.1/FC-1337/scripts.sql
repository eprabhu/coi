UPDATE `entity_action_type` SET `MESSAGE` = 'Entity <b>created using DUNS {DUNS_NUMBER}</b> by <b>{ADMIN_NAME}</b> and marked as <b>Unconfirmed</b>.' WHERE (`ACTION_TYPE_CODE` = '17');
UPDATE `entity_action_type` SET `MESSAGE` = 'Entity <b>created using DUNS {DUNS_NUMBER}</b> by <b>{ADMIN_NAME}</b> and marked as <b>Confirmed</b>.' WHERE (`ACTION_TYPE_CODE` = '19');
UPDATE `entity_action_type` SET `MESSAGE` = 'Entity <b>created without DUNS</b> by <b>{ADMIN_NAME}</b> and marked as <b>Confirmed</b>.' WHERE (`ACTION_TYPE_CODE` = '18');
UPDATE `entity_action_type` SET `MESSAGE` = 'Entity <b>created without DUNS</b> by <b>{ADMIN_NAME}</b> and marked as <b>Unconfirmed</b>.' WHERE (`ACTION_TYPE_CODE` = '16');
