package com.polus.integration.instituteProposal.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.integration.instituteProposal.dto.InstituteProposalDTO;


@Service
public interface InstituteProposalIntegrationService {


	/**
	 * @param instituteProposal
	 */
	public ResponseEntity<Object> feedInstituteProposal(InstituteProposalDTO instituteProposal);

}
