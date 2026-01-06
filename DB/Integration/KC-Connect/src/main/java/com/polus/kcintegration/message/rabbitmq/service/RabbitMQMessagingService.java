package com.polus.kcintegration.message.rabbitmq.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.polus.kcintegration.message.service.MessagingService;

@Service
public class RabbitMQMessagingService implements MessagingService {

	private final RabbitTemplate rabbitTemplate;

	public RabbitMQMessagingService(RabbitTemplate rabbitTemplate) {
		this.rabbitTemplate = rabbitTemplate;
	}

	@Override
	public void sendMessage(String destination, String message, Object object) {
		rabbitTemplate.convertAndSend(destination, message, object);
	}

}
