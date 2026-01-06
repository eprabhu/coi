package com.polus.kcintegration.entity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.kcintegration.entity.dto.EntityDTO;
import com.polus.kcintegration.entity.dto.EntityResponse;
import com.polus.kcintegration.entity.service.EntityKCIntegrationService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/entity")
public class EntityIntegrationController {

	@Autowired
	private EntityKCIntegrationService integrationService;

	@PostMapping("/feedEntityDetails")
	public ResponseEntity<EntityResponse> feedEntityDetails(@RequestBody EntityDTO entityDTO, HttpServletRequest req) {
		String clientIp = req.getRemoteAddr();
		log.info("Request received for feedEntityDetails from IP: {}", clientIp);
		log.info("EntityDTO details: {}", entityDTO);

		try {
			EntityResponse response = integrationService.feedEntityDetails(entityDTO);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("Unexpected error occurred while processing feedEntityDetails for IP {}: {}", clientIp, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(EntityResponse.builder().build());
		}
	}

}
