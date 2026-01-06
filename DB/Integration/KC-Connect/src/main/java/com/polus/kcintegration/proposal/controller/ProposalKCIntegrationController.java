package com.polus.kcintegration.proposal.controller;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.polus.kcintegration.proposal.dto.DisclosureResponse;
import com.polus.kcintegration.proposal.service.ProposalKCIntegrationService;
import com.polus.kcintegration.proposal.vo.ProposalKCIntegrationVO;
import com.polus.kcintegration.proposal.vo.QuestionnaireVO;

@RestController
public class ProposalKCIntegrationController {

	protected static Logger logger = LogManager.getLogger(ProposalKCIntegrationController.class.getName());

	@Autowired
	private ProposalKCIntegrationService proposalIntegrationService;

	@PostMapping("/feedProposal")
	public void feedProposal(@RequestBody ProposalKCIntegrationVO vo) {
		logger.info("Request for feedProposal");
		logger.info("ProposalNumber :{}", vo.getProposalNumber());
		proposalIntegrationService.feedProposal(vo.getProposalNumber());
	}

	@PostMapping("/createProposalDisclosure")
	public void createProposalDisclosure(@RequestBody QuestionnaireVO vo) {
		logger.info("Received request to createProposalDisclosure for ProposalNumber: {}, QuestionnaireId: {}, PersonId: {}", vo.getProposalNumber(), vo.getQuestionnaireId(), vo.getPersonId());

		try {
			proposalIntegrationService.feedPersonQuestionnaireAndCreateDisclosure(vo.getProposalNumber(), vo.getQuestionnaireId(), vo.getPersonId());

			logger.info("Successfully processed createProposalDisclosure for ProposalNumber: {}", vo.getProposalNumber());
//			return ResponseEntity.ok("Proposal Disclosure created successfully.");

		} catch (IllegalArgumentException e) {
			logger.error("Invalid input received for createProposalDisclosure: {}", vo, e);
//			return ResponseEntity.badRequest().body("Invalid input: " + e.getMessage());

		} catch (Exception e) {
			logger.error("Error occurred while processing createProposalDisclosure for ProposalNumber: {}", vo.getProposalNumber(), e);
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error. Please try again later.");
		}
	}

	@PostMapping("/createProposalDisclosure1")
	public DisclosureResponse createProposalDisclosure1(@RequestBody QuestionnaireVO vo) {
		logger.info("Received request for createProposalDisclosure with QuestionnaireVO: {}", vo);

		try {
			return proposalIntegrationService.feedPersonQuestionnaireAndCreateDisclosure1(vo.getProposalNumber(), vo.getQuestionnaireId(), vo.getPersonId()).get(30, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			logger.error("Thread interrupted while processing request: {}", e.getMessage());
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Request processing interrupted", e);
		} catch (ExecutionException e) {
			logger.error("Execution exception in async processing: {}", e.getCause().getMessage());
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing request", e.getCause());
		} catch (TimeoutException e) {
			logger.error("Request timed out after 15 seconds: {}", e.getMessage());
			throw new ResponseStatusException(HttpStatus.REQUEST_TIMEOUT, "Request took too long to process", e);
		}
	}

}
