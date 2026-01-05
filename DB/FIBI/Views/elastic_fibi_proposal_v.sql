DELIMITER //
CREATE VIEW `elastic_fibi_proposal_v` AS
    SELECT 
        `t1`.`PROPOSAL_ID` AS `PROPOSAL_ID`,
        `t1`.`TITLE` AS `TITLE`,
        `t2`.`FULL_NAME` AS `FULL_NAME`,
        `t5`.`DESCRIPTION` AS `CATEGORY`,
        `t3`.`DESCRIPTION` AS `TYPE`,
        `t4`.`DESCRIPTION` AS `STATUS`,
        `t6`.`SPONSOR_NAME` AS `SPONSOR`,
        `t1`.`APPLICATION_ID` AS `APPLICATION_ID`,
        `t1`.`HOME_UNIT_NAME` AS `LEAD_UNIT_NAME`,
        `t1`.`HOME_UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`
    FROM
        (((((`eps_proposal` `t1`
        LEFT JOIN `eps_proposal_persons` `t2` ON (((`t1`.`PROPOSAL_ID` = `t2`.`PROPOSAL_ID`)
            AND (`t2`.`PROP_PERSON_ROLE_ID` = 3))))
        JOIN `eps_proposal_type` `t3` ON ((`t1`.`TYPE_CODE` = `t3`.`TYPE_CODE`)))
        JOIN `eps_proposal_status` `t4` ON ((`t1`.`STATUS_CODE` = `t4`.`STATUS_CODE`)))
        JOIN `activity_type` `t5` ON ((`t1`.`ACTIVITY_TYPE_CODE` = `t5`.`ACTIVITY_TYPE_CODE`)))
        LEFT JOIN `sponsor` `t6` ON ((`t1`.`SPONSOR_CODE` = `t6`.`SPONSOR_CODE`)))
    WHERE
        ((`t1`.`STATUS_CODE` <> 35)
            AND (`t1`.`DOCUMENT_STATUS_CODE` <> '3'));
//