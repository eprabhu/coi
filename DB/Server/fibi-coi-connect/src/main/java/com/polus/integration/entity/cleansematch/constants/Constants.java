package com.polus.integration.entity.cleansematch.constants;

public class Constants {

    //Entity Stage match statuses
    public static final Integer ENTITY_MATCH_STATUS_ERROR_IN_PROCESS = 7;

    //DUNS statuses
    public static final Integer ENTITY_MATCH_STATUS_EXACT_MATCH = 3;
    public static final Integer ENTITY_MATCH_STATUS_MULTIPLE_MATCH = 4;
    public static final Integer ENTITY_MATCH_STATUS_NO_MATCH = 5;
    public static final Integer ENTITY_MATCH_STATUS_DUPLICATE = 2;

    //Admin Action statuses
    public static final Integer ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED = 1;
    public static final Integer ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED = 6;
    public static final Integer ADMIN_ACTION_STATUS_SOURCE_SELECTED = 2;
    public static final Integer ADMIN_ACTION_STATUS_MATCH_SELECTED = 3;
    public static final Integer ADMIN_ACTION_STATUS_MARK_EXCLUDE = 4;
    public static final Integer ADMIN_ACTION_STATUS_WITHOUT_DUNS = 5;
    public static final Integer ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_INCLUDED_ORIGINAL_CREATED = 7;
    public static final Integer ADMIN_ACTION_STATUS_MARK_DUPLICATE_AND_EXCLUDED_ORIGINAL_CREATED = 8;

    //Admin Review Statuses
    public static final Integer ADMIN_REVIEW_STATUS_PENDING = 1;
    public static final Integer ADMIN_REVIEW_STATUS_COMPLETED = 2;
    public static final Integer ADMIN_REVIEW_STATUS_ERROR_IN_PROCESS = 3;
    public static final Integer ADMIN_REVIEW_STATUS_PROCESSING = 4;
    public static final Integer ADMIN_REVIEW_STATUS_ERROR_ENRICH_VERIFY_PROCESS = 5;


    public static final String ADDITIONAL_ADDRESS_TYPE_SPONSOR_ADDRESS = "3";
    public static final String ADDITIONAL_ADDRESS_TYPE_ORGANIZATION_ADDRESS = "4";

    public static final String BATCH_SRC_TYPE_SPONSOR = "1";
    public static final String BATCH_SRC_TYPE_ORGANIZATION = "2";

    public static final Integer BATCH_REVIEW_STATUS_COMPLETED = 2;

    public static final Integer BATCH_STATUS_COMPLETED = 3;

    public static final String EXTERNAL_REF_TYPE_SPONSOR = "1";
    public static final String EXTERNAL_REF_TYPE_ORGANIZATION = "2";
    public static final String ENTITY_RISK_TYPE_CODE_ORGANIZATION = "4";
    public static final String ENTITY_RISK_TYPE_CODE_SPONSOR = "3";

}
