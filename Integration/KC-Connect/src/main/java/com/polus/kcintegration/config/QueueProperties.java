package com.polus.kcintegration.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * This class used to read values from application.properties
 */
@Configuration
@ConfigurationProperties(prefix = "fibi.messageq")
@Data
public class QueueProperties {

    private Map<String, String> queues = new HashMap<>();
    private String exchange;
    @Value("${fibi.messageq.dlx.exchange}")
    private String dlxExchange;
    @Value("${fibi.messageq.dlx.exchange.queue}")
    private String dlxExchangeQueue;
    @Value("${fibi.messageq.dlx.exchange.queue.key}")
    private String dlxExchangeQueueKey;
    @Value("${fibi.messageq.x-queue-type}")
    private String queueType;
    @Value("${fibi.messageq.x-delivery-limit}")
    private Long deliveryLimit;
    @Value("${fibi.messageq.x-dead-letter-strategy}")
    private String deadLetterStrategy;
    @Value("${fibi.messageq.x-message-ttl}")
    private Integer messageTTL;

    @Override
    public String toString() {
        return "QueueProperties{" +
                "queues=" + queues +
                ", exchange='" + exchange + '\'' +
                ", dlxExchange='" + dlxExchange + '\'' +
                ", dlxExchangeQueue='" + dlxExchangeQueue + '\'' +
                ", dlxExchangeQueueKey='" + dlxExchangeQueueKey + '\'' +
                ", queueType='" + queueType + '\'' +
                ", deliveryLimit=" + deliveryLimit +
                ", deadLetterStrategy='" + deadLetterStrategy + '\'' +
                '}';
    }

}
