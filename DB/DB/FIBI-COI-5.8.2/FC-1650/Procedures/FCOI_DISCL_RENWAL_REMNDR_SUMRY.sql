DELIMITER //
CREATE PROCEDURE `FCOI_DISCL_RENWAL_REMNDR_SUMRY`(AV_DAYS INT)
BEGIN
	DECLARE LS_HTML_CONTENT LONGTEXT;

	SET SESSION group_concat_max_len = 1000000;

        -- Build HTML table from all disclosures
        SELECT CONCAT(
            '<table border="1" cellpadding="5" cellspacing="0">',
            '<tr><th>Full Name</th><th>Home Unit</th><th>Expiration Date</th></tr>',
            GROUP_CONCAT(
                CONCAT(
                    '<tr>',
                        '<td>', full_name, '</td>',
                        '<td>', unit_name, '</td>',
                        '<td>',DATE_FORMAT(EXPIRATION_DATE, '%m-%d-%Y'),'</td>',
                    '</tr>'
                ) SEPARATOR ''
            ),
            '</table>'
        ) INTO LS_HTML_CONTENT
		FROM (
			SELECT DISTINCT t2.full_name, t3.unit_name, t1.EXPIRATION_DATE
			FROM COI_DISCLOSURE t1
			INNER JOIN PERSON t2 ON t2.PERSON_ID = t1.PERSON_ID
			INNER JOIN UNIT t3 ON t3.UNIT_NUMBER = t1.HOME_UNIT
			INNER JOIN COI_DISCL_PROJECTS t4 ON t4.DISCLOSURE_ID = t1.DISCLOSURE_ID
			INNER JOIN (
					SELECT MODULE_ITEM_KEY, KEY_PERSON_ID, MODULE_CODE
					FROM (
						SELECT PROJECT_NUMBER AS MODULE_ITEM_KEY, KEY_PERSON_ID, STATUS, 1 AS MODULE_CODE
						FROM COI_INT_STAGE_AWARD_PERSON
						WHERE DISCLOSURE_REQUIRED_FLAG IS NOT NULL AND DISCLOSURE_REQUIRED_FLAG <> 'NOT_REQUIRED'
						UNION ALL
						SELECT PROPOSAL_NUMBER AS MODULE_ITEM_KEY, KEY_PERSON_ID, STATUS, 3 AS MODULE_CODE
						FROM COI_INT_STAGE_DEV_PROPOSAL_PERSON
						WHERE DISCLOSURE_REQUIRED_FLAG IS NOT NULL AND DISCLOSURE_REQUIRED_FLAG <> 'NOT_REQUIRED'
					) s
					WHERE s.STATUS = 'A'
					GROUP BY MODULE_ITEM_KEY, KEY_PERSON_ID
				) t5
					ON t5.MODULE_CODE = t4.MODULE_CODE
					AND t5.MODULE_ITEM_KEY = t4.MODULE_ITEM_KEY
				AND t5.KEY_PERSON_ID = t1.PERSON_ID
			WHERE t1.FCOI_TYPE_CODE != 2
			AND t1.VERSION_STATUS = 'ACTIVE'
			AND DATE(t1.EXPIRATION_DATE) = DATE(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY))
                        AND (
                                NOT EXISTS (
                                    SELECT 1
                                    FROM COI_DISCL_PROJECTS CD
                                    JOIN COI_DISCLOSURE T2
                                        ON CD.DISCLOSURE_ID = T2.DISCLOSURE_ID
                                    AND T2.PERSON_ID = t1.PERSON_ID
                                    WHERE CD.MODULE_ITEM_KEY = t4.MODULE_ITEM_KEY
                                )
                                OR EXISTS (
                                    SELECT 1
                                    FROM COI_DISCL_PROJECTS CD
                                    JOIN COI_DISCLOSURE T2
                                        ON CD.DISCLOSURE_ID = T2.DISCLOSURE_ID
                                    AND T2.PERSON_ID = t1.PERSON_ID
                                    WHERE CD.MODULE_ITEM_KEY = t4.MODULE_ITEM_KEY
                                    AND T2.REVIEW_STATUS_CODE IN (1, 9, 10)
                                )
                            )
		) T;

        SELECT
            0 AS SUB_MODULE_ITEM_KEY,
            0 AS MODULE_ITEM_KEY,
            8 AS MODULE_CODE,
            0 AS SUB_MODULE_CODE,
            LS_HTML_CONTENT AS HTML_CONTENT, DATE_FORMAT(DATE(DATE_ADD(utc_timestamp(), INTERVAL AV_DAYS DAY)), '%m-%d-%Y') AS EXPIRATION_DATE;
END
//
