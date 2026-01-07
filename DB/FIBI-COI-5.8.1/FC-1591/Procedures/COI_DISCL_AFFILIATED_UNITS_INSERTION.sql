DELIMITER //
CREATE PROCEDURE `COI_DISCL_AFFILIATED_UNITS_INSERTION`(
    AV_DISCLOSURE_ID          INT,
    AV_UPDATED_BY        	VARCHAR(60)
)
BEGIN
	SET sql_safe_updates = 0;
    DELETE FROM disclosure_affiliated_units
    WHERE DISCLOSURE_ID = AV_DISCLOSURE_ID;
	SET sql_safe_updates = 1;
    -- Module Code 1: Awards
    INSERT INTO disclosure_affiliated_units (
        DISCLOSURE_ID,
        UNIT_NUMBER,
        MODULE_CODE,
        UPDATED_BY,
        UPDATE_TIMESTAMP
    )
    SELECT 
        dp.DISCLOSURE_ID,
        a.LEAD_UNIT_NUMBER,
        8,
        AV_UPDATED_BY,
        UTC_TIMESTAMP()
    FROM coi_discl_projects dp
    JOIN coi_int_stage_award a
        ON dp.MODULE_ITEM_KEY = a.PROJECT_NUMBER
    WHERE dp.DISCLOSURE_ID = AV_DISCLOSURE_ID
      AND dp.MODULE_CODE = 1
      AND a.LEAD_UNIT_NUMBER IS NOT NULL;

    -- Module Code 2: Proposals
    INSERT INTO disclosure_affiliated_units (
        DISCLOSURE_ID,
        UNIT_NUMBER,
        MODULE_CODE,
        UPDATED_BY,
        UPDATE_TIMESTAMP
    )
    SELECT 
        dp.DISCLOSURE_ID,
        p.LEAD_UNIT_NUMBER,
        8,
        AV_UPDATED_BY,
        UTC_TIMESTAMP()
    FROM coi_discl_projects dp
    JOIN coi_int_stage_proposal p
        ON dp.MODULE_ITEM_KEY = p.PROJECT_NUMBER
    WHERE dp.DISCLOSURE_ID = AV_DISCLOSURE_ID
      AND dp.MODULE_CODE = 2
      AND p.LEAD_UNIT_NUMBER IS NOT NULL;

    -- Module Code 3: Development Proposals
    INSERT INTO disclosure_affiliated_units (
        DISCLOSURE_ID,
        UNIT_NUMBER,
        MODULE_CODE,
        UPDATED_BY,
        UPDATE_TIMESTAMP
    )
    SELECT 
        dp.DISCLOSURE_ID,
        d.LEAD_UNIT,
        8,
        AV_UPDATED_BY,
        UTC_TIMESTAMP()
    FROM coi_discl_projects dp
    JOIN coi_int_stage_dev_proposal d
        ON dp.MODULE_ITEM_KEY = d.PROPOSAL_NUMBER
    WHERE dp.DISCLOSURE_ID = AV_DISCLOSURE_ID
      AND dp.MODULE_CODE = 3
      AND d.LEAD_UNIT IS NOT NULL;
END
//
