DELIMITER //
CREATE PROCEDURE `FCOI_DIS_RNWL_RMNDR_MNTLY_SMRY`()
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
			AND (t1.EXPIRATION_DATE BETWEEN utc_timestamp() AND DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH))
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
            UNION
            SELECT DISTINCT P.full_name, U.unit_name, CD.EXPIRATION_DATE
            FROM LEGACY_COI_DISCLOSURE CD
            JOIN LEGACY_COI_DISC_DETAILS CDP
                ON CDP.LEGACY_DISCLOSURE_ID = CD.LEGACY_DISCLOSURE_ID
            JOIN (
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
            ) stage
                ON stage.MODULE_CODE = CDP.MODULE_CODE
                AND stage.MODULE_ITEM_KEY = CDP.MODULE_ITEM_KEY
            AND stage.KEY_PERSON_ID = CD.PERSON_ID
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
                        WHERE T1.MODULE_ITEM_KEY = CDP.MODULE_ITEM_KEY
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM COI_DISCL_PROJECTS T1
                        JOIN COI_DISCLOSURE T2
                            ON T1.DISCLOSURE_ID = T2.DISCLOSURE_ID
                        AND T2.PERSON_ID = CD.PERSON_ID
                        WHERE T1.MODULE_ITEM_KEY = CDP.MODULE_ITEM_KEY
                        AND T2.REVIEW_STATUS_CODE IN (1, 9, 10)
                    )
                )
		) T;

        IF LS_HTML_CONTENT IS NOT NULL THEN
            SELECT
            0 AS SUB_MODULE_ITEM_KEY,
            0 AS MODULE_ITEM_KEY,
            8 AS MODULE_CODE,
            0 AS SUB_MODULE_CODE,
            LS_HTML_CONTENT AS HTML_CONTENT,
            DATE_FORMAT(DATE(DATE_ADD(utc_timestamp(), INTERVAL 1 MONTH)), '%m-%d-%Y') AS EXPIRATION_DATE,
            NOTIFICATION_TYPE_ID AS NOTIFICATION_TYPE_ID,
            30 AS DAYS_LEFT_TO_EXPIRE
            from NOTIFICATION_TYPE where NOTIFICATION_TYPE_ID = 8099 AND IS_ACTIVE = 'Y';
        END IF;
END
//
