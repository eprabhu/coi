DELIMITER //
CREATE VIEW `coi_project_proposal_v` AS
   SELECT
        `coi_int_stage_dev_proposal`.`STAGE_PROPOSAL_ID` AS `ID`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_NUMBER` AS `EXTERNAL_SYSTEM_REF_ID`,
        (CONVERT( '3' USING LATIN1) COLLATE latin1_swedish_ci) AS `COI_PROJECT_TYPE_CODE`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_NUMBER` AS `PROPOSAL_NUMBER`,
        `coi_int_stage_dev_proposal`.`TITLE` AS `TITLE`,
        (SELECT 
                `coi_int_stage_dev_proposal_person`.`KEY_PERSON_ID`
            FROM
                `coi_int_stage_dev_proposal_person`
            WHERE
                ((`coi_int_stage_dev_proposal_person`.`KEY_PERSON_ROLE` = 'Principal Investigator')
                    AND (`coi_int_stage_dev_proposal_person`.`PROPOSAL_NUMBER` = `coi_int_stage_dev_proposal`.`PROPOSAL_NUMBER`)
                    AND (`coi_int_stage_dev_proposal_person`.`STATUS` != 'I'))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT 
                `coi_int_stage_dev_proposal_person`.`KEY_PERSON_NAME`
            FROM
                `coi_int_stage_dev_proposal_person`
            WHERE
                (`coi_int_stage_dev_proposal_person`.`KEY_PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `coi_int_stage_dev_proposal_person`.`KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `coi_int_stage_dev_proposal_person`.`KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `coi_int_stage_dev_proposal_person`.`KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        `coi_int_stage_dev_proposal_person`.`KEY_PERSON_ROLE` AS `KEY_PERSON_ROLE_NAME`,
        `coi_int_stage_dev_proposal_person`.`CERTIFICATION_FLAG` AS `CERTIFICATION_FLAG`,
        `coi_int_stage_dev_proposal_person`.`DISCLOSURE_REQUIRED_FLAG` AS `DISCLOSURE_REQUIRED_FLAG`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_STATUS` AS `PROPOSAL_STATUS`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_STATUS_CODE` AS `PROPOSAL_STATUS_CODE`,
        `coi_int_stage_dev_proposal`.`SPONSOR` AS `SPONSOR_NAME`,
        `coi_int_stage_dev_proposal`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `coi_int_stage_dev_proposal`.`PRIME_SPONSOR` AS `PRIME_SPONSOR_NAME`,
        `coi_int_stage_dev_proposal`.`PRIME_SPONSOR_CODE` AS `PRIME_SPONSOR_CODE`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_START_DATE` AS `PROPOSAL_START_DATE`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_END_DATE` AS `PROPOSAL_END_DATE`,
        `coi_int_stage_dev_proposal`.`LEAD_UNIT` AS `LEAD_UNIT_NUMBER`,
        `coi_int_stage_dev_proposal`.`LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `coi_int_stage_dev_proposal`.`PROPOSAL_TYPE_CODE` AS `PROPOSAL_TYPE_CODE`,
        `coi_int_stage_dev_proposal`.`SRC_SYS_UPDATE_TIMESTAMP` AS `UPDATE_TIMESTAMP`,
        `coi_int_stage_dev_proposal`.`IP_NUMBER` AS `LINKED_IP_NUMBER`,
        `coi_int_stage_dev_proposal_person`.`STATUS` as `PERSON_STATUS`,
		`coi_int_stage_dev_proposal`.`ATTRIBUTE_2_VALUE` AS `DOCUMENT_NUMBER`,
        `coi_int_stage_dev_proposal`.`OVERALL_DISCLOSURE_STATUS` AS `OVERALL_DISCLOSURE_STATUS`,
        `coi_int_stage_dev_proposal`.`OVERALL_DISCL_REVIEW_STATUS` AS `OVERALL_DISCL_REVIEW_STATUS`,
		`coi_int_stage_dev_proposal_person`.`ATTRIBUTE_1_VALUE` as `NON_EMPLOYEE_FLAG`
    FROM
        (`coi_int_stage_dev_proposal`
        JOIN `coi_int_stage_dev_proposal_person` ON ((`coi_int_stage_dev_proposal`.`PROPOSAL_NUMBER` = `coi_int_stage_dev_proposal_person`.`PROPOSAL_NUMBER`)))
//
