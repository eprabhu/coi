package com.polus.kcintegration.instituteProposal.service;


import java.util.concurrent.CompletableFuture;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Transactional
@Service
public interface InstituteProposalIntegrationService {

	/**
	 * @param projectNumber
	 */
	public CompletableFuture<ResponseEntity<String>> feedInstituteProposal(String projectNumber);

}
