DELIMITER //
CREATE FUNCTION FN_QRY_REVEWR_DAS_OVRVEW_OPA(
    AV_PERSON_ID VARCHAR(40),
    JSON_INPUT JSON
)
RETURNS TEXT
DETERMINISTIC
BEGIN

/*
FN_QRY_REVEWR_DAS_OVRVEW_OPA

Purpose:
 - Build and return a complete dynamic SQL (TEXT) used by reviewer dashboard flows for the OPA module (module code 23).
 - The returned TEXT is a ready-to-PREPARE/PREPARE/EXECUTE statement that implements CTEs, filtering, grouping, pagination and SELECT lists required by header and detail modes.

Signature:
 - FUNCTION FN_QRY_REVEWR_DAS_OVRVEW_OPA(AV_PERSON_ID VARCHAR(40), JSON_INPUT JSON) RETURNS TEXT

Inputs (via parameters and JSON_INPUT keys):
 - AV_PERSON_ID: reviewer person identifier used in rights and workflow checks (embedded in returned SQL).
 - JSON_INPUT keys used (typical):
    - FETCH_TYPE    : 'HEADER' (summary counts) or other (detail/count).
    - IS_COUNT      : boolean — when TRUE function returns SQL for a single TOTAL_COUNT.
    - LIMIT         : integer page size for pagination.
    - PAGED         : integer page index.
    - IS_UNLIMITED  : boolean — when TRUE disables LIMIT/OFFSET.
    - SORT_TYPE     : string — custom ORDER BY expression (optional).
    - Any other filter keys are forwarded to helper function FN_QRY_RVW_DAS_OVRVW_OPA_FIL_COND(AV_PERSON_ID, JSON_INPUT).

Returned SQL structure (high-level):
 - Constructs base CTEs:
    - ACCESS_TMP: units the person can access based on PERSON_ROLES/ROLE_RIGHTS/RIGHTS and ADMIN_GROUP.
    - ACCESS_PRIVATE_COMMENT: units allowed to view/maintain private comments (honors DESCEND_FLAG).
    - COMMENTS: counts of top-level comments per MODULE_ITEM_KEY with private-comment visibility rules that reference ACCESS_PRIVATE_COMMENT and reviewer relationships.
 - Builds LS_FILTER_CONDITION by combining:
    - Version/status filters, assignee/admin/workflow approver checks embedding AV_PERSON_ID,
    - UNIT access via ACCESS_TMP,
    - Additional dynamic filters returned by helper filter function.
 - SELECT composition:
    - If FETCH_TYPE = 'HEADER': SELECT aggregated numeric fields (REVIEW_PENDING_COUNT, EXPIRING_COUNT, EXPIRING_DAYS, EXPIRED_COUNT, APPROVED_COUNT).
    - Else if IS_COUNT = TRUE: SELECT COUNT(DISTINCT T1.OPA_DISCLOSURE_ID) AS TOTAL_COUNT (no pagination).
    - Else: SELECT detailed disclosure fields, and use GROUP_CONCAT / GROUP BY to avoid duplicates.
 - Joins:
    - For HEADER mode a minimal join set is used (LEFT JOIN OPA_REVIEW, PERSON).
    - For detail mode additional INNER/LEFT JOIN, and workflow subqueries are appended.
 - Pagination and sorting:
    - LIMIT/OFFSET computed as LIMIT * PAGED when IS_UNLIMITED is not TRUE.
    - SORT_TYPE used when provided; otherwise defaults to ORDER BY UPDATE_TIMESTAMP DESC.
 - Final returned value:
    - A single TEXT containing the assembled CTEs + outer SELECT ready for PREPARE/EXECUTE by the caller.

*/




    DECLARE AV_FETCH_TYPE           VARCHAR(200);
    DECLARE JOIN_CONDITION          LONGTEXT;
    DECLARE LS_DYN_CTE_SQL          LONGTEXT;
    DECLARE LS_DYN_SQL              LONGTEXT;
    DECLARE TAB_QUERY               LONGTEXT;
    DECLARE LS_FILTER_CONDITION     LONGTEXT;
    DECLARE SELECTED_FIELD_LIST     LONGTEXT;
    DECLARE LS_GROUP_CONDITION      LONGTEXT;
    DECLARE AV_IS_COUNT             BOOLEAN DEFAULT FALSE;
    DECLARE AV_LIMIT                INT DEFAULT 10;
    DECLARE AV_PAGED                INT DEFAULT 0;
    DECLARE AV_UNLIMITED            BOOLEAN DEFAULT FALSE;
    DECLARE LS_OFFSET               INT DEFAULT 0;
    DECLARE LS_OFFSET_CONDITION     LONGTEXT DEFAULT '';
    DECLARE AV_SORT_TYPE            LONGTEXT DEFAULT '';

    SET JOIN_CONDITION          = '';
    SET LS_DYN_CTE_SQL          = '';
    SET LS_DYN_SQL              = '';
    SET TAB_QUERY               = '';
    SET LS_FILTER_CONDITION     = '';
    SET SELECTED_FIELD_LIST     = '';
    SET LS_GROUP_CONDITION      = '';

    -- Declare all expected JSON fields
    SET AV_FETCH_TYPE       = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT, '$.FETCH_TYPE'));
    SET AV_IS_COUNT         = (JSON_EXTRACT(JSON_INPUT, '$.IS_COUNT') = TRUE);
    SET AV_LIMIT            = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT,'$.LIMIT'));
    SET AV_PAGED            = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT,'$.PAGED'));
    SET AV_UNLIMITED        = (JSON_EXTRACT(JSON_INPUT, '$.IS_UNLIMITED') = TRUE);
    SET AV_SORT_TYPE        = JSON_UNQUOTE(JSON_EXTRACT(JSON_INPUT,'$.SORT_TYPE'));

    -- Base CTE to determine unit access based on roles and rights
    SET LS_DYN_CTE_SQL = CONCAT('WITH ACCESS_TMP AS ( SELECT UNIT_NUMBER
            FROM PERSON_ROLES T1
            INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
            INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
            WHERE T1.DESCEND_FLAG = ''N'' AND T1.PERSON_ID = ''',AV_PERSON_ID,'''
            AND RIGHT_NAME IN (''MANAGE_OPA_DISCLOSURE'', ''VIEW_OPA_DISCLOSURE'')
            UNION
            SELECT T1.UNIT_NUMBER FROM PERSON_ROLES T1
            INNER JOIN ADMIN_GROUP T2 ON T2.ROLE_ID = T1.ROLE_ID
            WHERE T2.MODULE_CODE=23 AND T1.PERSON_ID = ''',AV_PERSON_ID,'''
            UNION
            SELECT CHILD_UNIT_NUMBER FROM UNIT_WITH_CHILDREN
            WHERE UNIT_NUMBER IN ( SELECT UNIT_NUMBER
                FROM PERSON_ROLES T1
                INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
                INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
                WHERE T1.DESCEND_FLAG = ''Y'' AND T1.PERSON_ID = ''',AV_PERSON_ID,'''
                AND RIGHT_NAME IN (''MANAGE_OPA_DISCLOSURE'', ''VIEW_OPA_DISCLOSURE'')
                )
        ),
        ACCESS_PRIVATE_COMMENT AS (SELECT UNIT_NUMBER
            FROM PERSON_ROLES T1
            INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
            INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
            WHERE T1.DESCEND_FLAG = ''N'' AND T1.PERSON_ID = ''',AV_PERSON_ID,'''
            AND T3.RIGHT_NAME IN (''VIEW_OPA_PRIVATE_COMMENTS'',''MAINTAIN_OPA_PRIVATE_COMMENTS'')
            UNION
            SELECT CHILD_UNIT_NUMBER FROM UNIT_WITH_CHILDREN
            WHERE UNIT_NUMBER IN (SELECT UNIT_NUMBER
                FROM PERSON_ROLES T1
                INNER JOIN ROLE_RIGHTS T2 ON T1.ROLE_ID = T2.ROLE_ID
                INNER JOIN RIGHTS T3 ON T2.RIGHT_ID = T3.RIGHT_ID
                WHERE T1.DESCEND_FLAG = ''Y'' AND T1.PERSON_ID = ''',AV_PERSON_ID,'''
                AND T3.RIGHT_NAME IN (''VIEW_OPA_PRIVATE_COMMENTS'',''MAINTAIN_OPA_PRIVATE_COMMENTS''))
        ),
        COMMENTS AS (SELECT COUNT(COMMENT_ID) AS COMMENT_COUNT, MODULE_ITEM_KEY
            FROM DISCL_COMMENT DC
            WHERE DC.MODULE_CODE = 23
            AND DC.COMPONENT_TYPE_CODE IN (''3'',''4'',''5'',''6'',''8'',''9'',''2'',''10'',''11'',''12'',''13'',''14'')
            AND DC.PARENT_COMMENT_ID IS NULL
            AND (EXISTS (SELECT 1 FROM ACCESS_PRIVATE_COMMENT)
                OR (DC.IS_PRIVATE = ''N''
                    OR (DC.IS_PRIVATE = ''Y'' AND DC.COMMENT_BY_PERSON_ID = ''',AV_PERSON_ID,''')
                    OR DC.MODULE_ITEM_KEY IN (
                        SELECT OPA_DISCLOSURE_ID
                        FROM OPA_REVIEW CR
                        WHERE CR.ASSIGNEE_PERSON_ID = ''',AV_PERSON_ID,'''
                    )
                )
            ) GROUP BY MODULE_ITEM_KEY
        )
    ');

    SET LS_FILTER_CONDITION = CONCAT(' T1.VERSION_STATUS != ''ARCHIVE'' AND  (
            (T8.ASSIGNEE_PERSON_ID = ''', AV_PERSON_ID ,'''AND T8.REVIEW_STATUS_TYPE_CODE IN (1,2))
            OR (T1.ADMIN_PERSON_ID = ''', AV_PERSON_ID ,''')
            OR exists  (SELECT 1 FROM WORKFLOW WF
                INNER JOIN WORKFLOW_DETAIL WFD ON WF.WORKFLOW_ID = WFD.WORKFLOW_ID
                WHERE WF.MODULE_ITEM_ID = T1.OPA_DISCLOSURE_ID
                AND WFD.APPROVER_PERSON_ID = ''',AV_PERSON_ID,'''
                AND WF.MODULE_CODE = 23 AND WF.IS_WORKFLOW_ACTIVE = ''Y''
                AND WFD.APPROVAL_STATUS = ''W''
            )
            OR T1.HOME_UNIT IN (SELECT UNIT_NUMBER FROM ACCESS_TMP)
        ) AND ', FN_QRY_RVW_DAS_OVRVW_OPA_FIL_COND(AV_PERSON_ID, JSON_INPUT)
    );

    IF AV_FETCH_TYPE = 'HEADER' THEN
        SET SELECTED_FIELD_LIST = CONCAT(
            ' COUNT(DISTINCT CASE WHEN T1.REVIEW_STATUS_CODE IN (2,3,7,8,9) THEN T1.OPA_DISCLOSURE_ID END) AS REVIEW_PENDING_COUNT,
              COUNT(DISTINCT CASE WHEN T1.EXPIRATION_DATE BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY) THEN T1.OPA_DISCLOSURE_ID END) AS EXPIRING_COUNT,
              30 AS EXPIRING_DAYS,
              COUNT(DISTINCT CASE WHEN (T1.DISPOSITION_STATUS_CODE = 4 AND T1.EXPIRATION_DATE < CURRENT_DATE()) THEN T1.OPA_DISCLOSURE_ID END) AS EXPIRED_COUNT,
              COUNT(DISTINCT CASE WHEN T1.REVIEW_STATUS_CODE IN (4) THEN T1.OPA_DISCLOSURE_ID END) AS APPROVED_COUNT'
        );
        SET AV_SORT_TYPE = '';
        SET LS_OFFSET_CONDITION = '';
        SET JOIN_CONDITION = CONCAT(' LEFT JOIN OPA_REVIEW T8 ON T8.OPA_DISCLOSURE_ID = T1.OPA_DISCLOSURE_ID
                    INNER JOIN PERSON T16 ON T16.PERSON_ID = T1.PERSON_ID ');
    ELSE
        IF AV_IS_COUNT THEN
            SET SELECTED_FIELD_LIST = ' COUNT(DISTINCT T1.OPA_DISCLOSURE_ID) AS TOTAL_COUNT ';
            SET LS_GROUP_CONDITION = '';
            SET AV_SORT_TYPE = '';
            SET LS_OFFSET_CONDITION = '';
        ELSE
            SET SELECTED_FIELD_LIST = CONCAT('T1.OPA_DISCLOSURE_ID, T1.OPA_DISCLOSURE_NUMBER, T1.OPA_CYCLE_NUMBER,
                T2.PERIOD_START_DATE,
                T2.PERIOD_END_DATE,
                T2.OPA_CYCLE_STATUS,
                T2.OPEN_DATE,
                T2.CLOSE_DATE,
                T16.FULL_NAME AS DISCLOSURE_PERSON_FULL_NAME,
                T1.PERSON_ID,
                T16.HOME_UNIT AS UNIT_NUMBER,
                T3.UNIT_NAME,
                T16.IS_FACULTY,
                T1.IS_FALL_SABATICAL,
                T1.IS_SPRING_SABATICAL,
                T1.RECEIVED_SUMMER_COMP,
                T1.SUMMER_COMP_MONTHS,
                T1.HAS_POTENTIAL_CONFLICT,
                T1.CONFLICT_DESCRIPTION,
                T1.CREATE_TIMESTAMP,
                T1.CREATE_USER,
                T1.SUBMISSION_TIMESTAMP AS CERTIFIED_AT,
                T1.UPDATE_TIMESTAMP,
                T1.UPDATED_BY,
                T5.FULL_NAME AS UPDATE_USER_FULL_NAME ,
                T1.DISPOSITION_STATUS_CODE,
                T1.REVIEW_STATUS_CODE,
                T6.DESCRIPTION AS REVIEW_STATUS,
                T7.DESCRIPTION AS DISPOSITION_STATUS,
                T9.FULL_NAME AS ADMIN_FULL_NAME,
                T10.ADMIN_GROUP_NAME,
                CASE
                WHEN T1.HOME_UNIT IN (SELECT DISTINCT UNIT_NUMBER FROM ACCESS_TMP)
                     THEN ''HOME_UNIT''
                WHEN EXISTS (
                    SELECT 1
                    FROM PERSON_AFFILIATED_UNITS PAU
                    WHERE PAU.PERSON_ID = T1.PERSON_ID
                      AND PAU.AFFILIATION_TYPE_CODE = ''1''
                      AND PAU.IS_ACTIVE = ''Y''
                      AND PAU.UNIT_NUMBER IN (SELECT UNIT_NUMBER FROM ACCESS_TMP)
                ) THEN ''AFFILIATED_UNIT''
                END AS UNIT_ACCESS_TYPE,
                GROUP_CONCAT(DISTINCT
                CASE    WHEN T8.ASSIGNEE_PERSON_ID IS NULL THEN CONCAT(T15.DESCRIPTION, " : ", "null", " : ",T14.DESCRIPTION, " : ",T14.REVIEW_STATUS_CODE)
                    ELSE CONCAT(T15.DESCRIPTION, " : ", T13.FULL_NAME, " : ", T14.DESCRIPTION, " : ",T14.REVIEW_STATUS_CODE)
                    END
                SEPARATOR ";") AS REVIEWERS,
                T1.VERSION_NUMBER,
                T1.VERSION_STATUS,
                T1.EXPIRATION_DATE,
                IFNULL(T19.COMMENT_COUNT, 0) AS DISCLOSURE_COMMENT_COUNT,
                IFNULL(T21.NO_OF_SFI, 0) AS NO_OF_SFI,
                T21.DISCLOSURE_TYPES AS ENG_RELATIONSHIPS,
                T3.DISPLAY_NAME,
                (T8.ASSIGNEE_PERSON_ID = ''', AV_PERSON_ID,'''  OR WFR.APPROVER_PERSON_ID IS NOT NULL) AS IS_LOGIN_USER_REVIEWER,
                ',FN_QRY_REVWR_DASH_CMN_SELECT_FIELDS('T1.PERSON_ID', 23));

            -- Setting GROUP BY condition to avoid duplicates
            SET LS_GROUP_CONDITION = CONCAT(' GROUP BY T1.OPA_DISCLOSURE_ID ');

            -- Pagination logic
            IF AV_UNLIMITED IS NULL OR  AV_UNLIMITED != TRUE THEN
                SET LS_OFFSET = (AV_LIMIT * AV_PAGED);
                SET LS_OFFSET_CONDITION = CONCAT(' LIMIT ',AV_LIMIT,' OFFSET ',LS_OFFSET);
            ELSE
                SET LS_OFFSET_CONDITION = '';
            END IF;

            IF AV_SORT_TYPE IS NOT NULL OR AV_SORT_TYPE <> '' THEN
                SET AV_SORT_TYPE = CONCAT(' ORDER BY ', AV_SORT_TYPE);
            ELSE
                SET AV_SORT_TYPE =  CONCAT(' ORDER BY UPDATE_TIMESTAMP DESC ');
            END IF;
        END IF;

        SET JOIN_CONDITION = CONCAT(' INNER JOIN OPA_CYCLES T2 ON T2.OPA_CYCLE_NUMBER = T1.OPA_CYCLE_NUMBER
            INNER JOIN PERSON T16 ON T16.PERSON_ID = T1.PERSON_ID
            INNER JOIN UNIT T3 ON T3.UNIT_NUMBER = T16.HOME_UNIT
            INNER JOIN UNIT T20 ON T20.UNIT_NUMBER = T1.HOME_UNIT
            INNER JOIN PERSON T5 ON T5.PERSON_ID = T1.UPDATED_BY
            INNER JOIN OPA_REVIEW_STATUS_TYPE T6 ON T6.REVIEW_STATUS_CODE = T1.REVIEW_STATUS_CODE
            LEFT JOIN OPA_DISPOSITION_STATUS_TYPE T7 ON T7.DISPOSITION_STATUS_CODE = T1.DISPOSITION_STATUS_CODE
            LEFT JOIN OPA_REVIEW T8 ON T8.OPA_DISCLOSURE_ID = T1.OPA_DISCLOSURE_ID
            LEFT JOIN PERSON T9 ON T9.PERSON_ID = T1.ADMIN_PERSON_ID
            LEFT JOIN ADMIN_GROUP T10 ON T10.ADMIN_GROUP_ID = T1.ADMIN_GROUP_ID
            LEFT JOIN OPA_DISCL_PERSON_ENTITY T11 ON T11.OPA_DISCLOSURE_ID = T1.OPA_DISCLOSURE_ID
            LEFT JOIN PERSON T13 ON T13.PERSON_ID = T8.ASSIGNEE_PERSON_ID
            LEFT JOIN opa_review_reviewer_status_type T14 ON T14.REVIEW_STATUS_CODE = T8.REVIEW_STATUS_TYPE_CODE
            LEFT JOIN opa_review_location_type T15 ON T15.LOCATION_TYPE_CODE = T8.LOCATION_TYPE_CODE
            LEFT JOIN OPA_DISCL_PERSON_ENTITY T17 ON T17.OPA_DISCLOSURE_ID = T1.OPA_DISCLOSURE_ID
            LEFT JOIN ENTITY T18 ON T18.ENTITY_ID = T17.ENTITY_ID
            LEFT JOIN COMMENTS T19 ON T19.MODULE_ITEM_KEY = T1.OPA_DISCLOSURE_ID
            LEFT JOIN (
                SELECT DISTINCT WF.MODULE_ITEM_ID, WFD.APPROVER_PERSON_ID
                FROM WORKFLOW WF
                JOIN WORKFLOW_DETAIL WFD
                  ON WF.WORKFLOW_ID = WFD.WORKFLOW_ID
                WHERE WF.MODULE_CODE = 23
                  AND WF.IS_WORKFLOW_ACTIVE = ''Y''
                   AND WFD.APPROVER_PERSON_ID = ''', AV_PERSON_ID,'''
                  AND WFD.APPROVAL_STATUS = ''W''
            ) AS WFR ON WFR.MODULE_ITEM_ID = T1.OPA_DISCLOSURE_ID
            LEFT JOIN (
                SELECT OPDER.DISCLOSURE_ID, COUNT(*) AS NO_OF_SFI,
                CONCAT(''['',
                    GROUP_CONCAT(
                        DISTINCT JSON_OBJECT(
                            ''DISCLOSURE_TYPE_CODE'', T3.DISCLOSURE_TYPE_CODE,
                            ''DESCRIPTION'', T3.DESCRIPTION
                        )
                    ),
                '']'') AS DISCLOSURE_TYPES
                FROM OPA_DISCL_PERSON_ENTITY_REL OPDER
                INNER JOIN PERSON_ENTITY PE ON OPDER.PERSON_ENTITY_ID = PE.PERSON_ENTITY_ID
                INNER JOIN OPA_DISCLOSURE OD ON OD.OPA_DISCLOSURE_ID = OPDER.DISCLOSURE_ID
                LEFT JOIN PER_ENT_DISCL_TYPE_SELECTION PETS ON PETS.PERSON_ENTITY_ID = OPDER.PERSON_ENTITY_ID
                LEFT JOIN COI_DISCLOSURE_TYPE T3 ON T3.DISCLOSURE_TYPE_CODE = PETS.DISCLOSURE_TYPE_CODE
                WHERE (
                 (OD.REVIEW_STATUS_CODE IN (''1'',''5'', ''6'') AND PE.VERSION_STATUS = ''ACTIVE'' AND PE.IS_FORM_COMPLETED = ''Y'' AND PE.IS_COMMITMENT = ''Y'')
                 OR (OD.REVIEW_STATUS_CODE IN (''2'', ''3'', ''4'', ''7'', ''8'', ''9'') AND OPDER.include_in_opa_disclosure = ''Y'')
                )
                GROUP BY OPDER.DISCLOSURE_ID
            ) T21 ON T21.DISCLOSURE_ID = T1.OPA_DISCLOSURE_ID
        ');

    END IF;


    SET LS_DYN_SQL = CONCAT(LS_DYN_CTE_SQL, ' SELECT * FROM (SELECT ', SELECTED_FIELD_LIST, '
        FROM OPA_DISCLOSURE T1 ', JOIN_CONDITION, ' WHERE ', LS_FILTER_CONDITION, LS_GROUP_CONDITION, AV_SORT_TYPE, LS_OFFSET_CONDITION, ') T ');


    RETURN LS_DYN_SQL;
END
//
