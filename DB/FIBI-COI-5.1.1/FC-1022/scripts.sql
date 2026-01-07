
ALTER TABLE ENTITY_STAGE_DETAILS
ADD COLUMN ORIGINATING_ID INT NULL;

UPDATE ENTITY_STAGE_ADMIN_ACTION_TYPE SET DESCRIPTION = 'Selected as Original' WHERE (ADMIN_ACTION_CODE = '2');
UPDATE entity_stage_admin_action_type SET DESCRIPTION = 'Marked as Exclude' WHERE (ADMIN_ACTION_CODE = '4');
UPDATE entity_stage_admin_action_type SET DESCRIPTION = 'Marked as Duplicate and Included' WHERE (ADMIN_ACTION_CODE = '1');
UPDATE entity_stage_admin_action_type SET DESCRIPTION = 'Marked as Duplicate and Excluded' WHERE (ADMIN_ACTION_CODE = '6');
UPDATE entity_stage_admin_action_type SET DESCRIPTION = 'Created entity with DUNS' WHERE (ADMIN_ACTION_CODE = '3');
UPDATE entity_stage_admin_action_type SET DESCRIPTION = 'Created entity without DUNS' WHERE (ADMIN_ACTION_CODE = '5');
