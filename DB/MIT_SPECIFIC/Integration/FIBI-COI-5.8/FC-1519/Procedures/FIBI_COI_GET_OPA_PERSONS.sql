CREATE OR REPLACE PROCEDURE FIBI_COI_GET_OPA_PERSONS (
    AV_START_DATE        IN  DATE,
    AV_PAGE_NUMBER       IN  NUMBER,
    AV_LIMIT             IN  NUMBER,
    AV_INCLUDE_COUNT     IN  VARCHAR2,   -- 'Y' or 'N'
    AV_PERSON_ID_LIST    IN  VARCHAR2,   -- Comma-separated MIT_IDs
    AV_RESULT            OUT SYS_REFCURSOR,
    AV_TOTAL_COUNT       OUT NUMBER
) AS
    LV_OFFSET      NUMBER;
    LV_HAS_IDS     BOOLEAN := FALSE;
BEGIN
    -- Determine if AV_PERSON_ID_LIST is provided
    IF AV_PERSON_ID_LIST IS NOT NULL AND TRIM(AV_PERSON_ID_LIST) IS NOT NULL THEN
        LV_HAS_IDS := TRUE;
    END IF;

    -- Calculate pagination offset only if needed
    IF NOT LV_HAS_IDS THEN
        LV_OFFSET := (AV_PAGE_NUMBER - 1) * AV_LIMIT;
    END IF;

    -- Open cursor for results
    IF LV_HAS_IDS THEN
        -- When person ID list is given, skip filters and pagination
        OPEN AV_RESULT FOR
            SELECT
                p.MIT_ID,
                p.FULL_NAME,
                p.FORM_OF_ADDRESS_SHORT,
                p.FIRST_NAME,
                p.MIDDLE_NAME,
                p.LAST_NAME,
                p.KRB_NAME_UPPERCASE,
                p.EMAIL_ADDRESS,
                p.JOB_ID,
                p.JOB_TITLE,
                p.ADMIN_EMPLOYEE_TYPE,
                p.HR_DEPARTMENT_CODE_OLD,
                p.HR_DEPARTMENT_NAME,
                p.HR_ORG_UNIT_ID,
                p.ADMIN_ORG_UNIT_TITLE,
                p.ADMIN_POSITION_TITLE,
                p.PAYROLL_RANK,
                p.IS_FACULTY,
                p.EMPLOYMENT_PERCENT,
                p.IS_CONSULT_PRIV,
                p.IS_PAID_APPT,
                p.IS_SUMMER_SESSION_APPT,
                p.SUMMER_SESSION_MONTHS,
                p.IS_SABBATICAL,
                p.SABBATICAL_BEGIN_DATE,
                p.SABBATICAL_END_DATE,
                p.WAREHOUSE_LOAD_DATE,
                p.PERSONNEL_SUBAREA_CODE,
                p.PERSONNEL_SUBAREA,
                p.IS_OPA_REQUIRED
            FROM FIBI_OPA_PERSON_CURRENT p
            WHERE ',' || AV_PERSON_ID_LIST || ',' LIKE '%,' || p.MIT_ID || ',%';

            AV_TOTAL_COUNT := NULL;

    ELSE
        -- Default behavior with pagination and start date
        OPEN AV_RESULT FOR
            SELECT * FROM (
                SELECT
                    p.MIT_ID,
                    p.FULL_NAME,
                    p.FORM_OF_ADDRESS_SHORT,
                    p.FIRST_NAME,
                    p.MIDDLE_NAME,
                    p.LAST_NAME,
                    p.KRB_NAME_UPPERCASE,
                    p.EMAIL_ADDRESS,
                    p.JOB_ID,
                    p.JOB_TITLE,
                    p.ADMIN_EMPLOYEE_TYPE,
                    p.HR_DEPARTMENT_CODE_OLD,
                    p.HR_DEPARTMENT_NAME,
                    p.HR_ORG_UNIT_ID,
                    p.ADMIN_ORG_UNIT_TITLE,
                    p.ADMIN_POSITION_TITLE,
                    p.PAYROLL_RANK,
                    p.IS_FACULTY,
                    p.EMPLOYMENT_PERCENT,
                    p.IS_CONSULT_PRIV,
                    p.IS_PAID_APPT,
                    p.IS_SUMMER_SESSION_APPT,
                    p.SUMMER_SESSION_MONTHS,
                    p.IS_SABBATICAL,
                    p.SABBATICAL_BEGIN_DATE,
                    p.SABBATICAL_END_DATE,
                    p.WAREHOUSE_LOAD_DATE,
                    p.PERSONNEL_SUBAREA_CODE,
                    p.PERSONNEL_SUBAREA,
                    p.IS_OPA_REQUIRED,
                    ROW_NUMBER() OVER (ORDER BY p.MIT_ID) AS RN
                FROM FIBI_OPA_PERSON_CURRENT p
                WHERE AV_START_DATE IS NULL OR p.LAST_UPDATED_TIMESTAMP > AV_START_DATE
            )
            WHERE RN BETWEEN LV_OFFSET + 1 AND LV_OFFSET + AV_LIMIT;

        -- Count if needed
        IF AV_INCLUDE_COUNT = 'Y' THEN
            SELECT COUNT(*) INTO AV_TOTAL_COUNT
            FROM FIBI_OPA_PERSON_CURRENT p
            WHERE AV_START_DATE IS NULL OR  p.LAST_UPDATED_TIMESTAMP > AV_START_DATE;
        ELSE
            AV_TOTAL_COUNT := NULL;
        END IF;

    END IF;
END;
