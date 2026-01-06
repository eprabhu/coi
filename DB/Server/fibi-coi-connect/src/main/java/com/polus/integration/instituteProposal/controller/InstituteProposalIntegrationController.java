package com.polus.integration.instituteProposal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.instituteProposal.service.InstituteProposalIntegrationService;
import com.polus.integration.instituteProposal.vo.InstituteProposalIntegrationVO;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class InstituteProposalIntegrationController {

	@Autowired
	private InstituteProposalIntegrationService ipIntegrationService;

	@PostMapping("/feedInstituteProposal")
	public ResponseEntity<Object> feedInstituteProposal(@RequestBody InstituteProposalIntegrationVO vo) {
		log.info("Request for feedInstituteProposal");
		return ipIntegrationService.feedInstituteProposal(vo.getInstituteProposal());
	}

}
