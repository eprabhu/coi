package com.polus.integration.entity.criteriasearch.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.entity.criteriasearch.dto.DnBEntityCriteriaSearchRequestDTO;
import com.polus.integration.entity.criteriasearch.dto.EntityCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.service.EntityCriteriaSearchService;

@RestController
@RequestMapping("criteriasearch/entity")
public class EntityCriteriaSearchController {

	@Autowired
	EntityCriteriaSearchService entityCriteriaSearchService;

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return new ResponseEntity<String>("Hello from criteriasearch/entity", HttpStatus.OK);
	}

	@PostMapping("runSearch")
	public ResponseEntity<EntityCriteriaSearchAPIResponse> performCleanseMatch(
			@RequestBody DnBEntityCriteriaSearchRequestDTO request) {
		EntityCriteriaSearchAPIResponse response = entityCriteriaSearchService.runCleanseMatch(request);
		return new ResponseEntity<EntityCriteriaSearchAPIResponse>(response, HttpStatus.OK);

	}

}
