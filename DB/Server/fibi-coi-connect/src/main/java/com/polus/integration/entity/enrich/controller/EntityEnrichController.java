package com.polus.integration.entity.enrich.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.entity.enrich.dto.DnBEntityEnrichRequestDTO;
import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse;
import com.polus.integration.entity.enrich.service.EntityEnrichService;

@RestController
@RequestMapping("enrich/entity")
public class EntityEnrichController {

	@Autowired
	EntityEnrichService service;

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return new ResponseEntity<String>("Hello from enrich/entity", HttpStatus.OK);
	}

	@PostMapping("runEnrich")
	public ResponseEntity<EntityEnrichAPIResponse> performEnrich(
			@RequestBody DnBEntityEnrichRequestDTO request) {
		EntityEnrichAPIResponse response = service.runEnrich(request);
		return new ResponseEntity<EntityEnrichAPIResponse>(response, HttpStatus.OK);

	}

}
