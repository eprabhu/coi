DELIMITER //
CREATE PROCEDURE `GET_ENTITY_HIERARCHY`(IN AV_ENTITY_ID INT)
BEGIN
  
    WITH RECURSIVE root_parent AS (
    SELECT 
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    WHERE
        EFT.ENTITY_ID = AV_ENTITY_ID
    UNION ALL

    SELECT
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    INNER JOIN
        root_parent RP ON EFT.ENTITY_ID = RP.PARENT_ENTITY_ID
),

descendant_hierarchy AS (
    SELECT
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    WHERE
        EFT.ENTITY_ID = (SELECT ENTITY_ID FROM root_parent WHERE PARENT_ENTITY_ID IS NULL LIMIT 1)

    UNION ALL

    SELECT
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    INNER JOIN
        descendant_hierarchy DH ON EFT.PARENT_ENTITY_ID = DH.ENTITY_ID
),

sibling_hierarchy AS (
    SELECT
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    WHERE
        EFT.PARENT_ENTITY_ID = (SELECT PARENT_ENTITY_ID FROM entity_family_tree WHERE ENTITY_ID = AV_ENTITY_ID)
    AND EFT.ENTITY_ID != AV_ENTITY_ID

    UNION ALL

    SELECT
        EFT.ENTITY_ID,
        EFT.PARENT_ENTITY_ID,
		EFT.UPDATED_BY
    FROM
        entity_family_tree EFT
    INNER JOIN
        sibling_hierarchy SH ON EFT.PARENT_ENTITY_ID = SH.ENTITY_ID
)

SELECT DISTINCT
    combined_results.ENTITY_ID,
    T1.PRIMARY_NAME,
    combined_results.PARENT_ENTITY_ID,
    T2.DESCRIPTION as ENTITY_TYPE,
    T3.COUNTRY_NAME as COUNTRY,
    T1.DUNS_NUMBER,
	combined_results.UPDATED_BY
FROM (
    SELECT ENTITY_ID, PARENT_ENTITY_ID, UPDATED_BY
    FROM root_parent
    WHERE PARENT_ENTITY_ID IS NULL

    UNION ALL

    SELECT ENTITY_ID, PARENT_ENTITY_ID, UPDATED_BY
    FROM descendant_hierarchy

    UNION ALL

    SELECT ENTITY_ID, PARENT_ENTITY_ID, UPDATED_BY
    FROM sibling_hierarchy
) AS combined_results
    INNER JOIN ENTITY T1 on T1.ENTITY_ID = combined_results.ENTITY_ID
    LEFT JOIN entity_ownership_type T2 on T2.OWNERSHIP_TYPE_CODE = ENTITY_OWNERSHIP_TYPE_CODE
    LEFT JOIN COUNTRY T3 on T3.COUNTRY_CODE = T1.COUNTRY_CODE;
END
//
