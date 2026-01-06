DELIMITER //
CREATE PROCEDURE `GET_ENTITY_HIERARCHY`(IN AV_ENTITY_ID INT)
BEGIN
  
    WITH RECURSIVE hierarchy AS (
            -- Start from the given entity and find its parent
            SELECT
                EFT.ENTITY_ID,
                EFT.PARENT_ENTITY_ID
            FROM
                entity_family_tree EFT
            WHERE
                EFT.ENTITY_ID = AV_ENTITY_ID

            UNION ALL

            -- Recursively find the parent hierarchy
            SELECT
                EFT.ENTITY_ID,
                EFT.PARENT_ENTITY_ID
            FROM
                entity_family_tree EFT
            INNER JOIN
                hierarchy H ON EFT.ENTITY_ID = H.PARENT_ENTITY_ID
        ),
        descendants AS (
            -- Find all descendants starting from the root parent
            SELECT
                EFT.ENTITY_ID,
                EFT.PARENT_ENTITY_ID
            FROM
                entity_family_tree EFT
            WHERE
                EFT.PARENT_ENTITY_ID IN (SELECT ENTITY_ID FROM hierarchy WHERE PARENT_ENTITY_ID IS NULL)

            UNION ALL

            -- Recursively find descendants
            SELECT
                EFT.ENTITY_ID,
                EFT.PARENT_ENTITY_ID
            FROM
                entity_family_tree EFT
            INNER JOIN
                descendants D ON EFT.PARENT_ENTITY_ID = D.ENTITY_ID
        ),
        siblings AS (
            -- Find all siblings of the entity
            SELECT
                EFT.ENTITY_ID,
                EFT.PARENT_ENTITY_ID
            FROM
                entity_family_tree EFT
            WHERE
                EFT.PARENT_ENTITY_ID IN (SELECT PARENT_ENTITY_ID FROM entity_family_tree WHERE ENTITY_ID = AV_ENTITY_ID)
                AND EFT.ENTITY_ID != AV_ENTITY_ID
        ),
        max_entity_ids AS (
        -- Select the max ENTITY_ID per ENTITY_NUMBER
    	    SELECT
    	        ENTITY_NUMBER,
    	        MAX(ENTITY_ID) AS MAX_ENTITY_ID
    	    FROM ENTITY
    	    GROUP BY ENTITY_NUMBER
    	)
        -- Combine all results and enrich with metadata
        SELECT DISTINCT
            combined.ENTITY_ID,
            E.PRIMARY_NAME,
            combined.PARENT_ENTITY_ID,
            E.DUNS_NUMBER,
            T2.DESCRIPTION AS ENTITY_TYPE,
            T3.COUNTRY_NAME AS COUNTRY,
            E.ENTITY_NUMBER,
            E.UPDATED_BY
        FROM (
            SELECT * FROM hierarchy
            UNION ALL
            SELECT * FROM descendants
            UNION ALL
            SELECT * FROM siblings
        ) AS combined
        INNER JOIN ENTITY E ON E.ENTITY_ID = combined.ENTITY_ID
        LEFT JOIN entity_ownership_type T2 ON T2.OWNERSHIP_TYPE_CODE = E.ENTITY_OWNERSHIP_TYPE_CODE
        LEFT JOIN COUNTRY T3 ON T3.COUNTRY_CODE = E.COUNTRY_CODE
        LEFT JOIN ENTITY t4 on t4.ENTITY_ID = AV_ENTITY_ID
        LEFT JOIN max_entity_ids MEI ON MEI.ENTITY_NUMBER = E.ENTITY_NUMBER
        WHERE ((T4.VERSION_NUMBER = E.VERSION_NUMBER and E.ENTITY_NUMBER = t4.ENTITY_NUMBER)  or (E.ENTITY_NUMBER != t4.ENTITY_NUMBER and E.ENTITY_ID = MEI.MAX_ENTITY_ID ));
END
//
