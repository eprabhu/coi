package com.polus.integration.security;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

import com.polus.integration.constant.Constant;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JWTAuthorizationFilter extends BasicAuthenticationFilter {

	public JWTAuthorizationFilter(AuthenticationManager authManager) {
		super(authManager);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		String token = getJwtFromRequest(req);
		if (StringUtils.hasText(token) && validateToken(token)) {
			UsernamePasswordAuthenticationToken authentication = getAuthentication(req);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			chain.doFilter(req, res);
			return;
		}
		chain.doFilter(req, res);
	}

	private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request) {
		try {
			String token = getJwtFromRequest(request);
			if (token != null) {
				String username = getUserNameFromJWT(token);
				if (username != null) {
					return new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
				}
				return null;
			}
			return null;
		} catch (Exception e) {
			new CustomHttp403ForbiddenEntryPoint();
			return null;
		}
	}

	public boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(Constant.SECRET.getBytes())).build().parseClaimsJws(authToken);
			return true;
		} catch (io.jsonwebtoken.security.SecurityException ex) {
			logger.error("JWT validation error: {}", ex);
		} catch (MalformedJwtException ex) {
			logger.error("Invalid JWT token: {}", ex);
		} catch (UnsupportedJwtException ex) {
			logger.error("Unsupported JWT token: {}", ex);
		} catch (IllegalArgumentException ex) {
			logger.error("JWT claims string is empty.");
		} catch (ExpiredJwtException ex) {
			logger.error("JWT claims token is expired");
		}
		return false;
	}

	public String getUserNameFromJWT(String token) {
		try {
			return Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(Constant.SECRET.getBytes())).build()
					.parseClaimsJws(token).getBody().getSubject();
		} catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException | IllegalArgumentException ex) {
			logger.error("JWT parsing error: {}", ex);
		} catch (ExpiredJwtException ex) {
			logger.error("JWT token is expired");
		}
		return null;
	}

	public String getJwtFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader(Constant.HEADER_STRING);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(Constant.TOKEN_PREFIX)) {
			return bearerToken.substring(Constant.TOKEN_PREFIX.length());
		}
		return null;
	}
}
