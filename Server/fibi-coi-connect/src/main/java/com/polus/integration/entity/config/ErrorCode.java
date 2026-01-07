package com.polus.integration.entity.config;

public enum ErrorCode {

	DNB_BULK_MATCH_ERROR("FIBI_1001", "Error Processing Bulk Data"),
	DNB_CLEANSE_MATCH_ERROR("FIBI_1002", "Error While Call Cleanse Match API."),
	DNB_CLEANSE_MATCH_API_INVOKE("FIBI_1003", "Error While Invoking Cleanse Match API."),
	DNB_ENRICH_ERROR("FIBI_1004", "Error While calling run Enrich API."),
	DNB_ENRICH_API_INVOKE("FIBI_1005", "Error While Invoking Cleanse Match API."),
	DNB_BULK_CRITERIA_SEARCH_ERROR("FIBI_1006", "Error Processing Bulk search"),
	DNB_CRITERIA_SEARCH_ERROR("FIBI_1007", "Error While Call Criteria Search API."),
	DNB_CRITERIA_SEARCH_API_INVOKE("FIBI_1008", "Error While Invoking Criteria Search API.");
	
	
    private final String errorCode;
    private final String errorMessage;

    ErrorCode(String code, String description) {
        this.errorCode = code;
        this.errorMessage = description;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

   
    public static ErrorCode fromCode(String code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.getErrorCode().equalsIgnoreCase(code)) {
                return errorCode;
            }
        }
        throw new IllegalArgumentException("Unknown error code: " + code);
    }
}