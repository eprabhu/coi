package com.polus.integration.instituteProposal.dao;


import java.util.List;

import org.springframework.stereotype.Service;

import com.polus.integration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposal;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposalPerson;

import jakarta.transaction.Transactional;

@Transactional
@Service
public interface InstituteProposalIntegrationDao {

	/**
	 * @param instituteProposalDTO
	 * @param moduleCode 
	 * @return
	 */
	public Boolean canUpdateProjectDisclosureFlag(InstituteProposalDTO instituteProposalDTO);

	/**
	 * @param projectNumber
	 */
	public void postIntegrationProcess(String projectNumber);

	/**
	 * @param coiIntInstituteProposal
	 */
	public void saveInstituteProposal(COIIntInstituteProposal coiIntInstituteProposal);

	/**
	 * @param proposalPerson
	 */
	public void saveInstituteProposalPerson(COIIntInstituteProposalPerson proposalPerson);

	public List<String> findProposalNumbersByKeyPersonId(String keyPersonId);

}
