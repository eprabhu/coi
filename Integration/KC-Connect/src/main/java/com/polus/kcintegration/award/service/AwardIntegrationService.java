package com.polus.kcintegration.award.service;

import java.util.concurrent.CompletableFuture;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.polus.kcintegration.award.dto.ProjectSyncRequest;


@Transactional
@Service
public interface AwardIntegrationService {

	/**
	 * @param projectNumber
	 */
	public CompletableFuture<ResponseEntity<String>> feedAward(String projectNumber);

	public void syncPersonProjects(ProjectSyncRequest syncRequest);

}
