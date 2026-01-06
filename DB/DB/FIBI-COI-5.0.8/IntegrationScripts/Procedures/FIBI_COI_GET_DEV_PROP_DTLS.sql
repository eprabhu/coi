create or replace PROCEDURE FIBI_COI_GET_DEV_PROP_DTLS(
av_proposal_number IN eps_proposal.proposal_number%TYPE,
cur_generic        OUT SYS_REFCURSOR)
IS
BEGIN
    OPEN cur_generic FOR
      SELECT DISTINCT EP.proposal_number,
                      EP.ver_nbr                      AS VERSION_NUMBER,
                      EP.owned_by_unit                AS LEAD_UNIT_NUMBER,
                      U.unit_name                     AS LEAD_UNIT_NAME,
                      EP.requested_start_date_initial AS PROJECT_START_DATE,
                      EP.requested_end_date_initial   AS PROJECT_END_DATE,
                      EP.proposal_type_code,
                      PT.description                  AS PROPOSAL_TYPE,
                      EP.title,
                      EP.status_code                  AS PROPOSAL_STATUS_CODE,
                      EPS.description                 AS PROPOSAL_STATUS,
                      EP.sponsor_code                 AS SPONSOR,
                      S1.sponsor_name                 AS SPONSOR_NAME,
                      EP.prime_sponsor_code           AS PRIME_SPONSOR,
                      S.sponsor_name                  AS PRIME_SPONSOR_NAME,
      'https://fibi-compl-dev.mit.edu/'
      ||EP.proposal_number            AS DOCUMENT_URL,
      EP.program_announcement_number  AS SPONSOR_GRANT_NUMBER,
      P.proposal_number            AS IP_NUMBER,
      EP.update_timestamp             AS SRC_SYS_UPDATE_TIMESTAMP,
      EP.update_user                  AS SRC_SYS_UPDATE_USER_NAME,
      NULL                            AS ATTRIBUTE_1_LABEL,
      NULL                            AS ATTRIBUTE_1_VALUE,
      'DOCUMENT_NUMBER' 			  AS ATTRIBUTE_2_LABEL,
	  EP.DOCUMENT_NUMBER 			  AS ATTRIBUTE_2_VALUE,
      NULL                            AS ATTRIBUTE_3_LABEL,
      NULL                            AS ATTRIBUTE_3_VALUE,
      NULL                            AS ATTRIBUTE_4_LABEL,
      NULL                            AS ATTRIBUTE_4_VALUE,
      NULL                            AS ATTRIBUTE_5_LABEL,
      NULL                            AS ATTRIBUTE_5_VALUE
      FROM   eps_proposal EP
             left join unit U
                    ON U.unit_number = EP.owned_by_unit
             left join proposal_state EPS
                    ON EPS.state_type_code = EP.status_code
             left join sponsor S
                    ON S.sponsor_code = EP.prime_sponsor_code
             left join sponsor S1
                    ON S1.sponsor_code = EP.sponsor_code
             left join proposal_type PT
                    ON PT.proposal_type_code = EP.proposal_type_code
             left join proposal_admin_details PAD
                    ON PAD.dev_proposal_number = EP.proposal_number
             LEFT JOIN PROPOSAL P
                    ON P.PROPOSAL_ID = PAD.INST_PROPOSAL_ID
      WHERE  EP.proposal_number = av_proposal_number;
END;
