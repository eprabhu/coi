-- Drop Foreign Key if it exists

SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'CONSULTING_DISCL_FK5' 
      AND CONSTRAINT_SCHEMA = DATABASE()
);
SET @sql = IF(@fk_exists > 0, 'ALTER TABLE consulting_disclosure DROP FOREIGN KEY CONSULTING_DISCL_FK5;', 'SELECT "Foreign key does not exist";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop INDEX for CONSULTING_DISCL_FK5 if it exists
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consulting_disclosure'
      AND INDEX_NAME = 'CONSULTING_DISCL_FK5'
);

SET @sql = IF(@idx_exists > 0,
    'ALTER TABLE consulting_disclosure DROP INDEX CONSULTING_DISCL_FK5;',
    'SELECT "Index CONSULTING_DISCL_FK5 does not exist";'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add ENTITY_ID column if not exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_NAME = 'consulting_disclosure' 
      AND COLUMN_NAME = 'ENTITY_ID'
      AND TABLE_SCHEMA = DATABASE()
);
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE consulting_disclosure ADD COLUMN ENTITY_ID INT NULL AFTER DISPOSITION_STATUS_CODE;', 
    'SELECT "ENTITY_ID column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Change PERSON_ENTITY_ID to PERSON_ENTITY_NUMBER
SET @old_col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_NAME = 'consulting_disclosure' 
      AND COLUMN_NAME = 'PERSON_ENTITY_ID'
      AND TABLE_SCHEMA = DATABASE()
);

SET @new_col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_NAME = 'consulting_disclosure' 
      AND COLUMN_NAME = 'PERSON_ENTITY_NUMBER'
      AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@old_col_exists > 0 AND @new_col_exists = 0,
    'ALTER TABLE consulting_disclosure CHANGE COLUMN PERSON_ENTITY_ID PERSON_ENTITY_NUMBER INT NULL DEFAULT NULL;',
    'SELECT "Column rename not required or already done";'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- Add foreign key constraint if not exists
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'CONSULTING_DISCL_FK5' 
      AND CONSTRAINT_SCHEMA = DATABASE()
);
SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE consulting_disclosure ADD CONSTRAINT CONSULTING_DISCL_FK5 FOREIGN KEY (ENTITY_ID) REFERENCES entity (ENTITY_ID);', 
    'SELECT "Foreign key CONSULTING_DISCL_FK5 already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE coi_mgmt_plan_action_type SET STATUS_CODE = '4' WHERE (ACTION_TYPE_CODE = '21');
