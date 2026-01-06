DELIMITER //
CREATE PROCEDURE `VALIDATE_ENTITY_MANDATORY_FIELDS`(IN entityId INT)
BEGIN
    DECLARE overview_filled JSON;
    DECLARE sponsor_filled JSON;
    DECLARE organization_filled JSON;
    DECLARE result JSON;
    DECLARE li_sao_count INT DEFAULT 0;

    DECLARE overview_valid BOOLEAN DEFAULT TRUE;
    DECLARE sponsor_valid BOOLEAN DEFAULT TRUE;
    DECLARE organization_valid BOOLEAN DEFAULT TRUE;
    
    DECLARE validation_message VARCHAR(255);
    DECLARE validation_type VARCHAR(2);

    DECLARE all_null BOOLEAN DEFAULT TRUE;

    -- Check Overview Fields from entity table
    SELECT JSON_OBJECT(
        'entityName', PRIMARY_NAME IS NOT NULL,
        'entityOwnershipTypeCode', ENTITY_OWNERSHIP_TYPE_CODE IS NOT NULL,
        'primaryAddressLine1', PRIMARY_ADDRESS_LINE_1 IS NOT NULL,
        'city', city IS NOT NULL,
        'state', state IS NOT NULL,
        'postCode', POST_CODE IS NOT NULL,
        'countryCode', COUNTRY_CODE IS NOT NULL
    )
    INTO overview_filled
    FROM entity
    WHERE entity_Id = entityId;

    -- Determine if any of the overview fields are not filled
    IF overview_filled IS NULL OR 
       JSON_UNQUOTE(overview_filled->'$.entityName') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.entityOwnershipTypeCode') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.primaryAddressLine1') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.city') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.state') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.postCode') = 'false' OR
       JSON_UNQUOTE(overview_filled->'$.countryCode') = 'false' THEN
        SET overview_valid = FALSE;
    END IF;

    -- Check Sponsor Fields from entity_sponsor_info table
    SELECT JSON_OBJECT(
        'sponsorTypeCode', SPONSOR_TYPE_CODE IS NOT NULL
    )
    INTO sponsor_filled
    FROM entity_sponsor_info
    WHERE entity_id = entityId;

    -- Determine if any of the sponsor fields are not filled
    IF sponsor_filled IS NULL OR 
       JSON_UNQUOTE(sponsor_filled->'$.sponsorTypeCode') = 'false' THEN
        SET sponsor_valid = FALSE;
    END IF;

    -- Check Organization Risks from entity_risk and entity_risk_type tables
    SELECT COUNT(*) INTO li_sao_count
    FROM entity_risk ER
    INNER JOIN entity_risk_type ERT ON ER.RISK_TYPE_CODE = ERT.RISK_TYPE_CODE
    WHERE ER.ENTITY_ID = entityId
    AND ERT.RISK_CATEGORY_CODE = 'OR';

    -- Create JSON for Organization field (assuming risks are mandatory if count > 0)
    SELECT JSON_OBJECT(
        'organizationTypeCode', ORGANIZATION_TYPE_CODE IS NOT NULL,
        'entityRisks', li_sao_count > 0
    )
    INTO organization_filled
    FROM entity_sub_org_info
    WHERE entity_Id = entityId;

    -- Determine if any of the organization fields are not filled or null
    IF organization_filled IS NULL OR 
       JSON_UNQUOTE(organization_filled->'$.organizationTypeCode') = 'false' OR
       JSON_UNQUOTE(organization_filled->'$.entityRisks') = 'false' THEN
        SET organization_valid = FALSE;
    END IF;

    -- Prepare the validation message and result for Overview
    IF overview_valid THEN
        SET validation_message = 'Overview section is fully filled';
        SET validation_type = null;
    ELSE
        SET validation_message = 'Overview section is not fully filled';
        SET validation_type = 'VE';
        SET all_null = FALSE;
    END IF;

    SET result = JSON_OBJECT(
        'ValidationType', validation_type,
        'ValidationMessage', validation_message,
        'Overview', overview_filled
    );

    -- Prepare the validation message and result for Sponsor
    IF sponsor_valid THEN
        SET validation_message = 'Sponsor section is fully filled';
        SET validation_type = null;
    ELSE
        SET validation_message = 'Sponsor section is not fully filled';
        SET validation_type = 'VE';
        SET all_null = FALSE;
    END IF;

    SET result = JSON_ARRAY_APPEND(result, '$',
        JSON_OBJECT(
            'ValidationType', validation_type,
            'ValidationMessage', validation_message,
            'Sponsor', sponsor_filled
        )
    );

    -- Prepare the validation message and result for Organization
    IF organization_valid THEN
        SET validation_message = 'Organization section is fully filled';
        SET validation_type = null;
    ELSE
        SET validation_message = 'Organization section is not fully filled';
        SET validation_type = 'VE';
        SET all_null = FALSE;
    END IF;

    SET result = JSON_ARRAY_APPEND(result, '$',
        JSON_OBJECT(
            'ValidationType', validation_type,
            'ValidationMessage', validation_message,
            'Organization', organization_filled
        )
    );

    -- Check if all validation types are null
    IF all_null THEN
        SET result = JSON_ARRAY();  -- Return an empty JSON array
    END IF;

    -- Return the combined result or empty JSON array
    SELECT result AS fields_status;
END
//
