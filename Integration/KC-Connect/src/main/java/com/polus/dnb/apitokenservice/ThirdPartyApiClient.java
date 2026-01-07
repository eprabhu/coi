package com.polus.dnb.apitokenservice;

import org.springframework.stereotype.Component;

@Component
public interface ThirdPartyApiClient {

	TokenResponseDTO getNewToken();
}
