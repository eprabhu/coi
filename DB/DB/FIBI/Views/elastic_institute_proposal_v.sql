DELIMITER //
CREATE VIEW `elastic_institute_proposal_v` AS
    SELECT 
        `t1`.`PROPOSAL_ID` AS `PROPOSAL_ID`,
        `t1`.`PROPOSAL_NUMBER` AS `PROPOSAL_NUMBER`,
        `t1`.`TITLE` AS `TITLE`,
        `t1`.`HOME_UNIT_NUMBER` AS `HOME_UNIT_NUMBER`,
        `t1`.`HOME_UNIT_NAME` AS `LEAD_UNIT`,
        `t1`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `t10`.`SPONSOR_NAME` AS `SPONSOR`,
        `t1`.`INTERNAL_DEADLINE_DATE` AS `DEADLINE_DATE`,
        `t1`.`STATUS_CODE` AS `STATUS_CODE`,
        `t4`.`DESCRIPTION` AS `STATUS`,
        `t1`.`UPDATE_TIMESTAMP` AS `UPDATE_TIMESTAMP`,
        `t1`.`UPDATE_USER` AS `UPDATE_USER`,
        `t7`.`FULL_NAME` AS `PI_FULL_NAME`,
        `t5`.`TYPE_CODE` AS `PROPOSAL_TYPE_CODE`,
        `t5`.`DESCRIPTION` AS `PROPOSAL_TYPE`,
        `t6`.`ACTIVITY_TYPE_CODE` AS `ACTIVITY_TYPE_CODE`,
        `t6`.`DESCRIPTION` AS `ACTIVITY_TYPE`,
        IFNULL(`t9`.`TOTAL_COST`, 0) AS `TOTAL_COST`
    FROM
        (((((((`proposal` `t1`
        LEFT JOIN `proposal_status` `t4` ON ((`t1`.`STATUS_CODE` = `t4`.`STATUS_CODE`)))
        LEFT JOIN `proposal_type` `t5` ON ((`t1`.`TYPE_CODE` = `t5`.`TYPE_CODE`)))
        LEFT JOIN `activity_type` `t6` ON ((`t6`.`ACTIVITY_TYPE_CODE` = `t1`.`ACTIVITY_TYPE_CODE`)))
        LEFT JOIN `proposal_persons` `t7` ON (((`t7`.`PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)
            AND (`t7`.`PROP_PERSON_ROLE_ID` = 3))))
        LEFT JOIN `proposal_admin_details` `t8` ON ((`t8`.`INST_PROPOSAL_ID` = `t1`.`PROPOSAL_ID`)))
        LEFT JOIN `budget_header` `t9` ON ((`t9`.`PROPOSAL_ID` = `t8`.`DEV_PROPOSAL_ID`)))
        LEFT JOIN `sponsor` `t10` ON ((`t10`.`SPONSOR_CODE` = `t1`.`SPONSOR_CODE`)))
    WHERE
        (`t1`.`PROPOSAL_SEQUENCE_STATUS` = 'ACTIVE');
//