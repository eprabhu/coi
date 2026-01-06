package com.polus.integration.proposal.dao;


import org.springframework.stereotype.Service;

import com.polus.integration.proposal.dto.DisclosureResponse;
import com.polus.integration.proposal.pojo.COIIntegrationPropQuestAns;
import com.polus.integration.proposal.pojo.COIIntegrationProposal;
import com.polus.integration.proposal.pojo.COIIntegrationProposalPerson;
import com.polus.integration.proposal.questionnaire.pojo.FibiCoiQnrMapping;
import com.polus.questionnaire.dto.FetchQnrAnsHeaderDto;
import com.polus.questionnaire.dto.GetQNRDetailsDto;
import com.polus.questionnaire.dto.QuestionnaireSaveDto;

import jakarta.transaction.Transactional;

@Transactional
@Service
public interface ProposalIntegrationDao {

	/**
	 * @param questionnaireId
	 * @return
	 */
	public FibiCoiQnrMapping getQuestionnaireMappingInfo(Integer questionnaireId);

	/**
	 * @param fibiQstnId
	 * @param questionnaireId
	 * @param proposalNumber
	 * @param disclosurePersonId
	 * @return
	 */
	public String getQuestionAnswerByParams(Integer fibiQstnId, Integer questionnaireId, Integer proposalNumber, String disclosurePersonId);

	/**
	 * @param questionnaireDataBus
	 * @return
	 */
	public Integer findQuestionnaireAnsHeaderId(FetchQnrAnsHeaderDto request);

	/**
	 * @param questionnaireDataBus
	 * @return
	 */
	public GetQNRDetailsDto getQuestionnaireDetails(GetQNRDetailsDto questionnaireDataBus);

	/**
	 * @param questionnaireDataBus
	 * @return
	 */
	public QuestionnaireSaveDto saveQuestionnaireAnswers(QuestionnaireSaveDto questionnaireDataBus) throws Exception;

	/**
	 * @param questionnaireId
	 * @param personId
	 * @param proposalNumber
	 * @return
	 */
	public Boolean canCreateProjectDisclosure(Integer questionnaireId, String personId, String proposalNumber);

	/**
	 * @param COIIntegrationProposal
	 * @return
	 */
	public void saveProposal(COIIntegrationProposal coiIntegrationProposal) throws Exception;

	
	/**
	 * @param COIIntegrationProposalPerson
	 * @return
	 */
	public void saveProposalPerson(COIIntegrationProposalPerson proposalPerson) throws Exception;

	/**
	 * @param integrationPropQuestAns
	 */
	public void saveQuestionnaireAnswer(COIIntegrationPropQuestAns integrationPropQuestAns);

	/**
	 * @param questionnaireId
	 * @param personId
	 * @param moduleItemId
	 * @return
	 */
	public Boolean canMarkDisclosureAsVoid(Integer questionnaireId, String personId, String moduleItemId);	

	public DisclosureResponse feedProposalDisclosureStatus(String proposalNumber, String personId);

	public DisclosureResponse checkProposalDisclosureStatus(String proposalNumber);

	public DisclosureResponse feedDisclosureExpirationDate(String disclosureType, String personId);

	public DisclosureResponse feedProposalPersonDisclosureId(String proposalNumber, String personId);

	public DisclosureResponse fetchDeclarationStatus(String personId, String declarationTypeCode);

}
