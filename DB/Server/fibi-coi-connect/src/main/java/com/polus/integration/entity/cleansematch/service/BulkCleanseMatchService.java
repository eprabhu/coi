package com.polus.integration.entity.cleansematch.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.cleansematch.dto.BulkCleanseMatchAPIResponse;
import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse;
import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.MatchCandidate;
import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
import com.polus.integration.entity.cleansematch.entity.DnBEntityMatchRepository;
import com.polus.integration.entity.cleansematch.entity.EntityStageDetails;
import com.polus.integration.entity.cleansematch.entity.StageDnBEntityMatchSpecification;
import com.polus.integration.entity.config.Constants;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BulkCleanseMatchService {

	private static final ObjectMapper objectMapper = new ObjectMapper();
	@Autowired
	private DnBEntityMatchRepository dnbEntityMatchRepository;
	@Autowired
	private CleanseMatchUrlBuilder urlBuilder;
	@Autowired
	private DnBCleanseMatchAPIService apiService;
	@Autowired
	private EntityCriteriaSearchService searchService;

	private volatile AtomicBoolean stopMatchFlag = new AtomicBoolean(false);
	private boolean isProcessing = false;

	private Instant startTime;

	private Instant endTime;

	private AtomicInteger totalRecords = new AtomicInteger(0);

	private AtomicInteger processedRecords = new AtomicInteger(0);

	@Async
	public CompletableFuture<Void> startBulkCleanseMatch(String batchId) {
		if (isProcessing) {
			System.out.println("Bulk cleanse match is already in progress. Skipping...");
			return CompletableFuture.completedFuture(null);
		}
		startTime = Instant.now();
		isProcessing = true;
		stopMatchFlag.set(false);
// Intentionally commented for testing purpose with a limited set
//        Pageable firstPageWithTenRecords = PageRequest.of(0, 10);
//        List<EntityStageDetails> entityMatches = dnbEntityMatchRepository.findAll(firstPageWithTenRecords)
//                .getContent();
		List<EntityStageDetails> entityMatches = dnbEntityMatchRepository.findByBatchId(Integer.parseInt(batchId));
		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();

		for (EntityStageDetails entityMatch : entityMatches) {
			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch);
					entityMatch.setApiRequest(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {
					ErrorCode errorCode = ErrorCode.DNB_BULK_MATCH_ERROR;
					entityMatch.setErrorCode(errorCode.getErrorCode());
					entityMatch.setErrorMessage(errorCode.getErrorMessage());
					entityMatch.setErrorDetails(e.getMessage());
					entityMatch.setUpdateTimestamp(Timestamp.from(Instant.now()));
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch = setMatchStatus(entityMatch);
					entityMatch.setAdminReviewStatusCode(Constants.ENTITY_CLEAN_UP_ADMIN_REVIEW_PENDING);
					dnbEntityMatchRepository.save(entityMatch);
					processedRecords.incrementAndGet();
				}
			} catch (Exception e) {
				log.error("BULK CLEANSE MATCH API: Exception while startBulkCleanseMatch, error " + e.getMessage());

			}
		}
		endTime = Instant.now();
		isProcessing = false;

		return CompletableFuture.completedFuture(null);
	}

	@Async
	public CompletableFuture<Void> patchProcess(Map<String, String> filters) {
		if (isProcessing) {
			System.out.println("Bulk Patch match is already in progress. Skipping...");
			return CompletableFuture.completedFuture(null);
		}
		startTime = Instant.now();
		isProcessing = true;

		Specification<EntityStageDetails> specification = StageDnBEntityMatchSpecification.getSpecifications(filters);
		List<EntityStageDetails> entityMatches = dnbEntityMatchRepository.findAll(specification);
		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		BulkCleanseMatchAPIResponse response = new BulkCleanseMatchAPIResponse();
		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();

		for (EntityStageDetails entityMatch : entityMatches) {
			processedRecords.incrementAndGet();

			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch);
					entityMatch.setApiRequest(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {
					ErrorCode errorCode = ErrorCode.DNB_BULK_MATCH_ERROR;
					entityMatch.setErrorCode(errorCode.getErrorCode());
					entityMatch.setErrorMessage(errorCode.getErrorMessage());
					entityMatch.setErrorDetails(e.getMessage());
					entityMatch.setUpdateTimestamp(Timestamp.from(Instant.now()));
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch = setMatchStatus(entityMatch);
					entityMatch.setAdminReviewStatusCode(Constants.ENTITY_CLEAN_UP_ADMIN_REVIEW_PENDING);
					dnbEntityMatchRepository.save(entityMatch);
					processedRecords.incrementAndGet();
				}
			} catch (Exception e) {
				log.error("BULK CLEANSE MATCH API: Exception while startBulkCleanseMatch, error " + e.getMessage());

			}
		}
		endTime = Instant.now();
		isProcessing = false;

		return CompletableFuture.completedFuture(null);
	}

	@Async
	public CompletableFuture<Void> processError(Map<String, String> filters, String[] matchParams) {
		if (isProcessing) {
			System.out.println("Bulk processError is already in progress. Skipping...");
			return CompletableFuture.completedFuture(null);
		}
		startTime = Instant.now();
		isProcessing = true;

		Specification<EntityStageDetails> specification = StageDnBEntityMatchSpecification.getSpecifications(filters);
		List<EntityStageDetails> entityMatches = dnbEntityMatchRepository.findAll(specification);
		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();

		for (EntityStageDetails entityMatch : entityMatches) {
			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch, matchParams);
					entityMatch.setApiResponse(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {
					ErrorCode errorCode = ErrorCode.DNB_BULK_MATCH_ERROR;
					entityMatch.setErrorCode(errorCode.getErrorCode());
					entityMatch.setErrorMessage(errorCode.getErrorMessage());
					entityMatch.setErrorDetails(e.getMessage());
					entityMatch.setUpdateTimestamp(Timestamp.from(Instant.now()));
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch = setMatchStatus(entityMatch);
					entityMatch.setAdminReviewStatusCode(Constants.ENTITY_CLEAN_UP_ADMIN_REVIEW_PENDING);
					dnbEntityMatchRepository.save(entityMatch);
					processedRecords.incrementAndGet();
				}
			} catch (Exception e) {
				log.error("BULK CLEANSE MATCH API: Exception while startBulkCleanseMatch, error " + e.getMessage());

			}
		}
		endTime = Instant.now();
		isProcessing = false;

		return CompletableFuture.completedFuture(null);
	}

	public String getProcessStatus() {
		if (isProcessing) {
			int total = totalRecords.get();
			int processed = processedRecords.get();
			return String.format("Processing in progress: %d out of %d records processed (%.2f%% completed)", processed,
					total, (total == 0 ? 0 : (processed * 100.0 / total)));
		} else if (startTime != null && endTime != null) {
			Duration duration = Duration.between(startTime, endTime);
			return String.format("Processing completed. Duration: %d seconds. Total records processed: %d",
					duration.getSeconds(), processedRecords.get());
		} else {
			return "No processing has been started yet";
		}
	}

	public void stopBulkCleanseMatch() {
		stopMatchFlag.set(true);
	}

	private String buildApiUrl(EntityStageDetails sponsorMatch) {
		DnBEntityCleanseMatchRequestDTO dto = setDto(sponsorMatch);
		return urlBuilder.buildApiUrl(dto);
	}

	private String buildApiUrl(EntityStageDetails sponsorMatch, String[] matchParams) {
		DnBEntityCleanseMatchRequestDTO dto = setDto(sponsorMatch);
		return urlBuilder.buildApiUrl(dto, matchParams);
	}

	private DnBEntityCleanseMatchRequestDTO setDto(EntityStageDetails sponsorMatch) {
		DnBEntityCleanseMatchRequestDTO dto = new DnBEntityCleanseMatchRequestDTO();
		dto.setSourceDunsNumber(sponsorMatch.getSrcDunsNumber());
		dto.setSourceDataName(sponsorMatch.getSrcDataName());
		dto.setCountryCode(sponsorMatch.getSrcCountryCode());
		dto.setAddressLine1(sponsorMatch.getSrcAddressLine1());
		dto.setAddressLine2(sponsorMatch.getSrcAddressLine2());
		dto.setState(sponsorMatch.getSrcState());
		dto.setPostalCode(sponsorMatch.getSrcPostalCode());
		return dto;
	}

	private DnBCleanseMatchAPIResponse callAPI(String apiUrl) {
		return apiService.callAPI(apiUrl);
	}

	private String setIntegrationStatus(DnBCleanseMatchAPIResponse res) {

		String status = Constants.INT_STATUS_ERROR;
		if (res.getHttpStatusCode() != null && res.getHttpStatusCode().equals(Constants.HTTP_SUCCESS_CODE)) {
			if (res.getMatchCandidates() != null) {
				status = Constants.INT_STATUS_SUCCESSFUL_AND_MATCHED;
			} else {
				status = Constants.INT_STATUS_SUCCESSFUL_AND_NO_MATCH;
			}
		}
		return status;
	}

	private EntityStageDetails PrepareResponse(DnBCleanseMatchAPIResponse apiResponse, EntityStageDetails entityMatch) {
		try {
			if (apiResponse.getResponse() != null) {
				try {
					String fullResponse = objectMapper.writeValueAsString(apiResponse.getResponse());
					entityMatch.setApiResponse(fullResponse);

					if (apiResponse.getTransactionDetail() != null) {
						entityMatch.setExternalSysTransactionId(apiResponse.getTransactionDetail().getTransactionID());
					}
					entityMatch.setHttpStatusCode(apiResponse.getHttpStatusCode());
					entityMatch.setCandidateMatchedQuantity(apiResponse.getCandidatesMatchedQuantity());
				} catch (JsonProcessingException e) {
					log.error("BULK CLEANSE MATCH API: Exception while prepareDBSaveObject, error " + e.getMessage());
				}

			}
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
						m.setOrganization(dunsOrganizationMapFromSearchAPI.get(duns));
					}
					matchCandidates.add(m);
				}

				if (matchCandidates != null) {
					try {
						String matchResult = objectMapper.writeValueAsString(matchCandidates);
						entityMatch.setDunsMatchedResults(matchResult);
					} catch (JsonProcessingException e) {
						log.error("BULK CLEANSE MATCH API: Exception while prepareDBSaveObject finding Match, error "
								+ e.getMessage());
					}
				}

				if (apiResponse.getMatchCandidates().get(0) != null) {

					if (apiResponse.getMatchCandidates().get(0).getMatchQualityInformation() != null) {
						entityMatch.setHighestConfidenceCode(apiResponse.getMatchCandidates().get(0)
								.getMatchQualityInformation().getConfidenceCode());
					}
				}

			}

			if (apiResponse.getError() != null) {
				if (apiResponse.getError().getErrorCode() != null) {
					entityMatch.setErrorCode(apiResponse.getError().getErrorCode());
					entityMatch.setErrorMessage(apiResponse.getError().getErrorMessage());
					List<DnBCleanseMatchAPIResponse.ErrorDetail> errorDetails = apiResponse.getError()
							.getErrorDetails();
					if (errorDetails != null) {

						entityMatch.setErrorDetails(
								errorDetails.stream().map(DnBCleanseMatchAPIResponse.ErrorDetail::toString)
										.collect(Collectors.joining("; ")));
					}
				}

			}
			entityMatch.setIntegrationStatusCode(setIntegrationStatus(apiResponse));			

		} catch (Exception e) {
			ErrorCode errorCode = ErrorCode.DNB_CLEANSE_MATCH_ERROR;
			entityMatch.setErrorCode(errorCode.getErrorCode());
			entityMatch.setErrorMessage("Error while API PrepareResponse for Cleanse Match");
			entityMatch.setErrorDetails(e.getMessage());

		} finally {
			entityMatch.setUpdateTimestamp(Timestamp.from(Instant.now()));
		}

		return entityMatch;

	}

	private EntityStageDetails setMatchStatus(EntityStageDetails entityMatch) {

		if (entityMatch.getIntegrationStatusCode().equals(Constants.INT_STATUS_ERROR)) {
			entityMatch.setMatchStatusCode(Constants.ENTITY_CLEAN_UP_MATCH_STATUS_ERROR_IN_MATCH);
			return entityMatch;
		}

		if (entityMatch.getCandidateMatchedQuantity() == 1 && entityMatch.getSrcDunsNumber() != null) {
			entityMatch.setMatchStatusCode(Constants.ENTITY_CLEAN_UP_MATCH_STATUS_EXTACT_MATCH);
			return entityMatch;
		}

		if (entityMatch.getCandidateMatchedQuantity() > 0) {
			entityMatch.setMatchStatusCode(Constants.ENTITY_CLEAN_UP_MATCH_STATUS_MULTIPLE_MATCH);
			return entityMatch;
		}

		if (entityMatch.getCandidateMatchedQuantity() == 0) {
			entityMatch.setMatchStatusCode(Constants.ENTITY_CLEAN_UP_MATCH_STATUS_NO_MATCH);
			return entityMatch;
		}

		return entityMatch;
	}

}
