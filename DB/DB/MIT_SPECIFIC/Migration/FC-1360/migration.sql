-- 1. Create staging tables
    CREATE TABLE FIBI_COI_LEGACY_ENGAGEMENTS (
    PERSON_ID VARCHAR2(9),
    ENTITY_NUMBER VARCHAR2(10),
    SEQUENCE_NUMBER NUMBER,
    STATUS_CODE NUMBER,
    ENTITY_NAME VARCHAR2(60),
    ENTITY_TYPE_CODE NUMBER,
    ENTITY_OWNERSHIP_TYPE CHAR(1),
    RELATIONSHIP_DESCRIPTION VARCHAR2(4000),
    STUDENT_INVOLVEMENT VARCHAR2(4000),
    STAFF_INVOLVEMENT VARCHAR2(4000),
    INST_RESOURCE_INVOLVEMENT VARCHAR2(4000),
    IS_TRAVEL CHAR(1),
    IS_FINANCIAL CHAR(1),
    IS_FOUNDER CHAR(1),
    CERTIFICATION_DATE DATE,
    UPDATE_TIMESTAMP DATE,
    UPDATE_USER VARCHAR2(40),
    HAS_TRAVEL_ENTRY CHAR(1)
    );

    CREATE TABLE FIBI_COI_CFI_ENTITY_DTLS (
    ENTITY_NUMBER           VARCHAR2(10),
    COLUMN_NAME             VARCHAR2(30),
    COLUMN_VALUE            VARCHAR2(2000),
    COMMENTS                VARCHAR2(2000),
    RELATIONSHIP_TYPE_CODE  VARCHAR2(3) NOT NULL,
    UPDATE_TIMESTAMP        DATE,
    UPDATE_USER             VARCHAR2(40)
    );

-- 2. Create exception log table
    CREATE TABLE "MIGRATION_EXCEPTION_LOG"
    ("ID" NUMBER,
        "EXCEPTION_TYPE" VARCHAR2(255 BYTE),
        "EXCEPTION_MESSAGE" CLOB,
        "STACK_TRACE" CLOB,
        "URL" VARCHAR2(255 BYTE),
        "REQUEST_OBJ" CLOB,
        "CREATE_TIMESTAMP" TIMESTAMP (6) DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("ID")
    );

-- 3. Create procedure for engagement sync
-- Procedure will attempt to delete existings records by person id and re-insert.
    DROP PROCEDURE FIBI_COI_SYNC_ENGAGEMENTS;

    CREATE OR REPLACE PROCEDURE FIBI_COI_SYNC_ENGAGEMENTS(AV_PERSON_ID VARCHAR2 DEFAULT NULL)
        IS
        V_STACK_TRACE VARCHAR2(4000) DEFAULT NULL;
    BEGIN
        -- Clear existing data for the persons or all if no persons specified
        IF AV_PERSON_ID IS NOT NULL THEN
            DELETE FROM FIBI_COI_LEGACY_ENGAGEMENTS 
            WHERE PERSON_ID IN (
                SELECT TRIM(REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL)) 
                FROM DUAL
                CONNECT BY REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL) IS NOT NULL
            );
            
            DELETE FROM FIBI_COI_CFI_ENTITY_DTLS 
            WHERE ENTITY_NUMBER IN (
                SELECT ENTITY_NUMBER 
                FROM OSP$COI_FINANCIAL_ENTITIES 
                WHERE PERSON_ID IN (
                    SELECT TRIM(REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL)) 
                    FROM DUAL
                    CONNECT BY REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL) IS NOT NULL 
                )
            );
        ELSE
            DELETE FROM FIBI_COI_LEGACY_ENGAGEMENTS;
            DELETE FROM FIBI_COI_CFI_ENTITY_DTLS;
        END IF;

        -- Insert engagement data
        INSERT INTO FIBI_COI_LEGACY_ENGAGEMENTS (
            PERSON_ID,
            ENTITY_NUMBER,
            SEQUENCE_NUMBER,
            STATUS_CODE,
            ENTITY_NAME,
            ENTITY_TYPE_CODE,
            ENTITY_OWNERSHIP_TYPE,
            RELATIONSHIP_DESCRIPTION,
            STUDENT_INVOLVEMENT,
            STAFF_INVOLVEMENT,
            INST_RESOURCE_INVOLVEMENT,
            IS_TRAVEL,
            IS_FOUNDER,
            CERTIFICATION_DATE,
            UPDATE_TIMESTAMP,
            UPDATE_USER,
            HAS_TRAVEL_ENTRY
        )
        SELECT
            FE.PERSON_ID,
            FE.ENTITY_NUMBER,
            FE.SEQUENCE_NUMBER,
            FE.STATUS_CODE,
            FE.ENTITY_NAME,
            FE.ENTITY_TYPE_CODE,
            FE.ENTITY_OWNERSHIP_TYPE,
            FE.RELATIONSHIP_DESCRIPTION,
            FE.STUDENT_INVOLVEMENT,
            FE.STAFF_INVOLVEMENT,
            FE.INST_RESOURCE_INVOLVEMENT,
            FE.IS_TRAVEL,
            FE.IS_FOUNDER,
            CT.UPDATE_TIMESTAMP,
            FE.UPDATE_TIMESTAMP,
            FE.UPDATE_USER,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM OSP$COI_FIN_ENTITY_TRAVEL TR
                    WHERE TR.ENTITY_NUMBER = FE.ENTITY_NUMBER
                ) THEN 'Y'
                ELSE 'N'
            END AS HAS_TRAVEL_ENTRY
        FROM OSP$COI_FINANCIAL_ENTITIES FE
        LEFT JOIN (
                    SELECT T1.UPDATE_TIMESTAMP, T1.ENTITY_NUMBER
                    FROM OSP$COI_FINANCIAL_ENTITIES T1
                    WHERE T1.SEQUENCE_NUMBER = (
                        SELECT MIN(T2.SEQUENCE_NUMBER)
                        FROM OSP$COI_FINANCIAL_ENTITIES T2
                        WHERE T2.ENTITY_NUMBER = T1.ENTITY_NUMBER)) CT
            ON CT.ENTITY_NUMBER = FE.ENTITY_NUMBER
        WHERE FE.SEQUENCE_NUMBER = (
            SELECT MAX(F2.SEQUENCE_NUMBER)
            FROM OSP$COI_FINANCIAL_ENTITIES F2
            WHERE F2.ENTITY_NUMBER = FE.ENTITY_NUMBER
        )
        AND (AV_PERSON_ID IS NULL
            OR FE.PERSON_ID IN (
                SELECT TRIM(REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL))
                    FROM DUAL
                CONNECT BY REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL) IS NOT NULL
            ))
        AND FE.STATUS_CODE <> 2
        AND FE.IS_TRAVEL = 'N'
        AND NOT EXISTS (
                    SELECT 1
                    FROM OSP$COI_FIN_ENTITY_TRAVEL TR
                    WHERE TR.ENTITY_NUMBER = FE.ENTITY_NUMBER
                );

        -- Insert entity matrix mapping details
        INSERT INTO FIBI_COI_CFI_ENTITY_DTLS (
            ENTITY_NUMBER,
            COLUMN_NAME,
            COLUMN_VALUE,
            COMMENTS,
            RELATIONSHIP_TYPE_CODE,
            UPDATE_TIMESTAMP,
            UPDATE_USER
        )
        SELECT
            FE_DETAILS.ENTITY_NUMBER,
            FE_DETAILS.COLUMN_NAME,
            FE_DETAILS.COLUMN_VALUE,
            FE_DETAILS.COMMENTS,
            FE_DETAILS.RELATIONSHIP_TYPE_CODE,
            FE_DETAILS.UPDATE_TIMESTAMP,
            FE_DETAILS.UPDATE_USER
        FROM OSP$COI_FIN_ENTITY_DETAILS FE_DETAILS
        JOIN (
            SELECT CFE.ENTITY_NUMBER, MAX(CFE.SEQUENCE_NUMBER) AS MAX_SEQ
            FROM OSP$COI_FINANCIAL_ENTITIES CFE
            WHERE (AV_PERSON_ID IS NULL
                OR CFE.PERSON_ID IN (
                    SELECT TRIM(REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL))
                        FROM DUAL
                    CONNECT BY REGEXP_SUBSTR(AV_PERSON_ID, '[^,]+', 1, LEVEL) IS NOT NULL
                ))
            AND CFE.STATUS_CODE <> 2
            AND CFE.IS_TRAVEL = 'N'
            AND NOT EXISTS (
                    SELECT 1
                    FROM OSP$COI_FIN_ENTITY_TRAVEL TR
                    WHERE TR.ENTITY_NUMBER = CFE.ENTITY_NUMBER)
            GROUP BY CFE.ENTITY_NUMBER
        ) LATEST
        ON FE_DETAILS.ENTITY_NUMBER = LATEST.ENTITY_NUMBER
        AND FE_DETAILS.SEQUENCE_NUMBER = LATEST.MAX_SEQ
        WHERE FE_DETAILS.COLUMN_VALUE IS NOT NULL;

        -- Update financial flags
        /*UPDATE FIBI_COI_LEGACY_ENGAGEMENTS
        SET IS_FINANCIAL = 'N'
        WHERE IS_TRAVEL = 'Y';*/

        UPDATE FIBI_COI_LEGACY_ENGAGEMENTS
        SET IS_FINANCIAL = 'Y'
        WHERE IS_TRAVEL = 'N';

        /*UPDATE FIBI_COI_LEGACY_ENGAGEMENTS
        SET IS_TRAVEL = 'Y'
        WHERE HAS_TRAVEL_ENTRY = 'Y' AND IS_TRAVEL = 'N';*/

        COMMIT;

    EXCEPTION
        WHEN OTHERS THEN
        V_STACK_TRACE := SQLERRM;
        ROLLBACK;

        INSERT INTO MIGRATION_EXCEPTION_LOG (ID, EXCEPTION_TYPE, EXCEPTION_MESSAGE, CREATE_TIMESTAMP, STACK_TRACE)
        VALUES ((SELECT NVL(MAX(ID), 0) + 1 FROM MIGRATION_EXCEPTION_LOG),
                'SYNC_ERROR',
                'Exception at FIBI_COI_SYNC_ENGAGEMENTS',
                SYSDATE,
                V_STACK_TRACE);
    END;
    /

-- 4. (Case 1) Call procedure for select person_ids to migrate their engagements
    BEGIN
        FIBI_COI_SYNC_ENGAGEMENTS('929350640,920376604'); -- Example person IDs (Comma-separated)
    END;
    /

    -- (Case 2) To migrate all person's engagements, call the procedure with NULL parameter
    BEGIN
        FIBI_COI_SYNC_ENGAGEMENTS(NULL);
    END;
    /

-- 5. (Case 1) Validation step
	-- check if both counts are same for engagement records
	SELECT COUNT(*) FROM FIBI_COI_LEGACY_ENGAGEMENTS ORDER BY PERSON_ID ASC; -- staging table
	SELECT COUNT(*) FROM OSP$COI_FINANCIAL_ENTITIES FE WHERE PERSON_ID IN ('929350640','920376604') -- Example person IDs
	AND FE.SEQUENCE_NUMBER = (
			SELECT MAX(F2.SEQUENCE_NUMBER)
			FROM OSP$COI_FINANCIAL_ENTITIES F2
			WHERE F2.ENTITY_NUMBER = FE.ENTITY_NUMBER)
    AND FE.STATUS_CODE <> 2
    AND FE.IS_TRAVEL = 'N'
    AND NOT EXISTS (
                SELECT 1
                FROM OSP$COI_FIN_ENTITY_TRAVEL TR
                WHERE TR.ENTITY_NUMBER = FE.ENTITY_NUMBER)
    ORDER BY FE.PERSON_ID ASC;

	-- check if both counts are same for matrix records
	SELECT count(*) FROM FIBI_COI_CFI_ENTITY_DTLS ORDER BY ENTITY_NUMBER ASC; -- staging table
	SELECT count(*) FROM OSP$COI_FIN_ENTITY_DETAILS FE_DETAILS
    JOIN (
        SELECT CFE.ENTITY_NUMBER, MAX(CFE.SEQUENCE_NUMBER) AS MAX_SEQ
        FROM OSP$COI_FINANCIAL_ENTITIES CFE
        WHERE CFE.PERSON_ID IN ('929350640','920376604') -- Example person IDs
        AND CFE.STATUS_CODE <> 2
        AND CFE.IS_TRAVEL = 'N'
        AND NOT EXISTS (
                SELECT 1
                FROM OSP$COI_FIN_ENTITY_TRAVEL TR
                WHERE TR.ENTITY_NUMBER = CFE.ENTITY_NUMBER)
        GROUP BY ENTITY_NUMBER
    ) LATEST
    ON FE_DETAILS.ENTITY_NUMBER = LATEST.ENTITY_NUMBER
       AND FE_DETAILS.SEQUENCE_NUMBER = LATEST.MAX_SEQ
    WHERE FE_DETAILS.COLUMN_VALUE IS NOT NULL ORDER BY FE_DETAILS.ENTITY_NUMBER ASC;

 /*
-- 6.  Export the result of each query into .sql files:
        LEGACY_COI_ENGAGEMENTS.sql;
        LEGACY_COI_ENTITY_MATRIX.sql;

      Transfer Extracted Data to MySQL:
        Convert the exported .sql files into INSERT INTO statements for MySQL.

      Load data into MySQL:*/

-- 7. Set migration status to review in LEGACY_COI_MIGRATION table.
    UPDATE LEGACY_COI_ENGAGEMENTS SET MIGRATION_STATUS = 3;

-- 8. Ensure that engagements in LEGACY_COI_ENTITY_MATRIX have the correct foreign key relationships:
    UPDATE LEGACY_COI_ENTITY_MATRIX m
    JOIN LEGACY_COI_ENGAGEMENTS e ON m.ENTITY_NUMBER = e.ENTITY_NUMBER
    SET m.ENGAGEMENT_ID = e.ENGAGEMENT_ID;

-- 9. Check if the data was migrated correctly:
    SELECT COUNT(*) FROM LEGACY_COI_ENGAGEMENTS;
    SELECT COUNT(*) FROM LEGACY_COI_ENTITY_MATRIX;

/*
-- 10. Validate Data Integrity:

    Compare record counts and sample data between Oracle and MySQL.
    Check Foreign Key Relationships:

    Validate if STATUS_CODE, ENTITY_TYPE_CODE, and MIGRATION_STATUS refer correctly to their parent tables.
    Test Application Integration:

    If applicable, ensure that the application using this data operates correctly after migration. */
