INSERT INTO parameter (PARAMETER_NAME, VALUE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) 
VALUES ('ENGAGEMENT_FLOW_TYPE', 'REL_COMP', 'This is used to define the engagement flow type the system follows. Can have values REL_SUB_DIVISION, REL_SUMMARY, REL_COMP.', now(), 'quickstart');

INSERT INTO message (MESSAGE_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATE_USER) VALUES ('166', 'OPA disclosure Creation Required', now(), 'quickstart');
