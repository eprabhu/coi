package com.polus.integration.dnb.referencedata.service;

import org.springframework.stereotype.Service;

import com.polus.integration.entity.config.APIConfig;

@Service
public class ReferenceDataUrlBuilder {
	private final APIConfig apiConfig;

	public ReferenceDataUrlBuilder(APIConfig apiConfig) {
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

	public String buildApiUrl(String categoryId) {
		String baseUrl = apiConfig.getReferenceData();
		return new UrlBuilder(baseUrl).addParam("id", categoryId).build();

	}

}
