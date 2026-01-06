package com.polus.integration.entity.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class APIConfig {
			
		@Value("${entity.dnb.api.url.authToken}")
		private String authToken;
		
		@Value("${entity.dnb.api.auth.customerKey}")
		private String customerKey;
		
		@Value("${entity.dnb.api.auth.customerSecret}")
		private String customerSecret;
		
		@Value("${entity.dnb.api.url.cleansematch}")
		private String cleansematch;
		
		@Value("${entity.dnb.api.url.referenceData}")
		private String referenceData;
		
		@Value("${entity.dnb.api.url.enrich}")
		private String enrich;
		
		@Value("${entity.dnb.api.url.criteriasearch}")
		private String criteriasearch;

		@Value("${entity.dnb.api.url.dunsMonRegistration}")
		private String dunsMonRegistration;

}
