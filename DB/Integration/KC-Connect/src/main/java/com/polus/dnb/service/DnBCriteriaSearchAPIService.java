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

//import com.polus.integration.entity.cleansematch.dto.BulkCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.APIError;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.ErrorDetail;

import com.polus.dnb.config.ErrorCode;
import com.polus.dnb.dto.DnBCriteriaSearchAPIResponse;
import com.polus.dnb.dto.DnBCriteriaSearchAPIResponse.APIError;
import com.polus.dnb.dto.DnBEntityCriteriaSearchRequestDTO;

@Service
public class DnBCriteriaSearchAPIService {

	@Autowired
	private WebClient.Builder webClientBuilder;

	@Autowired
	private TokenService tokenService;

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

//			ObjectMapper mapper11 = new ObjectMapper();
//			String json = mapper11.writeValueAsString(request);
//			System.out.println("Serialized JSON: " + json);
//			
//			request1.setPrimaryName(request.getPrimaryName());
//			request1.setCountryISOAlpha2Code(request.getCountryISOAlpha2Code());
//			
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
