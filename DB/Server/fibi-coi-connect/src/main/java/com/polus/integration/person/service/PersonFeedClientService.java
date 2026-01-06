package com.polus.integration.person.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.polus.integration.feedentity.client.KCFeignClient;
import com.polus.integration.person.dao.PersonFeedSyncDao;
import com.polus.integration.person.pojo.FibiCoiPerson;
import com.polus.integration.person.pojo.PersonFeedReport;
import com.polus.integration.person.util.ErrorHandlerUtility;
import com.polus.integration.person.vo.PersonFeedRequest;
import com.polus.integration.person.vo.PersonFeedResponse;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PersonFeedClientService {

	private static final int MAX_BATCH_SIZE = 10000; // Upper limit
	private static final int MIN_BATCH_SIZE = 2000;  // Lower limit
	private static final int THREAD_COUNT = 5; // Number of parallel threads

	private int currentBatchSize = MAX_BATCH_SIZE; // Start with 10K batch size

	private final KCFeignClient kcFeignClient;
	private final PersonFeedSyncDao personFeedSyncDao;

	private final ExecutorService executorService = Executors.newFixedThreadPool(THREAD_COUNT);

	public PersonFeedClientService(KCFeignClient kcFeignClient, PersonFeedSyncDao personFeedSyncDao) {
		super();
		this.kcFeignClient = kcFeignClient;
		this.personFeedSyncDao = personFeedSyncDao;
	}

	public ResponseEntity<PersonFeedResponse> fetchAndProcessData(PersonFeedRequest request, PersonFeedReport report) {
		log.info("Starting fetchAndProcessData with request: {}", request);

		ResponseEntity<PersonFeedResponse> response = null;
		try {
			report.setFeedStatus("Request sent to external system.");
			personFeedSyncDao.savePersonFeedHistory(report);

			response = kcFeignClient.feedPersonDetails(request);

			log.info("Received response for fetchAndProcessData: {}", response);
			report.setFeedStatus("Response received from external system.");
			personFeedSyncDao.savePersonFeedHistory(report);

		} catch (FeignException feignEx) {
			ErrorHandlerUtility.handleFeignException(feignEx, report, "fetchAndProcessData");
		} catch (Exception ex) {
			ErrorHandlerUtility.handleUnexpectedException(ex, report, "fetchAndProcessData");
		}
		return response;
	}

	public List<FibiCoiPerson> fetchPersonsByBatch(List<String> personIds, PersonFeedReport report) {
		log.info("Starting fetchPersonsByBatch with personIds: {}", personIds);

		try {
			ResponseEntity<PersonFeedResponse> response = kcFeignClient
					.getPersonsByPersonIds(PersonFeedRequest.builder().personIds(personIds).build());

			log.info("Received response for fetchPersonsByBatch: {}", response);

			if (response != null && response.getStatusCode().is2xxSuccessful()) {
				return response.getBody().getPersons();
			}
		} catch (FeignException feignEx) {
			ErrorHandlerUtility.handleFeignException(feignEx, report, "fetchPersonsByBatch");
		} catch (Exception ex) {
			ErrorHandlerUtility.handleUnexpectedException(ex, report, "fetchPersonsByBatch");
		}

		return Collections.emptyList();
	}

	public PersonFeedResponse updateFeedStatusByPersonIds(List<String> personIds, PersonFeedReport report) {
		log.info("Starting updateFeedStatusByPersonIds with personIds: {}", personIds);

		try {
			ResponseEntity<PersonFeedResponse> response = kcFeignClient
					.updateFeedStatusByPersonIds(PersonFeedRequest.builder().personIds(personIds).build());

			log.info("Received response for updateFeedStatusByPersonIds: {}", response);

			if (response != null && response.getStatusCode().is2xxSuccessful()) {
				return response.getBody();
			}
		} catch (FeignException feignEx) {
			ErrorHandlerUtility.handleFeignException(feignEx, report, "updateFeedStatusByPersonIds");
		} catch (Exception ex) {
			ErrorHandlerUtility.handleUnexpectedException(ex, report, "updateFeedStatusByPersonIds");
		}

		return null;
	}

	public void startPersonFeedMigration(PersonFeedReport report) {
		log.info("🔹 STARTING Multi-Threaded Person Feed Migration with initial batch size: {}", currentBatchSize);

		int page = 0;

		try {
			report.setFeedStatus("Request started migration.");
			personFeedSyncDao.savePersonFeedHistory(report);
			do {
				log.info("🔄 Fetching records: Page = {}, Batch Size = {}", page, currentBatchSize);

				ResponseEntity<List<FibiCoiPerson>> response = kcFeignClient.feedFibiCoiPersonsByParams(page, currentBatchSize);

				if (response == null || !response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
					log.warn("⚠️ No data received or API failed. Stopping migration at Page = {}", page);
					break;
				}

				final List<FibiCoiPerson> persons = response.getBody();

				if (!persons.isEmpty()) {
					executorService.submit(() -> insertBatch(new ArrayList<>(persons)));
					page++;
				} else {
					log.info("🚀 No more data to migrate. Process completed.");
					break;
				}

			} while (true);

			// Wait for all threads to complete before shutting down
			executorService.shutdown();
			executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);

			log.info("✅ Multi-Threaded Migration COMPLETED successfully. Starting person feed validation.");
			report.setFeedStatus("Batch process completed. Starting validation.");
			personFeedSyncDao.savePersonFeedHistory(report);

			Map<String, Object> validationReport = personFeedSyncDao
					.validateAndUpdatePersonFeedData(report.getPersonFeedId());
			if (validationReport != null) {
				String validationMessage = (String) validationReport.get("VALIDATION_MESSAGE");
				int noOfNewRecords = (Integer) validationReport.getOrDefault("NO_OF_NEW_RECORDS", 0);
				int noOfUpdateRecords = (Integer) validationReport.getOrDefault("NO_OF_UPDATE_RECORDS", 0);

				report.setFeedStatus("SUCCESS");
				report.setNewUserCount(noOfNewRecords);
				report.setUpdatedUserCount(noOfUpdateRecords);
				List<String> failedBatchDetails = new ArrayList<>();
				if (validationMessage != null && !"SUCCESS".equals(validationMessage)) {
					failedBatchDetails.add(validationMessage);
				}

				if (!failedBatchDetails.isEmpty()) {
					report.setExceptionDetails(String.join(", ", failedBatchDetails));
				}
			}

			log.info("Validation completed successfully for personFeedId: {}", report.getPersonFeedId());

		} catch (FeignException feignEx) {
			ErrorHandlerUtility.handleFeignException(feignEx, report, "startPersonFeedMigration");
		} catch (Exception e) {
			log.error("❌ Migration failed: {}", e.getMessage(), e);
			ErrorHandlerUtility.handleUnexpectedException(e, report, "startPersonFeedMigration");
			throw new RuntimeException("Migration failed due to an unexpected error.", e);
		} finally {
			personFeedSyncDao.savePersonFeedHistory(report);
		}
	}

	private void insertBatch(List<FibiCoiPerson> persons) {
		long startTime = System.currentTimeMillis();

		try {
			log.info("✅ [Thread: {}] Inserting {} records into database...", Thread.currentThread().getName(), persons.size());
			personFeedSyncDao.feedFibiCoiPersonsByParams(persons);
			long duration = System.currentTimeMillis() - startTime;
			log.info("📌 [Thread: {}] Batch inserted successfully in {} ms.", Thread.currentThread().getName(), duration);

			// Adjust batch size based on execution time
			/*if (duration < 2000 && currentBatchSize < MAX_BATCH_SIZE) {
				currentBatchSize = Math.min(currentBatchSize + 1000, MAX_BATCH_SIZE);
				log.info("⬆️ Increasing batch size to: {}", currentBatchSize);
			} else if (duration > 5000 && currentBatchSize > MIN_BATCH_SIZE) {
				currentBatchSize = Math.max(currentBatchSize - 2000, MIN_BATCH_SIZE);
				log.info("⬇️ Reducing batch size to: {}", currentBatchSize);
			}*/

		} catch (DataAccessException e) {
			log.error("❌ [Thread: {}] Database error during insert: {}", Thread.currentThread().getName(), e.getMessage(), e);
			currentBatchSize = Math.max(currentBatchSize / 2, MIN_BATCH_SIZE);
			log.warn("⚠️ Batch size reduced to: {}", currentBatchSize);
		}
	}

}
