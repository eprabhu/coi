package com.polus.dnb.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
//import com.polus.integration.entity.cleansematch.dao.EntityCleanseMatchDAO;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.ErrorDetail;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.MatchCandidate;
//import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
//import com.polus.integration.entity.cleansematch.dto.EntityCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.EntityInfoDTO;
import com.polus.dnb.config.ErrorCode;
import com.polus.dnb.dto.DnBCriteriaSearchAPIResponse;
import com.polus.dnb.dto.DnBCriteriaSearchAPIResponse.ErrorDetail;
import com.polus.dnb.dto.DnBCriteriaSearchAPIResponse.MatchCandidate;
import com.polus.dnb.dto.DnBEntityCriteriaSearchRequestDTO;
import com.polus.dnb.dto.EntityCriteriaSearchAPIResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EntityCriteriaSearchService {

	@Autowired
	private CriteriaSearchUrlBuilder urlBuilder;

	@Autowired
	private DnBCriteriaSearchAPIService apiService;

	private static final ObjectMapper objectMapper = new ObjectMapper();

	public EntityCriteriaSearchAPIResponse runCleanseMatch(DnBEntityCriteriaSearchRequestDTO request) {
		EntityCriteriaSearchAPIResponse response = new EntityCriteriaSearchAPIResponse();
		try {
			String apiUrl = buildApiUrl();
			DnBCriteriaSearchAPIResponse apiResponse = callAPI(apiUrl, request);
			response = PrepareResponse(apiResponse);
		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage(errorCode.getErrorMessage());
			response.setErrorDetails(e.getMessage());
		}

		return response;
	}

	public DnBCriteriaSearchAPIResponse fetchSearchResult(List<String> dunsList) {
		DnBEntityCriteriaSearchRequestDTO request = new DnBEntityCriteriaSearchRequestDTO();
		request.setDunsList(dunsList);
		DnBCriteriaSearchAPIResponse result = fetchResult(request);
		return result;
	}

	public String fetchSearchResultAsSring(String duns) {
		DnBEntityCriteriaSearchRequestDTO request = new DnBEntityCriteriaSearchRequestDTO();
		request.setDuns(duns);
		DnBCriteriaSearchAPIResponse result = fetchResult(request);
		EntityCriteriaSearchAPIResponse response = PrepareResponse(result);
		String output = toString(response);
		return output;
	}

	public DnBCriteriaSearchAPIResponse fetchResult(DnBEntityCriteriaSearchRequestDTO request) {
		DnBCriteriaSearchAPIResponse apiResponse = new DnBCriteriaSearchAPIResponse();
		try {
			String apiUrl = buildApiUrl();
			apiResponse = callAPI(apiUrl, request);
			// response = PrepareResponse(apiResponse);
			// result = toString(response);
		} catch (Exception e) {
			log.error("fetchSearchResult " + e.getMessage());
		}
		return apiResponse;
	}

	private String toString(EntityCriteriaSearchAPIResponse response) {
		if (response != null && response.getMatchCandidates() != null) {

			try {
				return objectMapper.writeValueAsString(response.getMatchCandidates());
			} catch (JsonProcessingException e) {
				log.error("BULK CLEANSE MATCH API: Exception while prepareDBSaveObject finding Match, error "
						+ e.getMessage());
			}

		}
		return null;
	}

	private String fetchFirstMatchResult(EntityCriteriaSearchAPIResponse response) {
		if (response != null && response.getMatchCandidates() != null) {
			MatchCandidate matchCandidate = response.getMatchCandidates().get(0);

			try {
				return objectMapper.writeValueAsString(matchCandidate.getOrganization());
			} catch (JsonProcessingException e) {
				log.error("BULK CLEANSE MATCH API: Exception while prepareDBSaveObject finding Match, error "
						+ e.getMessage());
			}

		}
		return null;
	}

	private String buildApiUrl() {
		return urlBuilder.buildApiUrl();
	}

	private DnBCriteriaSearchAPIResponse callAPI(String apiUrl, DnBEntityCriteriaSearchRequestDTO request) {
		return apiService.callAPI(apiUrl, request);
	}

	private EntityCriteriaSearchAPIResponse PrepareResponse(DnBCriteriaSearchAPIResponse apiResponse) {
		EntityCriteriaSearchAPIResponse response = new EntityCriteriaSearchAPIResponse();
		try {

			if (apiResponse != null) {
				response.setHttpStatusCode(apiResponse.getHttpStatusCode());
				if (apiResponse.getTransactionDetail() != null) {
					response.setTransactionID(apiResponse.getTransactionDetail().getTransactionID());
				}
				response.setCandidatesMatchedQuantity(apiResponse.getCandidatesMatchedQuantity());
				if (apiResponse.getSearchCandidates() != null && !apiResponse.getSearchCandidates().isEmpty()) {
					response.setMatchCandidates(apiResponse.getSearchCandidates());
				}

				if (apiResponse.getError() != null) {

					if (apiResponse.getError().getErrorCode() != null) {
						response.setErrorCode(apiResponse.getError().getErrorCode());
						response.setErrorMessage(apiResponse.getError().getErrorMessage());
						List<ErrorDetail> errorDetails = apiResponse.getError().getErrorDetails();
						if (errorDetails != null) {
							response.setErrorDetails(
									errorDetails.stream().map(ErrorDetail::toString).collect(Collectors.joining("; ")));
						}
					}

				}
			}

		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage("Error while API PrepareResponse for Cleanse Match");
			response.setErrorDetails(e.getMessage());
		}

		return response;
	}

}
