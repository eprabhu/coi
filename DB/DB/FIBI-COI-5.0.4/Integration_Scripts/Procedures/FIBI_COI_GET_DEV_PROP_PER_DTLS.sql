create or replace PROCEDURE FIBI_COI_GET_DEV_PROP_PER_DTLS(
    AV_PROPOSAL_NUMBER IN EPS_PROPOSAL.PROPOSAL_NUMBER%TYPE,
    cur_generic OUT SYS_REFCURSOR
) IS
BEGIN
    OPEN cur_generic FOR
	SELECT DISTINCT EP.proposal_number,
       EPPr.prop_person_role_id         AS PROP_PERSON_ROLE_CODE,
       EPPR.DESCRIPTION                AS KEY_PERSON_ROLE,
       EPP.person_id,
       P.full_name,
       EPP.calendar_year_effort          AS PERCENTAGE_OF_EFFORT,
	   NULL AS  ATTRIBUTE_1_LABEL ,
       NULL AS   ATTRIBUTE_1_VALUE ,
       NULL AS   ATTRIBUTE_2_LABEL ,
       NULL AS   ATTRIBUTE_2_VALUE ,
       NULL AS   ATTRIBUTE_3_LABEL ,
       NULL AS   ATTRIBUTE_3_VALUE
	   FROM   eps_proposal EP
	    INNER JOIN eps_prop_person EPP
              ON EPP.proposal_number = EP.proposal_number
       INNER JOIN EPS_PROP_PERSON_ROLE EPPR
              ON EPPR.PROP_PERSON_ROLE_CODE = EPP.PROP_PERSON_ROLE_ID AND EPPR.SPONSOR_HIERARCHY_NAME='DEFAULT'      
       INNER JOIN person P
              ON P.person_id = EPP.person_id
	   WHERE  EP.proposal_number = AV_PROPOSAL_NUMBER; 

END;
