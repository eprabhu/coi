package com.polus.integration.entity.apitokenservice;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.config.APIConfig;

@Component
public class DnBAPITokenClient implements ThirdPartyApiClient {

	@Autowired
	private APIConfig apiConfig;

	@Override
	public TokenResponseDTO getNewToken() {
		try {

			String endpoint = apiConfig.getAuthToken();
			String customerKey = apiConfig.getCustomerKey();
			String customerSecret = apiConfig.getCustomerSecret();

			String auth = customerKey + ":" + customerSecret;
			String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

			HttpClient client = HttpClient.newHttpClient();
			HttpRequest request = HttpRequest.newBuilder().uri(URI.create(endpoint))
					.header("Content-Type", "application/x-www-form-urlencoded")
					.header("Authorization", "Basic " + encodedAuth).header("Cache-Control", "no-cache")
					.POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials")).build();

			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

			ObjectMapper objectMapper = new ObjectMapper();
			TokenResponseDTO tokenResponse = objectMapper.readValue(response.body(), TokenResponseDTO.class);
			System.out.println("Access Token: " + tokenResponse.getAccessToken());
			System.out.println("Response Code: " + response.statusCode());
			System.out.println("Response Body: " + response.body());
			return tokenResponse;

		} catch (Exception e) {
			e.printStackTrace();
		}
		return new TokenResponseDTO();
	}

}
