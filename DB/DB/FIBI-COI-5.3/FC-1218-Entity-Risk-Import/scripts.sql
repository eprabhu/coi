ALTER TABLE `entity_stage_details`
ADD COLUMN `SRC_RISK_LEVEL_CODE` VARCHAR(3) NULL ;

ALTER TABLE `entity_stage_details`
CHANGE COLUMN `SRC_ACRONYM` `SRC_ACRONYM` VARCHAR(30) NULL DEFAULT NULL ;

UPDATE `entity_organization_type` SET `DESCRIPTION` = 'City or Township Government' WHERE (`ORGANIZATION_TYPE_CODE` = '1');
UPDATE `entity_organization_type` SET `DESCRIPTION` = 'State Government' WHERE (`ORGANIZATION_TYPE_CODE` = '2');
UPDATE `entity_organization_type` SET `DESCRIPTION` = 'Federal Government' WHERE (`ORGANIZATION_TYPE_CODE` = '3');

INSERT INTO entity_organization_type(ORGANIZATION_TYPE_CODE, DESCRIPTION, UPDATE_TIMESTAMP, UPDATED_BY, IS_ACTIVE)
values
(4, 'Nonprofit with 501C3 IRS status (other than Institution of Higher Education)', now(), '10000000001', 'Y'),
(5, 'Nonprofit without 501C3 IRS status (other than Institution of Higher Education)', now(), '10000000001', 'Y'),
(6, 'For-profit Organization (other than small business)', NOW(), '10000000001', 'Y'),
(7, 'Other', NOW(), '10000000001', 'Y'),
(8, 'Native American Tribal Government (Federally Recognized)', NOW(), '10000000001', 'Y'),
(9, 'Individual', NOW(), '10000000001', 'Y'),
(10, 'Private Institution of Higher Education', NOW(), '10000000001', 'Y'),
(11, 'Small Business', NOW(), '10000000001', 'Y'),
(14, 'Other - Socially and economically disadvantaged', NOW(), '10000000001', 'Y'),
(15, 'Other - Women owned', NOW(), '10000000001', 'Y'),
(21, 'State-Controlled Institution of Higher Education', NOW(), '10000000001', 'Y'),
(22, 'County Government', NOW(), '10000000001', 'Y'),
(23, 'Special District Governments', NOW(), '10000000001', 'Y'),
(24, 'Independent School District', NOW(), '10000000001', 'Y'),
(25, 'Public/Indian Housing Authority', NOW(), '10000000001', 'Y'),
(26, 'Native American Tribal Organization (other than Federally recognized)', NOW(), '10000000001', 'Y'),
(27, 'Frequently used in IRB', NOW(), '10000000001', 'Y')
