package com.polus.integration.entity.config;

public final class Constants {
	
	private Constants(){
		
	}
	
	public static final String INT_STATUS_SUCCESSFUL_AND_MATCHED = "SCM";
	
	public static final String INT_STATUS_ERROR = "ERR";
	
	public static final String INT_STATUS_SUCCESSFUL_AND_NO_MATCH = "SUM";
	
	public static final String HTTP_SUCCESS_CODE = "200";
	
	public static final Integer ENTITY_CLEAN_UP_ADMIN_REVIEW_PENDING = 1;
	
	public static final Integer ENTITY_CLEAN_UP_MATCH_STATUS_EXTACT_MATCH = 3;
	
	public static final Integer ENTITY_CLEAN_UP_MATCH_STATUS_MULTIPLE_MATCH = 4;
	
	public static final Integer ENTITY_CLEAN_UP_MATCH_STATUS_NO_MATCH = 5;
	
	public static final Integer ENTITY_CLEAN_UP_MATCH_STATUS_ERROR_IN_MATCH = 6;
	
}
