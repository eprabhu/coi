DELIMITER //
CREATE VIEW `coi_project_proposal_status_v` AS
    SELECT 
        `coi_int_stage_dev_proposal_status`.`STATUS_CODE` AS `status_code`,
        `coi_int_stage_dev_proposal_status`.`DESCRIPTION` AS `description`
    FROM
        `coi_int_stage_dev_proposal_status`
//