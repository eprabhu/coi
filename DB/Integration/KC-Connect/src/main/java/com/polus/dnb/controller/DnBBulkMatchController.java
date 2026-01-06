package com.polus.dnb.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.polus.dnb.service.BulkCleanseMatchService;

@RestController
@RequestMapping("/dnb/match")
public class DnBBulkMatchController {

	@Autowired
	BulkCleanseMatchService bulkCleanseMatchService;

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return new ResponseEntity<String>("Hello from KC Connect DnB Match", HttpStatus.OK);
	}

	@GetMapping("/start")
	public ResponseEntity<String> startBulkCleanseMatch(@RequestParam(name = "batchId", required = true) String batchId) {
		
		if(batchId == null || batchId.isEmpty()) {
			return new ResponseEntity<>("batchId cannot be null or empty!!", HttpStatus.BAD_REQUEST);
		}
		
		bulkCleanseMatchService.startBulkCleanseMatch(batchId);
		return new ResponseEntity<String>("Processing started", HttpStatus.OK);
	}

	@GetMapping("/reRun")
	public ResponseEntity<String> startCustomCleanseMatch(@RequestParam Map<String, String> filters) {
		bulkCleanseMatchService.patchProcess(filters);
		return new ResponseEntity<String>("Processing started", HttpStatus.OK);
	}

	@GetMapping("/processError")
	public ResponseEntity<String> processError(@RequestParam String errorCode, @RequestParam String batchId,  @RequestParam String matchBy) {

		String[] matchParams = matchBy.split(",");
		Map<String, String> filters = new HashMap<>();
		filters.put("errorCode", errorCode);
		filters.put("batchId", batchId);
		bulkCleanseMatchService.processError(filters, matchParams);
		return new ResponseEntity<String>("Processing started", HttpStatus.OK);
	}

	@GetMapping("/status")
	public ResponseEntity<String> getBulkCleanseMatchStatus() {
		String status = bulkCleanseMatchService.getProcessStatus();
		return new ResponseEntity<>(status, HttpStatus.OK);
	}

	@GetMapping("/stopBulkCleanseMatch")
	public ResponseEntity<String> stopBulkCleanseMatch() {
		bulkCleanseMatchService.stopBulkCleanseMatch();
		return new ResponseEntity<String>("Processing stopped", HttpStatus.OK);
	}

}