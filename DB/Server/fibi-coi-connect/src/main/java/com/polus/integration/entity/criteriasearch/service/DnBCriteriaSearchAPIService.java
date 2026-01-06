package com.polus.integration.entity.criteriasearch.service;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.Builder;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.apitokenservice.TokenService;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse.APIError;
import com.polus.integration.entity.criteriasearch.dto.DnBEntityCriteriaSearchRequestDTO;

@Service
public class DnBCriteriaSearchAPIService {	
	
	private final WebClient.Builder webClientBuilder;	
	private final TokenService tokenService;	

	public DnBCriteriaSearchAPIService(Builder webClientBuilder, TokenService tokenService) {		
		this.webClientBuilder = webClientBuilder;
		this.tokenService = tokenService;
	}

	public DnBCriteriaSearchAPIResponse callAPI(String apiUrl, DnBEntityCriteriaSearchRequestDTO request) {
		String token = tokenService.getToken();
		DnBCriteriaSearchAPIResponse apiResponse = new DnBCriteriaSearchAPIResponse();
		apiResponse = callExternalAPI(apiUrl, request, token);
		return apiResponse;

	}

	private DnBCriteriaSearchAPIResponse callExternalAPI(String apiUrl, DnBEntityCriteriaSearchRequestDTO request,
			String token) {
		DnBCriteriaSearchAPIResponse response = new DnBCriteriaSearchAPIResponse();
		ErrorCode errorCode = ErrorCode.DNB_CRITERIA_SEARCH_API_INVOKE;
		try {

			ResponseEntity<String> responseEntity = webClientBuilder.build().post().uri(apiUrl)
					.header("Authorization", token).bodyValue(request).retrieve().toEntity(String.class).block();

			if (responseEntity != null) {
				String responseBody = responseEntity.getBody();
				HttpStatusCode httpStatus = responseEntity.getStatusCode();
				ObjectMapper mapper = new ObjectMapper();
				mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
				response = mapper.readValue(responseBody, DnBCriteriaSearchAPIResponse.class);
				response.setHttpStatusCode(String.valueOf(httpStatus.value()));
			} else {
				response.setError(new APIError(errorCode.getErrorCode(), "No response received from the API", null));
			}
		} catch (WebClientResponseException e) {
			response = handleWebClientException(e);
		} catch (Exception e) {
			response.setError(new APIError(errorCode.getErrorCode(), e.getMessage(), null));
		}

		return response;
	}

	private DnBCriteriaSearchAPIResponse handleWebClientException(WebClientResponseException e) {
		ObjectMapper mapper = new ObjectMapper();
		DnBCriteriaSearchAPIResponse response = new DnBCriteriaSearchAPIResponse();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		try {
			response = mapper.readValue(e.getResponseBodyAsString(), DnBCriteriaSearchAPIResponse.class);
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (JsonProcessingException e1) {
			e1.printStackTrace();
		}
		response.setHttpStatusCode(String.valueOf(e.getStatusCode().value()));
		return response;
	}
}
