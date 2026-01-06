DELIMITER //
CREATE VIEW `coi_project_proposal_v` AS
    SELECT 
        NULL AS `ID`,
        `t1`.`PROPOSAL_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        '3' AS `COI_PROJECT_TYPE_CODE`,
        `t1`.`PROPOSAL_ID` AS `PROPOSAL_NUMBER`,
        `t1`.`TITLE` AS `TITLE`,
        (SELECT 
                `eps_proposal_persons`.`PERSON_ID`
            FROM
                `eps_proposal_persons`
            WHERE
                ((`eps_proposal_persons`.`PROP_PERSON_ROLE_ID` = 3)
                    AND (`eps_proposal_persons`.`PI_FLAG` = 'Y')
                    AND (`eps_proposal_persons`.`PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)
                    AND (`t1`.`DOCUMENT_STATUS_CODE` <> 3)
                    AND (`t1`.`STATUS_CODE` NOT IN (1 , 29, 35, 9, 22, 20, 24, 30, 3, 12))
                    AND (`t1`.`DOCUMENT_STATUS_CODE` <> 3))
            LIMIT 1) AS `PI_PERSON_ID`,
        (SELECT 
                `eps_proposal_persons`.`FULL_NAME`
            FROM
                `eps_proposal_persons`
            WHERE
                (`eps_proposal_persons`.`PERSON_ID` = `PI_PERSON_ID`)
            LIMIT 1) AS `PI_NAME`,
        `t6`.`PERSON_ID` AS `KEY_PERSON_ID`,
        `t7`.`FULL_NAME` AS `KEY_PERSON_NAME`,
        `t6`.`PROP_PERSON_ROLE_ID` AS `KEY_PERSON_ROLE_CODE`,
        `t3`.`DESCRIPTION` AS `PROPOSAL_STATUS`,
        `t4`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        `t4`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `t5`.`SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        `t5`.`SPONSOR_CODE` AS `PRIME_SPONSOR_CODE`,
        `t1`.`START_DATE` AS `PROPOSAL_START_DATE`,
        `t1`.`END_DATE` AS `PROPOSAL_END_DATE`,
        `t1`.`HOME_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `t1`.`HOME_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `t1`.`UPDATE_TIMESTAMP` AS `UPDATE_TIMESTAMP`
    FROM
        (((((`eps_proposal` `t1`
        JOIN `eps_proposal_status` `t3` ON ((`t3`.`STATUS_CODE` = `t1`.`STATUS_CODE`)))
        JOIN `sponsor` `t4` ON ((`t4`.`SPONSOR_CODE` = `t1`.`SPONSOR_CODE`)))
        LEFT JOIN `sponsor` `t5` ON ((`t5`.`SPONSOR_CODE` = `t1`.`PRIME_SPONSOR_CODE`)))
        JOIN `eps_proposal_persons` `t6` ON ((`t6`.`PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)))
        JOIN `person` `t7` ON ((`t6`.`PERSON_ID` = `t7`.`PERSON_ID`)))
    WHERE
        ((`t1`.`DOCUMENT_STATUS_CODE` <> 3)
            AND (`t1`.`STATUS_CODE` NOT IN (1 , 29, 35, 9, 22, 20, 24, 30, 3, 12))
            AND (`t1`.`DOCUMENT_STATUS_CODE` <> 3)) 
    UNION ALL SELECT 
        `coi_project_proposal`.`ID` AS `ID`,
        `coi_project_proposal`.`EXTERNAL_SYSTEM_REF_ID` AS `EXTERNAL_SYSTEM_REF_ID`,
        `coi_project_proposal`.`COI_PROJECT_TYPE_CODE` AS `COI_PROJECT_TYPE_CODE`,
        `coi_project_proposal`.`PROPOSAL_NUMBER` AS `PROPOSAL_NUMBER`,
        `coi_project_proposal`.`TITLE` AS `TITLE`,
        `coi_project_proposal`.`PI_PERSON_ID` AS `PI_PERSON_ID`,
        `coi_project_proposal`.`PI_NAME` AS `PI_NAME`,
        `coi_project_proposal`.`KEY_PERSON_ID` AS `KEY_PERSON_ID`,
        `coi_project_proposal`.`KEY_PERSON_NAME` AS `KEY_PERSON_NAME`,
        `coi_project_proposal`.`KEY_PERSON_ROLE_CODE` AS `KEY_PERSON_ROLE_CODE`,
        NULL AS `PROPOSAL_STATUS`,
        `coi_project_proposal`.`SPONSOR_NAME` AS `SPONSOR_NAME`,
        NULL AS `SPONSOR_CODE`,
        `coi_project_proposal`.`PRIME_SPONSOR_NAME` AS `PRIME_SPONSOR_NAME`,
        NULL AS `PRIME_SPONSOR_CODE`,
        `coi_project_proposal`.`PROPOSAL_START_DATE` AS `PROPOSAL_START_DATE`,
        `coi_project_proposal`.`PROPOSAL_END_DATE` AS `PROPOSAL_END_DATE`,
        NULL AS `LEAD_UNIT_NUMBER`,
        `coi_project_proposal`.`LEAD_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        NULL AS `UPDATE_TIMESTAMP`
    FROM
        `coi_project_proposal`
    WHERE
        (`coi_project_proposal`.`COI_PROJECT_TYPE_CODE` = 3)
    ORDER BY `UPDATE_TIMESTAMP` DESC
//