DELIMITER //
CREATE PROCEDURE `FCOI_DIS_RNWL_RMNDR_MNTLY_SMRY`()
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
        DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH), '%m-%d-%Y') AS EXPIRATION_DATE,
        t1.NOTIFICATION_TYPE_ID,
        30 AS DAYS_LEFT_TO_EXPIRE,
        GROUP_CONCAT( DISTINCT t2.PERSON_ID) AS NOTIFICATION_RECIPIENTS
		FROM (
			SELECT DISTINCT t2.full_name, t3.unit_name, t1.EXPIRATION_DATE, t1.HOME_UNIT AS UNIT_NUMBER
			FROM COI_DISCLOSURE t1
			INNER JOIN PERSON t2 ON t2.PERSON_ID = t1.PERSON_ID
			INNER JOIN UNIT t3 ON t3.UNIT_NUMBER = t1.HOME_UNIT
			INNER JOIN COI_DISCL_PROJECTS t4 ON t4.DISCLOSURE_ID = t1.DISCLOSURE_ID
			WHERE t1.FCOI_TYPE_CODE != 2
			AND t1.VERSION_STATUS = 'ACTIVE'
			AND (t1.EXPIRATION_DATE BETWEEN utc_timestamp() AND DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH))
            AND t1.DISCLOSURE_ID = (
                SELECT MAX(DISCLOSURE_ID)
                    FROM COI_DISCLOSURE CD
                    WHERE CD.DISCLOSURE_NUMBER = t1.DISCLOSURE_NUMBER
                    AND CD.REVIEW_STATUS_CODE NOT IN (1, 5, 6)
            )
            AND FN_FCOI_DISCLOSURE_REQUIRED(t1.PERSON_ID) = TRUE
            UNION
            SELECT DISTINCT P.full_name, U.unit_name, CD.EXPIRATION_DATE, U.UNIT_NUMBER AS UNIT_NUMBER
            FROM LEGACY_COI_DISCLOSURE CD
            JOIN LEGACY_COI_DISC_DETAILS CDP
                ON CDP.LEGACY_DISCLOSURE_ID = CD.LEGACY_DISCLOSURE_ID
            LEFT JOIN PERSON P ON P.PERSON_ID = CD.PERSON_ID
            LEFT JOIN UNIT U ON P.HOME_UNIT = U.UNIT_NUMBER
            WHERE CD.DISCLOSURE_DISPOSITION_CODE = 1
            AND CD.DISC_ACTIVE_STATUS = 1
            AND CD.EVENT_TYPE_CODE IN (5, 6)
            AND (CD.EXPIRATION_DATE BETWEEN utc_timestamp() AND DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH))
            AND (
                    NOT EXISTS (
                        SELECT 1
                        FROM COI_DISCL_PROJECTS T1
                        JOIN COI_DISCLOSURE T2
                            ON T1.DISCLOSURE_ID = T2.DISCLOSURE_ID
                        AND T2.PERSON_ID = CD.PERSON_ID
                        WHERE T2.REVIEW_STATUS_CODE NOT IN (1, 5, 6)
                        AND T2.VERSION_STATUS = 'ACTIVE'
                    )
                )
            AND CD.SEQUENCE_NUMBER = (SELECT MAX(t1.SEQUENCE_NUMBER) from LEGACY_COI_DISCLOSURE t1 WHERE t1.COI_DISCLOSURE_NUMBER = CD.COI_DISCLOSURE_NUMBER)
            AND FN_FCOI_DISCLOSURE_REQUIRED(CD.PERSON_ID) = TRUE
		) T
		INNER JOIN NOTIFICATION_TYPE t1 ON t1.NOTIFICATION_TYPE_ID = 8099 AND t1.IS_ACTIVE = 'Y'
		INNER JOIN unit_administrator t2 ON t2.UNIT_NUMBER = T.UNIT_NUMBER AND t2.UNIT_ADMINISTRATOR_TYPE_CODE = 1
		WHERE T.full_name IS NOT NULL AND T.unit_name IS NOT NULL AND T.EXPIRATION_DATE IS NOT NULL AND T.UNIT_NUMBER IS NOT NULL
		group by unit_name;
END
//
