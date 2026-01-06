set sql_safe_updates = 0;
UPDATE `custom_data_elements` SET `IS_MULTI_SELECT_LOOKUP` = 'N' WHERE (`DATA_TYPE` IN (8,9));

UPDATE QUEST_USAGE SET MODULE_SUB_ITEM_CODE = 0 WHERE MODULE_ITEM_CODE = 20 AND MODULE_SUB_ITEM_CODE <> 0;
UPDATE QUEST_ANSWER_HEADER SET MODULE_SUB_ITEM_CODE = 0 WHERE MODULE_ITEM_CODE = 20 AND MODULE_SUB_ITEM_CODE <> 0;

UPDATE QUEST_USAGE SET MODULE_SUB_ITEM_CODE = 0 WHERE MODULE_ITEM_CODE = 13 AND MODULE_SUB_ITEM_CODE <> 0;
UPDATE QUEST_ANSWER_HEADER SET MODULE_SUB_ITEM_CODE = 0 WHERE MODULE_ITEM_CODE = 13 AND MODULE_SUB_ITEM_CODE <> 0;


update NEGOTIATION_LOCATION set REVIEW_START_DATE = UPDATE_TIMESTAMP, CREATE_TIMESTAMP = UPDATE_TIMESTAMP where REVIEW_START_DATE is null and CREATE_TIMESTAMP is null;

UPDATE EXT_REVIEW_REVIEWERS SET EXT_REVIEW_REVIEWERS_STATUS_CODE = 6 WHERE EXT_REVIEW_REVIEWERS_STATUS_CODE IS NULL;

-- 4.6.2


-- Update Query

-- General

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'Please complete all mandatory fields, and as specified in the corresponding Call for Proposals document (where applicable).' WHERE SUB_SECTION_CODE = '301';

-- Attachment

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '313';

-- Organization Subsection

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '332';

-- project Team

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '340';

-- Area of Research

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '304';

-- key performance Indicator

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '334';

-- Budget

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '308';

-- Attachment

UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '313';

-- Add Key Personnel

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'List all Key Personnel (KU and External) involved in the proposal with a clearly defined role, as per the Role dropdown menu' WHERE SUB_SECTION_CODE = '302';

-- Current Pending

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'Include grants (both internal and external) awarded in the last 5 years, including those currently held or submitted for consideration. For completed grants, include only the last three (3) grants completed.' WHERE SUB_SECTION_CODE = '316';

-- Budget

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'Refer to Annex A of Research Grant Program Document for the list of non-fundable items.' WHERE SUB_SECTION_CODE = '343';

-- Special Review

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'Proposal Module Review Conducted for Quality purpose.' WHERE SUB_SECTION_CODE = '303';

-- General

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'Please complete all mandatory fields, and as specified in the corresponding Call for Proposals document (where applicable).' WHERE SUB_SECTION_CODE = '301';

-- Key Person

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'List all Key Personnel (KU and External) involved in the proposal with a clearly defined role, as per the Role dropdown menu' WHERE SUB_SECTION_CODE = '302';

-- Role

UPDATE DYN_SUBSECTION_CONFIG SET HELP = 'List the major technical work package elements essential to successful delivery of the proposal''s scope of work. Include anticipated output milestones (publications and/or patent filings). DO NOT include standard reporting deliverables (general progress; financials) in this list.' WHERE SUB_SECTION_CODE = '305';



-- AWARD

-- AWARD OVERVIEW
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '117';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '101';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '104';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '105';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '106';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '113';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '112';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '125';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '123';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '122';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '143';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '144';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '108';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '145';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '102';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '150';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '111';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '103';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '109';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '121';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '110';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '119';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '115';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '157';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '107';

-- API DATA UPDATED TO DBQUERY
-- Orcid :
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '158';
-- Scopus :
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '195';
-- Code table 
INSERT INTO CODE_TABLE_CONFIGURATION (TABLE_NAME, DISPLAY_NAME, CONTENT, GROUP_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, IS_LOG_ENABLED ) VALUES ('DYN_SUBSECTION_CONFIG', 'Sub Section Help Text', '{"group":"Configuration","codeTableName":" Sub Section Help Text","description":"List of all  Help Text for Sub Section.","databaseTableName":"DYN_SUBSECTION_CONFIG","fields":[{"columnName":"SUB_SECTION_CODE","displayName":"Sub Section Code","dataType":"String","isEditable":false,"length":5,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"SECTION_CODE","displayName":"Section Code","dataType":"String","isEditable":false,"length":6,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"PARENT_SUB_SECTION_CODE","displayName":"Parent Sub Section Code","dataType":"String","isEditable":false,"length":5,"canEmpty":true,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"DESCRIPTION","displayName":"Description","dataType":"String","isEditable":false,"length":200,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"HELP","displayName":"Help","dataType":"String","isEditable":true,"length":2000,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"INSTRUCTION","displayName":"Instruction","dataType":"String","isEditable":true,"length":2000,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"UPDATE_TIMESTAMP","displayName":"Update Timestamp","dataType":"Date","isEditable":false,"length":null,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":null,"defaultValue":null},{"columnName":"UPDATE_USER","displayName":"Update User","dataType":"String","isEditable":false,"length":60,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":null,"valueField":null,"isTransient":null,"values":null,"refColumnName":"PERSON#USER_NAME","defaultValue":null},{"columnName":"IS_ACTIVE","displayName":"IS ACTIVE","dataType":"String","isEditable":true,"length":1,"canEmpty":false,"visible":true,"valueChanged":null,"index":null,"filterType":"switch","refColumnName":null,"defaultValue":null}],"primaryKey":["SUB_SECTION_CODE"],"dependency":[],"actions":"U"}', 'Configuration', 'List of all  sub section help text.', 'quickstart', now(), 'N');

-- KU changes



-- personnel Attachments

INSERT INTO DYN_SUBSECTION_CONFIG (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER, HELP) VALUES ('356', 'DP305', 'Personnel Attachments', 'Y', now(), 'admin', 'Please attach personnel documents if/as specified in the Grant Call.');

-- Proposal Attachments

UPDATE DYN_SUBSECTION_CONFIG SET DESCRIPTION = 'Proposal Attachments', HELP = 'Please attach proposal documents if/as specified in the Grant Call.' WHERE SUB_SECTION_CODE = '313';

-- Employee

UPDATE DYN_ELEMENT_CONFIG SET HELP = 'Begin typing in box to search KU employee name, and select name from drop-down menu.', INSTRUCTION = NULL WHERE ELEMENT_ID = '68';

-- ROLES

UPDATE DYN_ELEMENT_CONFIG SET HELP = 'Additional persons can be assigned to the proposal with different access rights, for the purposes of: proposal development (Proposal Aggregator), Proposal Budget Creator, View Proposal, and, Proposal Reviewer.' WHERE ELEMENT_ID = '175';

-- COMMENT

UPDATE DYN_ELEMENT_CONFIG SET HELP = 'Note that submitted Comments are viewable by administration staff, reviewers and each Faculty included on the proposal.' WHERE ELEMENT_ID = '173';

-- INSTITUTE PROPOSAL MODULE
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '201';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '202';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '204';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '205';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '206';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '212';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '209';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '210';
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL, INSTRUCTION = NULL WHERE SUB_SECTION_CODE = '226';


 
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE IN('1502','1501','1505','1503');


-- Duration
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '2003';

-- Watcher
UPDATE DYN_SUBSECTION_CONFIG SET HELP = NULL WHERE SUB_SECTION_CODE = '2004';


set sql_safe_updates = 1;

COMMIT;