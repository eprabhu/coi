package com.polus.kcintegration.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.polus.kcintegration.constant.Constant;
import com.polus.kcintegration.security.filter.KCAuthenticationFilter;
import com.polus.kcintegration.security.filter.KCAuthorizationFilter;
import com.polus.kcintegration.security.service.UserTokensService;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@Profile("secure")
public class WebSecurity {

	@Autowired
	private UserTokensService userTokensService;

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
		.authorizeHttpRequests(
				authz -> authz.requestMatchers(Constant.DnB_MATCH_API.concat(Constant.DnB_API_ANT_STYLE),
												Constant.GENERATE_USER_DETAILS_URL)
				.permitAll()
				.anyRequest()
				.authenticated())
				.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(ex -> ex.authenticationEntryPoint(new CustomHttp401UnAuthorizedEntryPoint()));

		http.addFilterBefore((request, response, chain) -> {
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			if (httpRequest.getServletPath().equals(Constant.GENERATE_USER_DETAILS_URL)) {
				new KCAuthenticationFilter(userTokensService).doFilter(request, response, chain);
			} 
			else {
				chain.doFilter(request, response);
			}
		}, UsernamePasswordAuthenticationFilter.class);

		http.addFilterBefore((request, response, chain) -> {
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			if (!httpRequest.getServletPath().equals(Constant.GENERATE_USER_DETAILS_URL) &&
					!httpRequest.getServletPath().startsWith(Constant.DnB_MATCH_API)
					) {
				new KCAuthorizationFilter(userTokensService).doFilter(request, response, chain);
			} else {
				chain.doFilter(request, response);
			}
		}, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", new CorsConfiguration().applyPermitDefaultValues());
		return source;
	}

}
