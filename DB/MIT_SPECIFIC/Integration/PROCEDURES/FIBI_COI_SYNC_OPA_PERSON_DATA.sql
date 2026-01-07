CREATE OR REPLACE PROCEDURE FIBI_COI_SYNC_OPA_PERSON_DATA AS
BEGIN
    MERGE INTO FIBI_OPA_PERSON_CURRENT target
    USING (
        SELECT
            MIT_ID,
            FULL_NAME,
            FORM_OF_ADDRESS_SHORT,
            FIRST_NAME,
            MIDDLE_NAME,
            LAST_NAME,
            KRB_NAME_UPPERCASE,
            EMAIL_ADDRESS,
            JOB_ID,
            JOB_TITLE,
            ADMIN_EMPLOYEE_TYPE,
            HR_DEPARTMENT_CODE_OLD,
            HR_DEPARTMENT_NAME,
            HR_ORG_UNIT_ID,
            ADMIN_ORG_UNIT_TITLE,
            ADMIN_POSITION_TITLE,
            PAYROLL_RANK,
            IS_FACULTY,
            EMPLOYMENT_PERCENT,
            IS_CONSULT_PRIV,
            IS_PAID_APPT,
            IS_SUMMER_SESSION_APPT,
            SUMMER_SESSION_MONTHS,
            IS_SABBATICAL,
            SABBATICAL_BEGIN_DATE,
            SABBATICAL_END_DATE,
            WAREHOUSE_LOAD_DATE,
            PERSONNEL_SUBAREA_CODE,
            PERSONNEL_SUBAREA,
            IS_OPA_REQUIRED
        FROM WAREUSER.OPA_PERSON_CURRENT@WAREHOUSE_COEUS.MIT.EDU
    ) source
    ON (target.MIT_ID = source.MIT_ID)
    WHEN MATCHED THEN
        UPDATE SET
            target.FULL_NAME              = source.FULL_NAME,
            target.FORM_OF_ADDRESS_SHORT = source.FORM_OF_ADDRESS_SHORT,
            target.FIRST_NAME            = source.FIRST_NAME,
            target.MIDDLE_NAME           = source.MIDDLE_NAME,
            target.LAST_NAME             = source.LAST_NAME,
            target.KRB_NAME_UPPERCASE    = source.KRB_NAME_UPPERCASE,
            target.EMAIL_ADDRESS         = source.EMAIL_ADDRESS,
            target.JOB_ID                = source.JOB_ID,
            target.JOB_TITLE             = source.JOB_TITLE,
            target.ADMIN_EMPLOYEE_TYPE   = source.ADMIN_EMPLOYEE_TYPE,
            target.HR_DEPARTMENT_CODE_OLD= source.HR_DEPARTMENT_CODE_OLD,
            target.HR_DEPARTMENT_NAME    = source.HR_DEPARTMENT_NAME,
            target.HR_ORG_UNIT_ID        = source.HR_ORG_UNIT_ID,
            target.ADMIN_ORG_UNIT_TITLE  = source.ADMIN_ORG_UNIT_TITLE,
            target.ADMIN_POSITION_TITLE  = source.ADMIN_POSITION_TITLE,
            target.PAYROLL_RANK          = source.PAYROLL_RANK,
            target.IS_FACULTY            = source.IS_FACULTY,
            target.EMPLOYMENT_PERCENT    = source.EMPLOYMENT_PERCENT,
            target.IS_CONSULT_PRIV       = source.IS_CONSULT_PRIV,
            target.IS_PAID_APPT          = source.IS_PAID_APPT,
            target.IS_SUMMER_SESSION_APPT= source.IS_SUMMER_SESSION_APPT,
            target.SUMMER_SESSION_MONTHS = source.SUMMER_SESSION_MONTHS,
            target.IS_SABBATICAL         = source.IS_SABBATICAL,
            target.SABBATICAL_BEGIN_DATE = source.SABBATICAL_BEGIN_DATE,
            target.SABBATICAL_END_DATE   = source.SABBATICAL_END_DATE,
            target.WAREHOUSE_LOAD_DATE   = source.WAREHOUSE_LOAD_DATE,
            target.PERSONNEL_SUBAREA_CODE= source.PERSONNEL_SUBAREA_CODE,
            target.PERSONNEL_SUBAREA     = source.PERSONNEL_SUBAREA,
            target.IS_OPA_REQUIRED       = source.IS_OPA_REQUIRED,
            target.LAST_UPDATED_TIMESTAMP= SYS_EXTRACT_UTC(SYSTIMESTAMP)
        WHERE NOT (
            (target.FULL_NAME = source.FULL_NAME OR (target.FULL_NAME IS NULL AND source.FULL_NAME IS NULL)) AND
            (target.FORM_OF_ADDRESS_SHORT = source.FORM_OF_ADDRESS_SHORT OR (target.FORM_OF_ADDRESS_SHORT IS NULL AND source.FORM_OF_ADDRESS_SHORT IS NULL)) AND
            (target.FIRST_NAME = source.FIRST_NAME OR (target.FIRST_NAME IS NULL AND source.FIRST_NAME IS NULL)) AND
            (target.MIDDLE_NAME = source.MIDDLE_NAME OR (target.MIDDLE_NAME IS NULL AND source.MIDDLE_NAME IS NULL)) AND
            (target.LAST_NAME = source.LAST_NAME OR (target.LAST_NAME IS NULL AND source.LAST_NAME IS NULL)) AND
            (target.KRB_NAME_UPPERCASE = source.KRB_NAME_UPPERCASE OR (target.KRB_NAME_UPPERCASE IS NULL AND source.KRB_NAME_UPPERCASE IS NULL)) AND
            (target.EMAIL_ADDRESS = source.EMAIL_ADDRESS OR (target.EMAIL_ADDRESS IS NULL AND source.EMAIL_ADDRESS IS NULL)) AND
            (target.JOB_ID = source.JOB_ID OR (target.JOB_ID IS NULL AND source.JOB_ID IS NULL)) AND
            (target.JOB_TITLE = source.JOB_TITLE OR (target.JOB_TITLE IS NULL AND source.JOB_TITLE IS NULL)) AND
            (target.ADMIN_EMPLOYEE_TYPE = source.ADMIN_EMPLOYEE_TYPE OR (target.ADMIN_EMPLOYEE_TYPE IS NULL AND source.ADMIN_EMPLOYEE_TYPE IS NULL)) AND
            (target.HR_DEPARTMENT_CODE_OLD = source.HR_DEPARTMENT_CODE_OLD OR (target.HR_DEPARTMENT_CODE_OLD IS NULL AND source.HR_DEPARTMENT_CODE_OLD IS NULL)) AND
            (target.HR_DEPARTMENT_NAME = source.HR_DEPARTMENT_NAME OR (target.HR_DEPARTMENT_NAME IS NULL AND source.HR_DEPARTMENT_NAME IS NULL)) AND
            (target.HR_ORG_UNIT_ID = source.HR_ORG_UNIT_ID OR (target.HR_ORG_UNIT_ID IS NULL AND source.HR_ORG_UNIT_ID IS NULL)) AND
            (target.ADMIN_ORG_UNIT_TITLE = source.ADMIN_ORG_UNIT_TITLE OR (target.ADMIN_ORG_UNIT_TITLE IS NULL AND source.ADMIN_ORG_UNIT_TITLE IS NULL)) AND
            (target.ADMIN_POSITION_TITLE = source.ADMIN_POSITION_TITLE OR (target.ADMIN_POSITION_TITLE IS NULL AND source.ADMIN_POSITION_TITLE IS NULL)) AND
            (target.PAYROLL_RANK = source.PAYROLL_RANK OR (target.PAYROLL_RANK IS NULL AND source.PAYROLL_RANK IS NULL)) AND
            (target.IS_FACULTY = source.IS_FACULTY OR (target.IS_FACULTY IS NULL AND source.IS_FACULTY IS NULL)) AND
            (target.EMPLOYMENT_PERCENT = source.EMPLOYMENT_PERCENT OR (target.EMPLOYMENT_PERCENT IS NULL AND source.EMPLOYMENT_PERCENT IS NULL)) AND
            (target.IS_CONSULT_PRIV = source.IS_CONSULT_PRIV OR (target.IS_CONSULT_PRIV IS NULL AND source.IS_CONSULT_PRIV IS NULL)) AND
            (target.IS_PAID_APPT = source.IS_PAID_APPT OR (target.IS_PAID_APPT IS NULL AND source.IS_PAID_APPT IS NULL)) AND
            (target.IS_SUMMER_SESSION_APPT = source.IS_SUMMER_SESSION_APPT OR (target.IS_SUMMER_SESSION_APPT IS NULL AND source.IS_SUMMER_SESSION_APPT IS NULL)) AND
            (target.SUMMER_SESSION_MONTHS = source.SUMMER_SESSION_MONTHS OR (target.SUMMER_SESSION_MONTHS IS NULL AND source.SUMMER_SESSION_MONTHS IS NULL)) AND
            (target.IS_SABBATICAL = source.IS_SABBATICAL OR (target.IS_SABBATICAL IS NULL AND source.IS_SABBATICAL IS NULL)) AND
            (target.SABBATICAL_BEGIN_DATE = source.SABBATICAL_BEGIN_DATE OR (target.SABBATICAL_BEGIN_DATE IS NULL AND source.SABBATICAL_BEGIN_DATE IS NULL)) AND
            (target.SABBATICAL_END_DATE = source.SABBATICAL_END_DATE OR (target.SABBATICAL_END_DATE IS NULL AND source.SABBATICAL_END_DATE IS NULL)) AND
            (target.WAREHOUSE_LOAD_DATE = source.WAREHOUSE_LOAD_DATE OR (target.WAREHOUSE_LOAD_DATE IS NULL AND source.WAREHOUSE_LOAD_DATE IS NULL)) AND
            (target.PERSONNEL_SUBAREA_CODE = source.PERSONNEL_SUBAREA_CODE OR (target.PERSONNEL_SUBAREA_CODE IS NULL AND source.PERSONNEL_SUBAREA_CODE IS NULL)) AND
            (target.PERSONNEL_SUBAREA = source.PERSONNEL_SUBAREA OR (target.PERSONNEL_SUBAREA IS NULL AND source.PERSONNEL_SUBAREA IS NULL)) AND
            (target.IS_OPA_REQUIRED = source.IS_OPA_REQUIRED OR (target.IS_OPA_REQUIRED IS NULL AND source.IS_OPA_REQUIRED IS NULL))
        )
    WHEN NOT MATCHED THEN
        INSERT (
            MIT_ID,
            FULL_NAME,
            FORM_OF_ADDRESS_SHORT,
            FIRST_NAME,
            MIDDLE_NAME,
            LAST_NAME,
            KRB_NAME_UPPERCASE,
            EMAIL_ADDRESS,
            JOB_ID,
            JOB_TITLE,
            ADMIN_EMPLOYEE_TYPE,
            HR_DEPARTMENT_CODE_OLD,
            HR_DEPARTMENT_NAME,
            HR_ORG_UNIT_ID,
            ADMIN_ORG_UNIT_TITLE,
            ADMIN_POSITION_TITLE,
            PAYROLL_RANK,
            IS_FACULTY,
            EMPLOYMENT_PERCENT,
            IS_CONSULT_PRIV,
            IS_PAID_APPT,
            IS_SUMMER_SESSION_APPT,
            SUMMER_SESSION_MONTHS,
            IS_SABBATICAL,
            SABBATICAL_BEGIN_DATE,
            SABBATICAL_END_DATE,
            WAREHOUSE_LOAD_DATE,
            PERSONNEL_SUBAREA_CODE,
            PERSONNEL_SUBAREA,
            IS_OPA_REQUIRED,
            CREATED_TIMESTAMP,
            LAST_UPDATED_TIMESTAMP
        )
        VALUES (
            source.MIT_ID,
            source.FULL_NAME,
            source.FORM_OF_ADDRESS_SHORT,
            source.FIRST_NAME,
            source.MIDDLE_NAME,
            source.LAST_NAME,
            source.KRB_NAME_UPPERCASE,
            source.EMAIL_ADDRESS,
            source.JOB_ID,
            source.JOB_TITLE,
            source.ADMIN_EMPLOYEE_TYPE,
            source.HR_DEPARTMENT_CODE_OLD,
            source.HR_DEPARTMENT_NAME,
            source.HR_ORG_UNIT_ID,
            source.ADMIN_ORG_UNIT_TITLE,
            source.ADMIN_POSITION_TITLE,
            source.PAYROLL_RANK,
            source.IS_FACULTY,
            source.EMPLOYMENT_PERCENT,
            source.IS_CONSULT_PRIV,
            source.IS_PAID_APPT,
            source.IS_SUMMER_SESSION_APPT,
            source.SUMMER_SESSION_MONTHS,
            source.IS_SABBATICAL,
            source.SABBATICAL_BEGIN_DATE,
            source.SABBATICAL_END_DATE,
            source.WAREHOUSE_LOAD_DATE,
            source.PERSONNEL_SUBAREA_CODE,
            source.PERSONNEL_SUBAREA,
            source.IS_OPA_REQUIRED,
            SYS_EXTRACT_UTC(SYSTIMESTAMP),
            SYS_EXTRACT_UTC(SYSTIMESTAMP)
        );

    COMMIT;
END;
