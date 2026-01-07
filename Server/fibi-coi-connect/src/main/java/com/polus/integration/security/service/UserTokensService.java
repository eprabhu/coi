package com.polus.integration.security.service;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.polus.integration.constant.Constant;
import com.polus.integration.pojo.UserTokens;
import com.polus.integration.repository.UserTokensRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserTokensService {

	@Autowired
	private UserTokensRepository tokensRepository;

	public void storeUserTokens(UserTokens userTokens) {
		tokensRepository.save(userTokens);
	}

	public UserTokens getUserTokensByUserName(String userName) {
		return tokensRepository.findByUserName(userName);
	}

	public Timestamp getCurrentTimestamp() {
		return new Timestamp(this.getCurrentDate().getTime());
	}

	public String getUserNameFromJWT(String token) {
		try {
			return Jwts.parserBuilder().setSigningKey(Keys.hmacShaKeyFor(Constant.SECRET.getBytes())).build().parseClaimsJws(token).getBody().getSubject();
		} catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException | IllegalArgumentException ex) {
			log.error("JWT parsing error: {}", ex);
		} catch (ExpiredJwtException ex) {
			log.error("JWT token is expired");
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "JWT token is expired");
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

	public Date getCurrentDate() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		return c.getTime();
	}

	public String generateToken(String key) {
		Claims claims = Jwts.claims().setSubject(key);
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + Constant.EXPIRATION_TIME);
		SecretKey secretKey = new SecretKeySpec(Constant.SECRET.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS512.getJcaName());
		return Jwts.builder().setClaims(claims).setIssuedAt(now).setExpiration(expiryDate).signWith(secretKey).compact();
	}

}
