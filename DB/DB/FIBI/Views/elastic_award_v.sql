DELIMITER //
CREATE VIEW `elastic_award_v` AS
    SELECT 
        `award`.`AWARD_NUMBER` AS `AWARD_NUMBER`,
        `award`.`AWARD_ID` AS `AWARD_ID`,
        `award`.`TITLE` AS `TITLE`,
        `award`.`ACCOUNT_NUMBER` AS `ACCOUNT_NUMBER`,
        `award`.`STATUS_CODE` AS `STATUS_CODE`,
        `award_status`.`DESCRIPTION` AS `STATUS`,
        `sponsor`.`SPONSOR_NAME` AS `SPONSOR`,
        `award`.`SPONSOR_CODE` AS `SPONSOR_CODE`,
        `unit`.`UNIT_NUMBER` AS `LEAD_UNIT_NUMBER`,
        `unit`.`unit_name` AS `LEAD_UNIT_NAME`,
        `award_persons`.`FULL_NAME` AS `PI_NAME`,
        `award_persons`.`PERSON_ID` AS `PERSON_ID`,
        `awi`.`OBLIGATION_EXPIRATION_DATE` AS `OBLIGATION_EXPIRATION_DATE`,
        `t1`.`NAME` AS `grant_call_title`,
        `award`.`SPONSOR_AWARD_NUMBER` AS `SP_AWD_NUMBER`
    FROM
        ((((((`award`
        LEFT JOIN `award_persons` ON (((`award`.`AWARD_ID` = `award_persons`.`AWARD_ID`)
            AND (`award_persons`.`PERSON_ROLE_ID` = 3))))
        LEFT JOIN `award_status` ON ((`award`.`STATUS_CODE` = `award_status`.`STATUS_CODE`)))
        LEFT JOIN `sponsor` ON ((`sponsor`.`SPONSOR_CODE` = `award`.`SPONSOR_CODE`)))
        LEFT JOIN `unit` ON ((`award`.`LEAD_UNIT_NUMBER` = `unit`.`UNIT_NUMBER`)))
        LEFT JOIN (SELECT 
            `s1`.`AWARD_ID` AS `AWARD_ID`,
                `s1`.`OBLIGATION_EXPIRATION_DATE` AS `OBLIGATION_EXPIRATION_DATE`
        FROM
            `award_amount_info` `s1`
        WHERE
            `s1`.`AWARD_AMOUNT_INFO_ID` IN (SELECT 
                    MAX(`s2`.`AWARD_AMOUNT_INFO_ID`)
                FROM
                    `award_amount_info` `s2`
                WHERE
                    (`s1`.`AWARD_ID` = `s2`.`AWARD_ID`))) `awi` ON ((`awi`.`AWARD_ID` = `award`.`AWARD_ID`)))
        LEFT JOIN `grant_call_header` `t1` ON ((`t1`.`GRANT_HEADER_ID` = `award`.`GRANT_HEADER_ID`)))
    WHERE
        ((`award`.`AWARD_SEQUENCE_STATUS` = 'ACTIVE')
            OR ((`award`.`AWARD_DOCUMENT_TYPE_CODE` = 1)
            AND (`award`.`AWARD_SEQUENCE_STATUS` = 'PENDING')));
//