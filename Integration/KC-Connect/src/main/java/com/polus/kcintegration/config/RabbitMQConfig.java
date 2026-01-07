package com.polus.kcintegration.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * RabbitMQ specific configurations
 * @author ajin.vs
 * @since 28/02/2024
 * If a change is done here make sure that
 * the change is also changed on RabbitMQConfigUtil class also
 */
//@Configuration
//@EnableRabbit
//@ConditionalOnProperty(name = "qrouter.messaging.service", havingValue = "RMQ")
//@ConditionalOnBean(ConnectionFactory.class) // This bean will be created only if the ConnectionFactory exists
public class RabbitMQConfig {

    private static final Logger LOGGER = LogManager.getLogger(RabbitMQConfig.class.getName());

    @Autowired
    private QueueProperties queueProperties;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // This is necessary if @ConditionalOnBean(ConnectionFactory.class) is uncommented
//    @Bean
//    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
//        // RabbitTemplate bean configuration
//        return new RabbitTemplate(connectionFactory);
//    }

    @Bean
    DirectExchange dlxExchange() {
        return new DirectExchange(queueProperties.getDlxExchange());
    }

    @Bean
    public Queue dlxExchangeQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-queue-type", queueProperties.getQueueType());
        return new Queue(queueProperties.getDlxExchangeQueue(), true, false, false, args);
    }

    /**
     * a dlx queue is bind to a dlx
     * @param dlxExchangeQueue
     * @param dlxExchange
     * @return
     */
    @Bean
    public Binding dlxQueueBinding(Queue dlxExchangeQueue, DirectExchange dlxExchange) {
        return BindingBuilder.bind(dlxExchangeQueue).to(dlxExchange).with(queueProperties.getDlxExchangeQueueKey());
    }

    /**
     * Declaring an exchange and bind it to an exchange
     * @return
     */
    @Bean
    public RabbitAdmin rabbitAdmin() {
        LOGGER.info( "Initializing Queues if not exists. Properties : {}", queueProperties.toString());
        RabbitAdmin rabbitAdmin = new RabbitAdmin(rabbitTemplate.getConnectionFactory());
        DirectExchange directExchange = directExchange(rabbitAdmin);
        queueProperties.getQueues().forEach((key, value) -> {
            Binding binding = BindingBuilder.bind(declareQueue(rabbitAdmin, value)).to(directExchange).with(value);
            rabbitAdmin.declareBinding(binding);
        });
        return rabbitAdmin;
    }

    /**
     * Declaring a direct exchange
     * @param rabbitAdmin
     * @return
     */
    DirectExchange directExchange(RabbitAdmin rabbitAdmin) {
        DirectExchange directExchange = new DirectExchange(queueProperties.getExchange());
        rabbitAdmin.declareExchange(directExchange);
        return directExchange;
    }

    /**
     * Declaring a queue
     * @param rabbitAdmin
     * @param queueName
     * @return
     */
    private Queue declareQueue(RabbitAdmin rabbitAdmin, String queueName) {
        Map<String, Object> args = new HashMap<>();
        args.put("x-queue-type", queueProperties.getQueueType());
        args.put("x-delivery-limit", queueProperties.getDeliveryLimit());
        args.put("x-dead-letter-exchange", queueProperties.getDlxExchange());
        args.put("x-dead-letter-strategy", queueProperties.getDeadLetterStrategy());
        args.put("x-dead-letter-routing-key", queueProperties.getDlxExchangeQueueKey());
        args.put("x-message-ttl", queueProperties.getMessageTTL());
        Queue queue = new Queue(queueName, true, false, false, args);
        rabbitAdmin.declareQueue(queue);
        return queue;
    }
}
