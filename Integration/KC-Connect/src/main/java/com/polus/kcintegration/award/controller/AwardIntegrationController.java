package com.polus.kcintegration.award.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.polus.kcintegration.award.dto.ProjectSyncRequest;
import com.polus.kcintegration.award.service.AwardIntegrationService;
import com.polus.kcintegration.award.vo.AwardIntegrationVO;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class AwardIntegrationController {

	@Autowired
	private AwardIntegrationService awardService;

	@PostMapping("/feedAward")
	public void feedAward(@RequestBody AwardIntegrationVO vo) {
		log.info("Request for feedAward");
		log.info("ProjectNumber :{}", vo.getProjectNumber());
		awardService.feedAward(vo.getProjectNumber());
	}

	@PostMapping("/coi/persons/projects/sync")
	public void syncPersonProjects(@RequestBody ProjectSyncRequest syncRequest) {
		String personId = syncRequest.getPersonId();
		try {
			log.info("Sync request received for personId: {}", personId);
			log.info("Project Numbers: {}", syncRequest.getProjectNumbers());
			log.info("Proposal Numbers: {}", syncRequest.getProposalNumbers());

			awardService.syncPersonProjects(syncRequest);

			log.info("Sync completed for personId: {}", personId);
		} catch (Exception e) {
			log.error("Error during sync for personId {}: {}", personId, e.getMessage(), e);
		}
	}

}
