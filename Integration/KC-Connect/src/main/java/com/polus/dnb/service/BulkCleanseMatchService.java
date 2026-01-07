package com.polus.dnb.service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.dnb.config.Constants;
import com.polus.dnb.config.ErrorCode;
import com.polus.dnb.dto.DnBCleanseMatchAPIResponse;
import com.polus.dnb.dto.DnBCleanseMatchAPIResponse.ErrorDetail;
import com.polus.dnb.dto.DnBCleanseMatchAPIResponse.MatchCandidate;
import com.polus.dnb.dto.DnBEntityCleanseMatchRequestDTO;
import com.polus.dnb.dto.DnBOrganizationDetails;
import com.polus.dnb.dto.DnBOrganizationDetails.IndustryCode;
import com.polus.dnb.entity.DnBIndustryCatInfo;
import com.polus.dnb.entity.DnBMatchHeader;
import com.polus.dnb.entity.DnBMatchHeaderSpecification;
import com.polus.dnb.entity.DnBMatchResult;
import com.polus.dnb.repository.DnBIndustryCatInfoRepository;
import com.polus.dnb.repository.DnBMatchHeaderRepository;
import com.polus.dnb.repository.DnBMatchResultRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BulkCleanseMatchService {

	private final DnBMatchHeaderRepository dnbEntityMatchRepository;
	private final DnBMatchResultRepository matchResultRepository;
	private final DnBIndustryCatInfoRepository industryCodeRepository;
	private final CleanseMatchUrlBuilder urlBuilder;
	private final DnBCleanseMatchAPIService apiService;
	private final EntityCriteriaSearchService searchService;

	public BulkCleanseMatchService(DnBMatchHeaderRepository dnbEntityMatchRepository,
			DnBMatchResultRepository matchResultRepository, DnBIndustryCatInfoRepository industryCodeRepository,
			CleanseMatchUrlBuilder urlBuilder, DnBCleanseMatchAPIService apiService,
			EntityCriteriaSearchService searchService) {
		this.dnbEntityMatchRepository = dnbEntityMatchRepository;
		this.matchResultRepository = matchResultRepository;
		this.industryCodeRepository = industryCodeRepository;
		this.urlBuilder = urlBuilder;
		this.apiService = apiService;
		this.searchService = searchService;
	}

	private volatile AtomicBoolean stopMatchFlag = new AtomicBoolean(false);

	private static final ObjectMapper objectMapper = new ObjectMapper();

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
		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();
		//tableCleanup();
		startTime = Instant.now();
		isProcessing = true;
		stopMatchFlag.set(false);

		List<DnBMatchHeader> entityMatches = fetchDataForMatching(batchId);

		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		for (DnBMatchHeader entityMatch : entityMatches) {
			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch);
					entityMatch.setRequest(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {
					entityMatch = setErrorInfo(entityMatch, e, ErrorCode.DNB_BULK_MATCH_ERROR);
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch.setUpdateTimestamp(LocalDateTime.now());
					saveToDB(entityMatch);

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
			System.out.println("Bulk cleanse match is already in progress. Skipping...");
			return CompletableFuture.completedFuture(null);
		}
		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();
		startTime = Instant.now();
		isProcessing = true;
		stopMatchFlag.set(false);
		
		List<DnBMatchHeader> entityMatches = fetchDataForMatching(filters);
		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		for (DnBMatchHeader entityMatch : entityMatches) {
			System.out.println("*********** startBulkCleanseMatch *******" + entityMatch.getSourceDataCode());
			processedRecords.incrementAndGet();
			entityMatch = resetPreviousResponse(entityMatch);

			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch);
					entityMatch.setRequest(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {
					entityMatch = setErrorInfo(entityMatch, e, ErrorCode.DNB_BULK_MATCH_ERROR);
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch.setUpdateTimestamp(LocalDateTime.now());
					saveToDB(entityMatch);
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

		System.out.println(
				"-------------===========================================================Executing startBulkCleanseMatch on thread: "
						+ Thread.currentThread().getName());

		if (isProcessing) {
			System.out.println("Bulk cleanse match is already in progress. Skipping...");
			return CompletableFuture.completedFuture(null);
		}
		startTime = Instant.now();
		isProcessing = true;
		stopMatchFlag.set(false);
		List<DnBMatchHeader> entityMatches = fetchDataForMatching(filters);
		totalRecords.set(entityMatches.size());
		processedRecords.set(0);

		DnBCleanseMatchAPIResponse apiResponse = new DnBCleanseMatchAPIResponse();

		for (DnBMatchHeader entityMatch : entityMatches) {
			System.out.println("*********** startBulkCleanseMatch *******" + entityMatch.getSourceDataCode());
			entityMatch = resetPreviousResponse(entityMatch);
			try {
				if (stopMatchFlag.get()) {
					break;
				}
				try {
					String apiUrl = buildApiUrl(entityMatch, matchParams);
					entityMatch.setRequest(apiUrl);
					apiResponse = callAPI(apiUrl);
					entityMatch = PrepareResponse(apiResponse, entityMatch);

				} catch (Exception e) {

					entityMatch = setErrorInfo(entityMatch, e, ErrorCode.DNB_BULK_MATCH_ERROR);
					entityMatch.setIntegrationStatusCode(Constants.INT_STATUS_ERROR);
				} finally {
					entityMatch.setUpdateTimestamp(LocalDateTime.now());
					saveToDB(entityMatch);
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

	private String buildApiUrl(DnBMatchHeader sponsorMatch) {
		DnBEntityCleanseMatchRequestDTO dto = setDto(sponsorMatch);
		return urlBuilder.buildApiUrl(dto);
	}

	private String buildApiUrl(DnBMatchHeader sponsorMatch, String[] matchParams) {
		DnBEntityCleanseMatchRequestDTO dto = setDto(sponsorMatch);
		return urlBuilder.buildApiUrl(dto, matchParams);
	}

	private DnBEntityCleanseMatchRequestDTO setDto(DnBMatchHeader sponsorMatch) {
		DnBEntityCleanseMatchRequestDTO dto = new DnBEntityCleanseMatchRequestDTO();
		dto.setSourceDunsNumber(sponsorMatch.getSourceDunsNumber());
		dto.setSourceDataName(sponsorMatch.getSourceDataName());
		dto.setCountryCode(sponsorMatch.getCountryCode());
		dto.setAddressLine1(sponsorMatch.getAddressLine1());
		dto.setAddressLine2(sponsorMatch.getAddressLine2());
		dto.setState(sponsorMatch.getState());
		dto.setPostalCode(sponsorMatch.getPostalCode());
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

	private DnBMatchHeader PrepareResponse(DnBCleanseMatchAPIResponse apiResponse, DnBMatchHeader entityMatch) {

		try {
			if (apiResponse.getResponse() != null) {

				try {
					String fullResponse = objectMapper.writeValueAsString(apiResponse.getResponse());
					entityMatch.setResponse(fullResponse);

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

				List<String> dunsList = apiResponse.getMatchCandidates().stream()
						.map(r -> r.getOrganization().getDuns()).collect(Collectors.toList());

				var result = searchService.fetchSearchResult(dunsList);
				var searchResult = result.getSearchCandidates();

				Map<String, DnBOrganizationDetails> dunsOrganizationMapFromSearchAPI = searchResult.stream()
						.map(row -> row.getOrganization())
						.collect(Collectors.toMap(DnBOrganizationDetails::getDuns, org -> org));

				List<DnBMatchResult> matchResult = new ArrayList<>(apiResponse.getMatchCandidates().size());
				List<DnBIndustryCatInfo> matchIndustryCategory = new ArrayList<>();

				for (MatchCandidate m : apiResponse.getMatchCandidates()) {

					String duns = m.getOrganization().getDuns();
					if (dunsOrganizationMapFromSearchAPI.containsKey(duns)) {
						m.setOrganization(dunsOrganizationMapFromSearchAPI.get(duns));
					}
					DnBMatchResult record = new DnBMatchResult();
					try {
						String data = objectMapper.writeValueAsString(m);
						record.setDnbData(data);
					} catch (Exception e) {

					}
					record.setConfidenceCode(m.getMatchQualityInformation().getConfidenceCode());
					record.setDunsNumber(duns);
					record.setElementOrderNumber(m.getDisplaySequence());
					record.setSourceDataCode(entityMatch.getSourceDataCode());
					matchResult.add(record);

					if (m.getOrganization() == null || m.getOrganization().getIndustryCodes() == null
							|| m.getOrganization().getIndustryCodes().isEmpty()) {
						continue;
					}

					for (IndustryCode i : m.getOrganization().getIndustryCodes()) {
						DnBIndustryCatInfo industryCode = new DnBIndustryCatInfo();
						industryCode.setDunsNumber(duns);
						industryCode.setIndustryCode(i.getCode());
						industryCode.setIndustryType(i.getTypeDnbCode());
						industryCode.setCodeDescription(i.getDescription());
						industryCode.setTypeDescription(i.getTypeDescription());

						matchIndustryCategory.add(industryCode);

					}
				}

				entityMatch.setMatchResult(matchResult);
				entityMatch.setMatchIndustryCategory(matchIndustryCategory);

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
					List<ErrorDetail> errorDetails = apiResponse.getError().getErrorDetails();
					if (errorDetails != null) {
						entityMatch.setErrorDetails(
								errorDetails.stream().map(ErrorDetail::toString).collect(Collectors.joining("; ")));
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
			entityMatch.setUpdateTimestamp(LocalDateTime.now());
		}

		return entityMatch;

	}

	private List<DnBMatchHeader> fetchDataForMatching(Map<String, String> filters) {
		Specification<DnBMatchHeader> specification = DnBMatchHeaderSpecification.getSpecifications(filters);
		return dnbEntityMatchRepository.findAll(specification);
	}

	private List<DnBMatchHeader> fetchDataForMatching(String batchId) {
		// Pageable firstPageWithTenRecords = PageRequest.of(0, 10);
		// List<DnBMatchHeader> entityMatches =
		// dnbEntityMatchRepository.findAll(firstPageWithTenRecords).getContent();
		List<DnBMatchHeader> entityMatches = dnbEntityMatchRepository.findByBatchId(Integer.parseInt(batchId));
		return entityMatches;
	}

	private void tableCleanup() {
		industryCodeRepository.deleteAll();
		matchResultRepository.deleteAll();
	}

	private DnBMatchHeader setErrorInfo(DnBMatchHeader entityMatch, Exception e, ErrorCode errorCode) {
		entityMatch.setErrorCode(errorCode.getErrorCode());
		entityMatch.setErrorMessage(errorCode.getErrorMessage());
		entityMatch.setErrorDetails(e.getMessage());
		return entityMatch;
	}

	private void saveToDB(DnBMatchHeader entityMatch) {
		List<DnBMatchResult> matchResult = entityMatch.getMatchResult();
		List<DnBIndustryCatInfo> matchIndustryCategory = entityMatch.getMatchIndustryCategory();

		dnbEntityMatchRepository.save(entityMatch);

		CompletableFuture<Void> saveMatchResultsFuture = null;
		CompletableFuture<Void> saveIndustryCodesFuture = null;

		if (matchResult != null && !matchResult.isEmpty()) {
			saveMatchResultsFuture = CompletableFuture.runAsync(() -> matchResultRepository.saveAll(matchResult));
		}

		if (matchIndustryCategory != null && !matchIndustryCategory.isEmpty()) {
			saveIndustryCodesFuture = CompletableFuture
					.runAsync(() -> industryCodeRepository.saveAll(matchIndustryCategory));
		}

		if (saveMatchResultsFuture != null && saveIndustryCodesFuture != null) {
			CompletableFuture.allOf(saveMatchResultsFuture, saveIndustryCodesFuture).join();
		} else if (saveMatchResultsFuture != null) {
			saveMatchResultsFuture.join();
		} else if (saveIndustryCodesFuture != null) {
			saveIndustryCodesFuture.join();
		}

	}

	private DnBMatchHeader resetPreviousResponse(DnBMatchHeader entityMatch) {
		entityMatch.setErrorCode(null);
		entityMatch.setErrorMessage(null);
		entityMatch.setErrorDetails(null);
		return entityMatch;
	}
}
