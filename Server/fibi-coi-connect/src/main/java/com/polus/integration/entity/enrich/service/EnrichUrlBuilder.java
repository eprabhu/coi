package com.polus.integration.entity.enrich.service;

import org.springframework.stereotype.Service;

import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
import com.polus.integration.entity.config.APIConfig;
import com.polus.integration.entity.enrich.dto.DnBEntityEnrichRequestDTO;

@Service
public class EnrichUrlBuilder {
	private final APIConfig apiConfig;
	private static final String DEFAULT_BLOCK_IDS = "companyinfo_L2_v1";

	public EnrichUrlBuilder(APIConfig apiConfig) {
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

	public String buildApiUrl(DnBEntityEnrichRequestDTO entityMatch) {
		String baseUrl = apiConfig.getEnrich();
		String blockIDs = DEFAULT_BLOCK_IDS;

		if (entityMatch.getDuns() == null) {
			throw new RuntimeException("D-U-N-S Number should be provided");
		}

		baseUrl = String.join("/", baseUrl, entityMatch.getDuns());

		if (entityMatch.getDatablock() != null) {
			blockIDs = String.join(",", entityMatch.getDatablock());
		}

		baseUrl = new UrlBuilder(baseUrl).addParam("blockIDs", blockIDs).build();

		return baseUrl;
	}

}
