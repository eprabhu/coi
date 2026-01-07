INSERT INTO parameter (PARAMETER_NAME, VALUE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('IS_FINANCIAL_ENGAGEMENT_ONLY_FOR_DISCLOSURE', 'Y', 'To check if all engagements should be included in disclosures', now(), 'fibi_admin');

INSERT INTO parameter (PARAMETER_NAME, VALUE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('ALLOW_FCOI_WITHOUT_PROJECT', 'N', 'To create FCOI without projects', now(), 'fibi_admin');

INSERT INTO coi_conflict_status_type (CONFLICT_STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER, SORT_ORDER) 
VALUES ('5', 'No Conflict without Projects', 'Y', now(), 'quickstart', '5');
INSERT INTO coi_conflict_status_type (CONFLICT_STATUS_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER, SORT_ORDER) 
VALUES ('6', 'No Conflict Without Projects and Engagements', 'Y', now(), 'quickstart', '6');
