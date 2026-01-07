package com.polus.fibicomp.globalentity.controller;

import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
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
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntitySponsorField;
import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SponsorResponseDTO;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;
import com.polus.fibicomp.globalentity.service.SponosrService;

@RestController
@RequestMapping("/entity/sponsor")
public class SponsorController {

	protected static Logger logger = LogManager.getLogger(SponsorController.class.getName());
	private static final String ACTION_TYPE_SAVE = "S";

	@Autowired
	private SponosrService sponosrService;

	@Autowired
	@Qualifier(value = "entityRiskService")
	private GlobalEntityService entityRiskService;

	@Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

	@Autowired
	private ElasticSyncOperation elasticSyncOperation;

	@PostMapping(value = "/save")
	public ResponseEntity<Map<String, Integer>> saveDetails(@RequestBody SponsorRequestDTO dto) {
		logger.info("Requesting for saveDetails");
		Map<String, Integer> response = sponosrService.saveDetails(dto);
		dto.setAcType(ACTION_TYPE_SAVE);
		sponosrService.logAction(dto);
		if (dto.getEntitySponsorFields().get(EntitySponsorField.feedStatusCode) != null) {
			globalEntityService.processEntityMessageToQ(dto.getEntityId());
		}
		elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping(value = "/update")
	public ResponseEntity<String> updateDetails(@RequestBody SponsorRequestDTO dto) {
		logger.info("Requesting for updateDetails");
		ResponseEntity<String> response = sponosrService.updateDetails(dto);
		if (dto.getEntitySponsorFields().get(EntitySponsorField.feedStatusCode) != null) {
			globalEntityService.processEntityMessageToQ(dto.getEntityId());
		}
		elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		return response;
	}

	@GetMapping(value = "/fetch/{entityId}")
	public ResponseEntity<SponsorResponseDTO> fetchDetails(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		logger.info("Requesting for fetchDetails");
		return sponosrService.fetchDetails(entityId);
	}

	@DeleteMapping(value = "/delete/{id}")
	public ResponseEntity<String> deleteDetails(@PathVariable(value = "id", required = true) final Integer id) {
		logger.info("Requesting for deleteDetails");
		return sponosrService.deleteDetails(id);
	}

	@PostMapping(value = "/saveRisk")
	public ResponseEntity<Map<String, Integer>> saveRisk(@RequestBody EntityRiskRequestDTO dto) {
		logger.info("Requesting for Sponsor/saveRisk");
		return entityRiskService.saveRisk(dto);
	}

	@PatchMapping(value = "/updateRisk")
	public ResponseEntity<String> updateRisk(@RequestBody EntityRiskRequestDTO dto) {
		logger.info("Requesting for Sponsor/updateRisk");
		return entityRiskService.updateRisk(dto);
	}

	@DeleteMapping(value = "/deleteRisk/{entityRiskId}")
	public ResponseEntity<String> deleteRisk(@PathVariable(value = "entityRiskId", required = true) final Integer entityRiskId) {
		logger.info("Requesting for Sponsor/deleteRisk");
		return entityRiskService.deleteRisk(entityRiskId);
	}

	@PatchMapping("/syncWithEntity/{entityId}")
	public ResponseEntity<SponsorResponseDTO> updateCopyFromEntity(@PathVariable("entityId") Integer entityId) {
		logger.info("Requesting for /syncWithEntity/{}", entityId);
		sponosrService.updateCopyFromEntity(entityId);
		return sponosrService.fetchDetails(entityId);
	}

}
