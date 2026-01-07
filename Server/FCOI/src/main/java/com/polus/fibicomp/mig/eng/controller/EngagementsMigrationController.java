package com.polus.fibicomp.mig.eng.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.mig.eng.dto.EngDetailRequestDto;
import com.polus.fibicomp.mig.eng.dto.EngMigDashboardDto;
import com.polus.fibicomp.mig.eng.dto.EngMigEntityDto;
import com.polus.fibicomp.mig.eng.dto.EngMigMatrixResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigResponseDto;
import com.polus.fibicomp.mig.eng.dto.EngMigStatusUpdateDto;
import com.polus.fibicomp.mig.eng.dto.EngPopulateReqDTO;
import com.polus.fibicomp.mig.eng.service.EngagementsMigrationService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/engagementMigration")
@Slf4j
public class EngagementsMigrationController {

	@Autowired
	EngagementsMigrationService engagementsMigrationService;
	
	@GetMapping("/checkMigration")
	public ResponseEntity<EngMigResponseDto> checkEngagementsToMigrate() {
		String personId = AuthenticatedUser.getLoginPersonId();
		log.info("Requesting for checkEngagementsToMigrate, personId: {}", personId);
		return new ResponseEntity<>(engagementsMigrationService.checkEngagementsToMigrate(personId), HttpStatus.OK);
	}
	
	@PostMapping("/getDashboard")
	public ResponseEntity<Map<String, Object>> getEngagementsMigDashboard(@RequestBody EngDetailRequestDto request) { 
		log.info("Requesting for getEngagementsMigDashboard");
        return new ResponseEntity<>(engagementsMigrationService.getEngagementsMigDashboard(request), HttpStatus.OK);
	}
	
	@GetMapping("/getMatrix/{engagementId}")
	public ResponseEntity<EngMigMatrixResponseDto> getLegacyEngMatrix(@PathVariable("engagementId") Integer engagementId) { 
		log.info("Requesting for getLegacyEngMatrix, engagementId: {}", engagementId);
	    return new ResponseEntity<>(engagementsMigrationService.fetchEngMatrix(engagementId), HttpStatus.OK);
	}
	
	@GetMapping("/getEntities/{engagementId}")
	public ResponseEntity<List<EngMigEntityDto>> getEntityByEntityName(@PathVariable("engagementId") int engagementId) {
		log.info("Requesting for getEntities, engagementId: {}", engagementId);
		boolean isValidEng = engagementsMigrationService.checkLegacyEngagements(engagementId);
		if (isValidEng == false) {
			log.info("No engagement records found for the logged-in user. EngagementId: {}", engagementId);
			return ResponseEntity.noContent().build();
	    }
		return new ResponseEntity<>(engagementsMigrationService.getEntityByEntityName(engagementId), HttpStatus.OK);
	}
	
	@GetMapping("/getEngagements/{engagementId}")
	public ResponseEntity<EngMigDashboardDto> getEngDetails(@PathVariable("engagementId") int engagementId) {
		log.info("Requesting for getEngDetails, engagementId: {}", engagementId);
		return new ResponseEntity<>(engagementsMigrationService.getEngDetails(engagementId), HttpStatus.OK);
	}
	
	@PostMapping("/updateMigStatus")
	public void updateMigStatus(@RequestBody EngMigStatusUpdateDto dto) {
		log.info("Requesting for updateMigStatus, personId: {} and engagementId: {}", dto.getEngagementIds());
		engagementsMigrationService.updateMigStatus(dto);
	}
	
	@PostMapping("/populateAndUpdateMigDetails")
	public void saveMatrixAnswer(@RequestBody EngPopulateReqDTO engSaveAnswerDto) {
		log.info("Requesting for populateAndUpdateMigDetails");
		engagementsMigrationService.populateAndUpdateMigDetails(engSaveAnswerDto);
	}
}	 
