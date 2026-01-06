package com.polus.integration.award.controller;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.award.dto.AwardDTO;
import com.polus.integration.award.dto.AwardPersonDTO;
import com.polus.integration.award.service.AwardIntegrationService;
import com.polus.integration.award.vo.AwardIntegrationVO;
import com.polus.integration.proposal.dto.DisclosureResponse;

import jakarta.persistence.PersistenceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class AwardIntegrationController {

	@Autowired
	private AwardIntegrationService awardService;

	@PostMapping("/feedAward")
	public void feedAward(@RequestBody AwardIntegrationVO vo) {
		log.info("Request for feedAward");
		awardService.feedAward(vo.getAward());
	}

	@GetMapping("/coi/disclosure/status/awards/{awardNumber}/persons/{personIds}")
	public ResponseEntity<DisclosureResponse> feedAwardPersonDisclosureStatus(HttpServletRequest request,
			@PathVariable("awardNumber") String awardNumber, @PathVariable("personIds") List<String> personIds) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for feedAwardPersonDisclosureStatus and IP: {}, Award Number: {}, Person ID: {}",
				clientIp, awardNumber, personIds);

		if (StringUtils.isBlank(awardNumber) || personIds.isEmpty()) {
			log.warn("Invalid award number or person ID provided.");
			return new ResponseEntity<>(
					DisclosureResponse.builder().error("Invalid award number or person ID.").build(),
					HttpStatus.BAD_REQUEST);
		}

		try {
			DisclosureResponse response = awardService.feedAwardPersonDisclosureStatus(awardNumber, personIds);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			log.error("Error fetching disclosure status for awardNumber: {}, personId: {}: {}", awardNumber, personIds,
					e.getMessage(), e);
			return new ResponseEntity<>(
					DisclosureResponse.builder().error("An internal server error occurred.").build(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/coi/disclosure/awards/{awardNumber}/validate")
	public ResponseEntity<DisclosureResponse> checkAwardDisclosureStatus(HttpServletRequest request,
			@PathVariable("awardNumber") String awardNumber) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for checkAwardDisclosureStatus and IP: {}, Award Number: {}", clientIp, awardNumber);

		if (StringUtils.isBlank(awardNumber)) {
			log.warn("Invalid award number provided.");
			return new ResponseEntity<>(DisclosureResponse.builder().error("Invalid award number.").build(),
					HttpStatus.BAD_REQUEST);
		}

		try {
			DisclosureResponse response = awardService.checkAwardDisclosureStatus(awardNumber);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (PersistenceException e) {
			log.error("Database error for awardNumber {}: {}", awardNumber, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("Database error occurred.").build(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			log.error("Error processing request for awardNumber {}: {}", awardNumber, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("An unexpected error occurred.").build(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PutMapping("/updateAwardDisclosureValidationFlag")
	public void updateAwardDisclosureValidationFlag(@RequestBody AwardDTO dto) {
		log.info("Requesting for updateAwardDisclosureValidationFlag,awardNumber:{}, disclosureValidationFlag: {}",
				dto.getProjectNumber(), dto.getDisclosureValidationFlag());
		awardService.updateAwardDisclosureValidationFlag(dto.getProjectNumber(), dto.getDisclosureValidationFlag());
	}

	@PutMapping("/updateAwardKPDisclosureRequirements")
	public void updateAwardKPDisclosureRequirements(@RequestBody AwardPersonDTO dto) {
		log.info("Requesting for updateAwardKPDisclosureRequirements, awardNumber:{}, keyPersonId:{}, projectNumbers:{}, newDisclosureRequired:{}",
				dto.getProjectNumber(), dto.getKeyPersonId(), dto.getProjectNumbers(), dto.getNewDisclosureRequired());
		awardService.updateKPDisclosureRequirements(dto);
	}

	@GetMapping("/coi/persons/{personId}/projects/sync")
	public void syncPersonProjects(@PathVariable String personId) {
		log.info("Received request to sync projects for personId: {}", personId);

		if (StringUtils.isBlank(personId)) {
			log.info("Sync aborted: personId is blank or null.");
			return;
		}

		try {
			awardService.syncPersonProjects(personId);
			log.info("Project sync triggered for personId: {}", personId);
		} catch (PersistenceException e) {
			log.error("Database error while syncing projects for personId {}: {}", personId, e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error during sync for personId {}: {}", personId, e.getMessage(), e);
		}
	}

}
