INSERT INTO DYN_ELEMENT_CONFIG 
(UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, INSTRUCTION, UPDATE_USER, UPDATE_TIMESTAMP)
SELECT 
    'coi-disc-req-recall-info-text',
    'Request to recall',
    '814',
    'COI808',
    'You already have a submitted FCOI disclosure that is currently under review. You will need to request a recall to update the engagement details.',
    'admin',
    UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 
    FROM DYN_ELEMENT_CONFIG 
    WHERE UI_REFERENCE_ID = 'coi-disc-req-recall-info-text'
);
