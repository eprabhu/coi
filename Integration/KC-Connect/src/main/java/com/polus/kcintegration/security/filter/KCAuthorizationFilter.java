package com.polus.kcintegration.security.filter;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import com.polus.kcintegration.constant.Constant;
import com.polus.kcintegration.exception.error.ErrorCode;
import com.polus.kcintegration.security.pojo.UserTokens;
import com.polus.kcintegration.security.service.UserTokensService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class KCAuthorizationFilter extends OncePerRequestFilter {

	private final UserTokensService userTokensService;

	public KCAuthorizationFilter(UserTokensService userTokensService) {
		this.userTokensService = userTokensService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
		try {
			String authToken = userTokensService.getJwtFromRequest(req);
			if (authToken == null || authToken.isEmpty()) {
				throw new ResponseStatusException(ErrorCode.TOKEN_MISSING.getStatus(), ErrorCode.TOKEN_MISSING.getMessage());
			}

			String userName = userTokensService.getUserNameFromJWT(authToken);
			if (userName == null || userName.isEmpty()) {
				throw new ResponseStatusException(ErrorCode.USERNAME_EXTRACT_ERROR.getStatus(), ErrorCode.USERNAME_EXTRACT_ERROR.getMessage());
			}

			String hashedUserName = BCrypt.hashpw(userName, Constant.STATIC_SALT);
			UserTokens tokens = userTokensService.getUserTokensByUserName(hashedUserName);
			String hashedAuthToken = BCrypt.hashpw(authToken, tokens.getSalt());
			if (tokens == null || !validateToken(authToken) || !hashedAuthToken.equals(tokens.getAccessToken())) {
				throw new ResponseStatusException(ErrorCode.INVALID_TOKEN.getStatus(), ErrorCode.INVALID_TOKEN.getMessage());
			}

			UsernamePasswordAuthenticationToken authentication = getAuthentication(req, hashedUserName);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			chain.doFilter(req, res);
		} catch (ResponseStatusException e) {
			res.setStatus(e.getStatusCode().value());
			res.getWriter().write(e.getReason());
		} catch (Exception e) {
			res.setStatus(ErrorCode.UNEXPECTED_ERROR.getStatus().value());
			res.getWriter().write(ErrorCode.UNEXPECTED_ERROR.getMessage() + " : " + e.getMessage());
		}
	}

	private boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(Constant.SECRET.getBytes())).build().parseClaimsJws(authToken);
			return true;
		} catch (Exception ex) {
			return false;
		}
	}

	private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request, String hashedUserName) {
		return new UsernamePasswordAuthenticationToken(hashedUserName, null, new ArrayList<>());
	}

}
