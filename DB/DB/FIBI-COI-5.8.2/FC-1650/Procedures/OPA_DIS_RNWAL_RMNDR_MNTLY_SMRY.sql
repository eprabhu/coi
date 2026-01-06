DELIMITER //
CREATE PROCEDURE `OPA_DIS_RNWAL_RMNDR_MNTLY_SMRY`()
BEGIN
	DECLARE LS_HTML_CONTENT LONGTEXT;

	SET SESSION group_concat_max_len = 1000000;

        -- Build HTML table from all disclosures
        SELECT CONCAT(
            '<table border="1" cellpadding="5" cellspacing="0">',
            '<tr><th>Full Name</th><th>Home Unit</th><th>Unit Name</th><th>Expiration Date</th></tr>',
            GROUP_CONCAT(
                CONCAT(
                    '<tr>',
                        '<td>', t2.full_name, '</td>',
                        '<td>', t3.unit_name, '</td>',
                        '<td>', t4.unit_name, '</td>',
                        '<td>',DATE_FORMAT(t1.EXPIRATION_DATE, '%m-%d-%Y'),'</td>',
                    '</tr>'
                ) SEPARATOR ''
            ),
            '</table>'
        ) INTO LS_HTML_CONTENT
        FROM opa_disclosure t1
        INNER JOIN PERSON t2 ON t2.PERSON_ID = t1.PERSON_ID
        INNER JOIN UNIT t3 ON t3.UNIT_NUMBER = t1.HOME_UNIT
        INNER JOIN UNIT t4 ON t4.UNIT_NUMBER = t2.HOME_UNIT
        WHERE t1.VERSION_STATUS = 'ACTIVE'
        AND (t1.EXPIRATION_DATE BETWEEN utc_timestamp() AND DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH));

        -- Now return your original columns + placeholder
        IF LS_HTML_CONTENT IS NOT NULL THEN
            SELECT
            0 AS SUB_MODULE_ITEM_KEY,
            0 AS MODULE_ITEM_KEY,
            23 AS MODULE_CODE,
            0 AS SUB_MODULE_CODE,
            LS_HTML_CONTENT AS HTML_CONTENT,
            DATE_FORMAT(DATE(DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH)), '%m-%d-%Y') AS EXPIRATION_DATE,
            NOTIFICATION_TYPE_ID AS NOTIFICATION_TYPE_ID,
            30 AS DAYS_LEFT_TO_EXPIRE
            from NOTIFICATION_TYPE where NOTIFICATION_TYPE_ID = 8100 AND IS_ACTIVE = 'Y';
        END IF;
END
//
