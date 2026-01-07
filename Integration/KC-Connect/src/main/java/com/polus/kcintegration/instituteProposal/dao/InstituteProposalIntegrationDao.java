package com.polus.kcintegration.instituteProposal.dao;

import java.util.List;

import com.polus.kcintegration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.kcintegration.instituteProposal.dto.InstituteProposalPersonDTO;

public interface InstituteProposalIntegrationDao {

	/**
	 * @param proposalNumber
	 * @return
	 */
	public InstituteProposalDTO fetchProposalByProposalNumber(String proposalNumber);

	/**
	 * @param proposalNumber
	 * @return
	 */
	public List<InstituteProposalPersonDTO> fetchProposalPersons(String proposalNumber);

}
