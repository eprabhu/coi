package com.polus.kcintegration.proposal.service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.proposal.dto.DisclosureResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@EnableAsync
@EnableRetry
@Transactional
@Service
public class ProposalKCIntegrationServiceImpl implements ProposalKCIntegrationService {

	@Autowired
    private RetryService proposalRetryService;

	@Async
	@Override
	public void feedProposal(String proposalNumber) {
		log.info("Proposal feed started for proposalNumber: {}", proposalNumber);
		CompletableFuture.runAsync(() -> {
			try {
				log.info("sleep start....");
				Thread.sleep(10000);
				log.info("sleep end....");
				// Retry the fetching and messaging if the list is null or empty
				log.info("retryFetchProposalAndSendMessage start....");
				proposalRetryService.retryFetchProposalAndSendMessage(proposalNumber);
				log.info("retryFetchProposalAndSendMessage end....");
			} catch (Exception e) {
				log.error("Error occurred in feedProposal: {}", e.getMessage());
				throw new IntegrationCustomException("Error during feedProposal: {}", e);
			}
		}).exceptionally(e -> {
	        log.error("Async operation failed: {}", e.getMessage());
	        return null;
	    });
	}

	@Async
	@Override
	public void feedPersonQuestionnaireAndCreateDisclosure(String moduleItemId, Integer questionnaireId, String personId) {
		log.info("Started async processing for feedPersonQuestionnaireAndCreateDisclosure - ModuleItemId: {}, QuestionnaireId: {}, PersonId: {}", moduleItemId, questionnaireId, personId);

		CompletableFuture.runAsync(() -> {
			try {
				log.info("Sleeping for 10 seconds before processing...");
				Thread.sleep(10000);
				log.info("Sleep completed, starting retryFetchAndSendMessage...");

				proposalRetryService.retryFetchAndSendMessage(moduleItemId, questionnaireId, personId);

				log.info("Successfully completed retryFetchAndSendMessage for ModuleItemId: {}", moduleItemId);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				log.error("Thread was interrupted during sleep: {}", e.getMessage(), e);
			} catch (Exception e) {
				log.error("Error occurred while processing feedPersonQuestionnaireAndCreateDisclosure for ModuleItemId: {}", moduleItemId, e);
				throw new IntegrationCustomException("Error during processing feedPersonQuestionnaireAndCreateDisclosure", e);
			}
		}).exceptionally(e -> {
			log.error("Async operation failed for ModuleItemId: {} - Error: {}", moduleItemId, e.getMessage(), e);
			return null;
		});

		log.info("Async processing initiated for ModuleItemId: {}", moduleItemId);
	}

	// Currently not used
	@Override
	public CompletableFuture<DisclosureResponse> feedPersonQuestionnaireAndCreateDisclosure1(String moduleItemId, Integer questionnaireId, String personId) {
		log.info("feedPersonQuestionnaireAndCreateDisclosure started for moduleItemId: {}, questionnaireId: {}, personId: {}", moduleItemId, questionnaireId, personId);

		return CompletableFuture.supplyAsync(() -> {
			try {
				log.info("Simulating delay (10 seconds)...");
				Thread.sleep(10000);
				log.info("Delay completed.");

				log.info("Calling retryFetchAndSendMessage...");
				DisclosureResponse disclosureResponse = proposalRetryService.retryFetchAndSendMessage1(moduleItemId, questionnaireId, personId);
				log.info("Completed retryFetchAndSendMessage successfully.");

				return disclosureResponse;
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				log.error("Thread interrupted in async task: {}", e.getMessage(), e);
				throw new IntegrationCustomException("Thread interrupted in async task", e);
			} catch (Exception e) {
				log.error("Exception in async processing: {}", e.getMessage(), e);
				throw new IntegrationCustomException("Error during feedPersonQuestionnaireAndCreateDisclosure", e);
			}
		}).handle((response, ex) -> {
			if (ex != null) {
				log.error("Async operation failed: {}", ex.getMessage(), ex);
				throw new CompletionException(new IntegrationCustomException("Async operation failed", ex));
			}
			return response;
		});
	}

}
