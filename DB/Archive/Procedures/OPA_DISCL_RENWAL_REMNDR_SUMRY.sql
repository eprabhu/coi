DELIMITER //
CREATE PROCEDURE `OPA_DISCL_RENWAL_REMNDR_SUMRY`(AV_DAYS INT)
BEGIN
	DECLARE LS_HTML_CONTENT LONGTEXT;

	SET SESSION group_concat_max_len = 1000000;

        -- Build HTML table from all disclosures
        SELECT CONCAT(
            '<table border="1" cellpadding="5" cellspacing="0">',
            '<tr><th>Full Name</th><th>Home Unit</th><th>Unit Name</th><th>Expiration Date</th></tr>',
            GROUP_CONCAT( DISTINCT
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
        AND DATE(t1.EXPIRATION_DATE) = DATE(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY))
        AND FN_OPA_DISCLOSURE_REQUIRED(t1.person_id) = TRUE;

        IF LS_HTML_CONTENT IS NOT NULL THEN
            SELECT
            0 AS SUB_MODULE_ITEM_KEY,
            0 AS MODULE_ITEM_KEY,
            23 AS MODULE_CODE,
            0 AS SUB_MODULE_CODE,
            LS_HTML_CONTENT AS HTML_CONTENT, DATE_FORMAT(DATE(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY)), '%m-%d-%Y') AS EXPIRATION_DATE;
        END IF;
END
//
