package com.polus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableAsync
@EnableScheduling
@ComponentScan({"com.polus.*"})
@EnableJpaAuditing(modifyOnCreate = true)
public class CoiIntegrationApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoiIntegrationApplication.class, args);
	}

}
