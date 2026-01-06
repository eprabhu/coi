package com.polus.fibicomp;

import java.util.TimeZone;

import javax.annotation.PostConstruct;

import com.polus.core.common.service.ElasticSyncOperation;
import org.hibernate.annotations.Filter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
//Can change title based on application, title appears on top of API documentation
@OpenAPIDefinition(info = @Info(title = "FCOI"))
@EnableAutoConfiguration
@EnableTransactionManagement
@ComponentScan
//@EnableScheduling
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableFeignClients
@ComponentScan(
		basePackages = "com.polus.*",
		excludeFilters = {
				@ComponentScan.Filter(type = FilterType.REGEX,
				pattern = "com.polus.core.authorization.*")
//				,
//				@ComponentScan.Filter(type=FilterType.ASSIGNABLE_TYPE, value= ElasticSyncOperation.class)
		}
)
public class FibicompApplication {

	@PostConstruct
	void started() {
		TimeZone.setDefault(TimeZone.getTimeZone("TimeZone"));
	}

	public static void main(String[] args) {
		SpringApplication.run(FibicompApplication.class, args);
	}
}

