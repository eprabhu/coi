package com.polus.integration.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.polus.integration.service.IntegrationService;
import com.polus.integration.dto.ProposalRequest;
import com.polus.integration.pojo.FibiCOIConnectDummy;

@RestController
public class IntegrationController {

	protected static Logger logger = LogManager.getLogger(IntegrationController.class.getName());

	@Autowired
	private IntegrationService coiIntegrationService;


    @PostMapping("/saveProposalDetails")
    public FibiCOIConnectDummy saveProposalDetails(@RequestBody ProposalRequest request) throws JsonMappingException, JsonProcessingException {
    	logger.info("Inside fibi coi connect {}");
    	return coiIntegrationService.saveOrUpdateRecievedProposalDetail(request);
    }
	
}
