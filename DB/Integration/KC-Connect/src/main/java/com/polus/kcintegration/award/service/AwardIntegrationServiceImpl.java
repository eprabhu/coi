package com.polus.kcintegration.award.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.award.dao.AwardIntegrationDao;
import com.polus.kcintegration.award.dto.ProjectSyncRequest;
import com.polus.kcintegration.instituteProposal.service.InstituteProposalIntegrationService;
import com.polus.kcintegration.proposal.service.RetryService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@EnableAsync
@EnableRetry
@Transactional
@Service
public class AwardIntegrationServiceImpl implements AwardIntegrationService {

	@Autowired
    private RetryService proposalRetryService;

	@Autowired
	private AwardIntegrationDao awardIntegrationDao;

	@Autowired
	private InstituteProposalIntegrationService ipIntegrationService;

	@Async
	@Override
	public CompletableFuture<ResponseEntity<String>> feedAward(String projectNumber) {
		log.info("Award feed started for projectNumber: {}", projectNumber);
		return CompletableFuture.supplyAsync(() -> {
			try {
				log.info("sleep start....");
				Thread.sleep(10000);
				log.info("sleep end....");
				// Retry the fetching and messaging if the list is null or empty
				log.info("retryFetchAwardAndSendMessage start....");
				proposalRetryService.retryFetchAwardAndSendMessage(projectNumber);
				log.info("retryFetchAwardAndSendMessage end....");
				return new ResponseEntity<>("Message successfully sent to queue", HttpStatus.OK);
			} catch (Exception e) {
				log.error("Error occurred in feedAward: {}", e.getMessage());
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during feedInstituteProposal: " + e.getMessage());
			}
		}).exceptionally(e -> {
	        log.error("Async operation failed: {}", e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Async operation failed: {}" + e.getMessage());
	    });
	}

	@Override
	public void syncPersonProjects(ProjectSyncRequest syncRequest) {
		String personId = syncRequest.getPersonId();
		ProjectSyncRequest latestData = awardIntegrationDao.syncPersonProjects(personId);

		List<String> requestProjectNumbers = Optional.ofNullable(syncRequest.getProjectNumbers()).orElse(Collections.emptyList());
		List<String> requestProposalNumbers = Optional.ofNullable(syncRequest.getProposalNumbers()).orElse(Collections.emptyList());

		List<String> latestProjectNumbers = Optional.ofNullable(latestData.getProjectNumbers()).orElse(Collections.emptyList());
		List<String> latestProposalNumbers = Optional.ofNullable(latestData.getProposalNumbers()).orElse(Collections.emptyList());

		Set<String> requestProjectSet = new HashSet<>(requestProjectNumbers);
		Set<String> requestProposalSet = new HashSet<>(requestProposalNumbers);

		List<String> newProjectNumbers = latestProjectNumbers.stream().filter(projectNum -> !requestProjectSet.contains(projectNum)).collect(Collectors.toList());
		List<String> newProposalNumbers = latestProposalNumbers.stream().filter(proposalNum -> !requestProposalSet.contains(proposalNum)).collect(Collectors.toList());

		log.info("Project sync summary for personId: {}", personId);
		log.info("Existing project numbers: {}", requestProjectNumbers);
		log.info("Latest project numbers from source: {}", latestProjectNumbers);
		log.info("New project numbers to sync ({}): {}", newProjectNumbers.size(), newProjectNumbers);

		log.info("Existing proposal numbers: {}", requestProposalNumbers);
		log.info("Latest proposal numbers from source: {}", latestProposalNumbers);
		log.info("New proposal numbers to sync ({}): {}", newProposalNumbers.size(), newProposalNumbers);

		if (!newProjectNumbers.isEmpty()) {
			for (String projectNumber : newProjectNumbers) {
				try {
					log.info("Feeding new award project: {}", projectNumber);
					feedAward(projectNumber);
				} catch (Exception e) {
					log.error("Failed to feed award for projectNumber {}: {}", projectNumber, e.getMessage(), e);
				}
			}
		} else {
			log.info("No new project data to sync for personId: {}", personId);
		}

		if (!newProposalNumbers.isEmpty()) {
			for (String proposalNumber : newProposalNumbers) {
				try {
					log.info("Feeding new proposal: {}", proposalNumber);
					ipIntegrationService.feedInstituteProposal(proposalNumber);
				} catch (Exception e) {
					log.error("Failed to feed proposal for proposalNumber {}: {}", proposalNumber, e.getMessage(), e);
				}
			}
		} else {
			log.info("No new proposal data to sync for personId: {}", personId);
		}
	}

}
