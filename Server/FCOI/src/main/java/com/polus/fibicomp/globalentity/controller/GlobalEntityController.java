package com.polus.fibicomp.globalentity.controller;

import java.util.List;
import java.util.Map;

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

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.core.common.service.ElasticSyncOperation;
import com.polus.core.pojo.Currency;
import com.polus.fibicomp.coi.clients.FibiCoiConnectClient;
import com.polus.fibicomp.coi.dto.EntityActionLogDto;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.ActivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.DnBEntityEnrichRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityDocumentStatusesDTO;
import com.polus.fibicomp.globalentity.dto.EntityFeedRequestDto;
import com.polus.fibicomp.globalentity.dto.EntityMandatoryFiledsDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskActionLogResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.dto.ExternalReferenceRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.InactivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.MarkDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.dto.ValidateDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.validateDuplicateResponseDTO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;
import com.polus.fibicomp.globalentity.service.SponsorDetailsService;
import com.polus.fibicomp.globalentity.service.SubAwdOrgDetailsService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/entity")
@Slf4j
public class GlobalEntityController {

	@Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

	@Autowired
	@Qualifier(value = "entityDetailsService")
	private GlobalEntityService entityDetailsService;

	@Autowired
	@Qualifier(value = "companyDetailsService")
	private GlobalEntityService companyDetailsService;

	@Autowired
	@Qualifier(value = "entityRiskService")
	private GlobalEntityService entityRiskService;

	@Autowired
	@Qualifier(value = "entityExternalReferenceService")
	private GlobalEntityService entityExternalReferenceService;

	@Autowired
	private FibiCoiConnectClient fibiCoiConnectClient;

	@Autowired
	private ElasticSyncOperation elasticSyncOperation;

	@Autowired
	private SponsorDetailsService sponsorDetailsService;

	@Autowired
	private SubAwdOrgDetailsService subAwdOrgDetailsService;

	@PostMapping(value = "/create")
	public ResponseEntity<Map<String, Integer>> createEntity(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for createEntity");
		ResponseEntity<Map<String, Integer>> response = entityDetailsService.createEntity(dto);
		Integer entityId = null;
		if (response.getStatusCode().is2xxSuccessful()) {
			entityId = response.getBody().get("entityId");
			globalEntityService.processEntityMessageToGraphSyncQ(entityId);
			try {
				elasticSyncOperation.initiateSyncForElasticQueueRequest(entityId.toString(),
						Constants.ELASTIC_ACTION_INSERT, Constants.ELASTIC_INDEX_ENTITY);
			} catch (Exception e) {
				log.info("Exception in elastic sync in /create: {}", e.getMessage());
			}
		}
		return response;
	}

	@PatchMapping(value = "/update")
	public ResponseEntity<String> updateEntityDetails(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for updateEntityDetails");
		ResponseEntity<String> response = entityDetailsService.updateEntityDetails(dto);
		Entity entityDetails = entityDetailsService.fetchEntityByEntityId(dto.getEntityId());
		subAwdOrgDetailsService.updateCopyFromEntity(entityDetails);
		sponsorDetailsService.updateCopyFromEntity(entityDetails);
		if (Boolean.FALSE.equals(dto.getModificationIsInProgress())) {
			try {
				elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(),
						Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
			} catch (Exception e) {
				log.info("Exception in elastic sync in /update ", e.getMessage());
			}
		}
		return response;
	}

	@GetMapping(value = "/fetch/{entityId}")
	public ResponseEntity<EntityResponseDTO> fetchEntityDetails(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting fetchEntityDetails: {}", entityId);
		return entityDetailsService.fetchEntityDetails(entityId);
	}

	@GetMapping(value = "/fetchIndustryCategoryCode/{industryCategroyTypeCode}")
	public ResponseEntity<List<IndustryCategoryCode>> fetchIndustryCategoryCode(@PathVariable(value = "industryCategroyTypeCode", required = true) final String industryCategroyTypeCode) {
		log.info("Requesting for fetchIndustryCategoryCode");
		return companyDetailsService.fetchIndustryCategoryCode(industryCategroyTypeCode);
	}
	
	@PostMapping(value = "/saveIndustryDetails")
	public ResponseEntity<List<EntityIndustryClassification>> saveIndustryDetails(@RequestBody IndustryDetailsRequestDTO dto) {
		log.info("Requesting for saveIndustryDetails");
		companyDetailsService.saveIndustryDetails(dto);
		return companyDetailsService.fetchIndustryDetails(dto.getEntityId());
	}

	@PatchMapping(value = "/updateIndustryDetails")
	public ResponseEntity<List<EntityIndustryClassification>> updateIndustryDetails(@RequestBody IndustryDetailsRequestDTO dto) {
		log.info("Requesting for updateIndustryDetails");
		companyDetailsService.updateIndustryDetails(dto);
		return companyDetailsService.fetchIndustryDetails(dto.getEntityId());
	}

	@DeleteMapping(value = "/deleteIndustryDetailsByClassId/{entityIndustryClassId}")
	public ResponseEntity<String> deleteIndustryDetailsByClassId(@PathVariable(value = "entityIndustryClassId", required = true) final Integer entityIndustryClassId) {
		log.info("Requesting for deleteIndustryDetailsByClassId");
		return companyDetailsService.deleteIndustryDetailsByClassId(entityIndustryClassId);
	}

	@DeleteMapping(value = "/deleteIndustryDetailsByCatCode/{industryCatCode}")
	public ResponseEntity<String> deleteIndustryDetailsByCatCode(@PathVariable(value = "industryCatCode", required = true) final String industryCatCode) {
		log.info("Requesting for deleteIndustryDetailsByCatCode");
		return companyDetailsService.deleteIndustryDetailsByCatCode(industryCatCode);
	}

	@PostMapping(value = "/saveRegistrationDetails")
	public ResponseEntity<Map<String, Integer>> saveRegistrationDetails(@RequestBody RegistrationDetailsRequestDTO dto) {
		log.info("Requesting for saveRegistrationDetails");
		return companyDetailsService.saveRegistrationDetails(dto);
	}

	@PatchMapping(value = "/updateRegistrationDetails")
	public ResponseEntity<String> updateRegistrationDetails(@RequestBody RegistrationDetailsRequestDTO dto) {
		log.info("Requesting for updateRegistrationDetails");
		return companyDetailsService.updateRegistrationDetails(dto);
	}

	@DeleteMapping(value = "/deleteRegistrationDetails/{entityRegistrationId}")
	public ResponseEntity<String> deleteRegistrationDetails(@PathVariable(value = "entityRegistrationId", required = true) final Integer entityRegistrationId) {
		log.info("Requesting for deleteRegistrationDetails");
		return companyDetailsService.deleteRegistrationDetails(entityRegistrationId);
	}

	@PostMapping(value = "/saveAdditionalAddresses")
	public ResponseEntity<Map<String, Integer>> saveAdditionalAddresses(@RequestBody AddressDetailsRequestDTO dto) {
		log.info("Requesting for saveAdditionalAddresses");
		return companyDetailsService.saveAdditionalAddresses(dto);
	}

	@PatchMapping(value = "/updateAdditionalAddresses")
	public ResponseEntity<String> updateAdditionalAddresses(@RequestBody AddressDetailsRequestDTO dto) {
		log.info("Requesting for updateAdditionalAddresses");
		return companyDetailsService.updateAdditionalAddresses(dto);
	}

	@DeleteMapping(value = "/deleteAdditionalAddress/{entityMailingAddressId}")
	public ResponseEntity<String> deleteAdditionalAddress(@PathVariable(value = "entityMailingAddressId", required = true) final Integer entityMailingAddressId) {
		log.info("Requesting for deleteAdditionalAddress");
		return companyDetailsService.deleteAdditionalAddress(entityMailingAddressId);
	}

	@PatchMapping(value = "/updateOtherDetails")
	public ResponseEntity<String> updateOtherDetails(@RequestBody OtherDetailsRequestDTO dto) {
		log.info("Requesting for updateOtherDetails");
		ResponseEntity<String> response = companyDetailsService.updateOtherDetails(dto);
		Entity entityDetails = entityDetailsService.fetchEntityByEntityId(dto.getEntityId());
		subAwdOrgDetailsService.updateCopyFromEntity(entityDetails);
		sponsorDetailsService.updateCopyFromEntity(entityDetails);
		return response;
	}

	@PostMapping(value = "/saveRisk")
	public ResponseEntity<Map<String, Integer>> saveRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting for saveRisk");
		return entityRiskService.saveRisk(dto);
	}

	@PatchMapping(value = "/updateRisk")
	public ResponseEntity<String> updateRisk(@RequestBody EntityRiskRequestDTO dto) {
		log.info("Requesting for updateRisk");
		return entityRiskService.updateRisk(dto);
	}

	@DeleteMapping(value = "/deleteRisk/{entityRiskId}")
	public ResponseEntity<String> deleteRisk(@PathVariable(value = "entityRiskId", required = true) final Integer entityRiskId) {
		log.info("Requesting for deleteRisk");
		return entityRiskService.deleteRisk(entityRiskId);
	}

	@PostMapping(value = "/saveExternalReference")
	public ResponseEntity<Map<String, Integer>> saveExternalReference(@RequestBody ExternalReferenceRequestDTO dto) {
		log.info("Requesting for saveExternalReference");
		return entityExternalReferenceService.saveExternalReference(dto);
	}

	@PatchMapping(value = "/updateExternalReference")
	public ResponseEntity<String> updateExternalReference(@RequestBody ExternalReferenceRequestDTO dto) {
		log.info("Requesting for updateExternalReference");
		return entityExternalReferenceService.updateExternalReference(dto);
	}

	@DeleteMapping(value = "/deleteExternalReference/{entityExternalMappingId}")
	public ResponseEntity<String> deleteExternalReference(@PathVariable(value = "entityExternalMappingId", required = true) final Integer entityExternalMappingId) {
		log.info("Requesting for deleteExternalReference");
		return entityExternalReferenceService.deleteExternalReference(entityExternalMappingId);
	}

	@PostMapping(value = "/dunsNumberExists")
	public ResponseEntity<Boolean> dunsNumberExists(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for dunsNumberExists");
		return globalEntityService.isDunsNumberExists(dto);
	}

	@PostMapping(value = "/ueiNumberExists")
	public ResponseEntity<Boolean> ueiNumberExists(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for ueiNumberExists");
		return globalEntityService.isUeiNumberExists(dto);
	}

	@PostMapping(value = "/cageNumberExists")
	public ResponseEntity<Boolean> cageNumberExists(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for cageNumberExists");
		return globalEntityService.isCageNumberExists(dto);
	}

	@GetMapping(value = "/fetchCurrencyDetails")
	public ResponseEntity<List<Currency>> fetchCurrencyDetails() {
		log.info("Requesting for fetchCurrencyDetails");
		return globalEntityService.fetchCurrencyDetails();
	}

	@PostMapping(value = "/addPriorName")
	public ResponseEntity<Map<String, Integer>> addPriorName(@RequestBody PriorNameRequestDTO dto) {
		log.info("Requesting for addPriorName");
		ResponseEntity<Map<String, Integer>> response = companyDetailsService.addPriorName(dto);
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /addPriorName ", e.getMessage());
		}
		return response;
	}

	@GetMapping(value = "/fetchPriorNames/{entityId}")
	public List<PriorNameResponseDTO> fetchPriorNames(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for fetchPriorNames");
		return companyDetailsService.fetchPriorNames(entityId);
	}

	@DeleteMapping(value = "/deletePriorName/{id}")
	public ResponseEntity<String> deletePriorName(@PathVariable(value = "id", required = true) final Integer id) {
		log.info("Requesting for deletePriorName");
		return companyDetailsService.deletePriorName(id);
	}

	@PostMapping(value = "/addForeignName")
	public ResponseEntity<Map<String, Integer>> addForeignName(@RequestBody ForeignNameRequestDTO dto) {
		log.info("Requesting for addForeignName");
		ResponseEntity<Map<String, Integer>> response = companyDetailsService.addForeignName(dto);
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /addForeignName ", e.getMessage());
		}
		return response;
	}

	@GetMapping(value = "/fetchForeignNames/{entityId}")
	public List<ForeignNameResponseDTO> fetchForeignNames(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for fetchForeignNames");
		return companyDetailsService.fetchForeignNames(entityId);
	}

	@DeleteMapping(value = "/deleteForeignName/{id}")
	public ResponseEntity<String> deleteForeignName(@PathVariable(value = "id", required = true) final Integer id) {
		log.info("Requesting for deleteForeignName");
		return companyDetailsService.deleteForeignName(id);
	}

	@GetMapping(value = "/fetchRiskTypes/{riskCategoryCode}")
	public ResponseEntity<List<EntityRiskType>> fetchRiskTypes(@PathVariable(value = "riskCategoryCode", required = true) final String riskCategoryCode) {
		log.info("Requesting for fetchRiskTypes");
		return entityRiskService.fetchRiskTypes(riskCategoryCode);
	}

	@GetMapping(value = "/fetchRiskLevels/{riskTypeCode}")
	public ResponseEntity<List<EntityRiskLevel>> fetchRiskLevels(@PathVariable(value = "riskTypeCode", required = true) final String riskTypeCode) {
		log.info("Requesting for fetchRiskTypes");
		return entityRiskService.fetchRiskLevels(riskTypeCode);
	}

	@PatchMapping(value = "/verify/{entityId}")
	public ResponseEntity<Map<String, Object>> verifyEntityDetails(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for verifyEntityDetails");
		ResponseEntity<Map<String, Object>> response = globalEntityService.verifyEntityDetails(entityId, Boolean.FALSE);
		globalEntityService.processEntityMessageToQ(entityId);
		globalEntityService.processEntityMessageToGraphSyncQ(entityId);
		try {
			globalEntityService.updateEntityForeignFlag(entityId);
			globalEntityService.updateEntityElastic(entityId);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /verify/{entityId} ", e.getMessage());
		}
		return response;
	}

	@GetMapping(value = "/fetchEntityTabStatus/{entityId}")
	public Map<String, Object> fetchEntityTabStatus(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for fetchEntityDetails");
		return globalEntityService.fetchEntityTabStatus(entityId);
	}

	@PostMapping(value = "/validateDuplicate")
	public ResponseEntity<List<validateDuplicateResponseDTO>> validateDuplicate(@RequestBody ValidateDuplicateRequestDTO dto) {
		log.info("Requesting for validateDuplicate");
		return new ResponseEntity<>(globalEntityService.validateDuplicate(dto), HttpStatus.OK);
	}

	@PostMapping(value = "/markDuplicate")
	public ResponseEntity<ResponseMessageDTO> markDuplicate(@RequestBody MarkDuplicateRequestDTO dto) {
		log.info("Requesting for markDuplicate");
		ResponseMessageDTO response = globalEntityService.markDuplicate(dto);
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getDuplicateEntityId());
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getDuplicateEntityId().toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /markDuplicate ", e.getMessage());
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/fetchHistory/{entityId}")
	public List<EntityActionLogDto> fetchHistory(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for fetchHistory");
		return globalEntityService.fetchHistory(entityId);
	}

	@GetMapping(value = "/fetchHistory/{entityId}/{entityNumber}")
	public List<EntityActionLogDto> fetchHistory(@PathVariable(value = "entityId", required = true) final Integer entityId,
												 @PathVariable(value = "entityNumber") Integer entityNumber) {
		log.info("Requesting for fetchHistory entityId : {} | entityNumber : {}", entityId, entityNumber);
		return globalEntityService.fetchHistory(entityId, entityNumber);
	}

	@PostMapping(value = "/logAction")
	public ResponseEntity<ResponseMessageDTO> logAction(@RequestBody ActionLogRequestDTO dto) {
		log.info("Requesting for logAction");
		return new ResponseEntity<>(globalEntityService.logAction(dto), HttpStatus.OK);
	}

	@GetMapping(value = "/fetchRiskHistory/{entityRiskId}")
	public List<EntityRiskActionLogResponseDTO> fetchRiskHistory(@PathVariable(value = "entityRiskId", required = true) final Integer entityRiskId) {
		log.info("Requesting for fetchRiskHistory with id: {}", entityRiskId);
		return globalEntityService.fetchRiskHistory(entityRiskId);
	}

	@PostMapping(value = "/activate")
	public ResponseEntity<ResponseMessageDTO> activateEntity(@RequestBody ActivateEntityRequestDTO dto) {
		log.info("Requesting for activateEntity with id: {}", dto.getEntityId());
		ResponseMessageDTO response = globalEntityService.activateEntity(dto);
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getEntityId());
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /activate ", e.getMessage());
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/inactivate")
	public ResponseEntity<ResponseMessageDTO> inactivateEntity(@RequestBody InactivateEntityRequestDTO dto) {
		log.info("Requesting for inactivateEntity with id: {}", dto.getEntityId());
		ResponseMessageDTO response = globalEntityService.inactivateEntity(dto);
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getEntityId());
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(dto.getEntityId().toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /inactivate ", e.getMessage());
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/fetchEntityMandatoryFields")
	public EntityMandatoryFiledsDTO fetchRiskHistory() {
		log.info("Requesting for fetchEntityMandatoryFields");
		return globalEntityService.fetchEntityMandatoryFields();
	}

	@GetMapping(value = "/validateEntityDetails/{entityId}")
	public ResponseEntity<ObjectNode> validateEntityDetails(@PathVariable(value = "entityId", required = true) final Integer entityId) {
		log.info("Requesting for validateEntityDetails with id: {}", entityId);;
		return new ResponseEntity<>(globalEntityService.validateEntityDetails(entityId), HttpStatus.OK);
	}

	@PostMapping(value = "/create/fromFeed")
	public ResponseEntity<Map<String, Integer>> createEntityFromFeed(@RequestBody EntityFeedRequestDto dto) {
		log.info("Requesting for createEntityFromFeed");
		ResponseEntity<Map<String, Integer>> response = entityDetailsService.createEntity(dto.getEntity());
		Integer entityId = null;
		if (response.getStatusCode().is2xxSuccessful()) {
			entityId = response.getBody().get("entityId");
			if (entityId == null) {
				return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // while changing analyse the impact
			}
			try {
				if (dto.getEntity().getDunsNumber() != null && dto.getEntity().getCreateWithDuns() != null && dto.getEntity().getCreateWithDuns()) {
					fibiCoiConnectClient.performEnrich(DnBEntityEnrichRequestDTO.builder().duns(dto.getEntity().getDunsNumber())
							.entityId(response.getBody().get("entityId")).fromFeed(Boolean.TRUE).build());
					Entity entityDetails = entityDetailsService.fetchEntityByEntityId(entityId);
					subAwdOrgDetailsService.updateCopyFromEntity(entityDetails);
					sponsorDetailsService.updateCopyFromEntity(entityDetails);
				}
				entityDetailsService.postCreationProcessFromFeed(dto, entityId);
			} catch (Exception e) {
				log.info("Exception in post creation processes {} ", e.getMessage());
				return new ResponseEntity<>(response.getBody(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			try {
				elasticSyncOperation.initiateSyncForElasticQueueRequest(response.getBody().get("entityId").toString(),
						Constants.ELASTIC_ACTION_INSERT, Constants.ELASTIC_INDEX_ENTITY);
			} catch (Exception e) {
				log.info("Exception in elastic sync in /create/fromFeed {}", e.getMessage());
			}
		}
		return response;
	}

	@GetMapping(value = "/fetchEntityDocumentStatuses")
	public ResponseEntity<List<EntityDocumentStatusesDTO>> fetchEntityDocumentStatuses() {
		log.info("Requesting for fetchEntityDocumentStatuses");
		return new ResponseEntity<>(globalEntityService.fetchEntityDocumentStatuses(), HttpStatus.OK);
	}

	@PostMapping(value = "/updateSponsorOrg/fromFeed")
	public ResponseEntity<Object> updateEntitySponsorOrgDetailsFromFeed(@RequestBody EntityFeedRequestDto dto) {
		log.info("Requesting for updateEntitySponsorOrgDetailsFromFeed");
		entityDetailsService.updateEntitySponsorOrgDetailsFromFeed(dto);
		Integer activeEntityId = entityDetailsService.updateActiveEntitySponOrgFeedStatus(dto.getEntitySubAward() != null ?
				dto.getEntitySubAward().getEntityId() : dto.getEntitySponsor().getEntityId());
		log.info("Active Entity Id : {}", activeEntityId);
		globalEntityService.processEntityMessageToQ(activeEntityId);
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(activeEntityId.toString(),
					Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /updateSponsorOrg/fromFeed ", e.getMessage());
		}
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PostMapping(value = "/syncGraph")
	public void syncGraph(@RequestBody Integer entityId) {
		log.info("Requesting for syncGraph, entityId: {}", entityId);
		globalEntityService.processEntityMessageToGraphSyncQ(entityId);
	}

	@PostMapping(value = "/fromFeed/verifyEntity")
	public void verifyEntityFromFeed(@RequestBody EntityRequestDTO dto) {
		log.info("Requesting for verifyEntityFromFeed");
		entityDetailsService.feedVerifyEntity(dto);
		globalEntityService.processEntityMessageToQ(dto.getEntityId());
		globalEntityService.processEntityMessageToGraphSyncQ(dto.getEntityId());
		try {
			globalEntityService.updateEntityForeignFlag(dto.getEntityId());
			globalEntityService.updateEntityElastic(dto.getEntityId());
		} catch (Exception e) {
			log.info("Exception in elastic sync in /fromFeed/verifyEntity ", e.getMessage());
		}
	}

	@PatchMapping("/modify/{entityId}/{entityNumber}")
	public ResponseEntity<Object> modifyEntity(@PathVariable("entityId") Integer entityId, @PathVariable("entityNumber") Integer entityNumber) {
		ResponseEntity<Object> response = entityDetailsService.modifyEntity(entityId, entityNumber);
		return response;
	}

	@GetMapping("/activeModifying/{entityNumber}/version")
	public ResponseEntity<Object> getActiveModifyingVersion(@PathVariable("entityNumber") Integer entityNumber) {
		return entityDetailsService.getActiveModifyingVersion(entityNumber);
	}

	@GetMapping("/version/{entityNumber}")
	public ResponseEntity<Object> getVersions(@PathVariable("entityNumber") Integer entityNumber) {
		return entityDetailsService.getVersions(entityNumber);
	}

	@PostMapping(value = "/saveExternalReference/fromFeed")
	public void saveExternalReferenceFromFeed(@RequestBody ExternalReferenceRequestDTO dto) {
		log.info("Requesting for saveExternalReferenceFromFeed");
		entityExternalReferenceService.saveExternalReferenceFromFeed(dto);
	}

	@PostMapping("/cancelModification")
	public ResponseEntity<Object> cancelEntityModification(@RequestBody EntityRequestDTO entityRequestDTO) {
		log.info("Requesting for cancelEntityModification entityId : {}, entityNumber : {}", entityRequestDTO.getEntityId(), entityRequestDTO.getEntityNumber());
		Map<String, Object> response = entityDetailsService.cancelEntityModification(entityRequestDTO);
		if (response == null) {
			return new ResponseEntity(HttpStatus.METHOD_NOT_ALLOWED);
		} else {
			return new ResponseEntity(response, HttpStatus.OK);
		}
	}

	@GetMapping(value = "/fetchIndustryCategoryTypeBySource/{source}")
	public ResponseEntity<List<IndustryCategoryType>> fetchIndustryCategoryTypeBySource(@PathVariable(required = true) final String source) {
		log.info("Received request to fetch IndustryCategoryType by source: {}", source);

		if (source == null || source.trim().isEmpty()) {
			log.warn("Invalid source received: {}", source);
			return ResponseEntity.badRequest().build();
		}

		List<IndustryCategoryType> industryCategoryTypes = companyDetailsService.fetchIndustryCategoryTypeBySource(source);

		if (industryCategoryTypes == null || industryCategoryTypes.isEmpty()) {
			log.info("No IndustryCategoryType found for source: {}", source);
			return ResponseEntity.noContent().build();
		}

		log.info("Successfully fetched {} IndustryCategoryType(s) for source: {}", industryCategoryTypes.size(), source);
		return ResponseEntity.ok(industryCategoryTypes);
	}

	@PatchMapping(value = "/unlinkDnbMatchDetails/{entityId}")
	public ResponseEntity<String> unlinkDnbMatchDetails(@PathVariable("entityId") Integer entityId) {
		log.info("Requesting for unlinkDnbMatchDetails for entityId : {}", entityId);
		ResponseEntity<String> response = entityDetailsService.unlinkDnbMatchDetails(entityId);
		try {
			elasticSyncOperation.initiateSyncForElasticQueueRequest(entityId.toString(), Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
		} catch (Exception e) {
			log.info("Exception in elastic sync in /update ", e.getMessage());
		}
		return response;
	}

	@PostMapping("/create/dunsRefreshVersion/{entityId}/{entityNumber}")
	public ResponseEntity<Object> createDunsRefreshVersion(@PathVariable("entityId") Integer entityId, @PathVariable("entityNumber") Integer entityNumber) {
		log.info("createDunsRefreshVersion Request : entityId {} || entityNumber {} ", entityId, entityNumber);
		ResponseEntity<Object> response = entityDetailsService.createDunsRefreshVersion(entityId, entityNumber);
		return response;
	}

	@PostMapping(value = "/verify/{entityId}/fromDunsMonitoring")
	public void verifyEntityFromDunsMonitoring(@PathVariable("entityId") Integer entityId) {
		log.info("Requesting for verifyEntityFromDunsMonitoring {}", entityId);
		ResponseEntity<Map<String, Object>> response = globalEntityService.verifyEntityDetails(entityId, Boolean.TRUE);
		if (response.getStatusCode().is2xxSuccessful()) {
			globalEntityService.insertDunsMonitoringVerifyLog(entityId);
			globalEntityService.processEntityMessageToQ(entityId);
			globalEntityService.processEntityMessageToGraphSyncQ(entityId);
			try {
				globalEntityService.updateEntityForeignFlag(entityId);
				globalEntityService.updateEntityElastic(entityId);
			} catch (Exception e) {
				log.info("Exception in elastic sync in /verify/{}/fromDunsMonitoring {} ", entityId, e.getMessage());
			}
		}
	}
}
