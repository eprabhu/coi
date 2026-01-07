
UPDATE `MESSAGE` SET `DESCRIPTION` = 'Entity has been modified. Please review the Engagement if required.' WHERE (`MESSAGE_TYPE_CODE` = '157');
UPDATE `entity_action_type` SET `MESSAGE` = 'Entity <b>confirmed</b> by <b>{ADMIN_NAME}</b>' WHERE (`ACTION_TYPE_CODE` = '4');

