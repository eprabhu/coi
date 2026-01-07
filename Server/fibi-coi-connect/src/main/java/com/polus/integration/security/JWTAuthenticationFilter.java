package com.polus.integration.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.constant.Constant;
import com.polus.integration.dto.PersonDTO;
import com.polus.integration.login.dao.LoginDao;
import com.polus.integration.pojo.Person;
import com.polus.integration.service.CommonService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

	protected static Logger log = LogManager.getLogger(JWTAuthenticationFilter.class.getName());

	private AuthenticationManager authenticationManager;
	private LoginDao loginDao;
	private CommonService commonService;

	public JWTAuthenticationFilter(AuthenticationManager authenticationManager, LoginDao loginDao,
			CommonService commonService) {
		this.authenticationManager = authenticationManager;
		this.loginDao = loginDao;
		this.commonService = commonService;
		setFilterProcessesUrl(Constant.SIGN_UP_URL);  // Set the new endpoint here
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res) {
		try {
			Person creds = new ObjectMapper().readValue(req.getInputStream(), Person.class);
			String encryptedPWD = getEncryptedPassword(creds.getPassword());
			return authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(creds.getPrincipalName(), encryptedPWD, new ArrayList<>()));
		} catch (IOException e) {
			log.error(String.format("Exception in attemptAuthentication: %s", e.getMessage()));
		}
		return null;
	}

	private String getEncryptedPassword(String password) {
		try {
			return commonService.hash(password);
		} catch (GeneralSecurityException e) {
			log.error("Error occured while hashing the password: {} ", e);
		}
		return "";
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain chain,
			Authentication auth) throws IOException, ServletException {
		log.info("-------- successfulAuthentication --------");
		try {
			res.setContentType("application/json; charset=UTF-8");
			String userName = ((User) auth.getPrincipal()).getUsername();

			PersonDTO personDTO = loginDao.readPersonData(userName);
			personDTO.setJwtRoles(auth.getAuthorities());
			if (personDTO.isLogin()) {
				String token = generateToken(userName, personDTO.getPersonID(), personDTO.getFullName());
				log.info("Token:   {}", token);
				res.addHeader(Constant.HEADER_STRING, Constant.TOKEN_PREFIX + token);
				res.getWriter().write(new ObjectMapper().writeValueAsString(personDTO));
			}
		} catch (Exception e) {
			log.error("Exception in successfulAuthentication {}", e.getMessage());
			e.printStackTrace();
		}
	}

	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse res,
			AuthenticationException failed) throws IOException, ServletException {
		log.info("-------- unsuccessfulAuthentication --------");
		PersonDTO personDTO = new PersonDTO();
		personDTO.setLogin(false);
		String response = new ObjectMapper().writeValueAsString(personDTO);
		res.getWriter().write(response);
	}

	public String generateToken(String username, String personId, String fullName) {
		Claims claims = Jwts.claims().setSubject(username);
		claims.put(Constant.LOGIN_PERSON_ID, personId);
		claims.put(Constant.LOGIN_USER_FULL_NAME, fullName);
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + Constant.EXPIRATION_TIME);

		// SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Generate a secure key

		// Create a SecretKey object from the byte array
		SecretKey secretKey = new SecretKeySpec(Constant.SECRET.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS512.getJcaName());

		// Build JWT token
		return Jwts.builder().setClaims(claims).setIssuedAt(now).setExpiration(expiryDate).signWith(secretKey).compact();
	}

}
