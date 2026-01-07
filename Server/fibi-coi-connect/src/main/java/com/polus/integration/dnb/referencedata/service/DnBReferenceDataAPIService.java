package com.polus.integration.dnb.referencedata.service;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.polus.integration.dnb.referencedata.dto.DnBReferenceDataAPIResponse;
import com.polus.integration.dnb.referencedata.dto.DnBReferenceDataDTO;
import com.polus.integration.entity.apitokenservice.TokenService;

import reactor.core.publisher.Mono;

@Service
public class DnBReferenceDataAPIService {

	@Autowired
	private WebClient.Builder webClientBuilder;

	@Autowired
	private TokenService tokenService;

	private final ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

	public ArrayList<DnBReferenceDataDTO> callDnBReferenceAPI(String apiUrl) {

		ArrayList<DnBReferenceDataDTO> response = new ArrayList<DnBReferenceDataDTO>();
		try {
			DnBReferenceDataAPIResponse apiResponse = callDnBAPI(apiUrl);
			if (apiResponse.getFullResponse() != null) {
				processSuccessResponse(apiResponse);
			}
			response = apiResponse.getReferenceData();

		} catch (Exception e) {
			e.printStackTrace();			
		} 
		
		return response;
		
	}

	public DnBReferenceDataAPIResponse callDnBAPI(String apiUrl) {
		String token = tokenService.getToken();
		DnBReferenceDataAPIResponse response = new DnBReferenceDataAPIResponse();

		try {
			callAPI(apiUrl, token, response);		

		} catch (Exception e) {
			System.err.println("Exception occurred: " + e.getMessage());
			response.setHttpStatusCode("500");
			response.setFullResponse("Error: " + e.getMessage());
		}

		return response;
	}

	private void callAPI(String apiUrl, String token, DnBReferenceDataAPIResponse response) {
		webClientBuilder.build().get().uri(apiUrl).header("Authorization", token) 
				.retrieve().onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
						clientResponse -> clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
							handleErrorResponse(clientResponse.statusCode().toString(), errorBody, response);
							return Mono.error(new RuntimeException("Error response: " + errorBody));
						}))
				.bodyToMono(String.class).doOnSuccess(body -> {
					response.setHttpStatusCode("200"); 
					response.setFullResponse(body);
				}).doOnError(e -> handleWebClientException(e, response)).block();
	}

	private void handleErrorResponse(String statusCode, String errorBody, DnBReferenceDataAPIResponse response) {
		response.setFullResponse(errorBody);
		response.setHttpStatusCode(statusCode);
		parseErrorResponse(errorBody, response);
	}

	private void handleWebClientException(Throwable e, DnBReferenceDataAPIResponse response) {
		if (e instanceof WebClientResponseException) {
			WebClientResponseException webClientResponseException = (WebClientResponseException) e;
			response.setHttpStatusCode(webClientResponseException.getStatusCode().toString());
			response.setFullResponse(webClientResponseException.getResponseBodyAsString());
			parseErrorResponse(webClientResponseException.getResponseBodyAsString(), response);
		} else {
			response.setHttpStatusCode("500");
			response.setFullResponse(e.getMessage());
		}
	}

	   private void processSuccessResponse(DnBReferenceDataAPIResponse response) throws Exception {
	        
	        if(response.getErrorCode() != null || response.getHttpStatusCode() == "500") {
	        	//System.out.println("Inside error");
	        	return;
	        }
	        
	        String jsonResponse = response.getFullResponse();
	        
	        JsonNode rootNode = objectMapper.readTree(jsonResponse);
	        
	        ArrayList<DnBReferenceDataDTO> codeDescList = new ArrayList<>();
	        
	        
	        if (rootNode.has("codeTables")) {
	            JsonNode codeTablesNode = rootNode.get("codeTables");
	            if (codeTablesNode.isArray()) {
	                for (JsonNode codeTableItem : codeTablesNode) {
	                    // Within each codeTableItem, look for codeLists
	                    if (codeTableItem.has("codeLists")) {
	                        JsonNode codeListsNode = codeTableItem.get("codeLists");
	                        if (codeListsNode.isArray()) {
	                            for (JsonNode codeListItem : codeListsNode) {
	                                String code = codeListItem.has("code") ? codeListItem.get("code").asText() : null;
	                                String description = codeListItem.has("description") ? codeListItem.get("description").asText() : null;
	                                DnBReferenceDataDTO codeDesc = new DnBReferenceDataDTO(code, description);
	                                codeDescList.add(codeDesc);
	                            }
	                        }
	                    }
	                }
	            }
	        }

	        // Set the list in the response object
	        response.setReferenceData(codeDescList);
	    }

	private void parseErrorResponse(String errorBody, DnBReferenceDataAPIResponse response) {
		try {
			JsonNode rootNode = objectMapper.readTree(errorBody);

			if (rootNode.has("transactionDetail")) {
				JsonNode transactionDetail = rootNode.get("transactionDetail");
				if (transactionDetail.has("transactionID")) {
					response.setTransactionID(transactionDetail.get("transactionID").asText());
				}
			}

			if (rootNode.has("error")) {
				JsonNode error = rootNode.get("error");
				if (error.has("errorCode")) {
					response.setErrorCode(error.get("errorCode").asText());
				}
				if (error.has("errorMessage")) {
					response.setErrorMessage(error.get("errorMessage").asText());
				}
				if (error.has("errorDetails") && error.get("errorDetails").isArray()
						&& error.get("errorDetails").size() > 0) {
					JsonNode errorDetailNode = error.get("errorDetails").get(0);
					StringBuilder errorDetailBuilder = new StringBuilder();
					if (errorDetailNode.has("parameter")) {
						errorDetailBuilder.append(errorDetailNode.get("parameter").asText()).append(": ");
					}
					if (errorDetailNode.has("description")) {
						errorDetailBuilder.append(errorDetailNode.get("description").asText());
					}
					response.setErrorDetails(errorDetailBuilder.toString());
				}
			}
		} catch (Exception e) {
			System.err.println("Error parsing error response: " + e.getMessage());
		}
	}

}
