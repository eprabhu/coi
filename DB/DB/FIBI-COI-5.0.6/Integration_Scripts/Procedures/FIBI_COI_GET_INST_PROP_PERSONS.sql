create or replace PROCEDURE FIBI_COI_GET_INST_PROP_PERSONS(
av_proposal_number IN proposal.proposal_number%TYPE,
cur_generic        OUT SYS_REFCURSOR)
IS
BEGIN
    OPEN cur_generic FOR
      SELECT DISTINCT P.proposal_id           AS PROJECT_ID,
                      P.proposal_number       AS PROJECT_NUMBER,
                      EPP.prop_person_role_id AS KEY_PERSON_ROLE_CODE,
                      EPP.description         AS KEY_PERSON_ROLE,
                      PR.person_id            AS PERSON_ID,
                      PR.full_name            AS PERSON_NAME,
                      NULL                    AS PERCENTAGE_OF_EFFORT,
                      NULL                    AS ATTRIBUTE_1_LABEL,
                      NULL                    AS ATTRIBUTE_1_VALUE,
                      NULL                    AS ATTRIBUTE_2_LABEL,
                      NULL                    AS ATTRIBUTE_2_VALUE,
                      NULL                    AS ATTRIBUTE_3_LABEL,
                      NULL                    AS ATTRIBUTE_3_VALUE
      FROM   proposal P
             inner join proposal_persons PP
                     ON PP.proposal_id = P.proposal_id
             inner join eps_prop_person_role EPP
                     ON EPP.prop_person_role_code = PP.contact_role_code
                        AND EPP.sponsor_hierarchy_name = 'DEFAULT'
             inner join person PR
                     ON PR.person_id = PP.person_id
      WHERE  P.proposal_number = av_proposal_number
             AND proposal_sequence_status = 'ACTIVE'
      ORDER  BY 1 ASC;
END;
