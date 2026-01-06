package com.polus.kcintegration.person.controller;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.polus.kcintegration.person.pojo.FibiCoiPerson;
import com.polus.kcintegration.person.repo.FibiCoiPersonRepository;
import com.polus.kcintegration.person.service.PersonFeedService;
import com.polus.kcintegration.person.vo.PersonFeedRequest;
import com.polus.kcintegration.person.vo.PersonFeedResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/personFeed")
public class PersonFeedController {

	private final PersonFeedService fibiCoiPersonFeedService;

	private final FibiCoiPersonRepository fibiCoiPersonRepository;

	public PersonFeedController(FibiCoiPersonRepository personRepository, PersonFeedService fibiCoiPersonFeedService) {
		super();
		this.fibiCoiPersonRepository = personRepository;
		this.fibiCoiPersonFeedService = fibiCoiPersonFeedService;
	}

	@PostMapping("/feedPersonDetails")
	public ResponseEntity<PersonFeedResponse> feedPersonDetails(@RequestBody PersonFeedRequest personRequest,
			HttpServletRequest req) {
		String clientIp = req.getRemoteAddr();
		long startTime = System.currentTimeMillis();
		log.info("Event STARTED: feedPersonDetails | clientIp: {} | personRequest: {} | startTime: {}", clientIp, personRequest, formatTimestamp(startTime));

		String personId = personRequest.getPersonId();
		Timestamp requestDate = personRequest.getRequestDate();

		try {
			PersonFeedResponse personFeedResponse = fibiCoiPersonFeedService.feedFibiCoiPersons(personId, requestDate);
			if (personFeedResponse == null) {
				log.warn("No data found for personId: {} and requestDate: {}", personId, requestDate);
				return ResponseEntity.noContent().build();
			}
			log.debug("Successfully fetched {} records for personId: {} and requestDate: {}", personFeedResponse.getPersonIds().size(), personId, requestDate);
			return ResponseEntity.ok(personFeedResponse);
		} catch (Exception ex) {
			long endTime = System.currentTimeMillis();
			log.error("Event FAILED: feedPersonDetails | clientIp: {} | personRequest: {} | endTime: {} | duration: {}", clientIp, personRequest, formatTimestamp(endTime), calculateDuration(startTime, endTime), ex);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching person details. Please try again later.");
		} finally {
			long endTime = System.currentTimeMillis();
			log.info("Event COMPLETED: feedPersonDetails | clientIp: {} | personRequest: {} | endTime: {} | duration: {}", clientIp, personRequest, formatTimestamp(endTime), calculateDuration(startTime, endTime));
		}
	}

	@PostMapping("/getPersonsByPersonIds")
	public ResponseEntity<PersonFeedResponse> getPersonsByPersonIds(@RequestBody PersonFeedRequest personRequest,
			HttpServletRequest req) {
		List<String> personIds = personRequest.getPersonIds();
		long startTime = System.currentTimeMillis();
		log.info("Event STARTED: getPersonsByPersonIds | personIds count: {} | startTime: {}", personIds.size(), formatTimestamp(startTime));

		if (personIds == null || personIds.isEmpty()) {
			log.warn("Invalid personIds: {}", personIds);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "personIds cannot be null or empty.");
		}

		List<FibiCoiPerson> persons = fibiCoiPersonRepository.findAllById(personIds);
		PersonFeedResponse feedResponse = PersonFeedResponse.builder().persons(persons).build();

		if (persons.isEmpty()) {
			log.warn("No persons found for personIds : {}", personIds);
			return ResponseEntity.notFound().build();
		}

		long endTime = System.currentTimeMillis();
		log.info("Event COMPLETED: getPersonsByPersonIds | personIds size: {} | endTime: {} | duration: {}", personIds.size(), formatTimestamp(endTime), calculateDuration(startTime, endTime));
		return ResponseEntity.ok(feedResponse);
	}

	@GetMapping("/getAllPersons")
	public ResponseEntity<List<FibiCoiPerson>> getAllPersons() {
		long startTime = System.currentTimeMillis();
		log.info("Event STARTED: getAllPersons | startTime: {}", formatTimestamp(startTime));

		List<FibiCoiPerson> persons = fibiCoiPersonRepository.findAll();
		if (persons.isEmpty()) {
			log.warn("No person hashes found.");
			long endTime = System.currentTimeMillis();
			log.info("Event COMPLETED: getAllPersons | endTime: {} | duration: {}", formatTimestamp(endTime), calculateDuration(startTime, endTime));
			return ResponseEntity.noContent().build();
		}

		long endTime = System.currentTimeMillis();
		log.info("Event COMPLETED: getAllPersons | numberOfHashes: {} | endTime: {} | duration: {}", persons.size(), formatTimestamp(endTime), calculateDuration(startTime, endTime));
		return ResponseEntity.ok(persons);
	}

	@PostMapping("/updateFeedStatusByPersonIds")
	public ResponseEntity<PersonFeedResponse> updateFeedStatusByPersonIds(@RequestBody PersonFeedRequest personRequest,
			HttpServletRequest req) {
		List<String> personIds = personRequest.getPersonIds();
		long startTime = System.currentTimeMillis();
		log.info("Event STARTED: updateFeedStatusByPersonIds | personIds count: {} | startTime: {}", personIds.size(), formatTimestamp(startTime));

		if (personIds == null || personIds.isEmpty()) {
			log.warn("Invalid personIds: {}", personIds);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "personIds cannot be null or empty.");
		}

		int updatedCount = fibiCoiPersonRepository.updateFeedStatusByPersonIds("ERROR", personIds);
		log.info("updatedCount : {}", updatedCount);
		PersonFeedResponse feedResponse;

		if (personIds.size() == updatedCount) {
			feedResponse = PersonFeedResponse.builder().status("SUCCESS").build();
		} else {
			feedResponse = PersonFeedResponse.builder().status("FAIL").build();
		}

		long endTime = System.currentTimeMillis();
		log.info("Event COMPLETED: updateFeedStatusByPersonIds | personIds size: {} | endTime: {} | duration: {}", personIds.size(), formatTimestamp(endTime), calculateDuration(startTime, endTime));
		return ResponseEntity.ok(feedResponse);
	}

	@GetMapping("/feedFibiCoiPersonsByParams")
	public ResponseEntity<List<FibiCoiPerson>> feedFibiCoiPersonsByParams(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10000") int size) {

		long startTime = System.currentTimeMillis();
		log.info("🔹 Event STARTED: feedFibiCoiPersonsByParams | Page: {} | Size: {} | Start Time: {}", page, size, formatTimestamp(startTime));

		try {
			List<FibiCoiPerson> data = fibiCoiPersonFeedService.feedFibiCoiPersonsByParams(page, size);

			if (data == null || data.isEmpty()) {
				log.warn("⚠️ No records found for Page: {} | Size: {}", page, size);
				return ResponseEntity.noContent().build();
			}

			long endTime = System.currentTimeMillis();
			log.info("✅ Event COMPLETED: feedFibiCoiPersonsByParams | End Time: {} | Duration: {}", formatTimestamp(endTime), calculateDuration(startTime, endTime));

			return ResponseEntity.ok(data);
		} catch (Exception e) {
			long endTime = System.currentTimeMillis();
			log.error("❌ Event FAILED: feedFibiCoiPersonsByParams | End Time: {} | Duration: {} | Error: {}", formatTimestamp(endTime), calculateDuration(startTime, endTime), e.getMessage(), e);

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
		}
	}

	private String formatTimestamp(long millis) {
		return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(millis));
	}

	private String calculateDuration(long startMillis, long endMillis) {
		long durationMillis = endMillis - startMillis;
		long minutes = (durationMillis / 1000) / 60;
		long seconds = (durationMillis / 1000) % 60;
		return minutes + " Minutes and " + seconds + " Seconds (" + durationMillis + " ms)";
	}

}
