package com.polus.integration.coideclarations.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.coideclarations.services.CoiDeclarationIntegrService;
import com.polus.integration.constant.Constant;
import com.polus.integration.exception.service.MQRouterException;
import com.polus.integration.feedentity.dto.MessageQVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;

@Slf4j
@Configuration
public class CoiDeclarationsIntegrationListener {

    @Autowired
    private CoiDeclarationIntegrService integrationService;

    @Value("${fibi.messageq.queues.coiDeclaration.integration}")
    private String coiDeclarationIntegrationQueue;

    @RabbitListener(queues = "${fibi.messageq.queues.coiDeclaration.integration}")
    public void receiveMessage(Message ampqMessage) {
        String message = new String(ampqMessage.getBody());
        log.info("Message received from Coi application for coiDeclaration integration: {}", message);
        String messageId = null;
        try {
            MessageQVO qvo = new ObjectMapper().readValue(message, new TypeReference<MessageQVO>() {
            });
            messageId = qvo.getMessageId();
            log.info("Processing coiDeclarationId: {} by user: {}", qvo.getOrginalModuleItemKey(), qvo.getPublishedUserName());
            integrationService.syncCoiDeclaration(qvo.getOrginalModuleItemKey());
        } catch (JsonProcessingException e) {
            log.error("JSON parsing error while processing message from queue: {}", e.getMessage(), e);
            throw new MQRouterException(Constant.ERROR_CODE, "Invalid JSON message format", e, e.getMessage(), coiDeclarationIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, messageId);
        } catch (DataAccessException dae) {
            log.error("Database error while processing entity details: {}", dae.getMessage(), dae);
            throw new MQRouterException(Constant.ERROR_CODE, "Database access error", dae, dae.getMessage(), coiDeclarationIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, messageId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while processing message from queue: {}", e.getMessage(), e);
            throw new MQRouterException(Constant.ERROR_CODE, "Unexpected error", e, e.getMessage(), coiDeclarationIntegrationQueue, null, Constant.FIBI_DIRECT_EXCHANGE, null, null, Constant.ENTITY_COI_INTEGRATION_ACTION_TYPE, messageId);
        }
    }
}
