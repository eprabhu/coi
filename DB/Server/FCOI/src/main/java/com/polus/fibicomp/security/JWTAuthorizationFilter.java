package com.polus.fibicomp.security;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

import com.polus.fibicomp.constants.Constants;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

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
            Jwts.parser().setSigningKey(Constants.SECRET).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }catch (ExpiredJwtException ex) {
            logger.error("JWT claims token is expired");
        }
        return false;
	}
	
	public String getUserNameFromJWT(String token) {
		return Jwts.parser()
               .setSigningKey(Constants.SECRET)
               .parseClaimsJws(token)
               .getBody().getSubject();      
	}
	
	public String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(Constants.HEADER_STRING);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(Constants.TOKEN_PREFIX)) {
            return bearerToken.substring(7, bearerToken.length());
        }
        return null;
	}
}
