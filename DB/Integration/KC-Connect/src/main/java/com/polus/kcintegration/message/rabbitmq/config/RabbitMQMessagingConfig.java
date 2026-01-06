package com.polus.kcintegration.message.rabbitmq.config;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.polus.kcintegration.message.rabbitmq.service.RabbitMQMessagingService;
import com.polus.kcintegration.message.service.MessagingService;

@Configuration
@Profile("rabbitmq")
public class RabbitMQMessagingConfig {

	@Bean
	MessagingService messagingService(RabbitTemplate rabbitTemplate) {
		return new RabbitMQMessagingService(rabbitTemplate);
	}

}
