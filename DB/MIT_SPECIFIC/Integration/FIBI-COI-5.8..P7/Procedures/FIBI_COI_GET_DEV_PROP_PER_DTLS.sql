create or replace PROCEDURE FIBI_COI_GET_DEV_PROP_PER_DTLS(
    AV_PROPOSAL_NUMBER IN EPS_PROPOSAL.PROPOSAL_NUMBER%TYPE,
    cur_generic OUT SYS_REFCURSOR
) IS
BEGIN

OPEN cur_generic FOR
WITH PERSON_DATA AS (
    SELECT 
		EP.proposal_number,
        EPPR.prop_person_role_id AS PROP_PERSON_ROLE_CODE,
        EPPR.description AS KEY_PERSON_ROLE,
        NVL(EPP.person_id, EPP.rolodex_id) AS person_rolodex_id,
		EPP.person_id as is_person_id,
        NVL(P.full_name,COALESCE(R.first_name, '') || ' ' || COALESCE(R.middle_name, '') || ' ' || COALESCE(R.last_name, '')) AS full_name,
		EPP.calendar_year_effort AS PERCENTAGE_OF_EFFORT,
        FIBI_COI_DEV_PER_CERT_FLAG(EPP.proposal_number,EPP.person_id,EPP.PROP_PERSON_NUMBER,EPP.prop_person_role_id,EPP.PROJECT_ROLE) AS certification_flag,
        FIBI_COI_DEV_PER_COI_DISC_FLAG(EPP.proposal_number,EPP.person_id,EPP.PROP_PERSON_NUMBER,EPP.prop_person_role_id,EPP.PROJECT_ROLE) AS disclosure_required_flag
    FROM eps_proposal EP
    INNER JOIN eps_prop_person EPP ON EPP.proposal_number = EP.proposal_number
    INNER JOIN EPS_PROP_PERSON_ROLE EPPR 
        ON EPPR.PROP_PERSON_ROLE_CODE = EPP.PROP_PERSON_ROLE_ID 
       AND EPPR.SPONSOR_HIERARCHY_NAME = 'DEFAULT'
    LEFT JOIN person P ON P.person_id = EPP.person_id
    LEFT JOIN rolodex R ON R.rolodex_id = EPP.rolodex_id
    WHERE EP.proposal_number = AV_PROPOSAL_NUMBER
)
SELECT DISTINCT
    proposal_number,
    PROP_PERSON_ROLE_CODE,
    KEY_PERSON_ROLE,
    person_rolodex_id as person_id,
    full_name,
    PERCENTAGE_OF_EFFORT,
    certification_flag,
    disclosure_required_flag,
    'NON_EMPLOYEE_FLAG' AS ATTRIBUTE_1_LABEL,
    CASE WHEN is_person_id IS NULL THEN 'Y' ELSE 'N' END AS  ATTRIBUTE_1_VALUE ,
    NULL AS ATTRIBUTE_2_LABEL,
    NULL AS ATTRIBUTE_2_VALUE,
    NULL AS ATTRIBUTE_3_LABEL,
    NULL AS ATTRIBUTE_3_VALUE,
    CASE 
		WHEN certification_flag = 'COMPLETED' and disclosure_required_flag = 'REQUIRED' THEN 'DISCLOSURE_PENDING'
		WHEN disclosure_required_flag = 'NOT_REQUIRED' THEN 'DISCLOSURE_NOT_REQUIRED'
		WHEN disclosure_required_flag = 'TO_BE_DETERMINED' THEN 'DISCLOSURE_TO_BE_DETERMINED'
    END AS disclosure_status,
    CASE 
	   WHEN certification_flag = 'COMPLETED' and disclosure_required_flag = 'REQUIRED' THEN 'DISCLOSURE_PENDING'
       WHEN disclosure_required_flag = 'NOT_REQUIRED' THEN 'DISCLOSURE_REVIEW_NA' 
    END AS disclosure_review_status
FROM PERSON_DATA;


END;
