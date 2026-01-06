package com.polus.integration.entity.enrich.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.apitokenservice.TokenService;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.APIError;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.ErrorDetail;
import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse;

@Service
public class DnBEnrichAPIService {

	@Autowired
	private WebClient.Builder webClientBuilder;

	@Autowired
	private TokenService tokenService;

	public DnBEnrichAPIResponse callAPI(String apiUrl) {
		String token = tokenService.getToken();
		DnBEnrichAPIResponse apiResponse = new DnBEnrichAPIResponse();
		apiResponse = callExternalAPI(apiUrl, token);
		return apiResponse;					 
	}


	private DnBEnrichAPIResponse callExternalAPI(String apiUrl, String token) {
		DnBEnrichAPIResponse response = new DnBEnrichAPIResponse();
		ErrorCode errorCode = ErrorCode.DNB_ENRICH_API_INVOKE;
		try {

			ResponseEntity<String> responseEntity =
							webClientBuilder.build()
											.get()
											.uri(apiUrl)
											.header("Authorization", token)
											.retrieve()
											.toEntity(String.class)
											.block();

			if (responseEntity != null) {
				String responseBody = responseEntity.getBody();
				HttpStatusCode httpStatus = responseEntity.getStatusCode();
				ObjectMapper mapper = new ObjectMapper();
				mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
				response = mapper.readValue(responseBody, DnBEnrichAPIResponse.class);
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

	private DnBEnrichAPIResponse handleWebClientException(WebClientResponseException e) {
		ObjectMapper mapper = new ObjectMapper();
		DnBEnrichAPIResponse response = new DnBEnrichAPIResponse();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		try {
			response = mapper.readValue(e.getResponseBodyAsString(), DnBEnrichAPIResponse.class);
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (JsonProcessingException e1) {
			e1.printStackTrace();
		}
		response.setHttpStatusCode(String.valueOf(e.getStatusCode().value()));
		return response;
	}
}
