package com.polus.integration.proposal.listener;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.proposal.dto.ProposalDTO;
import com.polus.integration.proposal.repository.ProposalPersonIntegrationRepository;
import com.polus.integration.proposal.service.ProposalIntegrationService;
import com.polus.integration.proposal.vo.QuestionnaireVO;

@Configuration
public class ProposalIntegrationListener {

	protected static Logger logger = LogManager.getLogger(ProposalIntegrationListener.class.getName());

	@Autowired
	private ProposalIntegrationService integrationService;

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private ProposalPersonIntegrationRepository proposalPersonIntegrationRepository;

	@Value("${fibi.messageq.queues.devProposalIntegration}")
	private String devProposalIntegrationQueue;

	@Value("${fibi.messageq.queues.devPropQuesAnsIntegration}")
	private String devPropQuesAnsIntegrationQueue;

	@RabbitListener(queues = "${fibi.messageq.queues.devProposalIntegration}")
	public void feedProposalDetails(Message ampqMessage) {
		String response = new String(ampqMessage.getBody());
		logger.info("Message received in proposal integration: {}", response);
		try {
			ProposalDTO proposalDTO = new ObjectMapper().readValue(response, ProposalDTO.class);
			integrationService.feedProposalDetails(proposalDTO);
			proposalPersonIntegrationRepository.UPD_COI_PROP_DISCLOSURE_STS(proposalDTO.getProposalNumber(), null);
		} catch (JsonProcessingException e) {
			logger.error("JSON parsing error for message in proposal integration: {}", response, e);
			throw new MQRouterException(Constant.ERROR_CODE, "Invalid JSON format", e, e.getMessage(),
					devProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
					Constant.DEV_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		} catch (Exception e) {
			logger.error("Error processing message: {}", response, e);
			throw new MQRouterException(Constant.ERROR_CODE, "Error processing message", e, e.getMessage(),
					devProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
					Constant.DEV_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

	@RabbitListener(queues = "${fibi.messageq.queues.devPropQuesAnsIntegration}")
	public void feedPersonQuestionnaireAndCreateDisclosure(Message ampqMessage) {
		String response = new String(ampqMessage.getBody());
		logger.info("Message received in feedPersonQuestionnaireAndCreateDisclosure: {}", response);
		try {
			List<QuestionnaireVO> questionnaireVOs = new ObjectMapper().readValue(response,	new TypeReference<List<QuestionnaireVO>>(){});
			integrationService.feedPersonQuestionnaireAndCreateDisclosure(questionnaireVOs);
		} catch (JsonProcessingException e) {
			logger.error("JSON parsing error for message in proposal questionnaire integration: {}", response, e);
			throw new MQRouterException(Constant.ERROR_CODE, "Invalid JSON format", e, e.getMessage(),
					devPropQuesAnsIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, Constant.DEV_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		} catch (Exception e) {
			throw new MQRouterException(Constant.ERROR_CODE, e.getMessage(), e, e.getMessage(), devPropQuesAnsIntegrationQueue,
					null, Constant.FIBI_DIRECT_EXCHANGE, Constant.DEV_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.QUESTIONNAIRE_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

}
