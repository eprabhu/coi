package com.polus.integration.feedentity.listener;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.constant.Constant;
import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.feedentity.dto.MessageQVO;
import com.polus.integration.feedentity.service.EntityOutboundIntegrationService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class EntityIntegrationListener {

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private EntityOutboundIntegrationService integrationService;

	@Value("${fibi.messageq.queues.entity.integration}")
	private String entityCoiIntegrationQueue;

	@RabbitListener(queues = "${fibi.messageq.queues.entity.integration}")
	public void receiveMessage(Message ampqMessage) {
		String message = new String(ampqMessage.getBody());
		log.info("Message received from Coi application for entity COI integration: {}", message);

		try {
			MessageQVO qvo = new ObjectMapper().readValue(message, new TypeReference<MessageQVO>() {});
			log.info("Processing entityId: {} by user: {}", qvo.getOrginalModuleItemKey(), qvo.getPublishedUserName());

			integrationService.getEntityDetails(qvo.getOrginalModuleItemKey());

		} catch (JsonProcessingException e) {
			log.error("JSON parsing error while processing message from queue: {}", e.getMessage(), e);
			throw new MQRouterException(Constant.ERROR_CODE, "Invalid JSON message format", e, e.getMessage(), entityCoiIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		} catch (DataAccessException dae) {
			log.error("Database error while processing entity details: {}", dae.getMessage(), dae);
			throw new MQRouterException(Constant.ERROR_CODE, "Database access error", dae, dae.getMessage(), entityCoiIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		} catch (Exception e) {
			log.error("Unexpected error occurred while processing message from queue: {}", e.getMessage(), e);
			throw new MQRouterException(Constant.ERROR_CODE, "Unexpected error", e, e.getMessage(), entityCoiIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, integrationDao.generateUUID());
		}
	}

}
