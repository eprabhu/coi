package com.polus.kcintegration.instituteProposal.service;

import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.proposal.service.RetryService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@EnableAsync
@EnableRetry
@Transactional
@Service
public class InstituteProposalIntegrationServiceImpl implements InstituteProposalIntegrationService {

	@Autowired
    private RetryService proposalRetryService;

	@Async
	@Override
	public CompletableFuture<ResponseEntity<String>> feedInstituteProposal(String proposalNumber) {
	    log.info("Institute Proposal feed started for proposalNumber: {}", proposalNumber);
	    return CompletableFuture.supplyAsync(() -> {
	        try {
	            log.info("sleep start....");
	            Thread.sleep(10000);
	            log.info("sleep end....");
	            log.info("retryFetchIPAndSendMessage start....");
	            proposalRetryService.retryFetchIPAndSendMessage(proposalNumber);
	            log.info("retryFetchIPAndSendMessage end....");
	            return new ResponseEntity<>("Message successfully sent to queue", HttpStatus.OK);
	        } catch (Exception e) {
	            log.error("Error occurred in feedInstituteProposal: {}", e.getMessage());
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                                 .body("Error during feedInstituteProposal: " + e.getMessage());
	        }
	    }).exceptionally(e -> {
	        log.error("Async operation failed: {}", e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("Async operation failed: " + e.getMessage());
	    });
	}

}
