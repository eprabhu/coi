DELIMITER //
CREATE PROCEDURE `GET_ENTITY_HIERARCHY`(IN AV_ENTITY_NUMBER INT)
BEGIN

    DROP TEMPORARY TABLE IF EXISTS ENTITY_HIERARCHY_TEMP_TABLE;
   -- Create the temporary table(for common use in GET_ENTITY_HIERARCHY & UPDATE_GLOBAL_ENTITY_FOREIGN_FLAG) if it doesn't exist
   CREATE TEMPORARY TABLE IF NOT EXISTS ENTITY_HIERARCHY_TEMP_TABLE (
       ENTITY_ID INT,
       ENTITY_NUMBER INT,
       PRIMARY_NAME VARCHAR(500),
       PARENT_ENTITY_NUMBER INT,
       PARENT_ENTITY_ID INT,
       DUNS_NUMBER VARCHAR(20),
       ENTITY_TYPE VARCHAR(200),
       COUNTRY VARCHAR(100),
       UPDATED_BY VARCHAR(40),
       COUNTRY_CODE VARCHAR(3),
       IS_SYSTEM_CREATED VARCHAR(1)
   );

   -- Clear the existing data
   TRUNCATE TABLE ENTITY_HIERARCHY_TEMP_TABLE;

    INSERT INTO ENTITY_HIERARCHY_TEMP_TABLE (
        ENTITY_ID, ENTITY_NUMBER, PRIMARY_NAME, PARENT_ENTITY_NUMBER, PARENT_ENTITY_ID, DUNS_NUMBER,
        ENTITY_TYPE, COUNTRY, UPDATED_BY, COUNTRY_CODE, IS_SYSTEM_CREATED
    )
    WITH RECURSIVE hierarchy AS (
            -- Start from the given entity and find its parent
            SELECT
                EFT.ENTITY_NUMBER,
                EFT.PARENT_ENTITY_NUMBER,
                EFT.IS_SYSTEM_CREATED
            FROM
                entity_family_tree EFT
            WHERE
                EFT.ENTITY_NUMBER = AV_ENTITY_NUMBER

            UNION ALL

            -- Recursively find the parent hierarchy
            SELECT
                EFT.ENTITY_NUMBER,
                EFT.PARENT_ENTITY_NUMBER,
                EFT.IS_SYSTEM_CREATED
            FROM
                entity_family_tree EFT
            INNER JOIN
                hierarchy H ON EFT.ENTITY_NUMBER = H.PARENT_ENTITY_NUMBER
        ),
        descendants AS (
            -- Find all descendants starting from the root parent
            SELECT
                EFT.ENTITY_NUMBER,
                EFT.PARENT_ENTITY_NUMBER,
                EFT.IS_SYSTEM_CREATED
            FROM
                entity_family_tree EFT
            WHERE
                EFT.PARENT_ENTITY_NUMBER IN (SELECT ENTITY_NUMBER FROM hierarchy WHERE PARENT_ENTITY_NUMBER IS NULL)

            UNION ALL

            -- Recursively find descendants
            SELECT
                EFT.ENTITY_NUMBER,
                EFT.PARENT_ENTITY_NUMBER,
                EFT.IS_SYSTEM_CREATED
            FROM
                entity_family_tree EFT
            INNER JOIN
                descendants D ON EFT.PARENT_ENTITY_NUMBER = D.ENTITY_NUMBER
        ),
        siblings AS (
            -- Find all siblings of the entity
            SELECT
                EFT.ENTITY_NUMBER,
                EFT.PARENT_ENTITY_NUMBER,
                EFT.IS_SYSTEM_CREATED
            FROM
                entity_family_tree EFT
            WHERE
                EFT.PARENT_ENTITY_NUMBER IN (SELECT PARENT_ENTITY_NUMBER FROM entity_family_tree WHERE ENTITY_NUMBER = AV_ENTITY_NUMBER)
                AND EFT.ENTITY_NUMBER != AV_ENTITY_NUMBER
        )
        -- Combine all results and enrich with metadata
        SELECT DISTINCT
            E.ENTITY_ID,
            combined.ENTITY_NUMBER,
            E.PRIMARY_NAME,
            combined.PARENT_ENTITY_NUMBER,
            PE.ENTITY_ID AS PARENT_ENTITY_ID,
            E.DUNS_NUMBER,
            T2.DESCRIPTION AS ENTITY_TYPE,
            T3.COUNTRY_NAME AS COUNTRY,
            E.UPDATED_BY,
            E.COUNTRY_CODE,
            combined.IS_SYSTEM_CREATED
        FROM (
            SELECT * FROM hierarchy
            UNION ALL
            SELECT * FROM descendants
            UNION ALL
            SELECT * FROM siblings
        ) AS combined
        INNER JOIN ENTITY E ON E.ENTITY_NUMBER = combined.ENTITY_NUMBER AND E.VERSION_STATUS = 'ACTIVE'
        LEFT JOIN ENTITY PE ON PE.ENTITY_NUMBER = combined.PARENT_ENTITY_NUMBER AND PE.VERSION_STATUS = 'ACTIVE'
        LEFT JOIN entity_ownership_type T2 ON T2.OWNERSHIP_TYPE_CODE = E.ENTITY_OWNERSHIP_TYPE_CODE
        LEFT JOIN COUNTRY T3 ON T3.COUNTRY_CODE = E.COUNTRY_CODE;

    SELECT * from ENTITY_HIERARCHY_TEMP_TABLE;

END
//
