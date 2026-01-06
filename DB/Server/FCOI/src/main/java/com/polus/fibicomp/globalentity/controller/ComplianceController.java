package com.polus.fibicomp.globalentity.controller;

import java.util.Map;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.common.service.ElasticSyncOperation;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.dto.ComplianceResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.service.ComplianceService;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/entity/compliance")
public class ComplianceController {

	@Autowired
	@Qualifier(value = "entityRiskService")
	private GlobalEntityService entityRiskService;

	@Autowired
	private ComplianceService complianceService;

	@Autowired
	private ElasticSyncOperation elasticSyncOperation;

	@PostMapping(value = "/saveRisk")
	public ResponseEntity<Map<String, Integer>> saveRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting for compliance/saveRisk");
		return entityRiskService.saveRisk(dto);
	}

	@PatchMapping(value = "/updateRisk")
	public ResponseEntity<String> updateRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting for compliance/updateRisk");
		return entityRiskService.updateRisk(dto);
	}

	@DeleteMapping(value = "/deleteRisk/{entityRiskId}")
	public ResponseEntity<String> deleteRisk(@PathVariable(value = "entityRiskId", required = true) final Integer entityRiskId) {
		log.info("Requesting for compliance/deleteRisk");
		return entityRiskService.deleteRisk(entityRiskId);
	}

	@GetMapping(value = "/fetch/{entityId}")
	public ResponseEntity<ComplianceResponseDTO> fetchDetails(@PathVariable Integer entityId) {
		log.info("Received request to fetch compliance details for entityId: {}", entityId);

		try {
			ComplianceResponseDTO response = complianceService.fetchComplianceDetails(entityId);
			return ResponseEntity.ok(response);
		} catch (EntityNotFoundException e) {
			log.warn("Compliance details not found for entityId: {}", entityId);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		} catch (Exception e) {
			log.error("Error fetching compliance details for entityId: {}", entityId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PostMapping(value = "/save")
	public ResponseEntity<Map<String, Integer>> saveComplianceInfo(@RequestBody ComplianceRequestDTO dto) {
		log.info("Received request to save compliance info");

		try {
			validateComplianceRequest(dto, "I");

			log.info("Processing compliance info for entityId: {}, entityTypeCode: {}", dto.getEntityId(), dto.getEntityTypeCode());

			Map<String, Integer> response = complianceService.saveComplianceInfo(dto);

			log.info("Successfully saved compliance info with ID: {}", response.get("id"));
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
			return ResponseEntity.ok(response);

		} catch (IllegalArgumentException e) {
			log.error("Validation failed: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", -1));
		} catch (Exception e) {
			log.error("Error saving compliance info", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", -1));
		}
	}

	@PatchMapping(value = "/update")
	public ResponseEntity<Map<String, String>> updateComplianceInfo(@RequestBody ComplianceRequestDTO dto) {
		log.info("Received request to update compliance info");

		try {
			validateComplianceRequest(dto, "U");

			log.info("Updating compliance info for entityId: {}, entityTypeCode: {}, id: {}", dto.getEntityId(), dto.getEntityTypeCode(), dto.getId());

			String message = complianceService.updateComplianceInfo(dto);

			log.info("Compliance info updated successfully for ID: {}", dto.getId());
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
			return ResponseEntity.ok(Map.of("message", message));

		} catch (IllegalArgumentException e) {
			log.error("Validation failed: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			log.error("Error updating compliance info", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update compliance info"));
		}
	}

	@DeleteMapping(value = "/delete/{id}")
	public ResponseEntity<Map<String, String>> deleteComplianceInfo(@PathVariable Integer id) {
		log.info("Received request to delete compliance info for ID: {}", id);

		try {
			String message = complianceService.deleteComplianceInfo(id);

			log.info("Successfully deleted compliance info for ID: {}", id);
			return ResponseEntity.ok(Map.of("message", message));

		} catch (IllegalArgumentException e) {
			log.error("Validation failed: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		} catch (EntityNotFoundException e) {
			log.error("Delete failed: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			log.error("Error deleting compliance info for ID: {}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete compliance info"));
		}
	}

	private void validateComplianceRequest(ComplianceRequestDTO dto, String action) {
		if (dto == null) {
			throw new IllegalArgumentException("Request body cannot be null");
		}
		if (dto.getEntityId() == null || dto.getEntityId() <= 0) {
			throw new IllegalArgumentException("Invalid entity ID");
		}
		if (dto.getEntityTypeCode() == null || dto.getEntityTypeCode().isBlank()) {
			throw new IllegalArgumentException("Entity type code cannot be empty");
		}
		if (action.equals("U") && (dto.getId() == null || dto.getId() <= 0)) {
	        throw new IllegalArgumentException("Invalid entity compliance ID");
	    }
	}

}
