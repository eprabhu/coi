package com.polus.integration.constant;

import java.util.Map;

import com.polus.integration.config.ConstantProperties;

public interface Constant {

	// Security Constant
    String SECRET = "q3t6w9z$C&F)J@NcRfUjWnZr4u7x!A%D";
    String TOKEN_PREFIX = "Bearer ";
    String HEADER_STRING = "Authorization";
    long EXPIRATION_TIME = 43_200_000; // 12 hour
    String SIGN_UP_URL = "/authenticate";
    
    String LOGIN_USER_FULL_NAME = "fullName";
    String LOGIN_PERSON_ID = "personId";
    String LOGIN_PERSON_UNIT = "unitNumber";
    String IS_EXTERNAL_USER = "isExternalUser";
    String HASH_ALGORITHM = "SHA";
    String CHARSET = "UTF-8";
    String ERROR_CODE = "ER004";
    // Module Code
    Integer AWARD_MODULE_CODE = 1;
    Integer INST_PROPOSAL_MODULE_CODE = 2;
    Integer DEV_PROPOSAL_MODULE_CODE = 3;
    Integer COI_MODULE_CODE = 8;
    //SubModuleCode
    Integer SUB_MODULE_CODE= 0;
    Integer COI_INTEGRATION_SUB_MODULE_CODE= 802;
    String SUB_MODULE_ITEM_KEY= "0";
    //Queue Action type
    String PROPOSAL_INTEGRATION_ACTION_TYPE = "PROPOSAL_INTEGRATION";
    String QUESTIONNAIRE_INTEGRATION_ACTION_TYPE = "PROPOSAL_QUESTIONNAIRE_INTEGRATION";
    String INST_PROPOSAL_INTEGRATION_ACTION_TYPE = "INST_PROPOSAL_INTEGRATION";
    String AWARD_INTEGRATION_ACTION_TYPE = "AWARD_INTEGRATION";
    String ENTITY_COI_INTEGRATION_ACTION_TYPE = "ENTITY_COI_INTEGRATION";
	String COI_PROJECT_TYPE_PROPOSAL = "3";
	String PENDING_PROJECT = "projectDisclosure";
	String FIBI_DIRECT_EXCHANGE = "FIBI.DIRECT.EXCHANGE";
	String AC_TYPE_UPDATE = "U";
	String AC_TYPE_INSERT = "I";
	
	String UPDATE_BY = "10000000001";
	
	String DEFAULT_IS_ACTIVE_VALUE = "Y";	
	
    Map<String, String> REQUIRED_DnB_INDUSTRY_TYPE = Map.of(
            "24659", "International Standard Industrial Classification Revision 4",
            "35912", "D&B Hoovers Industry Classification",
            "37788", "North American Industry Classification System 2022"
        );
	
	String PRIMARY_DnB_INDUSTRY_TYPE = "37788";
	
	String IS_PRIMARY_YES = "Y";
	String IS_PRIMARY_NO = "N";
	String ACTIVE = "A";
	String INACTIVE = "I";
	String DISCLOSURE_TYPE_CODE_PROPOSAL = "2";

	// Date format
	String DATE_FORMAT = "\\d{4}-\\d{2}-\\d{2}";
	String DEFAULT_DATE_FORMAT = ConstantProperties.PROPERTIES_MAP.get("DEFAULT_DATE_FORMAT");
	
	String STATIC_SALT = "$2a$10$IcWCnJIVz.4mgZbfSt2dY.";
	String NO = "N";
	String YES = "Y";
	String AWARD_STATUS_CODE_INACTIVE = "2";
	String AWARD_STATUS_CODE_CLOSED = "5";
	String NON_EMPLOYEE_FLAG = "Y";
	String SUBMODULE_ITEM_KEY = "0";
	
    String COI_DISCL_MARKED_VOID_BY_QUEST = "38";
    String COI_DISCL_MARKED_VOID_BY_PRJCT_CLOSED = "39";
    String COI_DISCL_MARKED_VOID_BY_KEY_PRSN_REMOVAL = "40";
    String COI_DISCL_MARKED_VOID_BY_KEY_PRSN_ROLE_CHANGE = "41";
}
