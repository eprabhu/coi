DELIMITER //
CREATE VIEW `coi_project_proposal_status_v` AS
    SELECT 
        `eps_proposal_status`.`STATUS_CODE` AS `status_code`,
        `eps_proposal_status`.`DESCRIPTION` AS `description`
    FROM
        `eps_proposal_status`
//