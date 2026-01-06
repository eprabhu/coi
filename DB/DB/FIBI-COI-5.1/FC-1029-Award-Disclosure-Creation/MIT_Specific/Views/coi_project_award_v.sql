DELIMITER //
CREATE VIEW `coi_project_award_v` AS
    SELECT 
        `coi_int_stage_award`.`STAGE_AWARD_ID` AS `ID`,
        `coi_int_stage_award`.`PROJECT_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        '1' AS `COI_PROJECT_TYPE_CODE`,
        `coi_int_stage_award`.`PROJECT_NUMBER` AS `AWARD_NUMBER`,
        `coi_int_stage_award`.`ACCOUNT_NUMBER` AS `ACCOUNT_NUMBER`,
        `coi_int_stage_award`.`SPONSOR_GRANT_NUMBER` AS `SPONSOR_AWARD_NUMBER`,
        `coi_int_stage_award`.`TITLE` AS `TITLE`,
        (SELECT 
                `coi_int_stage_award_person`.`KEY_PERSON_ID`
            FROM
                `coi_int_stage_award_person`
            WHERE
                ((`coi_int_stage_award_person`.`KEY_PERSON_ROLE_NAME` = 'Principal Investigator')
                    AND (`coi_int_stage_award_person`.`PROJECT_NUMBER` = `coi_int_stage_award`.`PROJECT_NUMBER`))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT 
                `coi_int_stage_award_person`.`KEY_PERSON_NAME`
            FROM
                `coi_int_stage_award_person`
            WHERE
                (`coi_int_stage_award_person`.`KEY_PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `coi_int_stage_award_person`.`KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `coi_int_stage_award_person`.`KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `coi_int_stage_award_person`.`KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        `coi_int_stage_award_person`.`KEY_PERSON_ROLE_NAME` AS `KEY_PERSON_ROLE_NAME`,
        `coi_int_stage_award`.`PROJECT_STATUS` AS `AWARD_STATUS`,
        `coi_int_stage_award`.`PROJECT_STATUS_CODE` AS `AWARD_STATUS_CODE`,
        `coi_int_stage_award`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `coi_int_stage_award`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `coi_int_stage_award`.`PRIME_SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `coi_int_stage_award`.`PRIME_SPONSOR_CODE` AS `PRIME_SPONSOR_CODE`,
        `coi_int_stage_award`.`PROJECT_START_DATE` AS `AWARD_START_DATE`,
        `coi_int_stage_award`.`PROJECT_END_DATE` AS `AWARD_END_DATE`,
        `coi_int_stage_award`.`LEAD_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `coi_int_stage_award`.`LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `coi_int_stage_award`.`PROJECT_TYPE_CODE` AS `PROJECT_TYPE_CODE`,
        `coi_int_stage_award`.`SRC_SYS_UPDATE_TIMESTAMP` AS `UPDATE_TIMESTAMP`,
        `coi_int_stage_award`.`ATTRIBUTE_1_VALUE` AS `PCK`,
        `coi_int_stage_award_person`.`STATUS` AS `PERSON_STATUS`,
        `coi_int_stage_award`.`ATTRIBUTE_2_VALUE` AS `DOCUMENT_NUMBER`,
        `coi_int_stage_award_person`.`DISCLOSURE_REQUIRED_FLAG` AS `DISCLOSURE_REQUIRED_FLAG`,
        `coi_int_stage_award`.`DISCLOSURE_VALIDATION_FLAG` AS `DISCLOSURE_VALIDATION_FLAG`
    FROM
        (`coi_int_stage_award`
        JOIN `coi_int_stage_award_person` ON ((`coi_int_stage_award`.`PROJECT_NUMBER` = `coi_int_stage_award_person`.`PROJECT_NUMBER`)))
//
