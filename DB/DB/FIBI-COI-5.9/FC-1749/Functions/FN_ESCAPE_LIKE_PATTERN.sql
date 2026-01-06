DELIMITER //
CREATE FUNCTION FN_ESCAPE_LIKE_PATTERN(AV_INPUT TEXT)
RETURNS TEXT
DETERMINISTIC
BEGIN
    IF AV_INPUT IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN REPLACE(
             REPLACE(
               REPLACE(
                 REPLACE(AV_INPUT, '\\', '\\\\'),
               '''', ''''''),
             '%', '\%'),
           '_', '\_');
END
//
