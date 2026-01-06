package com.polus.kcintegration.config;

import java.util.Map;
import java.util.concurrent.TimeoutException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.FixedBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.security.authentication.LockedException;

import feign.FeignException;
import jakarta.persistence.PersistenceException;

@Configuration
public class RetryConfig {

	@Bean
	RetryTemplate retryTemplate() {
		RetryTemplate retryTemplate = new RetryTemplate();

		FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
		backOffPolicy.setBackOffPeriod(60000); // 60 seconds delay
		retryTemplate.setBackOffPolicy(backOffPolicy);

		SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(3, 
				Map.of(
						PersistenceException.class, true,
						TimeoutException.class, true, 
						FeignException.class, true, 
						LockedException.class, true
				));
		retryTemplate.setRetryPolicy(retryPolicy);

		return retryTemplate;
	}

}
