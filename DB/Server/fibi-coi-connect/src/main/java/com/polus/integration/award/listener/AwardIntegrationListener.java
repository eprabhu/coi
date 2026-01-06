package com.polus.integration.award.listener;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.award.dto.AwardDTO;
import com.polus.integration.award.service.AwardIntegrationService;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.dto.MessageQueueDto;
import com.polus.integration.exception.service.MQRouterException;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class AwardIntegrationListener {

	@Autowired
	private AwardIntegrationService integrationService;

	@Autowired
	private IntegrationDao integrationDao;

	@Value("${fibi.messageq.queues.awardIntegration}")
	private String awardIntegrationQueue;

	@Value("${fibi.messageq.queues.awardIntegration.notify}")
	private String awardNotifyQueue;

	@RabbitListener(queues = "${fibi.messageq.queues.awardIntegration}")
	public void feedAward(Message ampqMessage) {
		String response = new String(ampqMessage.getBody());
		log.info("Message received in feed award integration: {}", response);
		try {
			AwardDTO award = new ObjectMapper().readValue(response, AwardDTO.class);
			ResponseEntity<AwardDTO> awardDto = integrationService.feedAward(award);
			log.info("calling updateAwardDisclosureStatus, child: {}", award.getProjectNumber());
			if (awardDto != null && awardDto.getBody() != null
					&& Boolean.TRUE.equals(awardDto.getBody().getNewChildAwardFeed())) {
				integrationService.updateAwardDisclosureStatus(award.getProjectNumber(), Constant.YES);
			} else if (awardDto.getBody().getNewPersonIds() != null
					&& !awardDto.getBody().getNewPersonIds().isEmpty()) {
				integrationService.updateAwardDisclosureStatus(award.getProjectNumber(), Constant.NO, awardDto.getBody().getNewPersonIds());
			} else if(awardDto.getBody().getInactivePersonIds() != null
					&& !awardDto.getBody().getInactivePersonIds().isEmpty()) {
				integrationService.updateAwardDisclosureStatus(award.getProjectNumber(), Constant.NO);
			}
		} catch (Exception e) {
			log.error("Exception in feed award integration: {}", response);
			throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed award integration", e, e.getMessage(),
					awardIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
					Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

	@RabbitListener(queues = "${fibi.messageq.queues.awardIntegration.notify}")
	public void notifyUserForDisclosureCreation(Message ampqMessage) {
		String message = null;
		MessageProperties messageProperties = ampqMessage.getMessageProperties();
		try {
            message = new String(ampqMessage.getBody());
            log.info("message : {}", message);
            MessageQueueDto messageQueueDto = new ObjectMapper().readValue(message, MessageQueueDto.class);
            messageQueueDto.setSourceExchange(messageProperties.getReceivedExchange());
            messageQueueDto.setSourceQueueName(messageProperties.getConsumerQueue());
            messageQueueDto.setJsonMessage(message);
            messageQueueDto.setMessageId(messageProperties.getMessageId());
            String actionType = messageQueueDto.getActionType();
            log.info("actionType : {}", actionType);
            AwardDTO awardDTO = new AwardDTO();
            awardDTO.setProjectId(String.valueOf(messageQueueDto.getOrginalModuleItemKey()));
            awardDTO.setProjectNumber(String.valueOf(messageQueueDto.getSubModuleItemKey()));
            Thread.sleep(5000);
            integrationService.notifyUserForDisclosureCreation(awardDTO);
		} catch (Exception e) {
			log.error("Exception in notifyUserForDisclosureCreation: {}", message);
			throw new MQRouterException(Constant.ERROR_CODE, "Exception in feed award integration", e, e.getMessage(),
					awardNotifyQueue, null, Constant.FIBI_DIRECT_EXCHANGE,
					Constant.AWARD_MODULE_CODE, Constant.SUB_MODULE_CODE,
					Constant.AWARD_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

}
