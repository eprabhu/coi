SET SQL_SAFE_UPDATES = 0;

UPDATE DYN_ELEMENT_CONFIG SET INSTRUCTION = 'In submitting this Travel disclosure, I certify that <strong>I agree to</strong> abide by the Institute’s FCOI policy and guidelines.  <strong>I further certify</strong> that the information provided in this Travel Disclosure, including the details of any relationship with my sponsored research, is an accurate and current statement of my reportable outside interests and activities.' WHERE (UI_REFERENCE_ID = 'coi-travel-cert-cnfrm-text');

SET SQL_SAFE_UPDATES = 1;

-- Insert into BUSINESS_RULE_FUNCTION if it doesn't exist
INSERT INTO `BUSINESS_RULE_FUNCTION` 
(`FUNCTION_NAME`,`MODULE_CODE`,`SUB_MODULE_CODE`,`DESCRIPTION`,`DB_FUNCTION_NAME`,`UPDATE_TIMESTAMP`,`UPDATE_USER`)
SELECT 'Chk commitment question answered', 8, 801, 'Check engagement has commitment question answered', 'FN_IS_COMMITMENT_QN_ANSWERED', NOW(), 'quickstart'
WHERE NOT EXISTS (
    SELECT 1 
    FROM `BUSINESS_RULE_FUNCTION` 
    WHERE `FUNCTION_NAME` = 'Chk commitment question answered'
);
 
-- Insert into BUSINESS_RULE_FUNCTION_ARG if it doesn't exist
INSERT INTO `BUSINESS_RULE_FUNCTION_ARG` 
(`FUNCTION_NAME`, `ARGUMENT_SEQUENCE_NUMBER`, `ARGUMENT_NAME`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT 'Chk commitment question answered', 1, 'AV_PERSON_ENTITY_ID', NULL, 'quickstart'
WHERE NOT EXISTS (
    SELECT 1 
    FROM `BUSINESS_RULE_FUNCTION_ARG` 
    WHERE `FUNCTION_NAME` = 'Chk commitment question answered' 
      AND `ARGUMENT_SEQUENCE_NUMBER` = 1
);
