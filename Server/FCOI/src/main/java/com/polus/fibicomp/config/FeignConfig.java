package com.polus.fibicomp.config;

import org.springframework.context.annotation.Bean;

import feign.RequestInterceptor;
import feign.RequestTemplate;

public class FeignConfig {

    @Bean
    public RequestInterceptor xSourceInterceptor() {
        return (RequestTemplate template) -> {
            template.header("X-Source", "FormBuilder");
        };
    }
}
