DELIMITER //
CREATE PROCEDURE `FCOI_DISCL_RENWAL_REMNDR_SUMRY`(AV_DAYS INT)
BEGIN
	DECLARE LS_HTML_CONTENT LONGTEXT;

	SET SESSION group_concat_max_len = 1000000;

        -- Build HTML table from all disclosures
        SELECT CONCAT(
            '<table border="1" cellpadding="5" cellspacing="0">',
            '<tr><th>Full Name</th><th>Home Unit</th><th>Expiration Date</th></tr>',
            GROUP_CONCAT( DISTINCT
                CONCAT(
                    '<tr>',
                        '<td>', full_name, '</td>',
                        '<td>', unit_name, '</td>',
                        '<td>',DATE_FORMAT(EXPIRATION_DATE, '%m-%d-%Y'),'</td>',
                    '</tr>'
                ) SEPARATOR ''
            ),
            '</table>'
        ) AS HTML_CONTENT,
        8 AS MODULE_CODE,
        0 AS SUB_MODULE_CODE,
        0 AS SUB_MODULE_ITEM_KEY,
        0 AS MODULE_ITEM_KEY,
        DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY), '%m-%d-%Y') AS EXPIRATION_DATE,
        GROUP_CONCAT( DISTINCT t2.PERSON_ID) AS NOTIFICATION_RECIPIENTS
		FROM (
			SELECT DISTINCT t2.full_name, t3.unit_name, t1.EXPIRATION_DATE, t1.HOME_UNIT AS UNIT_NUMBER
			FROM COI_DISCLOSURE t1
			INNER JOIN PERSON t2 ON t2.PERSON_ID = t1.PERSON_ID
			INNER JOIN UNIT t3 ON t3.UNIT_NUMBER = t1.HOME_UNIT
			INNER JOIN COI_DISCL_PROJECTS t4 ON t4.DISCLOSURE_ID = t1.DISCLOSURE_ID
			WHERE t1.FCOI_TYPE_CODE != 2
			AND t1.VERSION_STATUS = 'ACTIVE'
			AND DATE(t1.EXPIRATION_DATE) = DATE(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY))
            AND t1.DISCLOSURE_ID = (
                SELECT MAX(DISCLOSURE_ID)
                    FROM COI_DISCLOSURE CD
                    WHERE CD.DISCLOSURE_NUMBER = t1.DISCLOSURE_NUMBER
                    AND CD.REVIEW_STATUS_CODE NOT IN (1, 5, 6)
            )
            AND FN_FCOI_DISCLOSURE_REQUIRED(t1.PERSON_ID) = TRUE
		) T
        INNER JOIN unit_administrator t2 ON t2.UNIT_NUMBER = T.UNIT_NUMBER AND t2.UNIT_ADMINISTRATOR_TYPE_CODE = 1
        WHERE T.full_name IS NOT NULL AND T.unit_name IS NOT NULL AND T.EXPIRATION_DATE IS NOT NULL AND T.UNIT_NUMBER IS NOT NULL group by unit_name;

END
//
