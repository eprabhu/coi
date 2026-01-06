DELIMITER //
CREATE VIEW `coi_project_institute_proposal_v` AS
    SELECT
        NULL AS `ID`,
        `t1`.`PROPOSAL_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        '2' AS `COI_PROJECT_TYPE_CODE`,
        `t1`.`PROPOSAL_NUMBER` AS `PROPOSAL_NUMBER`,
        `t1`.`TITLE` AS `TITLE`,
        (SELECT 
                `proposal_persons`.`PERSON_ID`
            FROM
                `proposal_persons`
            WHERE
                ((`proposal_persons`.`PROP_PERSON_ROLE_ID` = 3)
                    AND (`proposal_persons`.`PI_FLAG` = 'Y')
                    AND (`proposal_persons`.`PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)
                    AND (`t1`.`STATUS_CODE` IN (1 , 8, 3, 5, 6, 11)))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT 
                `proposal_persons`.`FULL_NAME`
            FROM
                `proposal_persons`
            WHERE
                (`proposal_persons`.`PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `t6`.`PERSON_ID` AS `KEY_PERSON_ID`,
        `t7`.`FULL_NAME` AS `KEY_PERSON_NAME`,
        `t6`.`PROP_PERSON_ROLE_ID` AS `KEY_PERSON_ROLE_CODE`,
        `t3`.`DESCRIPTION` AS `PROPOSAL_STATUS`,
        `t4`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `t5`.`SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `t1`.`START_DATE` AS `PROPOSAL_START_DATE`,
        `t1`.`END_DATE` AS `PROPOSAL_END_DATE`,
        `t1`.`HOME_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `t1`.`HOME_UNIT_NAME` AS `LEAD_UNIT_NAME`
    FROM
        (((((`proposal` `t1`
        JOIN `proposal_status` `t3` ON ((`t3`.`STATUS_CODE` = `t1`.`STATUS_CODE`)))
        JOIN `sponsor` `t4` ON ((`t4`.`SPONSOR_CODE` = `t1`.`SPONSOR_CODE`)))
        LEFT JOIN `sponsor` `t5` ON ((`t5`.`SPONSOR_CODE` = `t1`.`PRIME_SPONSOR_CODE`)))
        JOIN `proposal_persons` `t6` ON ((`t6`.`PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)))
        JOIN `person` `t7` ON ((`t6`.`PERSON_ID` = `t7`.`PERSON_ID`)))
    WHERE `t1`.`STATUS_CODE` IN (1 , 8, 3, 5, 6, 11)

    UNION ALL SELECT
        `ID` AS `ID`,
        `EXTERNAL_SYSTEM_REF_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        `COI_PROJECT_TYPE_CODE` AS `COI_PROJECT_TYPE_CODE`,
        `IP_NUMBER` AS `PROPOSAL_NUMBER`,
        `TITLE` AS `TITLE`,
        `PI_PERSON_ID` AS `PI_PERSON_ID`,
        `PI_NAME` AS `PI_NAME`,
        `KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        NULL AS `PROPOSAL_STATUS`,
        `SPONSOR_NAME` AS `SPONSOR_NAME`,
        `PRIME_SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `PROPOSAL_START_DATE` AS `PROPOSAL_START_DATE`,
        `PROPOSAL_END_DATE` AS `PROPOSAL_END_DATE`,
        NULL AS `LEAD_UNIT_NUMBER`,
        `LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`
    FROM
        `COI_PROJECT_INSTITUTE_PROPOSAL`
    WHERE
        (`COI_PROJECT_TYPE_CODE` = 2);
//