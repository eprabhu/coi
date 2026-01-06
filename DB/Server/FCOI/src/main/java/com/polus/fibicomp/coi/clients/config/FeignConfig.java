package com.polus.fibicomp.coi.clients.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@Configuration
public class    FeignConfig {

    @Bean
    public RequestInterceptor authTokenInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                log.info("Feign Request Interceptor called to add Cookie header");
                ServletRequestAttributes attributes =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String cookie = request.getHeader("Cookie");
                    log.info("Extracted Cookie from incoming request: {}", cookie);
                    if (cookie != null && !cookie.isEmpty()) {
                        requestTemplate.header("Cookie", cookie);
                    }
                }
            }
        };
    }
}
