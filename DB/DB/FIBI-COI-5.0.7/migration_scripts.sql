
SET SQL_SAFE_UPDATES = 0;
         UPDATE sponsor 
SET DISPLAY_NAME = CONCAT(
    SPONSOR_CODE, 
    ' - ', 
    SPONSOR_NAME, 
    IFNULL(CONCAT(' (', ACRONYM, ')'), '')
);
SET SQL_SAFE_UPDATES = 1;


SET SQL_SAFE_UPDATES = 0;
         UPDATE unit
SET DISPLAY_NAME = CONCAT(
    UNIT_NUMBER, 
    ' - ', 
    unit_name
);
SET SQL_SAFE_UPDATES = 1;
