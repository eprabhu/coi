DELIMITER //
CREATE VIEW `coi_project_award_v` AS
    SELECT 
        NULL AS `ID`,
        `t1`.`AWARD_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        '1' AS `COI_PROJECT_TYPE_CODE`,
        `t1`.`AWARD_NUMBER` AS `AWARD_NUMBER`,
        `t1`.`ACCOUNT_NUMBER` AS `ACCOUNT_NUMBER`,
        `t1`.`SPONSOR_AWARD_NUMBER` AS `SPONSOR_AWARD_NUMBER`,
        `t1`.`TITLE` AS `TITLE`,
        (SELECT 
                `award_persons`.`PERSON_ID`
            FROM
                `award_persons`
            WHERE
                ((`award_persons`.`PI_FLAG` = 'Y')
                    AND (`award_persons`.`AWARD_ID` = `t1`.`AWARD_ID`)
                    AND ((`t1`.`AWARD_SEQUENCE_STATUS` = 'ACTIVE')
                    OR ((`t1`.`AWARD_SEQUENCE_STATUS` = 'PENDING')
                    AND (`t1`.`AWARD_DOCUMENT_TYPE_CODE` = 1))))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT 
                `award_persons`.`FULL_NAME`
            FROM
                `award_persons`
            WHERE
                (`award_persons`.`PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `t5`.`PERSON_ID` AS `KEY_PERSON_ID`,
        `t7`.`FULL_NAME` AS `KEY_PERSON_NAME`,
        `t5`.`PERSON_ROLE_ID` AS `KEY_PERSON_ROLE_CODE`,
        `t6`.`DESCRIPTION` AS `AWARD_STATUS`,
        `t4`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `t40`.`SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `t1`.`BEGIN_DATE` AS `AWARD_START_DATE`,
        `t1`.`FINAL_EXPIRATION_DATE` AS `AWARD_END_DATE`,
        `t1`.`LEAD_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `t3`.`unit_name` AS `LEAD_UNIT_NAME`,
        `t5`.`PROJECT_ROLE` AS `PROJECT_ROLE`
    FROM
        ((((((`award` `t1`
        JOIN `unit` `t3` ON ((`t3`.`UNIT_NUMBER` = `t1`.`LEAD_UNIT_NUMBER`)))
        JOIN `sponsor` `t4` ON ((`t4`.`SPONSOR_CODE` = `t1`.`SPONSOR_CODE`)))
        LEFT JOIN `sponsor` `t40` ON ((`t40`.`SPONSOR_CODE` = `t1`.`PRIME_SPONSOR_CODE`)))
        JOIN `award_persons` `t5` ON ((`t5`.`AWARD_ID` = `t1`.`AWARD_ID`)))
        JOIN `award_status` `t6` ON ((`t6`.`STATUS_CODE` = `t1`.`STATUS_CODE`)))
        JOIN `person` `t7` ON ((`t5`.`PERSON_ID` = `t7`.`PERSON_ID`)))
    WHERE
        ((`t1`.`AWARD_SEQUENCE_STATUS` = 'ACTIVE')
            OR ((`t1`.`AWARD_SEQUENCE_STATUS` = 'PENDING')
            AND (`t1`.`AWARD_DOCUMENT_TYPE_CODE` = 1))) 
    UNION ALL SELECT 
        `coi_project_award`.`ID` AS `ID`,
        `coi_project_award`.`EXTERNAL_SYSTEM_REF_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        `coi_project_award`.`COI_PROJECT_TYPE_CODE` AS `COI_PROJECT_TYPE_CODE`,
        `coi_project_award`.`AWARD_NUMBER` AS `AWARD_NUMBER`,
        `coi_project_award`.`ACCOUNT_NUMBER` AS `ACCOUNT_NUMBER`,
        `coi_project_award`.`SPONSOR_AWARD_NUMBER` AS `SPONSOR_AWARD_NUMBER`,
        `coi_project_award`.`TITLE` AS `TITLE`,
        `coi_project_award`.`PI_PERSON_ID` AS `PI_PERSON_ID`,
        `coi_project_award`.`PI_NAME` AS `PI_NAME`,
        `coi_project_award`.`KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `coi_project_award`.`KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `coi_project_award`.`KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        NULL AS `AWARD_STATUS`,
        `coi_project_award`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `coi_project_award`.`PRIME_SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `coi_project_award`.`AWARD_START_DATE` AS `AWARD_START_DATE`,
        `coi_project_award`.`AWARD_END_DATE` AS `AWARD_END_DATE`,
        NULL AS `LEAD_UNIT_NUMBER`,
        `coi_project_award`.`LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `coi_project_award`.`PROJECT_ROLE` AS `PROJECT_ROLE`
    FROM
        `coi_project_award`
    WHERE
        (`coi_project_award`.`COI_PROJECT_TYPE_CODE` = 2);

//