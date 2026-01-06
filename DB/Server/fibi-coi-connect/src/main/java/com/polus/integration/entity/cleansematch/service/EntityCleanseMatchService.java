package com.polus.integration.entity.cleansematch.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.cleansematch.dao.EntityCleanseMatchDAO;
import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse;
import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.ErrorDetail;
import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.MatchCandidate;
import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
import com.polus.integration.entity.cleansematch.dto.EntityCleanseMatchAPIResponse;
import com.polus.integration.entity.cleansematch.dto.EntityInfoDTO;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EntityCleanseMatchService {

	@Autowired
	private CleanseMatchUrlBuilder urlBuilder;

	@Autowired
	private DnBCleanseMatchAPIService apiService;
	
	@Autowired
	private EntityCriteriaSearchService searchService;
	
	@Autowired
	private EntityCleanseMatchDAO dao;
	
	private static final Integer UEI_DNB_REGISTRATION_TYPE = 37491;

	private static final Integer FEDERAL_EMPLOYER_ID_DNB_REGISTRATION_TYPE = 6863;
	
	private static final Integer CAGE_CODE = 23949;
	
	private static final String COI_ENRICH_ACTION_TYPE = "2";
	
	private static final String PUBLICLY_TRADED_COMPANY = "1";
	
	private static final String PRIVATELY_OWNED_COMPANY = "2";
	
	private static final String UNKNOWN_OWNERSHIP_TYPE = "3";

	public EntityCleanseMatchAPIResponse runCleanseMatch(DnBEntityCleanseMatchRequestDTO request) {
		EntityCleanseMatchAPIResponse response = new EntityCleanseMatchAPIResponse();		 
		try {
			String apiUrl = buildApiUrl(request);
			DnBCleanseMatchAPIResponse apiResponse = callAPI(apiUrl);
			response = PrepareResponse(apiResponse, request);
		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage(errorCode.getErrorMessage());
			response.setErrorDetails(e.getMessage());
		}

		return response;
	}

	private String buildApiUrl(DnBEntityCleanseMatchRequestDTO request) {
		return urlBuilder.buildApiUrl(request);
	}

	private DnBCleanseMatchAPIResponse callAPI(String apiUrl) {
		return apiService.callAPI(apiUrl);
	}

	private EntityCleanseMatchAPIResponse PrepareResponse(DnBCleanseMatchAPIResponse apiResponse, DnBEntityCleanseMatchRequestDTO request) {
		EntityCleanseMatchAPIResponse response = new EntityCleanseMatchAPIResponse();
		try {

			if (apiResponse != null) {
				response.setHttpStatusCode(apiResponse.getHttpStatusCode());
				if (apiResponse.getTransactionDetail() != null) {
					response.setTransactionID(apiResponse.getTransactionDetail().getTransactionID());
				}
				response.setCandidatesMatchedQuantity(apiResponse.getCandidatesMatchedQuantity());
				if (apiResponse.getMatchCandidates() != null && !apiResponse.getMatchCandidates().isEmpty()) {
				
					
					List<String> dunsList = apiResponse.getMatchCandidates()
													   .stream()
													   .map(r -> r.getOrganization().getDuns())
													   .collect(Collectors.toList());

					DnBCriteriaSearchAPIResponse result = searchService.fetchSearchResult(dunsList);
					var searchResult = result.getSearchCandidates();

					Map<String, DnBOrganizationDetails> dunsOrganizationMapFromSearchAPI =
													searchResult.stream()
																.map(row -> row.getOrganization())
																.collect(Collectors.toMap(DnBOrganizationDetails::getDuns, org -> org));

					List<MatchCandidate> matchCandidates = new ArrayList<>();
					for (MatchCandidate m : apiResponse.getMatchCandidates()) {

						String duns = m.getOrganization().getDuns();
						if (dunsOrganizationMapFromSearchAPI.containsKey(duns)) {
							DnBOrganizationDetails dnBOrganizationDetails = dunsOrganizationMapFromSearchAPI.get(duns);
							
							dnBOrganizationDetails.setCageNumber(getCageNumber(dnBOrganizationDetails));
							dnBOrganizationDetails.setUei(getUEI(dnBOrganizationDetails));
							dnBOrganizationDetails.setOwnershipType(getOwnershipType(dnBOrganizationDetails));
							dnBOrganizationDetails.setOwnershipTypeDescription(getOwnershipDescription(dnBOrganizationDetails.getOwnershipType()));
							
							m.setOrganization(dnBOrganizationDetails);
						}
						
						matchCandidates.add(m);
					}

					response.setMatchCandidates(matchCandidates);
					//response.setMatchCandidates(apiResponse.getMatchCandidates());	
					response = CheckEntityExistenceByDUNS(response, request);
				}

				if (apiResponse.getError() != null) {

					if (apiResponse.getError().getErrorCode() != null) {
						response.setErrorCode(apiResponse.getError().getErrorCode());
						response.setErrorMessage(apiResponse.getError().getErrorMessage());
						List<ErrorDetail> errorDetails = apiResponse.getError().getErrorDetails();
						if(errorDetails != null) {
							response.setErrorDetails(
									errorDetails
										.stream()
										.map(ErrorDetail::toString)
										.collect(Collectors.joining("; ")));
						}
					}

				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_ERROR;
			response.setErrorCode(errorCode.getErrorCode());
			response.setErrorMessage("Error while API PrepareResponse for Cleanse Match");
			response.setErrorDetails(e.getMessage());
		}
		
		
		return response;
	}

	private EntityCleanseMatchAPIResponse CheckEntityExistenceByDUNS(EntityCleanseMatchAPIResponse response, DnBEntityCleanseMatchRequestDTO request) {

		try {
			response.getMatchCandidates().parallelStream().forEach( data -> {
				if (DunsIsEmpty(data)) {
					return;
				}
	
				String dunsNumber = data.getOrganization().getDuns();
	
				EntityInfoDTO entityInfo = dao.getEntityInfoByDUNS(dunsNumber, request);
				data.setEntity(entityInfo);	
				
			});
			
		}catch(Exception e) {
			log.error("CLEANSE MATCH API: Exception while CheckEntityExistenceByDUNS, error "+ e.getMessage());
		}

		return response;
	}

	private boolean DunsIsEmpty(MatchCandidate data) {
		if(data == null) {
			return true;
		}
		
		if(data.getOrganization() == null) {
			return true;
		}
		
		if(data.getOrganization().getDuns() == null) {
			return true;
		}
		return false;
	}

	private String getUEI(com.polus.integration.entity.base.dto.DnBOrganizationDetails organization) {

		return pickRegistrationNumber(UEI_DNB_REGISTRATION_TYPE, organization);

	}

	private String getOwnershipType(
			com.polus.integration.entity.base.dto.DnBOrganizationDetails organization) {

		if (organization.getIsPubliclyTradedCompany() != null && organization.getIsPubliclyTradedCompany()) {
			return PUBLICLY_TRADED_COMPANY;
		}
		
		return UNKNOWN_OWNERSHIP_TYPE;
	}
	
	private String getOwnershipDescription(String ownershipType) {
		
		return switch(ownershipType) {
				case PUBLICLY_TRADED_COMPANY -> "Publicly Traded Company";
				case PRIVATELY_OWNED_COMPANY -> "Privately Traded";
				case UNKNOWN_OWNERSHIP_TYPE -> "Unknown";
				default -> "Unknown";
		};
		
	}

	private String pickRegistrationNumber(Integer registrationTypeCode,
			com.polus.integration.entity.base.dto.DnBOrganizationDetails organization) {
		return handleException(() -> {
			if (organization.getRegistrationNumbers() == null) {
				return null;
			}

			String registrationNumber = organization.getRegistrationNumbers().stream()
					.filter(reg -> reg.getTypeDnBCode() == registrationTypeCode)
					.map(com.polus.integration.entity.base.dto.DnBOrganizationDetails.RegistrationNumber::getRegistrationNumber)
					.findFirst().orElse(null);

			return registrationNumber;
		});

	}

	private String getCageNumber(
			com.polus.integration.entity.base.dto.DnBOrganizationDetails organization) {

		return pickRegistrationNumber(CAGE_CODE, organization);

	}
	
	private <T> T handleException(Supplier<T> supplier) {
		try {
			return supplier.get();
		} catch (Exception e) {
			log.error("DnB ENRICH API: Exception while handleException, error " + e.getMessage());
			return null;
		}
	}
	
}
