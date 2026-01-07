package com.polus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class KCApplication {

	public static void main(String[] args) {
		SpringApplication.run(KCApplication.class, args);
	}

}
