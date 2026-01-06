package com.polus.kcintegration.security.filter;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.kcintegration.constant.Constant;
import com.polus.kcintegration.exception.error.ErrorCode;
import com.polus.kcintegration.security.pojo.UserTokens;
import com.polus.kcintegration.security.service.UserTokensService;
import com.polus.kcintegration.security.vo.AuthRequest;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class KCAuthenticationFilter extends OncePerRequestFilter {

	private final UserTokensService userTokensService;
	private final ObjectMapper objectMapper;

	public KCAuthenticationFilter(UserTokensService userTokensService) {
		this.userTokensService = userTokensService;
		this.objectMapper = new ObjectMapper();
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		try {
			AuthRequest creds = objectMapper.readValue(request.getInputStream(), AuthRequest.class);
			String userName = Optional.ofNullable(creds.getUserName())
					.orElseThrow(() -> new ResponseStatusException(ErrorCode.USERNAME_EMPTY.getStatus(),
							ErrorCode.USERNAME_EMPTY.getMessage()));

			String password = Optional.ofNullable(creds.getPassword())
					.orElseThrow(() -> new ResponseStatusException(ErrorCode.PASSWORD_EMPTY.getStatus(),
							ErrorCode.PASSWORD_EMPTY.getMessage()));

			boolean generateUserDetails = Optional.ofNullable(creds.getGenerateUserDetails()).orElse(Boolean.FALSE);

			String hashedUserName = BCrypt.hashpw(userName, Constant.STATIC_SALT);
			String salt, hashedPassword, token;

			if (generateUserDetails) {
				if (userTokensService.getUserTokensByUserName(hashedUserName) != null) {
					throw new ResponseStatusException(ErrorCode.USER_ALREADY_EXIST.getStatus(), String.format(ErrorCode.USER_ALREADY_EXIST.getMessage(), userName));
				}

				salt = BCrypt.gensalt();
				hashedPassword = BCrypt.hashpw(password, salt);

				token = userTokensService.generateToken(userName);
				String hashedToken = BCrypt.hashpw(token, salt);

				UserTokens tokens = new UserTokens(hashedUserName, hashedPassword, hashedToken, salt, creds.getPersonId());
				tokens.setUpdateTimestamp(userTokensService.getCurrentTimestamp());
				userTokensService.storeUserTokens(tokens);
			} else {
				UserTokens tokens = Optional.ofNullable(userTokensService.getUserTokensByUserName(hashedUserName))
				.orElseThrow(() -> new ResponseStatusException(ErrorCode.INVALID_USER_DETAILS.getStatus(),
						ErrorCode.INVALID_USER_DETAILS.getMessage()));

				salt = tokens.getSalt();
				hashedPassword = BCrypt.hashpw(password, salt);

				if (!hashedPassword.equals(tokens.getPassword())) {
					throw new ResponseStatusException(ErrorCode.INVALID_PASSWORD.getStatus(), ErrorCode.INVALID_PASSWORD.getMessage());
				}

				token = userTokensService.generateToken(userName);
				tokens.setAccessToken(BCrypt.hashpw(token, salt));
				tokens.setUpdateTimestamp(userTokensService.getCurrentTimestamp());
				userTokensService.storeUserTokens(tokens);
			}

			response.addHeader(Constant.HEADER_STRING, Constant.TOKEN_PREFIX + token);
			filterChain.doFilter(request, response);
		} catch (ResponseStatusException e) {
			response.setStatus(e.getStatusCode().value());
			response.getWriter().write(e.getReason());
		} catch (IOException e) {
			throw new ResponseStatusException(ErrorCode.INVALID_PAYLOAD.getStatus(), ErrorCode.INVALID_PAYLOAD.getMessage(), e);
		} catch (Exception e) {
			e.printStackTrace();
			throw new ResponseStatusException(ErrorCode.UNEXPECTED_ERROR.getStatus(), ErrorCode.UNEXPECTED_ERROR.getMessage(), e);
		}
	}

}
