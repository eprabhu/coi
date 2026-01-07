package com.polus.integration.entity.apitokenservice;

import org.springframework.stereotype.Component;

@Component
public interface ThirdPartyApiClient {

	TokenResponseDTO getNewToken();
}
