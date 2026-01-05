DELIMITER //
CREATE VIEW `coi_project_proposal_qnr_ans_v` AS
    SELECT 
        `t1`.`QUESTIONNAIRE_ANS_HEADER_ID` AS `QNR_ANSWER_ID`,
        `t2`.`MODULE_ITEM_KEY` AS `PROPOSAL_NUMBER`,
        `t2`.`PERSON_ID` AS `KEY_PERSON_ID`,
        `t1`.`QUESTIONNAIRE_ID` AS `QUESTIONNAIRE_ID`,
        `t3`.`QUESTION_ID` AS `QUESTION_ID`,
        `t3`.`ANSWER` AS `ANSWER`
    FROM
        ((`quest_answer_header` `t1`
        LEFT JOIN `coi_disclosure` `t2` ON ((`t2`.`DISCLOSURE_ID` = `t1`.`MODULE_ITEM_KEY`)))
        LEFT JOIN `quest_answer` `t3` ON ((`t3`.`QUESTIONNAIRE_ANS_HEADER_ID` = `t1`.`QUESTIONNAIRE_ANS_HEADER_ID`)))
    WHERE
        ((`t1`.`MODULE_ITEM_CODE` = 8)
            AND (`t1`.`MODULE_SUB_ITEM_CODE` = 0)
            AND (`t2`.`MODULE_CODE` = 3))
//