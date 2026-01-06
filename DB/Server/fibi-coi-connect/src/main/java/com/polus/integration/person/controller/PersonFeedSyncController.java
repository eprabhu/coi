package com.polus.integration.person.controller;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.person.pojo.PersonFeedReport;
import com.polus.integration.person.service.PersonFeedClientService;
import com.polus.integration.person.service.PersonFeedReportService;
import com.polus.integration.person.service.PersonFeedSyncService;
import com.polus.integration.person.vo.PersonFeedRequest;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/personFeed")
@ConditionalOnProperty(name = "schedule.cron.person.feed.enabled", havingValue = "true")
public class PersonFeedSyncController {

	private final PersonFeedSyncService personFeedSyncService;
	private final PersonFeedClientService personFeedClientService;
	private final PersonFeedReportService personFeedReportService;
	private final IntegrationDao integrationDao;

	public PersonFeedSyncController(PersonFeedSyncService personFeedSyncService, PersonFeedClientService personFeedClientService, PersonFeedReportService personFeedReportService, IntegrationDao integrationDao) {
		this.personFeedSyncService = personFeedSyncService;
		this.personFeedClientService = personFeedClientService;
		this.personFeedReportService = personFeedReportService;
		this.integrationDao = integrationDao;
	}

	@PostMapping("/syncPersonFeed")
	public ResponseEntity<String> syncPersonFeed(@RequestBody PersonFeedRequest personRequest) {
		String personId = personRequest.getPersonId();
		Timestamp requestDate = personRequest.getRequestDate();
		Timestamp startTime = integrationDao.getCurrentTimestamp();
		log.info("Event STARTED: syncPersonFeed | personId: {} | requestDate: {} | startTime: {}", personId, requestDate, formatTimestamp(startTime));

		try {
			personFeedSyncService.syncPersonFeedData(personRequest, false);
			Timestamp endTime = integrationDao.getCurrentTimestamp();
			String totalDuration = calculateDuration(startTime, endTime);
			log.info("Event COMPLETED: syncPersonFeed | personId: {} | requestDate: {} | endTime: {} | total duration: {} ", personId, requestDate, formatTimestamp(endTime), totalDuration);
			return ResponseEntity.ok("Person feed sync triggered successfully...!");
		} catch (Exception ex) {
			Timestamp endTime = integrationDao.getCurrentTimestamp();
			String totalDuration = calculateDuration(startTime, endTime);
			log.error("Event FAILED: syncPersonFeed | personId: {} | requestDate: {} | endTime: {} | total duration: {} ", personId, requestDate, formatTimestamp(endTime), totalDuration, ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred. Please try again later.");
		}
	}

	@GetMapping("/startPersonFeedMigration")
	public ResponseEntity<String> startPersonFeedMigration() {
		Timestamp startTime = integrationDao.getCurrentTimestamp();
		log.info("Event STARTED: startPersonFeedMigration | Start Time: {}", formatTimestamp(startTime));

		try {
			PersonFeedReport report = personFeedReportService.initializeReport(null);
			personFeedClientService.startPersonFeedMigration(report);

			Timestamp endTime = integrationDao.getCurrentTimestamp();
			String totalDuration = calculateDuration(startTime, endTime);

			log.info("Event COMPLETED: startPersonFeedMigration | End Time: {} | Total Duration: {}", formatTimestamp(endTime), totalDuration);

			personFeedReportService.finalizeReport(report);
			return ResponseEntity.ok("✅ Person feed migrated successfully in " + totalDuration);
		} catch (Exception e) {
			Timestamp endTime = integrationDao.getCurrentTimestamp();
			String totalDuration = calculateDuration(startTime, endTime);

			log.error("❌ Event FAILED: startPersonFeedMigration | End Time: {} | Total Duration: {} | Error: {}", formatTimestamp(endTime), totalDuration, e.getMessage(), e);

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Migration failed. Please check logs for details.");
		}
	}

	@GetMapping("/personFeedReportTest")
	public ResponseEntity<String> personFeedReportTest(@PathVariable Integer feedId) {
		Timestamp startTime = integrationDao.getCurrentTimestamp();
		log.info("Event STARTED: personFeedReportTest | Start Time: {}", formatTimestamp(startTime));
		try {
			String message = personFeedReportService.personFeedReportTest(feedId);
			Timestamp endTime = integrationDao.getCurrentTimestamp();
			String totalDuration = calculateDuration(startTime, endTime);

			log.info("Event COMPLETED: personFeedReportTest | End Time: {} | Total Duration: {}", formatTimestamp(endTime), totalDuration);
			return ResponseEntity.ok(message);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Person feed report failed. Please check logs for details.");
		}
	}

	private String formatTimestamp(Timestamp timestamp) {
		return (timestamp != null) ? new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(timestamp) : "N/A";
	}

	private String calculateDuration(Timestamp start, Timestamp end) {
		if (start == null || end == null) {
			return "N/A";
		}
		long durationMillis = end.getTime() - start.getTime();
		long minutes = (durationMillis / 1000) / 60;
		long seconds = (durationMillis / 1000) % 60;
		return minutes + " Minutes and " + seconds + " Seconds";
	}

}
