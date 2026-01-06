package com.polus.fibicomp.config;

import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.AuditorAware;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

@Import({ FibiRepoConfig.class })
@Configuration
public class FibiPropConfig {

	@Bean
	public PropertyPlaceholderConfigurer getPropertyPlaceholderConfigurer() {
		PropertyPlaceholderConfigurer placeHolderConfig = new PropertyPlaceholderConfigurer();
		placeHolderConfig.setLocation(new ClassPathResource("application.properties"));
		placeHolderConfig.setIgnoreUnresolvablePlaceholders(true);
		return placeHolderConfig;
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

	@Bean
	public ObjectWriter objectWriter(ObjectMapper objectMapper) {
		return objectMapper.writerWithDefaultPrettyPrinter();
	}

	@Bean("auditorProvider")
    public AuditorAware<String> auditorProvider() {
        return new FibiAuditorAwareImpl();
    }
}
