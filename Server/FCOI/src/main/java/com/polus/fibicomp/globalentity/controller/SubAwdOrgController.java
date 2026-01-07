package com.polus.fibicomp.globalentity.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwardOrgField;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgResponseDTO;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;
import com.polus.fibicomp.globalentity.service.SubAwdOrgService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/entity/organization")
@Slf4j
public class SubAwdOrgController {

	@Autowired
	@Qualifier(value = "subAwardOrganizationService")
	private SubAwdOrgService subAwardOrganizationService;

	@Autowired
	@Qualifier(value = "entityRiskService")
	private GlobalEntityService entityRiskService;

	@Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

	@Autowired
	private ElasticSyncOperation elasticSyncOperation;

	@PostMapping(value = "/save")
	public ResponseEntity<Map<String, Integer>> saveDetails(@RequestBody SubAwdOrgRequestDTO dto) {
		log.info("Requesting for saveDetails");
		log.info("entityId : {}", dto.getEntityId());
		log.info("subAwardOrgFields : {}", dto.getSubAwardOrgFields());
		ResponseEntity<Map<String, Integer>> response = subAwardOrganizationService.saveDetails(dto);
		elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		return response;
	}

	@PatchMapping(value = "/update")
	public ResponseEntity<String> updateDetails(@RequestBody SubAwdOrgRequestDTO dto) {
		log.info("Requesting for updateDetails");
		log.info("entityId : {}", dto.getEntityId());
		log.info("subAwardOrgFields : {}", dto.getSubAwardOrgFields());
		ResponseEntity<String> response = subAwardOrganizationService.updateDetails(dto);
		if (dto.getSubAwardOrgFields().get(SubAwardOrgField.feedStatusCode) != null) {
			globalEntityService.processEntityMessageToQ(dto.getEntityId());
		}
		elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		return response;
	}

	@GetMapping(value = "/fetch/{entityId}")
	public ResponseEntity<SubAwdOrgResponseDTO> fetchDetails(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for fetchDetails");
		return subAwardOrganizationService.fetchDetails(entityId);
	}

	@DeleteMapping(value = "/delete/{id}")
	public ResponseEntity<String> deleteDetails(@PathVariable(value = "id", required = true) final Integer id) {
		log.info("Requesting for deleteDetails");
		return subAwardOrganizationService.deleteDetails(id);
	}

	@PostMapping(value = "/saveRisk")
	public ResponseEntity<Map<String, Integer>> saveRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting for SubAwardOrganization/saveRisk");
		return entityRiskService.saveRisk(dto);
	}

	@PatchMapping(value = "/updateRisk")
	public ResponseEntity<String> updateRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting forSubAwardOrganization/updateRisk");
		return entityRiskService.updateRisk(dto);
	}

	@DeleteMapping(value = "/deleteRisk/{entityRiskId}")
	public ResponseEntity<String> deleteRisk(@PathVariable(value = "entityRiskId", required = true) final Integer entityRiskId) {
		log.info("Requesting for SubAwardOrganization/deleteRisk");
		return entityRiskService.deleteRisk(entityRiskId);
	}

	@PatchMapping("/syncWithEntity/{entityId}")
	ResponseEntity<SubAwdOrgResponseDTO> updateCopyFromEntity(@PathVariable("entityId") Integer entityId) {
		log.info("Requesting for /syncWithEntity/{}", entityId);
		subAwardOrganizationService.updateCopyFromEntity(entityId);
		return subAwardOrganizationService.fetchDetails(entityId);
	}

}
