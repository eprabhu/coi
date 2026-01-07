package com.polus.fibicomp.fcoiDisclosure.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.PersonEntityRelationshipDto;
import com.polus.fibicomp.coi.exception.DisclosureValidationException;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProposalIntegrationNotifiyDto;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/fcoiDisclosure")
public class DisclosureController {

    @Autowired
    private ConflictOfInterestService conflictOfInterestService;

    @Autowired
    private FcoiDisclosureService disclosureService;

    @Autowired
    private UserDocumentAuthorization documentAuthorization;

    //  createDisclosure
    @PostMapping
    public ResponseEntity<Object> createDisclosure(@RequestBody CoiDisclosureDto vo) throws JsonProcessingException {
        log.info("Request for createDisclosure");
        try {
        	return disclosureService.createDisclosure(vo);
        } catch(DisclosureValidationException ex) {
        	log.warn("Disclosure validation failed: {}", ex.getMessage());
        	return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_ACCEPTABLE);
        } catch(Exception ex) {
        	log.error("Unexpected error while creating disclosure: {}", ex.getMessage(), ex);
            return new ResponseEntity<>("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    //  loadDisclosure
    @GetMapping("/fetch/{disclosureId}")
    public ResponseEntity<Object> loadDisclosure(@PathVariable("disclosureId") Integer disclosureId) {
        log.info("Request for loadDisclosure");
        if (!documentAuthorization.isAuthorized(Constants.COI_MODULE_CODE, disclosureId.toString(), AuthenticatedUser.getLoginPersonId())) {
            return new ResponseEntity<>("Not Authorized to view this Disclosure", HttpStatus.FORBIDDEN);
        }
        return disclosureService.loadDisclosure(disclosureId);
    }

    @PatchMapping("/certifyDisclosure")
    public ResponseEntity<Object> certifyDisclosure(@RequestBody CoiDisclosureDto coiDisclosureDto) {
        log.info("Requesting for certifyDisclosure");
        return disclosureService.certifyDisclosure(coiDisclosureDto);
    }

    @PostMapping("/project/relations")
    public ResponseEntity<Object> getDisclosureProjectRelations(@RequestBody ProjectEntityRequestDto vo) throws JsonProcessingException {
        log.info("Requesting for /project/relations");
        List<DisclosureProjectDto> disclProjects = disclosureService.getDisclProjectEntityRelations(vo);
        if (disclProjects.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(getObjectMapper().writeValueAsString(disclProjects), HttpStatus.OK);
    }

    @PostMapping("/extendedProject/relations")
    public ResponseEntity<Object> getExtendedDisclosureProjectRelations(@RequestBody ProjectEntityRequestDto vo) throws JsonProcessingException {
        log.info("Requesting for /extendedProject/relations");
        List<DisclosureProjectDto> disclProjects = disclosureService.getExtendedDisclProjectEntityRelations(vo);
        if (disclProjects.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(getObjectMapper().writeValueAsString(disclProjects), HttpStatus.OK);
    }

    @PostMapping("/entity/relations")
    public ResponseEntity<Object> getDisclosureEntityRelations(@RequestBody ProjectEntityRequestDto vo) throws JsonProcessingException {
        log.info("Requesting for /entity/relations");
        List<PersonEntityRelationshipDto> disclPersonEntities = disclosureService.getDisclosureEntityRelations(vo);
        if (disclPersonEntities.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(getObjectMapper().writeValueAsString(disclPersonEntities), HttpStatus.OK);
    }

    public ObjectMapper getObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        return objectMapper;
    }

    @PostMapping("/relation/conflict")
    public ResponseEntity<Object> applyAllDisclosureConflict(@RequestBody ProjectEntityRequestDto vo) {
        log.info("Requesting for saveEntityProjectRelation");
        return disclosureService.saveDisclosureConflict(vo);
    }

    @PostMapping("/reviseDisclosure")
    public ResponseEntity<Object> reviseDisclosure(@RequestBody ConflictOfInterestVO vo) {
        log.info("Requesting for reviseDisclosure");
        try {
        	return disclosureService.reviseDisclosure(vo);
        } catch(DisclosureValidationException ex) {
        	log.warn("reviseDisclosure validation failed: {}", ex.getMessage());
        	return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_ACCEPTABLE);
        } catch(Exception ex) {
        	log.error("Unexpected error while creating reviseDisclosure: {}", ex.getMessage(), ex);
            return new ResponseEntity<>("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/historyDashboard")
    public ResponseEntity<Object> getDisclosureHistory(@RequestBody CoiDashboardVO dashboardVO) {
        return conflictOfInterestService.getDisclosureHistory(dashboardVO);
    }

    @PutMapping("/modifyRisk")
    public ResponseEntity<Object> modifyRisk(@RequestBody CoiDisclosureDto disclosureDto) {
        return disclosureService.modifyDisclosureRisk(disclosureDto);
    }

    @GetMapping("/risk")
    public ResponseEntity<Object> fetchAllDisclosureRisk() {
        return disclosureService.fetchAllDisclosureRisk();
    }

    @PostMapping("/history")
    public ResponseEntity<Object> fetchDisclosureHistory(@RequestBody DisclosureActionLogDto actionLogDto) {
        return disclosureService.fetchDisclosureHistory(actionLogDto);
    }

    @PostMapping("/riskStatus")
    public ResponseEntity<Object> checkRiskStatus(@RequestBody CoiDisclosureDto disclosureDto) {
        return disclosureService.checkDisclosureRiskStatus(disclosureDto);
    }

    @GetMapping("/projects/{disclosureId}")
    public ResponseEntity<Object>getDisclosureProjects(@PathVariable("disclosureId") Integer disclosureId) {
        return disclosureService.getDisclosureProjects(disclosureId);
    }

    @GetMapping("/lookups")
    public ResponseEntity<Object>getDisclosureLookups() {
        return disclosureService.getDisclosureLookups();
    }

    @PostMapping("/evaluateDisclosureQuestionnaire")
    public Boolean evaluateDisclosureQuestionnaire(@RequestBody ConflictOfInterestVO vo) {
        log.info("Request for evaluateDisclosureQuestionnaire");
        return disclosureService.evaluateDisclosureQuestionnaire(vo);
    }

    @PostMapping(value = "/updateProjectRelationship")
    public ResponseEntity<Object> updateProjectRelationship(@RequestBody ConflictOfInterestVO vo) {
        log.info("Request for updateProjectRelationship");
        return disclosureService.updateProjectRelationship(vo);
    }

    @GetMapping("/validateConflicts/{disclosureId}")
    public ResponseEntity<Object> validateConflicts(@PathVariable("disclosureId") Integer disclosureId) {
        log.info("Requesting for validateConflicts");
        return disclosureService.validateConflicts(disclosureId);
    }

    @PostMapping("/validate")
    public ResponseEntity<Object> validateDisclosure(@RequestBody CoiDisclosureDto disclosureDto) {
        return disclosureService.validateDisclosure(disclosureDto);
    }

    @PatchMapping("/assignAdmin")
    public ResponseEntity<Object> assignDisclosureAdmin(@RequestBody CoiDisclosureDto dto) {
        return disclosureService.assignDisclosureAdmin(dto);
    }

    @PostMapping("/sync")
    public void syncFCOIDisclosure(@RequestBody CoiDisclosureDto coiDisclosureDto) {
        disclosureService.syncFCOIDisclosure(coiDisclosureDto);
        conflictOfInterestService.updateOverallDisclosureStatus(null, coiDisclosureDto.getDisclosureId(), Constants.DISCLOSURE_TYPE_CODE_FCOI);
    }

	@PostMapping("/evaluateValidation")
	public ResponseEntity<Object> evaluateValidation(@RequestBody CoiDisclosureDto coiDisclosureDto) {
		log.info("Received request for evaluateValidation");

		try {
			if (coiDisclosureDto == null) {
				log.warn("Received null request body for evaluateValidation");
				return ResponseEntity.badRequest().body("Invalid request: Request body cannot be null");
			}

			coiDisclosureDto.setUpdateUser(AuthenticatedUser.getLoginUserName());
			coiDisclosureDto.setLogginPersonId(AuthenticatedUser.getLoginPersonId());

			log.info("Processing evaluateValidation for moduleCode: {}, subModuleCode: {}, moduleItemKey: {}, subModuleItemKey: {}, logginPersonId: {}, updateUser: {}",
					coiDisclosureDto.getModuleCode(), coiDisclosureDto.getSubModuleCode(),
					coiDisclosureDto.getModuleItemKey(), coiDisclosureDto.getSubModuleItemKey(),
					coiDisclosureDto.getLogginPersonId(), coiDisclosureDto.getUpdateUser());

			return disclosureService.evaluateValidation(coiDisclosureDto);
		} catch (Exception ex) {
			log.error("Error occurred while processing evaluateValidation: {}", ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
		}
	}

    @PutMapping("/integration/syncNeeded")
    public void updateFcoiDisclSyncNeedStatus(@RequestBody DisclosureProjectDto projectDto) {
        disclosureService.updateFcoiDisclSyncNeedStatus(projectDto);
    }

    @PutMapping("/integration/detachProject")
    public void detachFcoiDisclProject(@RequestBody DisclosureProjectDto projectDto) {
        disclosureService.detachFcoiDisclProject(projectDto);
    }

    @PostMapping("/integration/makeVoid")
    public void makeDisclosureVoid(@RequestBody IntegrationRequestDto integrationRequestDto) {
        disclosureService.makeDisclosureVoid(integrationRequestDto);
    }

    @PostMapping("/integration/notifyUserForDisclosureCreation")
    public void notifyUserForDisclosureCreation(@RequestBody IntegrationNotificationRequestDto vo) {
        log.info("Request for notifyUserForDisclosureCreation");
        disclosureService.notifyUserCreateDisclosure(vo);
    }

    @PostMapping("/requestWithdrawal")
    public ResponseEntity<Object> requestWithdrawal(@RequestBody ConflictOfInterestVO vo) {
        return disclosureService.requestWithdrawal(vo);
    }

    @PostMapping("/requestWithdrawal/deny")
    public ResponseEntity<Object> denyRequestWithdrawal(@RequestBody ConflictOfInterestVO vo) {
        return disclosureService.denyRequestWithdrawal(vo);
    }

    @GetMapping(value = {"/markProjectDisclosureAsVoid", "/markProjectDisclosureAsVoid/{moduleCode}"})
    public ResponseEntity<Object> markProjectDisclosureAsVoid(@PathVariable(value = "moduleCode", required = false) Integer moduleCode) {
    	return disclosureService.markProjectDisclosureAsVoid(moduleCode);
    }

	@GetMapping(value = {"/getProjectDisclosures", "/getProjectDisclosures/{moduleCode}"})
	public ResponseEntity<Object> getProjectDisclosures(@PathVariable(value = "moduleCode", required = false) Integer moduleCode) {
		log.info("Requesting getProjectDisclosures with moduleCode: {}", moduleCode);
		return disclosureService.getProjectDisclosures(moduleCode);
	}

	@GetMapping("/isDisclosureSynced/{disclosureId}/{documentOwnerId}")
	public ResponseEntity<Boolean> isDisclosureSynced(@PathVariable("disclosureId") Integer disclosureId,
            @PathVariable("documentOwnerId") String documentOwnerId) {
		log.info("Request for isDisclosureSynced, disclosureId: {}, documentOwnerId: {}", disclosureId, documentOwnerId);
		return new ResponseEntity<>(disclosureService.isDisclosureSynced(disclosureId, documentOwnerId), HttpStatus.OK);
	}

    @PostMapping("/integration/deleteUserInboxForDisclosureCreation")
    public void deleteUserInboxForDisclosureCreation(@RequestBody IntegrationNotificationRequestDto vo) {
        log.info("Request for deleteUserInboxForDisclosureCreation for projectNumber:{}", vo.getModuleItemKey());
        disclosureService.deleteUserInboxForDisclosureCreation(vo);
        if (vo.getInactivePersonIds() != null) {
        	disclosureService.notifyUserBasedOnAwardHierarchy(vo);
        }
    }

    @PostMapping("/integration/notifyUserForDisclSubmission")
    public void notifyUserForDisclSubmission(@RequestBody ProposalIntegrationNotifiyDto vo) {
        log.info("Request for notifyUserForDisclSubmission for proposal disclosureId: {}", vo.getDisclosureId());
        disclosureService.notifyUserForDisclSubmission(vo);
    }

	@GetMapping("/checkFinancialEngagementCreated")
	public ResponseEntity<Object> checkFinancialEngagementCreated() {
		String personId = AuthenticatedUser.getLoginPersonId();
		log.info("Request for checkFinancialEngagementCreated for person personId: {}", personId);
		return disclosureService.checkFinancialEngagementCreated(personId);
	}
	
	@GetMapping("/checkDisclCreationEligibility")
	public ResponseEntity<Object> checkDisclCreationEligibility() {
		String personId = AuthenticatedUser.getLoginPersonId();
		log.info("Requesting for getActiveProjects");
		return disclosureService.checkDisclCreationEligibility(personId);
	}

    @GetMapping("/getProjectDisclosureId/{projectType}/{personId}/{moduleItemKey}")
    public ResponseEntity<Object> getProjectDisclosureId(@PathVariable("projectType") String projectType,
                                                         @PathVariable("personId") String personId,
                                                         @PathVariable("moduleItemKey") String moduleItemKey) {
        log.info("Requesting for getProjectDisclosureId projectType: {} personId: {} moduleItemKey: {}", projectType, personId, moduleItemKey);
        return disclosureService.getProjectDisclosureId(projectType, personId, moduleItemKey);
    }

}
