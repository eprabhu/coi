DELIMITER //
CREATE VIEW `coi_project_award_status_v` AS
    SELECT 
        `coi_int_stage_award_status`.`STATUS_CODE` AS `status_code`,
        `coi_int_stage_award_status`.`DESCRIPTION` AS `description`
    FROM
        `coi_int_stage_award_status`;

//