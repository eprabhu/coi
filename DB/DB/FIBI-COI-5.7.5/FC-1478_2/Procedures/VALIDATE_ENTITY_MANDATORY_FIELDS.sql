DELIMITER //
CREATE PROCEDURE `VALIDATE_ENTITY_MANDATORY_FIELDS`(IN AV_ENTITY_ID INT)
BEGIN
    DECLARE overview_filled JSON;
    DECLARE sponsor_filled JSON;
    DECLARE organization_filled JSON;
    DECLARE result JSON;

    DECLARE li_sao_count INT DEFAULT 0;
    DECLARE li_address_count INT DEFAULT 0;
    DECLARE li_sponsor_type_code VARCHAR(1);
    DECLARE li_org_type_code VARCHAR(1);
    DECLARE LS_COUNTRY_CODE VARCHAR(3);
    DECLARE LI_ORG_NAME VARCHAR(1);
    DECLARE LI_SPONSOR_NAME VARCHAR(1);
    
    DECLARE LI_SPONSOR_NAME_LENGTH_EXCEEDED INT DEFAULT 0;
    DECLARE LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED INT DEFAULT 0;
    DECLARE LI_ORG_NAME_LENGTH_EXCEEDED INT DEFAULT 0;
    DECLARE LI_ORG_ADDRESS_LENGTH_EXCEEDED INT DEFAULT 0;
    DECLARE LI_MAX_NAME_LENGTH INT DEFAULT 500;
    DECLARE LI_MAX_ADDRESS_LINE_LENGTH INT DEFAULT 500;

    DECLARE overview_valid BOOLEAN DEFAULT TRUE;
    DECLARE sponsor_valid BOOLEAN DEFAULT TRUE;
    DECLARE organization_valid BOOLEAN DEFAULT TRUE;

    DECLARE validation_message VARCHAR(255);
    DECLARE validation_type VARCHAR(2);

    DECLARE all_null BOOLEAN DEFAULT TRUE;

    SELECT COUNTRY_CODE INTO LS_COUNTRY_CODE FROM ENTITY WHERE ENTITY_ID = AV_ENTITY_ID;

    -- Overview validation for CAN/USA vs others
    IF LS_COUNTRY_CODE IN ('CAN', 'USA') THEN
        -- For CAN/USA: address must include state and post code
        SELECT JSON_OBJECT(
            'entityName', PRIMARY_NAME IS NOT NULL,
            'primaryAddressLine1', PRIMARY_ADDRESS_LINE_1 IS NOT NULL,
            'city', city IS NOT NULL,
            'state', state IS NOT NULL,
            'postCode', POST_CODE IS NOT NULL,
            'countryCode', COUNTRY_CODE IS NOT NULL
        )
        INTO overview_filled
        FROM entity
        WHERE entity_Id = AV_ENTITY_ID;

        -- Check for missing fields
        IF overview_filled IS NULL OR 
           JSON_UNQUOTE(overview_filled->'$.entityName') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.primaryAddressLine1') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.city') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.state') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.postCode') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.countryCode') = 'false' THEN
            SET overview_valid = FALSE;
        END IF;
    ELSE
        -- For non-CAN/USA: no state/post code required
        SELECT JSON_OBJECT(
            'entityName', PRIMARY_NAME IS NOT NULL,
            'primaryAddressLine1', PRIMARY_ADDRESS_LINE_1 IS NOT NULL,
            'city', city IS NOT NULL,
            'countryCode', COUNTRY_CODE IS NOT NULL
        )
        INTO overview_filled
        FROM entity
        WHERE entity_Id = AV_ENTITY_ID;

        IF overview_filled IS NULL OR 
           JSON_UNQUOTE(overview_filled->'$.entityName') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.primaryAddressLine1') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.city') = 'false' OR
           JSON_UNQUOTE(overview_filled->'$.countryCode') = 'false' THEN
            SET overview_valid = FALSE;
        END IF;
    END IF;

    -- Sponsor Validations
    SELECT
        -- Address validation by country
        COUNT(CASE WHEN (
            (COUNTRY_CODE IN ('USA', 'CAN') AND CITY IS NOT NULL AND STATE IS NOT NULL AND POST_CODE IS NOT NULL AND PRIMARY_ADDRESS_LINE_1 IS NOT NULL) OR
            (COUNTRY_CODE NOT IN ('USA', 'CAN') AND CITY IS NOT NULL AND PRIMARY_ADDRESS_LINE_1 IS NOT NULL AND COUNTRY_CODE IS NOT NULL)
        ) THEN 1 END) AS li_address_count,

        -- Required field checks
        COUNT(CASE WHEN SPONSOR_TYPE_CODE IS NOT NULL THEN 1 END) AS li_sponsor_type_code,
        COUNT(CASE WHEN SPONSOR_NAME IS NOT NULL THEN 1 END) AS li_sponsor_name,

        -- Field length validation
        MAX(CASE WHEN CHAR_LENGTH(SPONSOR_NAME) > LI_MAX_NAME_LENGTH THEN 1 ELSE 0 END) AS LI_SPONSOR_NAME_LENGTH_EXCEEDED,
        GREATEST(
            MAX(CASE WHEN CHAR_LENGTH(PRIMARY_ADDRESS_LINE_1) > LI_MAX_ADDRESS_LINE_LENGTH THEN 1 ELSE 0 END),
            MAX(CASE WHEN CHAR_LENGTH(PRIMARY_ADDRESS_LINE_2) > LI_MAX_ADDRESS_LINE_LENGTH THEN 1 ELSE 0 END)
        ) AS LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED

    INTO
        li_address_count,
        li_sponsor_type_code,
        li_sponsor_name,
        LI_SPONSOR_NAME_LENGTH_EXCEEDED,
        LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED

    FROM entity_sponsor_info
    WHERE entity_id = AV_ENTITY_ID;

    -- Populate sponsor_filled object based on length or required field validation
    IF  LI_SPONSOR_NAME_LENGTH_EXCEEDED > 0 OR LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SELECT JSON_OBJECT(
            'sponsorName', LI_SPONSOR_NAME_LENGTH_EXCEEDED = 0,
            'sponsorAddress', LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED = 0
        )
        INTO sponsor_filled;
    ELSE
        SELECT JSON_OBJECT(
            'sponsorTypeCode', li_sponsor_type_code > 0,
            'sponsorAddress', li_address_count > 0,
            'sponsorName', LI_SPONSOR_NAME > 0
        )
        INTO sponsor_filled;

        -- If any field is still false, mark sponsor as invalid
        IF sponsor_filled IS NULL OR
           JSON_UNQUOTE(sponsor_filled->'$.sponsorTypeCode') = 'false' OR
           JSON_UNQUOTE(sponsor_filled->'$.sponsorAddress') = 'false' OR
           JSON_UNQUOTE(sponsor_filled->'$.sponsorName') = 'false' THEN
            SET sponsor_valid = FALSE;
        END IF;
    END IF;

    -- Organization Validations
    SELECT
        -- SAO risk validation
        (SELECT COUNT(*) 
         FROM entity_risk ER
         INNER JOIN entity_risk_type ERT ON ER.RISK_TYPE_CODE = ERT.RISK_TYPE_CODE
         WHERE ER.ENTITY_ID = AV_ENTITY_ID AND ERT.RISK_CATEGORY_CODE = 'OR') AS li_sao_count,

        -- Address completeness by country
        COUNT(CASE WHEN (
            (COUNTRY_CODE IN ('USA', 'CAN') AND CITY IS NOT NULL AND STATE IS NOT NULL AND POST_CODE IS NOT NULL AND PRIMARY_ADDRESS_LINE_1 IS NOT NULL) OR
            (COUNTRY_CODE NOT IN ('USA', 'CAN') AND CITY IS NOT NULL AND PRIMARY_ADDRESS_LINE_1 IS NOT NULL AND COUNTRY_CODE IS NOT NULL)
        ) THEN 1 END) AS li_address_count,

        -- Required fields
        COUNT(CASE WHEN ORGANIZATION_TYPE_CODE IS NOT NULL THEN 1 END) AS li_org_type_code,
        COUNT(CASE WHEN ORGANIZATION_NAME IS NOT NULL THEN 1 END) AS li_org_name,

        -- Length validations
        MAX(CASE WHEN CHAR_LENGTH(ORGANIZATION_NAME) > LI_MAX_NAME_LENGTH THEN 1 ELSE 0 END) AS LI_ORG_NAME_LENGTH_EXCEEDED,
        GREATEST(
            MAX(CASE WHEN CHAR_LENGTH(PRIMARY_ADDRESS_LINE_1) > LI_MAX_ADDRESS_LINE_LENGTH THEN 1 ELSE 0 END),
            MAX(CASE WHEN CHAR_LENGTH(PRIMARY_ADDRESS_LINE_2) > LI_MAX_ADDRESS_LINE_LENGTH THEN 1 ELSE 0 END)
        ) AS LI_ORG_ADDRESS_LENGTH_EXCEEDED

    INTO
        li_sao_count,
        li_address_count,
        li_org_type_code,
        li_org_name,
        LI_ORG_NAME_LENGTH_EXCEEDED,
        LI_ORG_ADDRESS_LENGTH_EXCEEDED

    FROM entity_sub_org_info
    WHERE entity_id = AV_ENTITY_ID;

    -- Populate organization_filled object
    IF  LI_ORG_NAME_LENGTH_EXCEEDED > 0 OR LI_ORG_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SELECT JSON_OBJECT(
            'organizationName', LI_ORG_NAME_LENGTH_EXCEEDED = 0,
            'organizationAddress', LI_ORG_ADDRESS_LENGTH_EXCEEDED = 0
        )
        INTO organization_filled;
    ELSE
        SELECT JSON_OBJECT(
            'organizationTypeCode', li_org_type_code > 0,
            'entityRisks', li_sao_count > 0,
            'organizationAddress', li_address_count > 0,
            'organizationName', LI_ORG_NAME > 0
        )
        INTO organization_filled;

        -- If any required org field is missing, mark as invalid
        IF organization_filled IS NULL OR 
           JSON_UNQUOTE(organization_filled->'$.organizationTypeCode') = 'false' OR
           JSON_UNQUOTE(organization_filled->'$.entityRisks') = 'false' OR
           JSON_UNQUOTE(organization_filled->'$.organizationAddress') = 'false' OR
           JSON_UNQUOTE(organization_filled->'$.organizationName') = 'false' THEN
            SET organization_valid = FALSE;
        END IF;
    END IF;

    -- Final Result Building

    -- Add overview validation to result
    IF overview_valid THEN
        SET validation_message = 'Overview Information is complete.';
        SET validation_type = null;
    ELSE
        SET validation_message = 'Overview Information is incomplete.';
        SET validation_type = 'VE';
        SET all_null = FALSE;
    END IF;

    SET overview_filled = COALESCE(overview_filled, 
        (SELECT JSON_OBJECT(
            'entityName', false,
            'primaryAddressLine1', false,
            'city', false,
            'state', false,
            'postCode', false,
            'countryCode', false
        ))
    );

    SET result = JSON_OBJECT(
        'ValidationType', validation_type,
        'ValidationMessage', validation_message,
        'Overview', overview_filled
    );

    -- Append sponsor validation result
    IF LI_SPONSOR_NAME_LENGTH_EXCEEDED > 0 AND LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Sponsor Name exceeds ', LI_MAX_NAME_LENGTH, ' characters and Sponsor Address Line 1 / Address Line 2 exceeds ', LI_MAX_ADDRESS_LINE_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSEIF LI_SPONSOR_NAME_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Sponsor Name exceeds ', LI_MAX_NAME_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSEIF LI_SPONSOR_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Sponsor Address Line 1 / Address Line 2 exceeds ', LI_MAX_ADDRESS_LINE_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSE
        IF sponsor_valid THEN
            SET validation_message = 'Sponsor Information is complete.';
            SET validation_type = null;
        ELSE
            SET validation_message = 'Sponsor Information is incomplete.';
            SET validation_type = 'VW';
            SET all_null = FALSE;

            SET sponsor_filled = COALESCE(sponsor_filled, 
                (SELECT JSON_OBJECT(
                    'sponsorTypeCode', false,
                    'sponsorAddress', false,
                    'sponsorName', false
                ))
            );
        END IF;
    END IF;

    SET result = JSON_ARRAY_APPEND(result, '$',
        JSON_OBJECT(
            'ValidationType', validation_type,
            'ValidationMessage', validation_message,
            'Sponsor', sponsor_filled
        )
    );

    -- Append organization validation result
    IF LI_ORG_NAME_LENGTH_EXCEEDED > 0 AND LI_ORG_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Organization Name exceeds ', LI_MAX_NAME_LENGTH,  ' characters and Organization Address Line 1 / Address Line 2 exceeds ', LI_MAX_ADDRESS_LINE_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSEIF LI_ORG_NAME_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Organization Name exceeds ', LI_MAX_NAME_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSEIF LI_ORG_ADDRESS_LENGTH_EXCEEDED > 0 THEN
        SET validation_message = CONCAT('Organization Address Line 1 / Address Line 2 exceeds ', LI_MAX_ADDRESS_LINE_LENGTH, ' characters.');
        SET validation_type = 'VE';
        SET all_null = FALSE;
    ELSE
        IF organization_valid THEN
            SET validation_message = 'Organization Information is complete.';
            SET validation_type = null;
        ELSE
            SET validation_message = 'Organization Information is incomplete.';
            SET validation_type = 'VW';
            SET all_null = FALSE;

            SET organization_filled = COALESCE(organization_filled, 
                (SELECT JSON_OBJECT(
                    'organizationTypeCode', false,
                    'entityRisks', false,
                    'organizationAddress', false,
                    'organizationName', false
                ))
            );
        END IF;
    END IF;

    SET result = JSON_ARRAY_APPEND(result, '$',
        JSON_OBJECT(
            'ValidationType', validation_type,
            'ValidationMessage', validation_message,
            'Organization', organization_filled
        )
    );

    -- Final output
    SELECT result AS fields_status;
END
//
