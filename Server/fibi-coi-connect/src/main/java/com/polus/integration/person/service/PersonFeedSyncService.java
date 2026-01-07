package com.polus.integration.person.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.person.dao.PersonFeedSyncDao;
import com.polus.integration.person.pojo.FibiCoiPerson;
import com.polus.integration.person.pojo.PersonFeedReport;
import com.polus.integration.person.vo.PersonFeedRequest;
import com.polus.integration.person.vo.PersonFeedResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Component
@ConditionalOnProperty(name = "schedule.cron.person.feed.enabled", havingValue = "true")
public class PersonFeedSyncService {

	private static final AtomicBoolean isRunning = new AtomicBoolean(false);
	private static final int BATCH_SIZE = 1000;

	private final RetryTemplate retryTemplate;
	private final IntegrationDao integrationDao;
	private final PersonFeedSyncDao personFeedSyncDao;
	private final PersonFeedClientService personFeedClientService;
	private final PersonFeedReportService personFeedReportService;

	public PersonFeedSyncService(RetryTemplate retryTemplate, IntegrationDao integrationDao,
			PersonFeedSyncDao personFeedSyncDao, PersonFeedClientService personFeedClientService,
			PersonFeedReportService personFeedReportService) {
		this.retryTemplate = retryTemplate;
		this.integrationDao = integrationDao;
		this.personFeedSyncDao = personFeedSyncDao;
		this.personFeedClientService = personFeedClientService;
		this.personFeedReportService = personFeedReportService;
	}

	@Scheduled(cron = "${schedule.cron.person.feed}")
	public void scheduledSyncPersonFeedData() {
		String syncTaskId = UUID.randomUUID().toString();
		Timestamp startTime = integrationDao.getCurrentTimestamp();
		log.info("Sync Task ID: {} - Starting scheduledSyncPersonFeedData at {}", syncTaskId, startTime);
		syncPersonFeedData(new PersonFeedRequest(), true);
		Timestamp endTime = integrationDao.getCurrentTimestamp();
		Long duration = endTime.getTime() - startTime.getTime();
		long minutes = (duration / 1000) / 60;
		long seconds = (duration / 1000) % 60;
		String totalDuration = minutes + " Minutes and " + seconds + " seconds";
		log.info("Event COMPLETED: scheduledSyncPersonFeedData | endTime: {} | total duration: {}", integrationDao.getCurrentTimestamp(), totalDuration);
	}

	public void syncPersonFeedData(PersonFeedRequest request, boolean isScheduled) {
		if (isScheduled && !isRunning.compareAndSet(false, true)) {
			log.warn("Scheduled sync task is already running. Skipping...");
			return;
		}

		PersonFeedReport report = personFeedReportService.initializeReport(request);
		log.info("personFeedId : {}", report.getPersonFeedId());
		try {
			List<FibiCoiPerson> persons = request.getPersons();
			if (persons != null && !persons.isEmpty()) {
				syncPersonFeedDataForPersons(persons);
			} else {
				retryTemplate.execute(context -> {
					log.info("Attempt {} to sync person feed data", context.getRetryCount() + 1);
					ResponseEntity<PersonFeedResponse> response = personFeedClientService.fetchAndProcessData(request, report);
					processResponse(response, report);
					return null;
				});
			}
		} catch (Exception ex) {
			log.error("Sync process failed after retries: {}", ex.getMessage(), ex);
			report.setExceptionDetails(getStackTraceAsString(ex));
		} finally {
			personFeedReportService.finalizeReport(report);
			if (isScheduled) {
				isRunning.set(false);
			}
		}
	}

	public void syncPersonFeedDataForPersons(List<FibiCoiPerson> persons) {
		log.info("Started syncing person feed data for {} persons.", persons.size());
		PersonFeedReport report = personFeedReportService.initializeReport(null);

		if (persons == null || persons.isEmpty()) {
			log.warn("No persons provided for synchronization.");
			report.setExceptionDetails("No persons provided for synchronization.");
			personFeedReportService.finalizeReport(report);
			return;
		}

		int failureCount = 0;
		List<String> failedBatchDetails = new ArrayList<>();
		List<FibiCoiPerson> batch = new ArrayList<>();
		int batchNumber = 1;

		try {
			personFeedSyncDao.truncateFibiCoiPerson();
			for (FibiCoiPerson person : persons) {
				batch.add(person);
				if (batch.size() == BATCH_SIZE) {
					log.info("Processing batch number {} with {} records.", batchNumber, batch.size());
					int processedCount = processPersonBatch(batch, report, failedBatchDetails, batchNumber);
					failureCount += (batch.size() - processedCount);
					batch.clear();
					batchNumber++;
				}
			}

			if (!batch.isEmpty()) {
				log.info("Processing final batch number {} with {} records.", batchNumber, batch.size());
				int processedCount = processPersonBatch(batch, report, failedBatchDetails, batchNumber);
				failureCount += (batch.size() - processedCount);
			}

			try {
				log.info("Batch processing completed. Starting person feed validation.");
				report.setFeedStatus("Batch process completed. Starting validation.");
				personFeedSyncDao.savePersonFeedHistory(report);

				Map<String, Object> validationReport = personFeedSyncDao
						.validateAndUpdatePersonFeedData(report.getPersonFeedId());
				processValidationReport(validationReport, failedBatchDetails, report);

				log.info("Validation completed successfully for personFeedId: {}", report.getPersonFeedId());
			} catch (Exception e) {
				log.error("Error during person feed validation for personFeedId: {}. Error: {}",
						report.getPersonFeedId(), e.getMessage(), e);
				handleValidationException(report, failedBatchDetails, e);
			}
		} catch (Exception ex) {
			log.error("Error while syncing person feed data for persons: {}", ex.getMessage(), ex);
			report.setExceptionDetails(getStackTraceAsString(ex));
			throw new RuntimeException("Failed to sync person feed data for persons.", ex);
		} finally {
			log.info("failureCount : {}", failureCount);
			report.setTotalUserCount(persons.size());
			personFeedReportService.finalizeReport(report);
		}
	}

	private int processPersonBatch(List<FibiCoiPerson> batch, PersonFeedReport report, List<String> failedBatchDetails,
			int batchNumber) {
		int processedCount = 0;
		List<String> personIds = batch.stream().map(FibiCoiPerson::getPersonId).collect(Collectors.toList());

		try {
			log.info("Processing batch {} with {} persons.", batchNumber, batch.size());
			personFeedSyncDao.saveOrUpdatePersons(batch);
			processedCount = batch.size();
		} catch (Exception ex) {
			String failedDetail = String.format("Batch %d failed - %s - Person IDs: %s", batchNumber, ex.getMessage(),
					String.join(",", personIds));
			failedBatchDetails.add(failedDetail);
			log.error("Error processing batch {}: {}", batchNumber, ex.getMessage(), ex);
		}

		return processedCount;
	}

	private void processResponse(ResponseEntity<PersonFeedResponse> response, PersonFeedReport report) {
		if (response == null || !response.getStatusCode().is2xxSuccessful()) {
			log.warn("Failed to fetch person feed data. HTTP Status: {}",
					response != null ? response.getStatusCode() : "No Response");
			throw new RuntimeException("Invalid response from person feed API");
		}

		PersonFeedResponse responseBody = response.getBody();
		if (responseBody == null || !"SUCCESS".equals(responseBody.getStatus())
				|| responseBody.getPersonIds().isEmpty()) {
			log.info("No person data received.");
			report.setExceptionDetails("No person data received.");
			if ("SUCCESS".equals(responseBody.getStatus())) {
				report.setNewUserCount(0);
				report.setTotalUserCount(0);
				report.setUpdatedUserCount(0);
				report.setFeedStatus("SUCCESS");
			}
			return;
		}

		report.setTotalUserCount(responseBody.getPersonIds().size());
		report.setFeedStatus("Batch process started.");
		personFeedSyncDao.savePersonFeedHistory(report);

		Map<String, Integer> result = processPersonsInBatches(responseBody.getPersonIds(), report);
		int successCount = result.get("successCount");
		int failureCount = result.get("failureCount");
		log.info("Total Successful Records: {}", successCount);
		log.info("Total Failed Records: {}", failureCount);

		report.setUpdatedUserCount(successCount);
	}

	private Map<String, Integer> processPersonsInBatches(List<String> personIds, PersonFeedReport report) {
		int processedRecords = 0;
		int successCount = 0;
		int failureCount = 0;

		List<String> batch = new ArrayList<>();
		List<String> failedBatchDetails = new ArrayList<>();
		int batchNumber = 1;

		log.info("Starting batch processing for {} persons.", personIds.size());

		personFeedSyncDao.truncateFibiCoiPerson();
		for (String personId : personIds) {
			batch.add(personId);
			if (batch.size() == BATCH_SIZE) {
				log.info("Processing batch number {} with {} records.", batchNumber, batch.size());
				processedRecords += processBatch(batch, report, failedBatchDetails, batchNumber);
				successCount += batch.size();
				failureCount += (BATCH_SIZE - processedRecords);
				batch.clear();
				batchNumber++;
			}
		}

		if (!batch.isEmpty()) {
			log.info("Processing final batch number {} with {} records.", batchNumber, batch.size());
			processedRecords += processBatch(batch, report, failedBatchDetails, batchNumber);
			successCount += batch.size();
		}

		try {
			log.info("Batch processing completed. Starting person feed validation.");
			report.setFeedStatus("Batch process completed. Starting validation.");
			personFeedSyncDao.savePersonFeedHistory(report);

			Map<String, Object> validationReport = personFeedSyncDao
					.validateAndUpdatePersonFeedData(report.getPersonFeedId());
			processValidationReport(validationReport, failedBatchDetails, report);

			log.info("Validation completed successfully for personFeedId: {}", report.getPersonFeedId());
		} catch (Exception e) {
			log.error("Error during person feed validation for personFeedId: {}. Error: {}", report.getPersonFeedId(),
					e.getMessage(), e);
			handleValidationException(report, failedBatchDetails, e);
		}

		log.info("Batch processing summary: Processed Records: {}, Success Count: {}, Failure Count: {}.",
				processedRecords, successCount, failureCount);

		return Map.of("successCount", successCount, "failureCount", failureCount);
	}

	private int processBatch(List<String> batch, PersonFeedReport report, List<String> failedBatchDetails,
			int batchNumber) {
		try {
			List<FibiCoiPerson> persons = personFeedClientService.fetchPersonsByBatch(batch, report);
			personFeedSyncDao.saveOrUpdatePersons(persons);
			return batch.size();
		} catch (Exception ex) {
			String failedDetail = String.format("Batch %d - %s - Person IDs: %s", batchNumber, ex.getMessage(),
					String.join(",", batch));
			failedBatchDetails.add(failedDetail);

			log.error("Error processing batch of size {}: {}", batch.size(), ex.getMessage(), ex);
			return 0;
		}
	}

	private void processValidationReport(Map<String, Object> validationReport, List<String> failedBatchDetails,
			PersonFeedReport report) {
		if (validationReport != null) {
			String validationMessage = (String) validationReport.get("VALIDATION_MESSAGE");
			String invalidPersonIds = (String) validationReport.get("INVALID_PERSON_IDS");
			int noOfNewRecords = (Integer) validationReport.getOrDefault("NO_OF_NEW_RECORDS", 0);
			int noOfUpdateRecords = (Integer) validationReport.getOrDefault("NO_OF_UPDATE_RECORDS", 0);

			if (invalidPersonIds != null && !invalidPersonIds.isEmpty()) {
				List<String> invalidPersons = new ArrayList<>(Arrays.asList(invalidPersonIds.split(",")));
				personFeedClientService.updateFeedStatusByPersonIds(invalidPersons, report);
			}

			report.setFeedStatus("SUCCESS");
			report.setNewUserCount(noOfNewRecords);
			report.setUpdatedUserCount(noOfUpdateRecords);
			if (validationMessage != null && !"SUCCESS".equals(validationMessage)) {
				failedBatchDetails.add(validationMessage);
			}

			if (!failedBatchDetails.isEmpty()) {
				report.setExceptionDetails(String.join(", ", failedBatchDetails));
			}
			personFeedSyncDao.savePersonFeedHistory(report);
		} else {
			log.warn("Validation report was null for personFeedId: {}", report.getPersonFeedId());
			report.setFeedStatus("VALIDATION_FAILED");
			personFeedSyncDao.savePersonFeedHistory(report);
		}
	}

	private void handleValidationException(PersonFeedReport report, List<String> failedBatchDetails, Exception e) {
		report.setFeedStatus("ERROR");
		report.setExceptionDetails(getStackTraceAsString(e));
		personFeedSyncDao.savePersonFeedHistory(report);

		failedBatchDetails.add("Validation failed for feed ID " + report.getPersonFeedId() + ": " + e.getMessage());
	}

	private String getStackTraceAsString(Exception ex) {
		StringBuilder result = new StringBuilder();
		for (StackTraceElement element : ex.getStackTrace()) {
			result.append(element.toString()).append("\n");
		}
		return result.toString();
	}

}
