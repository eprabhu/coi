package com.polus.integration.config;

import java.util.HashMap;
import java.util.Map;



import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "core")
@Data
public class ConstantProperties {

    public static Map<String, String> PROPERTIES_MAP;

    private Map<String, String> constant = new HashMap<>();

    @PostConstruct
	public void init() {
		PROPERTIES_MAP = constant;
	}
}
