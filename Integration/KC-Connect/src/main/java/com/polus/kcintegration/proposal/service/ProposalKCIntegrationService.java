package com.polus.kcintegration.proposal.service;

import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.proposal.dto.DisclosureResponse;


@Transactional
@Service
public interface ProposalKCIntegrationService {

	/**
	 * @param proposalNumber
	 */
	public void feedProposal(String proposalNumber);

	/**
	 * @param moduleItemId
	 * @param personId 
	 * @param questionnaireId 
	 * @return
	 */
	public void feedPersonQuestionnaireAndCreateDisclosure(String moduleItemId, Integer questionnaireId, String personId);

	/**
	 * @param moduleItemId
	 * @param personId 
	 * @param questionnaireId 
	 * @return
	 */
	public CompletableFuture<DisclosureResponse> feedPersonQuestionnaireAndCreateDisclosure1(String moduleItemId, Integer questionnaireId, String personId);

}
