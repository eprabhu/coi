package com.polus.fibicomp.globalentity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/entity/corporateFamily")
public class CorporateFamilyController {

	@Autowired
	@Qualifier(value = "corporateFamilyService")
	private GlobalEntityService corporateFamilyService;

	@Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

	@Autowired
	@Qualifier(value = "entityDetailsService")
	private GlobalEntityService entityService;

	@PostMapping
	public ResponseEntity<CorporateFamilyRequestDTO> createCorporateFamily(@RequestBody CorporateFamilyRequestDTO dto) {
		log.info("Requesting for createCorporateFamily entityId: {}, parentEntityId: {}", dto.getEntityId(), dto.getParentEntityId());
		ResponseEntity<CorporateFamilyRequestDTO> response = corporateFamilyService.createCorporateFamily(dto);
		if (response.getStatusCode().is2xxSuccessful()) {
			globalEntityService.processEntityMessageToGraphSyncQ(dto.getEntityId());
			CorporateFamilyRequestDTO responseDto = response.getBody();
			if (dto.getCurrentEntityId() != null) {
				globalEntityService.updateEntityForeignFlag(dto.getCurrentEntityId(), dto.getCurrentEntityNumber());
				responseDto.setIsForeign(entityService.isEntityForeign(dto.getCurrentEntityId()));
				responseDto.setEntityFamilyTreeRoles(entityService.getFamilyTreeRoles(dto.getCurrentEntityNumber()));
			}
			return new ResponseEntity<>(responseDto, HttpStatus.OK);
		}
		return response;
	}

	@PostMapping("/createFromDnB")
	public ResponseEntity<ResponseMessageDTO> createCorporateFamilyFromDnB(@RequestBody CorporateFamilyRequestDTO dto) {
		log.info("Requesting for createCorporateFamilyFromDnB dunsnumber: {}", dto.getDunsNumber());
		ResponseEntity<ResponseMessageDTO> response = corporateFamilyService.createCorporateFamilyFromDnB(dto.getDunsNumber());
		corporateFamilyService.syncGraph(response, dto.getDunsNumber());
		return response;
	}

	@PatchMapping
	public ResponseEntity<ResponseMessageDTO> updateCorporateFamily(@RequestBody CorporateFamilyRequestDTO dto) {
		log.info("Requesting for updateCorporateFamily entityId: {}, parentEntityId: {}", dto.getEntityId(), dto.getParentEntityId());
		ResponseMessageDTO response = corporateFamilyService.updateCorporateFamily(dto);
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getEntityId());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/unLink")
	public ResponseEntity<CorporateFamilyRequestDTO> unlinkEntity(@RequestBody CorporateFamilyRequestDTO dto) {
		log.info("Requesting for unlinkEntity: {}", dto.getEntityNumber());
		CorporateFamilyRequestDTO response = corporateFamilyService.unlinkEntity(dto.getEntityNumber());
		globalEntityService.updateEntityForeignFlag(response.getEntityId(), response.getEntityNumber());
		globalEntityService.updateEntityForeignFlag(response.getParentEntityId(), response.getParentEntityNumber());
		globalEntityService.processEntityMessageToGraphSyncQ(response.getEntityId());
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getCurrentEntityId());
		globalEntityService.processEntityMessageToGraphSyncQ(response.getParentEntityId());
		if (dto.getCurrentEntityId() != null) {
			globalEntityService.updateEntityForeignFlag(dto.getCurrentEntityId(), dto.getCurrentEntityNumber());
			response.setIsForeign(entityService.isEntityForeign(dto.getCurrentEntityId()));
			response.setEntityFamilyTreeRoles(entityService.getFamilyTreeRoles(dto.getCurrentEntityNumber()));
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/{entityNumber}")
	public ResponseEntity<CorporateFamilyResponseDTO> fetchCorporateFamily(@PathVariable(value = "entityNumber", required = true) final Integer entityNumber) {
		log.info("Requesting fetchCorporateFamily: {}", entityNumber);
		CorporateFamilyResponseDTO response = corporateFamilyService.fetchCorporateFamily(entityNumber);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/parentExists/{entityNumber}")
	public ResponseEntity<Boolean> parentExists(@PathVariable(value = "entityNumber", required = true) final Integer entityNumber) {
		log.info("Requesting parentExists: {}", entityNumber);
		boolean response = corporateFamilyService.isParentLinked(entityNumber);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
