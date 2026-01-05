DELIMITER //
CREATE PROCEDURE `REVIEWER_DASHBOARD_OVERVIEW`(
    AV_LOGIN_PERSON_ID  VARCHAR(40),
    JSON_INPUT         JSON
)
BEGIN

/*

Document: Review of REVIEWER_DASHBOARD_OVERVIEW.sql

Purpose
    - Implements a reviewer dashboard summary procedure that returns header JSON or module-specific result sets depending on FETCH_TYPE.
    - Aggregates counts and metadata for three modules: FCOI (module 8), OPA (module 23), and Travel (module 24).
Signature
    Procedure: REVIEWER_DASHBOARD_OVERVIEW(AV_LOGIN_PERSON_ID VARCHAR(40), JSON_INPUT JSON)
    Inputs:
        - AV_LOGIN_PERSON_ID: reviewer person identifier.
        - JSON_INPUT: JSON payload controlling filters and flags (fields used include MODULE_CODE, FETCH_TYPE, HOME_UNIT, INCLUDE_CHILD_UNITS).
High-level flow
    - Lowercases the JSON payload into @js_lower and applies two regex-based SQL injection checks that signal an error if suspicious tokens appear.
    - Extracts JSON values into local variables (AV_MODULE_CODE, AV_FETCH_TYPE, AV_HOME_UNIT, AV_INCLUDE_CHILD_UNITS).
    - Builds two reusable subquery strings LS_RIGHT_CHK_OPA_COND and LS_RIGHT_CHK_PER_ELG_COND embedding AV_LOGIN_PERSON_ID to check unit-level rights.

    If AV_FETCH_TYPE = 'HEADER':
        - Ensures default user widget preferences exist and may insert default rows into USER_SELECTED_WIDGET.

        - Creates a temporary table temp_dashboard_data (data JSON) to collect module JSON objects.

        - For each widget (8001, 8002, 8003) checks widget activation and selection; when active, obtains a module-specific dynamic SQL (via functions FN_QRY_REVEWR_DAS_OVRVEW_FCOI, _OPA, _TRAVEL), composes an INSERT INTO temp_dashboard_data statement that wraps the result in JSON_OBJECT(...), prepares and executes the dynamic statement, then deallocates it.
            Returns HEADER as a single aggregated JSON array via SELECT JSON_ARRAYAGG(data) FROM temp_dashboard_data.
    Else (non-HEADER):
        - Chooses a single module dynamic SQL by MODULE_CODE, prepares and executes it directly to return its result set.

*/

    DECLARE AV_MODULE_CODE              VARCHAR(200);
    DECLARE LS_DYN_SQL                  LONGTEXT;
    DECLARE AV_FETCH_TYPE               VARCHAR(50);
    DECLARE LS_SQL_FCOI                 LONGTEXT;
    DECLARE LS_SQL_OPA                  LONGTEXT;
    DECLARE LS_SQL_TRAVEL               LONGTEXT;
    DECLARE LS_SQL_OPA_DELINQUENT       LONGTEXT;
    DECLARE LS_SQL_OPA_EXEMPT           LONGTEXT;
    DECLARE LS_SQL_OPA_UNIT_CHK_CON     LONGTEXT DEFAULT '';
    DECLARE LS_SQL_OPA_ELIGIBLE_PERSONS LONGTEXT;
    DECLARE AV_HOME_UNIT                VARCHAR(500);
    DECLARE AV_INCLUDE_CHILD_UNITS      BOOLEAN;
    DECLARE LS_RIGHT_CHK_OPA_COND       LONGTEXT;
    DECLARE LS_RIGHT_CHK_PER_ELG_COND   LONGTEXT;
    DECLARE LI_HAS_USER_PREFERENCE      BOOLEAN;
    DECLARE LI_IS_WIDGET_SELECTED       BOOLEAN;
    DECLARE LI_WIDGET_ORDER_NUMBER      BOOLEAN;
    DECLARE LI_IS_WIDGET_ACTIVE         BOOLEAN;
    DECLARE AV_PERSON_ID                VARCHAR(100);
    DECLARE LS_SQL_OPA_PERSON_CHK_CON   LONGTEXT DEFAULT '';

    -- Convert JSON to lowercase text
    SET @js_lower = LOWER(CAST(JSON_INPUT AS CHAR));

    -- Block obvious SQL injection patterns
    IF @js_lower REGEXP '(;|--|/\\*|\\*/|#)' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SQL Injection detected: comment or operator';
    END IF;

    -- Block dangerous SQL keywords as standalone words only
    IF @js_lower REGEXP '(^|[^a-z0-9_])(drop|insert|delete|alter|create|exec|union|grant|revoke|truncate|update |select )' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SQL Injection detected: SQL keyword found';
    END IF;

    SET AV_MODULE_CODE              = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT, '$.MODULE_CODE'));
    SET AV_FETCH_TYPE               = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT, '$.FETCH_TYPE'));
    SET AV_HOME_UNIT                = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT, '$.HOME_UNIT'));
    SET AV_INCLUDE_CHILD_UNITS      = JSON_EXTRACT(JSON_INPUT, '$.INCLUDE_CHILD_UNITS');
    SET AV_PERSON_ID                = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT, '$.PERSON'));

    SET LS_RIGHT_CHK_PER_ELG_COND = CONCAT('
        SELECT UNIT_NUMBER
        FROM PERSON_ROLES T1
        INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
        INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
        WHERE T1.DESCEND_FLAG = ''N''
          AND T1.PERSON_ID = ''', AV_LOGIN_PERSON_ID, '''
          AND T3.RIGHT_NAME IN (''VIEW_OPA_ELIGIBILITY'', ''MAINTAIN_OPA_ELIGIBILITY'')
        UNION
        SELECT CHILD_UNIT_NUMBER
        FROM UNIT_WITH_CHILDREN
        WHERE UNIT_NUMBER IN (
            SELECT UNIT_NUMBER
            FROM PERSON_ROLES T1
            INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
            INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
            WHERE T1.DESCEND_FLAG = ''Y''
              AND T1.PERSON_ID = ''', AV_LOGIN_PERSON_ID, '''
              AND T3.RIGHT_NAME IN (''VIEW_OPA_ELIGIBILITY'', ''MAINTAIN_OPA_ELIGIBILITY'')
        )');

    SET LS_RIGHT_CHK_OPA_COND = CONCAT('
        SELECT UNIT_NUMBER
        FROM PERSON_ROLES T1
        INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
        INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
        WHERE T1.DESCEND_FLAG = ''N''
          AND T1.PERSON_ID = ''', AV_LOGIN_PERSON_ID, '''
          AND T3.RIGHT_NAME IN (''VIEW_OPA_DISCLOSURE'', ''MANAGE_OPA_DISCLOSURE'')
        UNION
        SELECT CHILD_UNIT_NUMBER
        FROM UNIT_WITH_CHILDREN
        WHERE UNIT_NUMBER IN (
            SELECT UNIT_NUMBER
            FROM PERSON_ROLES T1
            INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
            INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
            WHERE T1.DESCEND_FLAG = ''Y''
              AND T1.PERSON_ID = ''', AV_LOGIN_PERSON_ID, '''
              AND T3.RIGHT_NAME IN (''VIEW_OPA_DISCLOSURE'', ''MANAGE_OPA_DISCLOSURE'')
        )');

    IF AV_FETCH_TYPE = 'HEADER' THEN

        SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END AS HAS_USER_PREFERENCE INTO LI_HAS_USER_PREFERENCE FROM USER_SELECTED_WIDGET
            WHERE PERSON_ID = AV_LOGIN_PERSON_ID AND WIDGET_ID IN ('8001', '8002', '8003');

        IF LI_HAS_USER_PREFERENCE IS NOT NULL AND LI_HAS_USER_PREFERENCE = FALSE THEN
            INSERT INTO USER_SELECTED_WIDGET (WIDGET_ID, SORT_ORDER, PERSON_ID, UPDATE_TIMESTAMP, UPDATE_USER)
            VALUES
            ('8001', 1, AV_LOGIN_PERSON_ID, NOW(), 'system'),
            ('8002', 2, AV_LOGIN_PERSON_ID, NOW(), 'system'),
            ('8003', 3, AV_LOGIN_PERSON_ID, NOW(), 'system');
            commit;
        END IF;

        DROP TEMPORARY TABLE IF EXISTS temp_dashboard_data;
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_dashboard_data (data JSON);

        SELECT CASE WHEN COUNT(t1.WIDGET_ID) > 0 THEN TRUE ELSE FALSE END AS HAS_USER_PREFERENCE,
               CASE WHEN t1.SORT_ORDER IS NULL THEN 1 ELSE t1.SORT_ORDER END AS SORT_ORDER,
               (SELECT CASE WHEN IS_ACTIVE = 'Y'
                    AND EXISTS(SELECT 1 FROM COI_DISCLOSURE_TYPE WHERE DISCLOSURE_TYPE_CODE = 1 AND IS_ACTIVE = 'Y')
                    THEN TRUE ELSE FALSE END FROM WIDGET_LOOKUP WHERE WIDGET_ID = '8001'
               ) AS IS_ACTIVE
               INTO LI_IS_WIDGET_SELECTED, LI_WIDGET_ORDER_NUMBER, LI_IS_WIDGET_ACTIVE
               FROM USER_SELECTED_WIDGET t1
            WHERE t1.PERSON_ID = AV_LOGIN_PERSON_ID AND t1.WIDGET_ID = '8001';

        IF LI_IS_WIDGET_ACTIVE = TRUE AND (LI_IS_WIDGET_SELECTED = TRUE OR LI_HAS_USER_PREFERENCE = FALSE) THEN

            SET LS_SQL_FCOI = FN_QRY_REVEWR_DAS_OVRVEW_FCOI(AV_LOGIN_PERSON_ID, JSON_INPUT);

            SET @fcoi_sql = CONCAT('INSERT INTO temp_dashboard_data(data) SELECT JSON_OBJECT(
                   ''MODULE_CODE'', 8,
                   ''COUNT_DETAILS'', JSON_ARRAY(
                           JSON_OBJECT(''LABEL'', ''Review Pending'', ''COUNT'', REVIEW_PENDING_COUNT, ''ORDER_NUMBER'', 1, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''FCOI_REVIEW_PENDING''),
                           JSON_OBJECT(''LABEL'', CONCAT(''Expiring in '', EXPIRING_DAYS, '' days''),''EXPIRING_DAYS'', EXPIRING_DAYS, ''COUNT'', EXPIRING_COUNT, ''ORDER_NUMBER'', 2, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''FCOI_EXPIRING''),
                           JSON_OBJECT(''LABEL'', ''Expired'', ''COUNT'', EXPIRED_COUNT, ''ORDER_NUMBER'', 3, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''FCOI_EXPIRED''),
                           JSON_OBJECT(''LABEL'', ''Approved'', ''COUNT'', APPROVED_COUNT, ''ORDER_NUMBER'', 4, ''SHOW_IN_HEADER'', false, ''UNIQUE_ID'', ''FCOI_APPROVED''),
                           JSON_OBJECT(''LABEL'', ''In Progress'', ''COUNT'', INPROGRESS_COUNT, ''ORDER_NUMBER'', 5, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''FCOI_INPROGRESS'')

                       ),
                    ''ORDER_NUMBER'', ', LI_WIDGET_ORDER_NUMBER, ',
                    ''MODULE_NAME'', ''FCOI Disclosure'',
                    ''MODULE_ICON'', ''article''
                ) FROM (', LS_SQL_FCOI, ') AS t');
            PREPARE stmt1 FROM @fcoi_sql;
            EXECUTE stmt1;
            DEALLOCATE PREPARE stmt1;

        END IF;

        SELECT CASE WHEN COUNT(t1.WIDGET_ID) > 0 THEN TRUE ELSE FALSE END AS HAS_USER_PREFERENCE,
               CASE WHEN t1.SORT_ORDER IS NULL THEN 1 ELSE t1.SORT_ORDER END AS SORT_ORDER,
               (SELECT CASE WHEN IS_ACTIVE = 'Y'
                    AND EXISTS(SELECT 1 FROM COI_DISCLOSURE_TYPE WHERE DISCLOSURE_TYPE_CODE = 2 AND IS_ACTIVE = 'Y')
                    THEN TRUE ELSE FALSE END FROM WIDGET_LOOKUP WHERE WIDGET_ID = '8002'
               ) AS IS_ACTIVE
               INTO LI_IS_WIDGET_SELECTED, LI_WIDGET_ORDER_NUMBER, LI_IS_WIDGET_ACTIVE
               FROM USER_SELECTED_WIDGET t1
            WHERE t1.PERSON_ID = AV_LOGIN_PERSON_ID AND t1.WIDGET_ID = '8002';

        IF LI_IS_WIDGET_ACTIVE = TRUE AND (LI_IS_WIDGET_SELECTED = TRUE OR LI_HAS_USER_PREFERENCE = FALSE) THEN

            SET LS_SQL_OPA  = FN_QRY_REVEWR_DAS_OVRVEW_OPA(AV_LOGIN_PERSON_ID, JSON_INPUT);

            SET LS_SQL_OPA_DELINQUENT = CONCAT('(SELECT COUNT(DISTINCT T0.PERSON_ID) FROM PERSON_DISCL_REQUIREMENT T0
                 INNER JOIN PERSON T1 ON T1.PERSON_ID = T0.PERSON_ID
                 INNER JOIN (',LS_RIGHT_CHK_OPA_COND, ')T10 ON T10.UNIT_NUMBER = T1.HOME_UNIT
                 WHERE T0.VERSION_STATUS = ''ACTIVE''  AND (T0.CAN_CREATE_OPA = ''Y'' OR T0.CREATE_OPA_ADMIN_FORCE_ALLOWED = ''Y'') AND
                    (T0.OPA_EXEMPT_FROM_DATE IS NULL OR (UTC_TIMESTAMP() NOT BETWEEN T0.OPA_EXEMPT_FROM_DATE AND T0.OPA_EXEMPT_TO_DATE))
                    AND (   NOT EXISTS (
                                SELECT 1 FROM OPA_DISCLOSURE OD
                                WHERE OD.PERSON_ID = T0.PERSON_ID
                                AND OD.VERSION_STATUS <> ''ARCHIVE''
                                AND OD.REVIEW_STATUS_CODE NOT IN (1,5,6) AND NOT EXISTS (
                                    SELECT 1 FROM OPA_DISCLOSURE OD2
                                    WHERE OD2.OPA_DISCLOSURE_NUMBER = OD.OPA_DISCLOSURE_NUMBER
                                    AND OD2.REVIEW_STATUS_CODE IN (1,5,6)
                                )
                            )
                        )');

            SET LS_SQL_OPA_EXEMPT = CONCAT('(SELECT COUNT(DISTINCT T0.PERSON_ID) FROM PERSON_DISCL_REQUIREMENT T0
                        INNER JOIN PERSON T1 ON T1.PERSON_ID = T0.PERSON_ID
                        INNER JOIN (', LS_RIGHT_CHK_PER_ELG_COND, ')T10 ON T10.UNIT_NUMBER = T1.HOME_UNIT
                        WHERE T0.VERSION_STATUS = ''ACTIVE''  AND  (T0.OPA_EXEMPT_FROM_DATE IS NOT NULL)');

            SET LS_SQL_OPA_ELIGIBLE_PERSONS = CONCAT('(SELECT COUNT(DISTINCT T0.PERSON_ID) FROM PERSON_DISCL_REQUIREMENT T0
                    INNER JOIN PERSON T1 ON T1.PERSON_ID = T0.PERSON_ID
                    INNER JOIN (', LS_RIGHT_CHK_PER_ELG_COND, ')T10 ON T10.UNIT_NUMBER = T1.HOME_UNIT
                    WHERE T0.VERSION_STATUS = ''ACTIVE''  AND T0.VERSION_STATUS = ''ACTIVE'' AND (T0.CAN_CREATE_OPA = ''Y'' OR T0.CREATE_OPA_ADMIN_FORCE_ALLOWED = ''Y'') ');

            IF AV_HOME_UNIT IS NOT NULL AND AV_HOME_UNIT <> '' AND AV_HOME_UNIT <> 'ALL' AND (AV_INCLUDE_CHILD_UNITS IS NULL OR AV_INCLUDE_CHILD_UNITS = FALSE)THEN
                SET LS_SQL_OPA_UNIT_CHK_CON = CONCAT(' AND T1.HOME_UNIT = ''', AV_HOME_UNIT, ''' ');
            ELSEIF AV_INCLUDE_CHILD_UNITS = TRUE THEN
                SET LS_SQL_OPA_UNIT_CHK_CON = CONCAT(' AND T1.HOME_UNIT IN (SELECT CHILD_UNIT_NUMBER FROM UNIT_WITH_CHILDREN WHERE UNIT_NUMBER =''',AV_HOME_UNIT,''') ');
            END IF;

            IF AV_PERSON_ID IS NOT NULL AND AV_PERSON_ID <> '' THEN
                SET LS_SQL_OPA_PERSON_CHK_CON = CONCAT(' AND T0.PERSON_ID = ''', AV_PERSON_ID, ''' ');
            END IF;

            SET LS_SQL_OPA_DELINQUENT = CONCAT(LS_SQL_OPA_DELINQUENT, LS_SQL_OPA_UNIT_CHK_CON, LS_SQL_OPA_PERSON_CHK_CON, ' ) ');
            SET LS_SQL_OPA_EXEMPT = CONCAT(LS_SQL_OPA_EXEMPT, LS_SQL_OPA_UNIT_CHK_CON, LS_SQL_OPA_PERSON_CHK_CON, ' ) ');
            SET LS_SQL_OPA_ELIGIBLE_PERSONS = CONCAT(LS_SQL_OPA_ELIGIBLE_PERSONS, LS_SQL_OPA_UNIT_CHK_CON, LS_SQL_OPA_PERSON_CHK_CON, ' ) ');

            -- Insert OPA results as JSON
            SET @opa_sql = CONCAT(
                'INSERT INTO temp_dashboard_data(data)
                SELECT JSON_OBJECT(
                   ''MODULE_CODE'', 23,
                   ''COUNT_DETAILS'', JSON_ARRAY(
                       JSON_OBJECT(''LABEL'', ''Review Pending'', ''COUNT'', REVIEW_PENDING_COUNT, ''ORDER_NUMBER'', 1, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''OPA_REVIEW_PENDING''),
                       JSON_OBJECT(''LABEL'', CONCAT(''Expiring in '', EXPIRING_DAYS, '' days''),''EXPIRING_DAYS'', EXPIRING_DAYS, ''COUNT'', EXPIRING_COUNT, ''ORDER_NUMBER'', 2, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''OPA_EXPIRING''),
                       JSON_OBJECT(''LABEL'', ''Expired'', ''COUNT'', EXPIRED_COUNT, ''ORDER_NUMBER'', 3, ''SHOW_IN_HEADER'', false, ''UNIQUE_ID'', ''OPA_EXPIRED''),
                       JSON_OBJECT(''LABEL'', ''Delinquent'', ''COUNT'', ', LS_SQL_OPA_DELINQUENT, ', ''ORDER_NUMBER'', 4, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''OPA_DELINQUENT''),
                       JSON_OBJECT(''LABEL'', ''Exemption'', ''COUNT'', ', LS_SQL_OPA_EXEMPT, ', ''ORDER_NUMBER'', 5, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''OPA_EXEMPT''),
                       JSON_OBJECT(''LABEL'', ''Eligible Persons'', ''COUNT'', ', LS_SQL_OPA_ELIGIBLE_PERSONS, ', ''ORDER_NUMBER'', 6, ''SHOW_IN_HEADER'', false, ''UNIQUE_ID'', ''OPA_ELIGIBLE''),
                       JSON_OBJECT(''LABEL'', ''Approved'', ''COUNT'', APPROVED_COUNT, ''ORDER_NUMBER'', 7, ''SHOW_IN_HEADER'', false, ''UNIQUE_ID'', ''OPA_APPROVED''),
                       JSON_OBJECT(''LABEL'', ''In Progress'', ''COUNT'', INPROGRESS_COUNT, ''ORDER_NUMBER'', 8, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''OPA_INPROGRESS'')

                   ),
                   ''ORDER_NUMBER'', ', LI_WIDGET_ORDER_NUMBER, ',
                   ''MODULE_NAME'', ''OPA Disclosure'',
                   ''MODULE_ICON'', ''pending_actions''
                )
                FROM (', LS_SQL_OPA, ') AS t'
            );

            PREPARE stmt2 FROM @opa_sql;
            EXECUTE stmt2;
            DEALLOCATE PREPARE stmt2;
        END IF;

        SELECT CASE WHEN COUNT(t1.WIDGET_ID) > 0 THEN TRUE ELSE FALSE END AS HAS_USER_PREFERENCE,
               CASE WHEN t1.SORT_ORDER IS NULL THEN 1 ELSE t1.SORT_ORDER END AS SORT_ORDER,
               (SELECT CASE WHEN IS_ACTIVE = 'Y'
                    AND EXISTS(SELECT 1 FROM COI_DISCLOSURE_TYPE WHERE DISCLOSURE_TYPE_CODE = 3 AND IS_ACTIVE = 'Y')
                    THEN TRUE ELSE FALSE END FROM WIDGET_LOOKUP WHERE WIDGET_ID = '8003'
               ) AS IS_ACTIVE
               INTO LI_IS_WIDGET_SELECTED, LI_WIDGET_ORDER_NUMBER, LI_IS_WIDGET_ACTIVE
               FROM USER_SELECTED_WIDGET t1
            WHERE t1.PERSON_ID = AV_LOGIN_PERSON_ID AND t1.WIDGET_ID = '8003';

        IF LI_IS_WIDGET_ACTIVE = TRUE AND (LI_IS_WIDGET_SELECTED = TRUE OR LI_HAS_USER_PREFERENCE = FALSE) THEN

             SET LS_SQL_TRAVEL  = FN_QRY_REVEWR_DAS_OVRVEW_TRAVEL(AV_LOGIN_PERSON_ID, JSON_INPUT);

             SET @travel_sql = CONCAT(
                        'INSERT INTO temp_dashboard_data(data)
                        SELECT JSON_OBJECT(
                           ''MODULE_CODE'', 24,
                           ''COUNT_DETAILS'', JSON_ARRAY(
                               JSON_OBJECT(''LABEL'', ''Review Pending'', ''COUNT'', REVIEW_PENDING_COUNT, ''ORDER_NUMBER'', 1, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''TRAVEL_REVIEW_PENDING''),
                               JSON_OBJECT(''LABEL'', ''Approved'', ''COUNT'', APPROVED_COUNT, ''ORDER_NUMBER'', 2, ''SHOW_IN_HEADER'', false, ''UNIQUE_ID'', ''TRAVEL_APPROVED''),
                               JSON_OBJECT(''LABEL'', ''In Progress'', ''COUNT'', INPROGRESS_COUNT, ''ORDER_NUMBER'', 3, ''SHOW_IN_HEADER'', true, ''UNIQUE_ID'', ''TRAVEL_INPROGRESS'')
                           ),
                           ''ORDER_NUMBER'', ', LI_WIDGET_ORDER_NUMBER, ',
                           ''MODULE_NAME'', ''Travel Disclosure'',
                           ''MODULE_ICON'', ''flight''
                        )
                        FROM (', LS_SQL_TRAVEL, ') AS t'
                    );

                PREPARE stmt2 FROM @travel_sql;
                EXECUTE stmt2;
                DEALLOCATE PREPARE stmt2;
         END IF;

        -- temp_dashboard_data contains all rows from both queries as JSON
        SELECT JSON_ARRAYAGG(data) AS HEADER FROM temp_dashboard_data;

    ELSE
        IF AV_MODULE_CODE = 8 THEN -- COI
            SET LS_DYN_SQL = FN_QRY_REVEWR_DAS_OVRVEW_FCOI(AV_LOGIN_PERSON_ID, JSON_INPUT);
        ELSEIF AV_MODULE_CODE = 23 THEN -- OPA
            SET LS_DYN_SQL = FN_QRY_REVEWR_DAS_OVRVEW_OPA(AV_LOGIN_PERSON_ID, JSON_INPUT);
        ELSEIF AV_MODULE_CODE = 24 THEN -- Travel
            SET LS_DYN_SQL = FN_QRY_REVEWR_DAS_OVRVEW_TRAVEL(AV_LOGIN_PERSON_ID, JSON_INPUT);
        END IF;

        SET @ls_sql = LS_DYN_SQL;
        PREPARE stmt FROM @ls_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;

END
//
