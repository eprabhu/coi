package com.polus.dnb.service;

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
import com.polus.dnb.apitokenservice.TokenService;
import com.polus.dnb.config.ErrorCode;
import com.polus.dnb.dto.DnBCleanseMatchAPIResponse;
import com.polus.dnb.dto.DnBCleanseMatchAPIResponse.APIError;

@Service
public class DnBCleanseMatchAPIService {

	@Autowired
	private WebClient.Builder webClientBuilder;

	@Autowired
	private TokenService tokenService;

	public DnBCleanseMatchAPIResponse callAPI(String apiUrl) {
		String token = tokenService.getToken();
		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();
		apiResponse = callExternalAPI(apiUrl, token);
		return apiResponse;

	}

	private DnBCleanseMatchAPIResponse callExternalAPI(String apiUrl, String token) {
		DnBCleanseMatchAPIResponse response = new DnBCleanseMatchAPIResponse();
		ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_API_INVOKE;
		try {

			ResponseEntity<String> responseEntity = webClientBuilder.build().get().uri(apiUrl)
					.header("Authorization", token).retrieve().toEntity(String.class).block();

			if (responseEntity != null) {
				String responseBody = responseEntity.getBody();
				HttpStatusCode httpStatus = responseEntity.getStatusCode();
				ObjectMapper mapper = new ObjectMapper();
				mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
				response = mapper.readValue(responseBody, DnBCleanseMatchAPIResponse.class);
				response.setHttpStatusCode(String.valueOf(httpStatus.value()));
				response.setResponse(responseBody);

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

	private DnBCleanseMatchAPIResponse handleWebClientException(WebClientResponseException e) {
		ObjectMapper mapper = new ObjectMapper();
		DnBCleanseMatchAPIResponse response = new DnBCleanseMatchAPIResponse();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		try {
			response = mapper.readValue(e.getResponseBodyAsString(), DnBCleanseMatchAPIResponse.class);
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (JsonProcessingException e1) {
			e1.printStackTrace();
		}
		response.setHttpStatusCode(String.valueOf(e.getStatusCode().value()));
		return response;
	}
}
