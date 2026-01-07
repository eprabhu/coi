package com.polus.integration.security;

import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

import com.polus.integration.constant.Constant;
import com.polus.integration.pojo.UserTokens;
import com.polus.integration.security.service.UserTokensService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ConnectAuthenticationFilter extends OncePerRequestFilter {

	private final UserTokensService userTokensService;

	private String userName;

	public ConnectAuthenticationFilter(UserTokensService userTokensService, String userName) {
		this.userTokensService = userTokensService;
		this.userName = userName;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			UserTokens token = userTokensService.getUserTokensByUserName(userName);

			if (token == null || token.getAccessToken() == null) {
				log.error("No access token found for user: {}", userName);
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Token not found");
				return;
			}

			response.addHeader(Constant.HEADER_STRING, Constant.TOKEN_PREFIX + token.getAccessToken());
			filterChain.doFilter(request, response);
		} catch (Exception e) {
			log.error("An error occurred in ConnectAuthenticationFilter", e);
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An internal server error occurred");
		}
	}

}
