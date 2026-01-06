DELIMITER //
create or replace PROCEDURE FIBI_COI_GET_AWARD_PERSONS(
av_project_number IN award.award_number%TYPE,
cur_generic       OUT SYS_REFCURSOR)
IS
BEGIN
    OPEN cur_generic FOR
      SELECT A.award_number           AS PROJECT_NUMBER,
             EPPR.prop_person_role_id AS KEY_PERSON_ROLE_CODE,
             EPPR.description         AS KEY_PERSON_ROLE,
             AP.person_id             AS PERSON_ID,
             AP.full_name             AS PERSON_NAME,
             NULL                     AS PERCENTAGE_OF_EFFORT,
             NULL                     AS ATTRIBUTE_1_LABEL,
             NULL                     AS ATTRIBUTE_1_VALUE,
             NULL                     AS ATTRIBUTE_2_LABEL,
             NULL                     AS ATTRIBUTE_2_VALUE,
             NULL                     AS ATTRIBUTE_3_LABEL,
             NULL                     AS ATTRIBUTE_3_VALUE,
			 FIBI_COI_AWD_PER_IS_DISCL_REQ(A.AWARD_NUMBER,AP.PERSON_ID) AS  DISCLOSURE_REQUIRED_FLAG
      FROM   award A
             inner join award_persons AP
                     ON AP.award_id = A.award_id
             inner join eps_prop_person_role EPPR
                     ON EPPR.prop_person_role_code = AP.contact_role_code
                        AND EPPR.sponsor_hierarchy_name = 'DEFAULT'
      WHERE  A.award_number = av_project_number
             AND A.award_sequence_status = 'ACTIVE';
END;
//