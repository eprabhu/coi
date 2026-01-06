DELIMITER //
CREATE VIEW `coi_project_institute_proposal_v` AS
    SELECT
        `coi_int_stage_proposal`.`STAGE_PROPOSAL_ID` AS `ID`,
        `coi_int_stage_proposal`.`PROJECT_NUMBER` AS `EXTERNAL_SYSTEM_REF_ID`,
        '2' AS `COI_PROJECT_TYPE_CODE`,
        `coi_int_stage_proposal`.`PROJECT_NUMBER` AS `PROPOSAL_NUMBER`,
        `coi_int_stage_proposal`.`TITLE` AS `TITLE`,
        (SELECT
                `coi_int_stage_proposal_person`.`KEY_PERSON_ID`
            FROM
                `coi_int_stage_proposal_person`
            WHERE
                ((`coi_int_stage_proposal_person`.`KEY_PERSON_ROLE_NAME` = 'Principal Investigator')
                    AND (`coi_int_stage_proposal_person`.`PROJECT_NUMBER` = `coi_int_stage_proposal`.`PROJECT_NUMBER`))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT
                `coi_int_stage_proposal_person`.`KEY_PERSON_NAME`
            FROM
                `coi_int_stage_proposal_person`
            WHERE
                (`coi_int_stage_proposal_person`.`KEY_PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `coi_int_stage_proposal_person`.`KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `coi_int_stage_proposal_person`.`KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `coi_int_stage_proposal_person`.`KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        `coi_int_stage_proposal_person`.`KEY_PERSON_ROLE_NAME` AS `KEY_PERSON_ROLE_NAME`,
        `coi_int_stage_proposal`.`PROJECT_STATUS` AS `PROPOSAL_STATUS`,
        `coi_int_stage_proposal`.`PROJECT_STATUS_CODE` AS `PROPOSAL_STATUS_CODE`,
        `coi_int_stage_proposal`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `coi_int_stage_proposal`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `coi_int_stage_proposal`.`PRIME_SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `coi_int_stage_proposal`.`PRIME_SPONSOR_CODE` AS `PRIME_SPONSOR_CODE`,
        `coi_int_stage_proposal`.`PROJECT_START_DATE` AS `PROPOSAL_START_DATE`,
        `coi_int_stage_proposal`.`PROJECT_END_DATE` AS `PROPOSAL_END_DATE`,
        `coi_int_stage_proposal`.`LEAD_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `coi_int_stage_proposal`.`LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `coi_int_stage_proposal`.`PROJECT_TYPE_CODE` AS `PROPOSAL_TYPE_CODE`,
        `coi_int_stage_proposal`.`SRC_SYS_UPDATE_TIMESTAMP` AS `UPDATE_TIMESTAMP`,
        `coi_int_stage_proposal`.`ATTRIBUTE_1_VALUE` AS `PCK`,
        `coi_int_stage_proposal`.`LINKED_AWARD_PROJECT_NUMBER`
    FROM
        (`coi_int_stage_proposal`
        JOIN `coi_int_stage_proposal_person` ON ((`coi_int_stage_proposal`.`PROJECT_NUMBER` = `coi_int_stage_proposal_person`.`PROJECT_NUMBER`)))
    ORDER BY `coi_int_stage_proposal`.`SRC_SYS_UPDATE_TIMESTAMP` DESC
//

