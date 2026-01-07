package com.polus.kcintegration.constant;

public interface Constant {

	// Security Constant
	String SECRET = "q3t6w9z$C&F)J@NcRfUjWnZr4u7x!A%D";
	String TOKEN_PREFIX = "Bearer ";
	String HEADER_STRING = "Authorization";
	long EXPIRATION_TIME = 31_536_000_000L; // 1 year in milliseconds
	String GENERATE_USER_DETAILS_URL = "/auth/generateUserDetails";
	String DnB_MATCH_API = "/dnb/match";
	String DnB_API_ANT_STYLE = "/**";
	String HASH_ALGORITHM = "SHA";
	String CHARSET = "UTF-8";
	String STATIC_SALT = "$2a$10$IcWCnJIVz.4mgZbfSt2dY.";

	String FIBI_DIRECT_EXCHANGE = "FIBI.DIRECT.EXCHANGE";

}
