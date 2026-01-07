package com.polus.integration.messageq.vo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "fibi.messageq")
public class MessagingQueueProperties {

	private Map<String, String> queues = new HashMap<>();

	public Map<String, String> getQueues() {
		return queues;
	}

	public void setQueues(Map<String, String> queues) {
		this.queues = queues;
	}
}
