package com.polus.integration.feedentity.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.polus.integration.constant.Constant;
import com.polus.integration.pojo.UserTokens;
import com.polus.integration.repository.UserTokensRepository;

import feign.Request;
import feign.RequestInterceptor;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class FeignClientConfig {

	@Autowired
	private UserTokensRepository userTokensRepository;

	@Value("${kc.integration.user.name}")
	private String userName;

	@Bean
	Request.Options options() {
		// Set connect timeout to 300 seconds and read timeout to 300 seconds
		return new Request.Options(Duration.ofMillis(300000), Duration.ofMillis(300000), Boolean.TRUE);
	}

	@Bean
	RequestInterceptor requestInterceptor() {
		return requestTemplate -> {
			log.info("Fetching token for user: {}", userName);
			UserTokens token = userTokensRepository.findByUserName(userName);
			if (token == null || !validateToken(token.getAccessToken())) {
				log.error("Invalid or missing token for user: {}", userName);
				throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token.");
			}
			requestTemplate.header(Constant.HEADER_STRING, Constant.TOKEN_PREFIX + token.getAccessToken());
		};
	}

	private boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(Constant.SECRET.getBytes())).build().parseClaimsJws(authToken);
			return true;
		} catch (Exception ex) {
			return false;
		}
	}

}
