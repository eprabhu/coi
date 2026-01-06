package com.polus.integration.messageq.service;

import java.util.UUID;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.exception.dao.MQExceptionLogRepository;
import com.polus.integration.exception.pojo.MQExceptionsLog;
import com.polus.integration.feedentity.dto.MessageQVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RMQMessagingQueueService {

	@Autowired
	private RabbitTemplate template;

	@Autowired
	private IntegrationDao integrationDao;

	@Autowired
	private MQExceptionLogRepository mqExceptionLogRepository;

	public void publishMessageToQueue(MessageQVO messageQVO) {
		log.info("Requesting for publishMessageToQueue .... ");
		try {
			String messageId = UUID.randomUUID().toString();
			messageQVO.setMessageId(messageId);
			String messageDetails = integrationDao.convertObjectToJSON(messageQVO);
			messageQVO.setJsonMessage(messageDetails);
			log.info(
					"Requesting for publishMessageToQueue --- exchange : {}, queueName : {} and messageDetails : {}",
					messageQVO.getSourceExchange(), messageQVO.getSourceQueueName(), messageDetails);
			MessageProperties properties = new MessageProperties();
			properties.setMessageId(messageId);
			properties.setHeader("moduleCode", messageQVO.getModuleCode());
			properties.setHeader("subModuleCode", messageQVO.getSubModuleCode());
			properties.setHeader("actionType", messageQVO.getActionType());

			publishQueue(messageQVO.getSourceExchange(), messageQVO.getSourceQueueName(), messageDetails, properties);

			log.info("Successfully Sent .... ");
		} catch (Exception e) {
			handleException(e, messageQVO);
		}
	}

	@Async
	private void publishQueue(String exchange, String queueName, String messageDetails, MessageProperties properties) {
		template.convertAndSend(exchange, queueName, new Message(messageDetails.getBytes(), properties));
	}

	private void handleException(Exception e, MessageQVO messageQVO) {
		log.error("Error occurred in {} to publish message: {}", messageQVO.getSourceQueueName(), e.getMessage());
		MQExceptionsLog exceptionsLog = new MQExceptionsLog();
		exceptionsLog.setActionType(messageQVO.getActionType());
		exceptionsLog.setModuleCode(messageQVO.getModuleCode());
		exceptionsLog.setSubModuleCode(messageQVO.getSubModuleCode());
		exceptionsLog.setMessageId(messageQVO.getMessageId());
		exceptionsLog.setTriggerType(messageQVO.getTriggerType());
		exceptionsLog.setEventType(messageQVO.getEventType());
		exceptionsLog.setErrorCode("ER004"); // TODO
		exceptionsLog.setErrorMessage(e.getMessage());
		exceptionsLog.setStackTrace(ExceptionUtils.getStackTrace(e));
		exceptionsLog.setQueueMessage(messageQVO.getJsonMessage());
		exceptionsLog.setSourceQueueName(messageQVO.getSourceQueueName());
		exceptionsLog.setQueueExchange(messageQVO.getSourceExchange());
		exceptionsLog.setUpdateUser("SYSTEM");
		exceptionsLog.setUpdateTimestamp(integrationDao.getCurrentTimestamp());
		mqExceptionLogRepository.save(exceptionsLog);
	}

}
