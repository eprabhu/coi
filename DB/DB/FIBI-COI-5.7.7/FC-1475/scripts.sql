SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

SET @sql := IF(
    (
        SELECT COUNT(*) 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'per_ent_matrix_question'
          AND COLUMN_NAME = 'COLUMN_LABEL'
          AND DATA_TYPE = 'varchar'
          AND CHARACTER_MAXIMUM_LENGTH = 4000
    ) = 0,
    'ALTER TABLE per_ent_matrix_question MODIFY COLUMN COLUMN_LABEL VARCHAR(4000) NOT NULL;',
    'DO 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

TRUNCATE TABLE per_ent_matrix_rel_mapping;
TRUNCATE TABLE per_ent_matrix_group;
TRUNCATE TABLE per_ent_matrix_question;

INSERT INTO `per_ent_matrix_question` 
(`MATRIX_QUESTION_ID`, `COLUMN_LABEL`, `ANSWER_TYPE_CODE`, `LOOKUP_TYPE`, `LOOKUP_VALUE`, `GROUP_ID`, `SORT_ID`, `IS_ACTIVE`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES 
('1', 'Any Equity Interest in a non-publicly traded company (e.g., stock, stock option, or other ownership interest)', '1', 'ARG_VALUE_LOOKUP', 'COMPENSATED_OR_NOT', '1', '1', 'Y', UTC_TIMESTAMP(), 'admin'),
('2', 'Stock, stock option, or other ownership interests in a publicly traded company valued at >$100K (Estimated US dollar value at time of disclosure)', '1', 'ARG_VALUE_LOOKUP', 'COMPENSATED_OR_NOT', '1', '2', 'Y', UTC_TIMESTAMP(), 'admin'),
('3', 'Royalty Income from intellectual property, including copyrights (excluding any received from MIT)', '1', 'ARG_VALUE_LOOKUP', 'REMUNERATION_RANGE', '2', '1', 'Y', UTC_TIMESTAMP(), 'admin'),
('4', 'Member of a Board of Directors or Science Advisory Board', '1', 'ARG_VALUE_LOOKUP', 'REMUNERATION_RANGE', '2', '2', 'Y', UTC_TIMESTAMP(), 'admin'),
('5', 'Consulting', '1', 'ARG_VALUE_LOOKUP', 'REMUNERATION_RANGE', '2', '3', 'Y', UTC_TIMESTAMP(), 'admin'),
('6', 'Service as an Employee', '1', 'ARG_VALUE_LOOKUP', 'REMUNERATION_RANGE', '2', '4', 'Y', UTC_TIMESTAMP(), 'admin'),
('7', '<p>Speaking at conferences or seminars (excluding US universities and others*) Exclude income from:</p>\n<ul>\n  <li>U.S. Federal, State or Local or tribal government agencies</li>\n  <li>U.S. Institutes of higher education</li>\n  <li>U.S. Research institutes affiliated with Institutes of higher education, and academic teaching hospitals and medical centers</li>\n</ul>', '1', 'ARG_VALUE_LOOKUP', 'REMUNERATION_RANGE', '2', '5', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT INTO `per_ent_matrix_group` 
(`GROUP_ID`, `GROUP_NAME`, `SORT_ID`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES
('1', 'Stock, Equity & Options', '1', UTC_TIMESTAMP(), 'admin'),
('2', 'Income From:', '2', UTC_TIMESTAMP(), 'admin');

INSERT INTO `per_ent_matrix_rel_mapping` 
(`MAPPING_CODE`, `RELATIONSHIP_TYPE_CODE`, `MATRIX_QUESTION_ID`, `UPDATE_TIMESTAMP`, `UPDATED_BY`)
VALUES
('001', '1', '1', UTC_TIMESTAMP(), 'admin'),
('002', '1', '2', UTC_TIMESTAMP(), 'admin'),
('003', '1', '3', UTC_TIMESTAMP(), 'admin'),
('004', '1', '4', UTC_TIMESTAMP(), 'admin'),
('005', '1', '5', UTC_TIMESTAMP(), 'admin'),
('006', '1', '6', UTC_TIMESTAMP(), 'admin'),
('007', '1', '7', UTC_TIMESTAMP(), 'admin'),
('014', '2', '1', UTC_TIMESTAMP(), 'admin'),
('015', '2', '2', UTC_TIMESTAMP(), 'admin'),
('016', '2', '3', UTC_TIMESTAMP(), 'admin'),
('017', '2', '4', UTC_TIMESTAMP(), 'admin'),
('018', '2', '5', UTC_TIMESTAMP(), 'admin'),
('019', '2', '6', UTC_TIMESTAMP(), 'admin'),
('020', '2', '7', UTC_TIMESTAMP(), 'admin'),
('027', '3', '1', UTC_TIMESTAMP(), 'admin'),
('028', '3', '2', UTC_TIMESTAMP(), 'admin'),
('029', '3', '3', UTC_TIMESTAMP(), 'admin'),
('030', '3', '4', UTC_TIMESTAMP(), 'admin'),
('031', '3', '5', UTC_TIMESTAMP(), 'admin'),
('032', '3', '6', UTC_TIMESTAMP(), 'admin'),
('033', '3', '7', UTC_TIMESTAMP(), 'admin');

INSERT INTO `arg_value_lookup` 
(`ARG_VALUE_LOOKUP_ID`, `ARGUMENT_NAME`, `ARGUMENT_VALUE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT 
  (SELECT A.ID FROM (SELECT MAX(ARG_VALUE_LOOKUP_ID) + 1 AS ID FROM arg_value_lookup) AS A),
  'COMPENSATED_OR_NOT',
  '00000001',
  'Yes',
  UTC_TIMESTAMP(),
  'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM arg_value_lookup 
    WHERE ARGUMENT_NAME = 'COMPENSATED_OR_NOT' 
      AND ARGUMENT_VALUE = '00000001'
);

INSERT INTO `arg_value_lookup` 
(`ARG_VALUE_LOOKUP_ID`, `ARGUMENT_NAME`, `ARGUMENT_VALUE`, `DESCRIPTION`, `UPDATE_TIMESTAMP`, `UPDATE_USER`)
SELECT 
  (SELECT A.ID FROM (SELECT MAX(ARG_VALUE_LOOKUP_ID) + 1 AS ID FROM arg_value_lookup) AS A),
  'COMPENSATED_OR_NOT',
  '00000002',
  'No',
  UTC_TIMESTAMP(),
  'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM arg_value_lookup 
    WHERE ARGUMENT_NAME = 'COMPENSATED_OR_NOT' 
      AND ARGUMENT_VALUE = '00000002'
);


SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;
