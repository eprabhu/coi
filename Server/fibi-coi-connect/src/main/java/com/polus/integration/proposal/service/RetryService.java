package com.polus.integration.proposal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.polus.integration.proposal.dao.ProposalIntegrationDao;
import com.polus.integration.proposal.dto.DisclosureResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RetryService {

	@Autowired
	private ProposalIntegrationDao proposalIntegrationDao;

	@Retryable(retryFor = { NullPointerException.class }, maxAttempts = 3, backoff = @Backoff(delay = 5000))
	public DisclosureResponse retryfeedProposalPersonDisclosureId(String proposalNumber, String personId) {
		log.info("Attempting to fetch DisclosureResponse for proposalNumber: {}, personId: {}", proposalNumber, personId);

		DisclosureResponse response = proposalIntegrationDao.feedProposalPersonDisclosureId(proposalNumber, personId);

		if (response == null || response.getDisclosureId() == null) {
			log.warn("Retry attempt failed. Disclosure ID is null for proposalNumber: {}, personId: {}. Retrying...", proposalNumber, personId);
			throw new NullPointerException("Response is null for proposalNumber: " + proposalNumber + " and personId: " + personId + ". Retrying...");
		}

		log.info("Successfully retrieved DisclosureResponse after retry for proposalNumber: {}, personId: {}. Disclosure ID: {}", proposalNumber, personId, response.getDisclosureId());

		return response;
	}

}
