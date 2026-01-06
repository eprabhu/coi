package com.polus.kcintegration.proposal.dao;

import java.util.List;

import com.polus.kcintegration.proposal.dto.ProposalDTO;
import com.polus.kcintegration.proposal.dto.ProposalPersonDTO;
import com.polus.kcintegration.proposal.dto.QuestionnaireVO;

public interface ProposalKCIntegrationDao {


	/**
	 * This method is used to convert Object into JSON format.
	 * 
	 * @param object - request object.
	 * @return response - JSON data.
	 */
	public String convertObjectToJSON(Object object);

	/**
	 * @param proposalNumber
	 * @return
	 */
	public ProposalDTO fetchProposalByProposalNumber(String proposalNumber);

	/**
	 * @param moduleItemId
	 * @param personId 
	 * @param questionnaireId 
	 * @return
	 */
	public List<QuestionnaireVO> fetchQuestionnaireDetailsByParams(String moduleItemId, Integer questionnaireId, String personId);

	/**
	 * @param proposalNumber
	 * @return
	 */
	public List<ProposalPersonDTO> fetchProposalPersons(String proposalNumber);

}
