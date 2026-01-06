create or replace PROCEDURE FIBI_COI_GET_DEV_PROP_QNR_DTLS(
AV_PROPOSAL_NUMBER IN EPS_PROPOSAL.PROPOSAL_NUMBER%TYPE,
AV_QUESTIONNAIRE_ID IN QUEST_ANSWER_HEADER.QUESTIONNAIRE_ID%TYPE,
AV_PERSON_ID IN PERSON.PERSON_ID%TYPE,
cur_generic        OUT SYS_REFCURSOR)
IS
BEGIN
    OPEN cur_generic FOR
       SELECT DISTINCT
                    QAH.module_sub_item_key AS PERSON_ID,
                    q.question_id,
                    qn.QUESTIONNAIRE_ID as questionnaire_id ,
                    case when QA.ANSWER = 'Y' then 'Yes' when QA.ANSWER = 'N' then 'No' else QA.ANSWER end  as ANSWER,
                    NULL AS ATTRIBUTE_1_LABEL,
                    NULL AS ATTRIBUTE_1_VALUE,
                    NULL AS ATTRIBUTE_2_LABEL,
                    NULL AS ATTRIBUTE_2_VALUE,
                    NULL AS ATTRIBUTE_3_LABEL,
                    NULL AS ATTRIBUTE_3_VALUE,
                    P.HOME_UNIT AS HOME_UNIT,
                    '3' as COI_PROJECT_TYPE_CODE

FROM   questionnaire_answer_header QAH
INNER JOIN questionnaire_answer QA
              ON QA.QUESTIONNAIRE_AH_ID_FK =
                 QAH.QUESTIONNAIRE_ANSWER_HEADER_ID
INNER JOIN question q on q.QUESTION_REF_ID = qa.QUESTION_REF_ID_FK
INNER JOIN QUESTIONNAIRE qn on qn.QUESTIONNAIRE_REF_ID = qah.QUESTIONNAIRE_REF_ID_FK
INNER JOIN PERSON P ON P.PERSON_ID = qah.module_sub_item_key
INNER JOIN EPS_PROP_PERSON EPP ON EPP.PROPOSAL_NUMBER = substr(QAH.module_item_key,1,instr(QAH.module_item_key,'|')-1)
INNER JOIN EPS_PROP_PERSON_CERT_DETAILS EPPCD ON EPPCD.PROPOSAL_NUMBER = EPP.PROPOSAL_NUMBER 
AND EPPCD.PROP_PERSON_NUMBER = EPP.PROP_PERSON_NUMBER

WHERE  substr(QAH.module_item_key,1,instr(QAH.module_item_key,'|')-1) = AV_PROPOSAL_NUMBER  
       AND qn.QUESTIONNAIRE_ID =AV_QUESTIONNAIRE_ID     
       AND QAH.module_sub_item_key = AV_PERSON_ID ; 
       
END;
