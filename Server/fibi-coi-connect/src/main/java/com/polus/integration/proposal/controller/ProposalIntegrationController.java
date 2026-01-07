package com.polus.integration.proposal.controller;

import java.util.concurrent.CompletableFuture;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.proposal.dto.DisclosureResponse;
import com.polus.integration.proposal.service.ProposalIntegrationService;
import com.polus.integration.proposal.vo.ProposalIntegrationVO;

import jakarta.persistence.PersistenceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;


@RestController
@Slf4j
public class ProposalIntegrationController {

	@Autowired
	private ProposalIntegrationService proposalIntegrationService;

	@PostMapping("/feedProposal")
	public void feedProposal(@RequestBody ProposalIntegrationVO vo) {
		log.info("Request for feedProposal");
		proposalIntegrationService.feedProposalDetails(vo.getProposalDTO());
	}

	@PostMapping("/createProposalDisclosure")
	public DisclosureResponse feedPersonQuestionnaireAndCreateDisclosure(@RequestBody ProposalIntegrationVO vo) {
		log.info("Request for createProposalDisclosure");
		log.info("QuestionnaireVO : {}", vo);
		return proposalIntegrationService.feedPersonQuestionnaireAndCreateDisclosure(vo.getQuestionnaireVOs());
	}	

	@GetMapping("/coi/disclosure/status/proposals/{proposalNumber}/persons/{personId}")
	public ResponseEntity<DisclosureResponse> feedProposalPersonDisclosureStatus(HttpServletRequest request,
			@PathVariable("proposalNumber") String proposalNumber, @PathVariable("personId") String personId) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for feedProposalPersonDisclosureStatus and IP: {}, Proposal Number: {}, Person ID: {}", clientIp, proposalNumber, personId);

		if (StringUtils.isBlank(proposalNumber) || StringUtils.isBlank(personId)) {
			log.warn("Invalid proposal number or person ID provided.");
			return new ResponseEntity<>(DisclosureResponse.builder().error("Invalid proposal number or person ID.").build(), HttpStatus.BAD_REQUEST);
		}

		try {
			DisclosureResponse response = proposalIntegrationService.feedProposalPersonDisclosureStatus(proposalNumber, personId);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			log.error("Error fetching disclosure status for proposalNumber: {}, personId: {}: {}", proposalNumber, personId, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("An internal server error occurred.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/coi/disclosure/proposals/{proposalNumber}/validate")
	public ResponseEntity<DisclosureResponse> checkProposalDisclosureStatus(HttpServletRequest request, @PathVariable("proposalNumber") String proposalNumber) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for checkProposalDisclosureStatus and IP: {}, Proposal Number: {}", clientIp, proposalNumber);

		if (StringUtils.isBlank(proposalNumber)) {
			log.warn("Invalid proposal number provided.");
			return new ResponseEntity<>(DisclosureResponse.builder().error("Invalid proposal number.").build(), HttpStatus.BAD_REQUEST);
		}

		try {
			DisclosureResponse response = proposalIntegrationService.checkProposalDisclosureStatus(proposalNumber);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (PersistenceException e) {
			log.error("Database error for proposalNumber {}: {}", proposalNumber, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("Database error occurred.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			log.error("Error processing request for proposalNumber {}: {}", proposalNumber, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("An unexpected error occurred.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/coi/disclosure/person/{personId}/expiration-date")
	public ResponseEntity<DisclosureResponse> feedDisclosureExpirationDate(HttpServletRequest request, @RequestParam(value = "disclosureType", required = false) String disclosureType, @PathVariable("personId") String personId) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for feedDisclosureExpirationDate and IP: {}, Disclosure Type: {}, Person ID: {}", clientIp, disclosureType, personId);

		if (StringUtils.isBlank(personId)) {
			log.warn("Invalid personId or disclosureType provided.");
			return new ResponseEntity<>(DisclosureResponse.builder().error("Invalid personId or disclosureType.").build(), HttpStatus.BAD_REQUEST);
		}

		try {
			DisclosureResponse response = proposalIntegrationService.feedDisclosureExpirationDate(disclosureType, personId);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (PersistenceException e) {
			log.error("Database error for personId {} and disclosureType {}: {}", personId, disclosureType, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("Database error occurred.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			log.error("Error processing request for personId {} and disclosureType {}: {}", personId, disclosureType, e.getMessage(), e);
			return new ResponseEntity<>(DisclosureResponse.builder().error("An unexpected error occurred.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/coi/disclosure/disclosureId/proposals/{proposalNumber}/persons/{personId}")
	public ResponseEntity<DisclosureResponse> feedProposalPersonDisclosureId(HttpServletRequest request,
			@PathVariable String proposalNumber, @PathVariable String personId) {
		String clientIp = request.getRemoteAddr();
		log.info("Request received for feedProposalPersonDisclosureId and IP: {}, Proposal Number: {}, Person ID: {}", clientIp, proposalNumber, personId);

		if (StringUtils.isBlank(proposalNumber) || StringUtils.isBlank(personId)) {
			log.warn("Request rejected due to missing or empty proposalNumber or personId. IP: {}", clientIp);
			return new ResponseEntity<>(DisclosureResponse.builder().error("Invalid proposal number or person ID.").build(), HttpStatus.BAD_REQUEST);
		}

		try {
			log.info("Processing feedProposalPersonDisclosureId for Proposal Number: {}, Person ID: {}", proposalNumber, personId);

			CompletableFuture<DisclosureResponse> futureResponse = proposalIntegrationService.feedProposalPersonDisclosureId(proposalNumber, personId);

			DisclosureResponse response = futureResponse.get();

			if (response == null) {
				log.warn("Received null response from async processing. Returning error response.");
				return ResponseEntity.status(HttpStatus.OK).body(DisclosureResponse.builder().message("Failed to process request. No response received.").build());
			}

			log.info("Successfully processed feedProposalPersonDisclosureId. Proposal Number: {}, Person ID: {}, Disclosure ID: {}",  proposalNumber, personId, response != null ? response.getDisclosureId() : "NULL");

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("Error while processing feedProposalPersonDisclosureId. Proposal Number: {}, Person ID: {}, Exception: {}", proposalNumber, personId, e.getMessage(), e);

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(DisclosureResponse.builder().error("An internal server error occurred. Please try again later.").build());
		}
	}

	@GetMapping("/coi/declaration/status/{personId}/{declarationType}")
	public ResponseEntity<DisclosureResponse> getDeclarationStatus(HttpServletRequest request, @PathVariable("personId") String personId, @PathVariable("declarationType") String declarationType) {

		String clientIp = request.getRemoteAddr();
		log.info("Received request to fetch declaration status. IP: {}, Person ID: {}, Declaration Type: {}", clientIp, personId, declarationType);

		if (StringUtils.isBlank(personId) || StringUtils.isBlank(declarationType)) {
			log.warn("Missing required input - personId: '{}' or declarationType: '{}'", personId, declarationType);
			return ResponseEntity.badRequest().body(DisclosureResponse.builder().error("Invalid personId or declarationType.").build());
		}

		try {
			DisclosureResponse response = proposalIntegrationService.getDeclarationStatus(personId, declarationType);
			log.info("Successfully fetched declaration status for Person ID: {}, Declaration Type: {}", personId, declarationType);
			return ResponseEntity.ok(response);
		} catch (PersistenceException e) {
			log.error("Database error while fetching declaration status for Person ID: {}, Declaration Type: {} - {}",
					personId, declarationType, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(DisclosureResponse.builder().error("Database error occurred.").build());
		} catch (Exception e) {
			log.error(
					"Unexpected error occurred while fetching declaration status for Person ID: {}, Declaration Type: {} - {}",
					personId, declarationType, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(DisclosureResponse.builder().error("An unexpected error occurred.").build());
		}
	}

}
