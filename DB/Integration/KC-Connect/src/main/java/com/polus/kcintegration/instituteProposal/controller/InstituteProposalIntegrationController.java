package com.polus.kcintegration.instituteProposal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.polus.kcintegration.instituteProposal.service.InstituteProposalIntegrationService;
import com.polus.kcintegration.instituteProposal.vo.InstituteProposalIntegrationVO;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class InstituteProposalIntegrationController {

	@Autowired
	private InstituteProposalIntegrationService ipIntegrationService;

	@PostMapping("/feedInstituteProposal")
	public void feedInstituteProposal(@RequestBody InstituteProposalIntegrationVO vo) {
		log.info("Request for feedInstituteProposal");
		log.info("ProjectNumber :{}", vo.getProjectNumber());
		ipIntegrationService.feedInstituteProposal(vo.getProjectNumber());
	}

}
