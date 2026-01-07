package com.polus.integration.entity.cleansematch.service;

import org.springframework.stereotype.Service;

import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
import com.polus.integration.entity.config.APIConfig;

@Service
public class CleanseMatchUrlBuilder {
	private final APIConfig apiConfig;

	public CleanseMatchUrlBuilder(APIConfig apiConfig) {
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

	public String buildApiUrl(DnBEntityCleanseMatchRequestDTO entityMatch) {
		String baseUrl = apiConfig.getCleansematch();
		return new UrlBuilder(baseUrl)
				.addParam("duns", entityMatch.getSourceDunsNumber())
				.addParam("name", entityMatch.getSourceDataName())
				.addParam("countryISOAlpha2Code", entityMatch.getCountryCode())
				.addParam("streetAddressLine1", entityMatch.getAddressLine1())
				.addParam("addressLocality", entityMatch.getAddressLine2())
				.addParam("addressRegion", entityMatch.getState())
				.addParam("email", entityMatch.getEmailAddress())
				.addParam("postalCode", entityMatch.getPostalCode()).build();

	}

	public String buildApiUrl(DnBEntityCleanseMatchRequestDTO entityMatch,
							  String[] matchParams) {
		String baseUrl = apiConfig.getCleansematch();
		UrlBuilder urlBuilder = new UrlBuilder(baseUrl);

		for (String param : matchParams) {
			switch (param.trim().toLowerCase()) {
				case "duns":
					urlBuilder.addParam("duns", entityMatch.getSourceDunsNumber());
					break;
				case "name":
					urlBuilder.addParam("name", entityMatch.getSourceDataName());
					break;
				case "countryisoalpha2code":
					urlBuilder.addParam("countryISOAlpha2Code", entityMatch.getCountryCode());
					break;
				case "streetaddressline1":
					urlBuilder.addParam("streetAddressLine1", entityMatch.getAddressLine1());
					break;
				case "addresslocality":
					urlBuilder.addParam("addressLocality", entityMatch.getAddressLine2());
					break;
				case "addressregion":
					urlBuilder.addParam("addressRegion", entityMatch.getState());
					break;
				case "email":
					urlBuilder.addParam("email", entityMatch.getEmailAddress());
					break;
				case "postalcode":
					urlBuilder.addParam("postalCode", entityMatch.getPostalCode());
					break;
				default:
					break;
			}
		}

		return urlBuilder.build();

	}


}
