ALTER TABLE ENTITY_SPONSOR_INFO ADD COLUMN SPONSOR_NAME VARCHAR(500) NULL, ADD COLUMN TRANSLATED_NAME VARCHAR(500) NULL, ADD COLUMN DUNS_NUMBER VARCHAR(20) NULL, ADD COLUMN UEI_NUMBER VARCHAR(20) NULL, ADD COLUMN CAGE_NUMBER VARCHAR(20) NULL, ADD COLUMN PRIMARY_ADDRESS_LINE_1 VARCHAR(500) NULL, ADD COLUMN PRIMARY_ADDRESS_LINE_2 VARCHAR(500) NULL, ADD COLUMN CITY VARCHAR(30) NULL, ADD COLUMN STATE VARCHAR(30) NULL, ADD COLUMN POST_CODE VARCHAR(15) NULL, ADD COLUMN COUNTRY_CODE VARCHAR(3) NULL, ADD COLUMN EMAIL_ADDRESS VARCHAR(200) NULL, ADD COLUMN PHONE_NUMBER VARCHAR(15) NULL, ADD COLUMN IS_COPY VARCHAR(1) NULL, ADD COLUMN COMMENTS VARCHAR(500) NULL, ADD INDEX ENTITY_SPONSOR_INFO_IDX_4 (COUNTRY_CODE ASC) VISIBLE;

ALTER TABLE ENTITY_SPONSOR_INFO ADD CONSTRAINT ENTITY_SUB_ORG_INFO_FK_4 FOREIGN KEY (COUNTRY_CODE) REFERENCES COUNTRY (COUNTRY_CODE) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE ENTITY_SUB_ORG_INFO ADD COLUMN ORGANIZATION_NAME VARCHAR(500) NULL, ADD COLUMN DUNS_NUMBER VARCHAR(20) NULL, ADD COLUMN UEI_NUMBER VARCHAR(20) NULL, ADD COLUMN CAGE_NUMBER VARCHAR(20) NULL, ADD COLUMN PRIMARY_ADDRESS_LINE_1 VARCHAR(500) NULL, ADD COLUMN PRIMARY_ADDRESS_LINE_2 VARCHAR(500) NULL, ADD COLUMN CITY VARCHAR(30) NULL, ADD COLUMN STATE VARCHAR(30) NULL, ADD COLUMN POST_CODE VARCHAR(15) NULL, ADD COLUMN COUNTRY_CODE VARCHAR(3) NULL, ADD COLUMN EMAIL_ADDRESS VARCHAR(200) NULL, ADD COLUMN PHONE_NUMBER VARCHAR(15) NULL, ADD COLUMN HUMAN_SUB_ASSURANCE VARCHAR(50) NULL, ADD COLUMN ANIMAL_WELFARE_ASSURANCE VARCHAR(50) NULL, ADD COLUMN ANIMAL_ACCREDITATION VARCHAR(50) NULL, ADD COLUMN CONGRESSIONAL_DISTRICT VARCHAR(45) NULL, ADD COLUMN INCORPORATED_IN VARCHAR(30) NULL, ADD COLUMN INCORPORATED_DATE VARCHAR(10) NULL, ADD COLUMN NUMBER_OF_EMPLOYEES INT NULL, ADD COLUMN FEDERAL_EMPLOYER_ID VARCHAR(50) NULL, ADD COLUMN IS_COPY VARCHAR(1) NULL, ADD INDEX ENTITY_SUB_ORG_INFO_IDX_4 (COUNTRY_CODE ASC) VISIBLE;

ALTER TABLE ENTITY_SUB_ORG_INFO ADD CONSTRAINT ENTITY_SUB_ORG_INFO_FK_5 FOREIGN KEY (COUNTRY_CODE) REFERENCES COUNTRY (COUNTRY_CODE) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE ENTITY_STAGE_DETAILS ADD COLUMN SRC_COMMENTS VARCHAR(50) NULL;

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_USER, UPDATE_TIMESTAMP) 
VALUES 
    ('coi-entity-sponsor-copy-data','Entity Sponsor Details Copy','2609', 'GE2602', 'Select the checkbox to overwrite the following sponsor details with the corresponding entity details: Sponsor Name, Country, Sponsor Address, Phone Number, Email Address, DUNS Number, UEI Number, and CAGE Number.', 'admin', NOW()),
    ('coi-entity-sponsor-name','Entity Sponsor Details Copy','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-country','Entity Sponsor Details Country','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-address1','Entity Sponsor Details Address 1','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-address2','Entity Sponsor Details Address 2','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-city','Entity Sponsor Details City','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-state','Entity Sponsor Details State','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-postCode','Entity Sponsor Details Postcode','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-phone','Entity Sponsor Details Phone Number','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-email','Entity Sponsor Details Email','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-trans-name','Entity Sponsor Details Translated Name','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-duns','Entity Sponsor Details DUNS Number','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-uei','Entity Sponsor Details UEI Number','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-cage','Entity Sponsor Details CAGE Number','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-comments','Entity Sponsor Details Comments','2609', 'GE2602', '', 'admin', NOW()),
    ('coi-entity-sponsor-conf-modal','Entity Sponsor Details Copy Confirm Modal','2609', 'GE2602', '', 'admin', NOW() ),
    ('coi-entity-org-copy-data','Entity Sub-Award Organization Details Copy','2612', 'GE2603', 'Select the checkbox to overwrite the following organization details with the corresponding entity details: Organization Name, Country, Organization Address,  DUNS Number, UEI Number, CAGE Number, Human Sub Assurance, Animal Welfare Assurance, AAALAC (Animal Accreditation), Phone Number, Incorporation Date, Incorporation In, Congressional District, Federal Employer ID and Number of Employees.', 'admin', NOW() ),
    ('coi-entity-org-name','Entity Sub-Award Organization Details Name','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-country','Entity Sub-Award Organization Details Country','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-address1','Entity Sub-Award Organization Details Address 1','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-address2','Entity Sub-Award Organization Details Address 2','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-city','Entity Sub-Award Organization Details City','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-state','Entity Sub-Award Organization Details State','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-postCode','Entity Sub-Award Organization Details PostCode','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-duns','Entity Sub-Award Organization Details DUNS Number','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-uei','Entity Sub-Award Organization Details UEI Number','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-cage','Entity Sub-Award Organization Details CAGE Number','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-human-assure','Entity Sub-Award Organization Details Human Sub Assurance','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-animal-assure','Entity Sub-Award Organization Details Animal Welfare Assurance','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-aaalac','Entity Sub-Award Organization Details AAALAC (Animal Accreditation)','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-phone','Entity Sub-Award Organization Details Phone Number','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-corp-date','Entity Sub-Award Organization Details Incorporation Date','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-corp-in','Entity Sub-Award Organization Details Incorporation In','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-cong-dist','Entity Sub-Award Organization Details Congressional District','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-fed-emp-id','Entity Sub-Award Organization Details Federal Employer ID','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-emp-no','Entity Sub-Award Organization Details >Number of Employees','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-entity-org-conf-modal','Entity Sub-Award Organization Details Copy Confirm Modal','2612', 'GE2603', '', 'admin', NOW() ),
    ('coi-GE-verify-basic-info','Entity Verify Overview Basic Details Validation Information','2632', 'GE2609', 'Entity basic details are considered complete only when all mandatory fields in the Entity Overview section are filled.', 'admin', NOW() ),
    ('coi-GE-verify-sp-info','Entity Verify Sponsor Details Validation Information','2632', 'GE2609', 'Sponsor details are considered complete only when Sponsor Name and Sponsor Type are filled.', 'admin', NOW() ),
    ('coi-GE-verify-sp-addr-info','Entity Verify Sponsor Address Details Validation Information','2632', 'GE2609', 'Sponsor address is considered complete when Country, Address Line 1, City, State, and Zip Code are filled for entities from the US and Canada. For all other countries, the address is considered complete when Country, Address Line 1, and City are filled.', 'admin', NOW() ),
    ('coi-GE-verify-org-info','Entity Verify Sub-Award Organization Details Validation Information','2632', 'GE2609', 'Organization details are considered complete only when Organization Name, Organization Type and Organization Risk are filled.', 'admin', NOW() ),
    ('coi-GE-verify-org-addr-info','Entity Verify Sub-Award Organization Address Details Validation Information','2632', 'GE2609', 'Organization address is considered complete when Country, Address Line 1, City, State, and Zip Code are filled for entities from the US and Canada. For all other countries, the address is considered complete when Country, Address Line 1, and City are filled.', 'admin', NOW() ),
    ('coi-GE-verify-org-risk-info','Entity Verify Sub-Award Organization Risk Details Validation Information','2632', 'GE2609', '', 'admin', NOW() );
