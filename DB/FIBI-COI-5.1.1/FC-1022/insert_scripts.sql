
INSERT INTO ENTITY_ACTION_TYPE (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('16','Entity <b>created</b> without DUNS by the system and marked as <b>unverified</b>.','Created without DUNS and unverified',now(),'quickstart');

INSERT INTO ENTITY_ACTION_TYPE (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('17','Entity <b>created</b> using DUNS <b>#{DUNS_NUMBER}</b> by the system and marked as <b>unverified</b>.','Created using DUNS and unverified',now(),'quickstart');

INSERT INTO ENTITY_ACTION_TYPE (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('18','Entity <b>created</b> without DUNS by the system and marked as <b>verified</b>.','Created without DUNS and verified',now(),'quickstart');

INSERT INTO ENTITY_ACTION_TYPE (ACTION_TYPE_CODE,MESSAGE,DESCRIPTION,UPDATE_TIMESTAMP,UPDATE_USER) VALUES ('19','Entity <b>created</b> using DUNS <b>#{DUNS_NUMBER}</b> by the system and marked as <b>verified</b>.','Created using DUNS and verified',now(),'quickstart');

INSERT INTO ENTITY_STAGE_ADMIN_ACTION_TYPE (ADMIN_ACTION_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE) VALUES ('6', 'Marked As Duplicate and Excluded', now(), '10000000001', 'Y');
