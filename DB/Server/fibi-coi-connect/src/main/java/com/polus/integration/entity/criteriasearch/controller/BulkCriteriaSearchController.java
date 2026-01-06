package com.polus.integration.entity.criteriasearch.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.entity.criteriasearch.service.BulkCriteriaSearchService;

@RestController
@RequestMapping("criteriasearch/bulk")
public class BulkCriteriaSearchController {

	@Autowired
	BulkCriteriaSearchService bulkCriteriaSearchService;

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return new ResponseEntity<String>("Hello from criteriasearch/bulk", HttpStatus.OK);
	}

	@GetMapping("/startBulkSearch")
	public ResponseEntity<String> startBulkSearch() {
		bulkCriteriaSearchService.startBulkSearch();
		return new ResponseEntity<String>("Processing started", HttpStatus.OK);
	}

	@GetMapping("/stopBulkSearch")
	public ResponseEntity<String> stopBulkSearch() {
		bulkCriteriaSearchService.stopBulkSearch();
		return new ResponseEntity<String>("Processing stopped", HttpStatus.OK);
	}
}
