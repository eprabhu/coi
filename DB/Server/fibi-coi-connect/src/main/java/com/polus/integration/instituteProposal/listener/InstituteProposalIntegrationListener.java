package com.polus.integration.instituteProposal.listener;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.integration.instituteProposal.service.InstituteProposalIntegrationService;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class InstituteProposalIntegrationListener {

	@Autowired
	private InstituteProposalIntegrationService integrationService;

	@Autowired
	private IntegrationDao integrationDao;

	@Value("${fibi.messageq.queues.instProposalIntegration}")
	private String instProposalIntegrationQueue;

	@RabbitListener(queues = "${fibi.messageq.queues.instProposalIntegration}")
	public void feedInstituteProposal(Message ampqMessage) {
		String response = new String(ampqMessage.getBody());
		log.info("Message received in feed institute proposal integration: {}", response);
		try {
			InstituteProposalDTO instituteProposal = new ObjectMapper().readValue(response, InstituteProposalDTO.class);
			integrationService.feedInstituteProposal(instituteProposal);
		} catch (Exception e) {
			log.error("Exception in feed institute proposal integration: {}", e.getMessage());
			throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed institute proposal integration", e, e.getMessage(),
					instProposalIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
					Constant.INST_PROPOSAL_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.INST_PROPOSAL_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

}
