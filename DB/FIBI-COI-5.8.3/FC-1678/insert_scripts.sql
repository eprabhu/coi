INSERT IGNORE INTO DYN_SECTION_CONFIG (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER)
    VALUES('TD2403', 'TD24', 'Travel Engagements', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO DYN_SUBSECTION_CONFIG (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER)
    VALUES('2403', 'TD2403', 'Engagements', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, INSTRUCTION, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'coi-travel-eng-ext-info',
        'COI Travel External Funding Type Engagement List Info',
        '2403',
        'TD2403',
        'Select the Engagement which directly paid on your behalf or reimbursed you for this trip or add a new engagement.',
        UTC_TIMESTAMP(),
        'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'coi-travel-eng-ext-info');

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, INSTRUCTION, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'coi-travel-eng-int-info',
        'COI Travel Internal Funding Type Engagement List Info',
        '2403',
        'TD2403',
        'This travel is funded by the University.',
        UTC_TIMESTAMP(),
        'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'coi-travel-eng-int-info');
