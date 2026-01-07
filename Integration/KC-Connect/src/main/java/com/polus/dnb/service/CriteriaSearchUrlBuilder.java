package com.polus.dnb.service;

import org.springframework.stereotype.Service;

import com.polus.dnb.config.APIConfig;
import com.polus.dnb.dto.DnBEntityCriteriaSearchRequestDTO;

@Service
public class CriteriaSearchUrlBuilder {
	private final APIConfig apiConfig;

	public CriteriaSearchUrlBuilder(APIConfig apiConfig) {
		this.apiConfig = apiConfig;
	}

	public static class UrlBuilder {
		private final StringBuilder urlBuilder;
		private boolean hasParams = false;

		public UrlBuilder(String baseUrl) {
			this.urlBuilder = new StringBuilder(baseUrl);
		}

		public UrlBuilder addParam(String key, String value) {
			if (value != null && !value.isEmpty()) {
				if (hasParams) {
					urlBuilder.append("&");
				} else {
					urlBuilder.append("?");
					hasParams = true;
				}
				urlBuilder.append(key).append("=").append(value);
			}
			return this;
		}

		public String build() {
			return urlBuilder.toString();
		}
	}

	public String buildApiUrl(DnBEntityCriteriaSearchRequestDTO entityMatch) {
		String baseUrl = apiConfig.getCriteriasearch();
		return new UrlBuilder(baseUrl).build();

	}

	public String buildApiUrl() {
		return apiConfig.getCriteriasearch();

	}

}
