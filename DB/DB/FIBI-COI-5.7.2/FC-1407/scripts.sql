UPDATE BUSINESS_RULE_FUNCTION_ARG 
SET ARGUMENT_NAME = 'AV_OPA_DISCLOSURE_ID' 
WHERE FUNCTION_NAME IN (
  'Check if OPA Discl Person eng are complete.',
  'Verify all required sabbaticals are filled in OPA.'
);
