package com.polus.dnb.apitokenservice;

import java.time.Instant;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private static final Logger logger = LoggerFactory.getLogger(TokenService.class);
    private final ThirdPartyApiClient thirdPartyApiClient;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private String token;
    private String tokenType;
    private long tokenValidityInSeconds = 24 * 60 * 60; // 24 hours as default
    private Instant tokenExpirationTime;

    public TokenService(DnBAPITokenClient apiClient) throws Exception {
        this.thirdPartyApiClient = apiClient;       
  }

    private TokenResponseDTO fetchNewToken() {        
    	TokenResponseDTO response = thirdPartyApiClient.getNewToken();  
        this.token = response.getAccessToken();
        this.tokenType = response.getTokenType();
        this.tokenValidityInSeconds = response.getExpiresIn();   
        this.tokenExpirationTime = Instant.now().plusSeconds(tokenValidityInSeconds);        
        scheduler.scheduleAtFixedRate(this::renewToken, tokenValidityInSeconds - 300, tokenValidityInSeconds - 300, TimeUnit.SECONDS);
        logger.info("Fetched new token");
        return response;
    }

    private void renewToken() {
        try {
        	TokenResponseDTO response = fetchNewToken();
            this.token = response.getAccessToken();
            this.tokenValidityInSeconds = response.getExpiresIn();           
            logger.info("Token renewed successfully");
        } catch (Exception e) {
            logger.error("Error renewing token", e);
        }
    }

    public String getPlainToken() {
        return token;
    }
    
    public String getToken() {    	
    	if(isTokenExpired()) {
    		fetchNewToken();
    	}
    	if(token == null) {
    		fetchNewToken();
    	}    	
        return tokenType + " " + token;
    }
    
    
    private boolean isTokenExpired() {
        if (tokenExpirationTime == null) {
            return true;
        }
        return Instant.now().isAfter(tokenExpirationTime.minusSeconds(60)); 
        // Consider token expired if less than 60 seconds remaining
    }
}

