package com.polus.integration.dnb.referencedata.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.dnb.referencedata.service.ReferenceDataService;
import com.polus.integration.feedentity.dao.EntityIntegrationDao;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("referenceData")
public class DnBReferenceDataController {

	private static final String DnB_INDUSTRY_CODE_TYPE_VALUE = "30";
	
	private static final String DnB_REGISTRATION_NUMBER_TYPE_VALUE = "7";
	
	private static final String DnB_BUSINESS_ENTITY_TYPE_VALUE = "197";	
	
	private static final String DnB_FAMILY_TREE_ROLE_TYPE_VALUE = "202";
	
	private static final String DnB_OPERATING_STATUS_TYPE_VALUE = "166";
	
	
	@Autowired
	ReferenceDataService service;

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return new ResponseEntity<String>("Hello from referenceData", HttpStatus.OK);
	}

	@GetMapping("/loadIndustryCodeType")
	public ResponseEntity<String> loadIndustryCodeType() {
		service.loadIndustryCodeType(DnB_INDUSTRY_CODE_TYPE_VALUE);
		return new ResponseEntity<String>("Completed Industry Classification Loading", HttpStatus.OK);		
	}
	
	@GetMapping("/loadRegistrationNumberType")
	public ResponseEntity<String> loadRegistrationNumberType() {
		service.loadRegistrationNumberType(DnB_REGISTRATION_NUMBER_TYPE_VALUE);
		return new ResponseEntity<String>("Completed Registration Number Type Loading", HttpStatus.OK);		
	}

	@GetMapping("/loadBusinessEntityType")
	public ResponseEntity<String> loadBusinessEntityType() {
		service.loadBusinessEntityType(DnB_BUSINESS_ENTITY_TYPE_VALUE);
		return new ResponseEntity<String>("Completed Business Entity Type Loading", HttpStatus.OK);		
	}
	
	@GetMapping("/loadFamilyRoleType")
	public ResponseEntity<String> loadFamilyRoleType() {
		service.loadFamilyRoleType(DnB_FAMILY_TREE_ROLE_TYPE_VALUE);
		return new ResponseEntity<String>("Completed Family Role Type Loading", HttpStatus.OK);		
	}
	
	@GetMapping("/loadOperatingStatusType")
	public ResponseEntity<String> loadOperatingStatusType() {
		service.loadOperatingStatusType(DnB_OPERATING_STATUS_TYPE_VALUE);
		return new ResponseEntity<String>("Completed Operating Status Type Loading", HttpStatus.OK);		
	}
	
	@GetMapping("/loadAll")
	public ResponseEntity<String> loadAll() {		
		service.loadOperatingStatusType(DnB_OPERATING_STATUS_TYPE_VALUE);
		log.info("Completed loading Operating status");
		
		service.loadFamilyRoleType(DnB_FAMILY_TREE_ROLE_TYPE_VALUE);
		log.info("Completed loading Family Tree Role Type");
		
		service.loadBusinessEntityType(DnB_BUSINESS_ENTITY_TYPE_VALUE);
		log.info("Completed loading Business Entity Type");
		
		service.loadRegistrationNumberType(DnB_REGISTRATION_NUMBER_TYPE_VALUE);
		log.info("Completed loading Registration Number Type");
		
		service.loadIndustryCodeType(DnB_INDUSTRY_CODE_TYPE_VALUE);
		log.info("Completed loading Industry Code Type");
		
		return new ResponseEntity<String>("Completed Loading All DnB Lookup data", HttpStatus.OK);		
	}
		
}
