DELIMITER //
CREATE FUNCTION FN_QRY_REVWR_DASH_CMN_SELECT_FIELDS (
    AV_PERSON_ID_CONDITION    VARCHAR(40),
    AV_MODULE_CODE  INT
)
RETURNS TEXT
DETERMINISTIC
BEGIN

    DECLARE LS_SELECT_FIELDS             LONGTEXT    DEFAULT '';

    SET LS_SELECT_FIELDS = CONCAT('JSON_ARRAY(');

    IF AV_MODULE_CODE != 8 THEN
        SET LS_SELECT_FIELDS = CONCAT(LS_SELECT_FIELDS, 'JSON_OBJECT(
            ''moduleName'', ''FCOI'',
            ''moduleCode'',8,
            ''isExists'', EXISTS(
                SELECT 1 FROM COI_DISCLOSURE
                WHERE PERSON_ID = ', AV_PERSON_ID_CONDITION, '
                AND VERSION_STATUS = ''ACTIVE''
            )), ');
    END IF;

    IF AV_MODULE_CODE != 23 THEN
        SET LS_SELECT_FIELDS = CONCAT(LS_SELECT_FIELDS, 'JSON_OBJECT(
            ''moduleName'', ''OPA'',
            ''moduleCode'',23,
            ''isExists'', EXISTS(
                SELECT 1 FROM OPA_DISCLOSURE
                WHERE PERSON_ID = ', AV_PERSON_ID_CONDITION, '
                AND VERSION_STATUS = ''ACTIVE''
            )), ');
    END IF;

    IF AV_MODULE_CODE != 24 THEN
        SET LS_SELECT_FIELDS = CONCAT(LS_SELECT_FIELDS, 'JSON_OBJECT(
            ''moduleName'', ''Travel'',
            ''moduleCode'',24,
            ''isExists'', EXISTS(
                SELECT 1 FROM coi_travel_disclosure
                WHERE PERSON_ID = ', AV_PERSON_ID_CONDITION, '
                AND SUBMISSION_DATE >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            )), ');
    END IF;

    IF RIGHT(LS_SELECT_FIELDS, 2) = ', ' THEN
        SET LS_SELECT_FIELDS = LEFT(LS_SELECT_FIELDS, LENGTH(LS_SELECT_FIELDS) - 2);
    END IF;

    SET LS_SELECT_FIELDS = CONCAT(LS_SELECT_FIELDS, ') AS EXISTING_DISCLOSURES');

    RETURN LS_SELECT_FIELDS;
END
//
