CREATE OR REPLACE FUNCTION FIBI_COI_DEV_PER_COI_DISC_FLAG (
  AV_PROPOSAL_NUMBER IN EPS_PROP_PERSON.PROPOSAL_NUMBER%TYPE,
  AV_PERSON_ID IN EPS_PROP_PERSON.PERSON_ID%TYPE,
  AV_PROP_PERSON_ROLE_ID IN EPS_PROP_PERSON.PROP_PERSON_ROLE_ID%TYPE,
  AV_PERSON_PROJ_ROLE IN EPS_PROP_PERSON.PROJECT_ROLE%TYPE
) RETURN VARCHAR2
IS
  
  LS_CERTIFICATION_FLAG VARCHAR2(20); -- Possbile values for this flag are NOT_REQUIRED, COMPLETED, INCOMPLETE
  LI_COUNT NUMBER; 
  LS_SUB_ITEM_CODE VARCHAR2(20);
  
BEGIN
-- Possbile Return values are NOT_REQUIRED, REQUIRED, TO_BE_DETERMINED
	
	LS_CERTIFICATION_FLAG := FIBI_COI_DEV_PER_CERT_FLAG(AV_PROPOSAL_NUMBER,AV_PERSON_ID,AV_PROP_PERSON_ROLE_ID,AV_PERSON_PROJ_ROLE);
	
	IF LS_CERTIFICATION_FLAG = 'NOT_REQUIRED' THEN	
		RETURN 'NOT_REQUIRED';
		
	END IF;
	
	
	IF LS_CERTIFICATION_FLAG = 'INCOMPLETE' THEN	
		RETURN 'TO_BE_DETERMINED';
		
	END IF;
		
		
		
	IF AV_PROP_PERSON_ROLE_ID = 'PI' THEN
			LS_SUB_ITEM_CODE := '4';
			
	ELSIF  AV_PROP_PERSON_ROLE_ID IN ('COI','MPI') THEN
			LS_SUB_ITEM_CODE := '5';
			
	ELSIF  AV_PROP_PERSON_ROLE_ID = 'KP' THEN
			LS_SUB_ITEM_CODE := '6';
			
	ELSE
			LS_SUB_ITEM_CODE := '0';
			
	END IF;	
	
	select count(t2.question_id) INTO LI_COUNT
	from questionnaire_answer_header  t0
    inner join questionnaire_answer t1 on t0.questionnaire_answer_header_id = t1.questionnaire_ah_id_fk
    inner join question t2 on t2.question_ref_id = t1.question_ref_id_fk
	INNER JOIN EPS_PROP_PERSON_CERT_DETAILS EPPCD ON EPPCD.PROPOSAL_NUMBER = substr(t0.MODULE_ITEM_KEY,1,instr(t0.MODULE_ITEM_KEY,'|')-1) 
    AND EPPCD.CERTIFIED_BY = t0.MODULE_SUB_ITEM_KEY
	where t0.module_Item_code = '3'
	and t0.module_sub_item_code = LS_SUB_ITEM_CODE
	and substr(t0.module_item_key,1,(instr(t0.module_item_key,'|')-1)) = AV_PROPOSAL_NUMBER
	and t0.module_sub_item_key =  AV_PERSON_ID
	and t0.questionnaire_ref_id_fk IN  (
										select s1.questionnaire_ref_id_fk
										from questionnaire_usage s1
										where s1.module_Item_code = '3'
										and s1.module_sub_item_code = LS_SUB_ITEM_CODE
								 )
    and t2.question_id IN (1005,1006,1007) -- Hardcode COI question Id's
    and UPPER(t1.answer) = 'Y'; 
	
	IF LI_COUNT = 0 THEN
		RETURN 'NOT_REQUIRED';
		
	END IF;
	
	
	RETURN 'REQUIRED';
	
END FIBI_COI_DEV_PER_COI_DISC_FLAG;
