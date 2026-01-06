SET SQL_SAFE_UPDATES = 0;
UPDATE person_entity_action_type SET MESSAGE = 'Engagement <b>activated</b>' WHERE ACTION_TYPE_CODE = 2;
UPDATE person_entity_action_type SET MESSAGE = 'Engagement <b>inactivated</b>' WHERE ACTION_TYPE_CODE = 3;
UPDATE person_entity_action_type SET MESSAGE = 'Engagement <b>modified</b>' WHERE ACTION_TYPE_CODE = 4;
UPDATE person_entity_action_type SET MESSAGE = 'Engagement <b>created</b>' WHERE ACTION_TYPE_CODE = 1;
UPDATE person_entity_action_type SET MESSAGE = 'Engagement <b>completed</b>' WHERE ACTION_TYPE_CODE = 7;

UPDATE person_entity_action_log SET DESCRIPTION = 'Engagement <b>created</b>' WHERE ACTION_TYPE_CODE = 1;
UPDATE person_entity_action_log SET DESCRIPTION = 'Engagement <b>completed</b>' WHERE ACTION_TYPE_CODE = 7;
UPDATE person_entity_action_log SET DESCRIPTION = 'Engagement <b>modified</b>' WHERE ACTION_TYPE_CODE = 4;
UPDATE person_entity_action_log SET DESCRIPTION = 'Engagement <b>inactivated</b>' WHERE ACTION_TYPE_CODE = 3;
UPDATE person_entity_action_log SET DESCRIPTION = 'Engagement <b>activated</b>' WHERE ACTION_TYPE_CODE = 2;

UPDATE coi_conflict_status_type SET DESCRIPTION = 'No Conflict without Engagement' WHERE CONFLICT_STATUS_CODE = 4;

UPDATE discl_component_type SET DESCRIPTION = 'Engagements' WHERE COMPONENT_TYPE_CODE = 5;
SET SQL_SAFE_UPDATES = 1;
