package com.polus.fibicomp.coi.controller;

import java.math.BigDecimal;
import java.util.HashMap;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.EngagementsDetailsDTO;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.PersonEntityService;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;
import com.polus.fibicomp.matrix.service.MatrixService;
import com.polus.fibicomp.opa.service.OPAService;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/personEntity")
public class PersonEntityCtrl {

    protected static Logger logger = LogManager.getLogger(PersonEntityCtrl.class.getName());

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private PersonEntityService personEntityService;

    @Autowired
    private UserDocumentAuthorization documentAuthorization;

    @Autowired
	@Qualifier(value = "globalEntityService")
	private GlobalEntityService globalEntityService;

    @Autowired
    @Qualifier(value = "conflictOfInterestDao")
    private ConflictOfInterestDao conflictOfInterestDao;

    @Autowired
    private MatrixService matrixService;

    @Autowired
	private OPAService opaService;

    @PostMapping
    public ResponseEntity<Object> createSFI(@RequestBody PersonEntity personEntity) {
        logger.info("Requesting for createSFI");
        ResponseEntity<Object> response = personEntityService.createPersonEntity(personEntity);
        globalEntityService.processEntityMessageToGraphSyncQ(personEntity.getEntityId());
        return response;
    }

    @PostMapping("/addRelationship")
    public ResponseEntity<Object> saveCoiFinancialEntityDetails(@RequestBody PersonEntityRelationship vo) {
        logger.info("Request for saveOrUpdateCoiFinancialEntityDetails");
        PersonEntityDto personEntityDto = personEntityService.saveOrUpdatePersonEntityRelationship(vo);
        String message = personEntityDto.getMessage();
        if (message == null || message.isEmpty()) {
        	PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(vo.getPersonEntityId());
        	globalEntityService.processEntityMessageToGraphSyncQ(personEntity.getEntityId());
        } else {
        	return new ResponseEntity<>(message, HttpStatus.METHOD_NOT_ALLOWED);
        }
        return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
    }

    @GetMapping("/{personEntityId}")
    public ResponseEntity<Object> getPersonEntityDetails(@PathVariable("personEntityId") Integer personEntityId) {
        logger.info("Requesting for getPersonEntityDetails");
        if (!documentAuthorization.isAuthorized(Constants.COI_MODULE_CODE, String.valueOf(personEntityId), AuthenticatedUser.getLoginPersonId(),
                Constants.COI_SFI_SUBMODULE_CODE, null)) {
            return new ResponseEntity<>("Not Authorized to view this Disclosure", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(personEntityService.getPersonEntityDetails(personEntityId), HttpStatus.OK);
    }

    @PostMapping(value = "/dashboard")
    public ResponseEntity<Object> getPersonEntityDashboard(@RequestBody CoiDashboardVO vo) {
        logger.info("Requesting for getPersonEntityDetails");
        return personEntityService.getPersonEntityDashboard(vo);
    }

    @PutMapping
    public ResponseEntity<Object> updatePersonEntity(@RequestBody PersonEntityDto personEntityDto) {
        return new ResponseEntity<>(personEntityService.updatePersonEntity(personEntityDto), HttpStatus.OK);
    }

    @DeleteMapping("/relationship/{personEntityRelId}/{personEntityId}")
    public ResponseEntity<Object> deletePersonEntityRelationship(@PathVariable(name = "personEntityRelId") Integer personEntityRelId,
                                                                 @PathVariable(name = "personEntityId") Integer personEntityId) {
        return personEntityService.deletePersonEntityRelationship(personEntityRelId, personEntityId);
    }

    @PutMapping("/activateInactivate")
    public ResponseEntity<Object> activateOrInactivatePersonEntity(@RequestBody PersonEntityDto personEntityDto) {
        return personEntityService.activateOrInactivatePersonEntity(personEntityDto);
    }

    @DeleteMapping("/{personEntityId}")
    public ResponseEntity<PersonEntityDto>deletePersonEntity(@PathVariable("personEntityId") Integer personEntityId) {
        ResponseEntity<PersonEntityDto> response = personEntityService.deletePersonEntity(personEntityId);
        if (response.getStatusCode().is2xxSuccessful()) {
            globalEntityService.processEntityMessageToGraphSyncQ(response.getBody().getEntityId());
        }
        return response;
    }

    @PostMapping("/getRelationship")
    public ResponseEntity<Object> getPersonEntityRelationship(@RequestBody ConflictOfInterestVO vo) {
        logger.info("Requesting for getPersonEntityRelationship");
        if (!documentAuthorization.isAuthorized(Constants.COI_MODULE_CODE, String.valueOf(vo.getPersonEntityId()), AuthenticatedUser.getLoginPersonId(),
                Constants.COI_SFI_SUBMODULE_CODE, null)) {
            return new ResponseEntity<>("Not Authorized to view this Disclosure", HttpStatus.FORBIDDEN);
        }
        return personEntityService.getPersonEntityRelationship(vo);
    }

    @GetMapping("/{personEntityNumber}/latestVersion")
    public ResponseEntity<Object> getSFILatestVersion(@PathVariable("personEntityNumber") Integer personEntityNumber) {
        return personEntityService.getSFILatestVersion(personEntityNumber);
    }

    @GetMapping("/versions/{personEntityNumber}")
    public ResponseEntity<Object> getAllPersonEntityVersions(@PathVariable("personEntityNumber") Integer personEntityNumber) {
        logger.info("Requesting for getAllPersonEntityVersions");
        return personEntityService.getAllPersonEntityVersions(personEntityNumber);
    }

    @PostMapping("/history")
    public ResponseEntity<Object> fetAllPersonEntityActionLog(@RequestBody PersonEntityDto personEntityDto) {
        logger.info("Requesting for fetAllPersonEntityActionLog");
        return actionLogService.getAllPersonEntityActionLog(personEntityDto);
    }

    @PatchMapping("/checkFormCompleted/{personEntityId}")
	public ResponseEntity<Map<String, Object>> updatePersonEntityCompleteFlag(@PathVariable("personEntityId") Integer personEntityId) {
		logger.info("Requesting for updatePersonEntityCompleteFlag");
		Map<String, String> opaEvalResult = opaService.evaluateOPAQuestionnaire(personEntityId);
		Map<String, Object> martixEvalResult = matrixService.checkMatrixCompletedAndEvaluate(personEntityId);
		Boolean sfiEvalResult = (Boolean) personEntityService.evaluateSfi(personEntityId).get("isSFI");
		ResponseEntity<Map<String, Object>> formCompleteResponse = personEntityService.updatePersonEntityCompleteFlag(personEntityId);
	    Map<String, Object> finalResponse = new HashMap<>();
	    if (formCompleteResponse.getBody() != null) {
	    	finalResponse.putAll(formCompleteResponse.getBody());
	    }
	    finalResponse.put("opaEvalResult", opaEvalResult);
	    finalResponse.put("matrixEvalResult", martixEvalResult);
	    finalResponse.put("sfiEvalResult", sfiEvalResult);
	    return new ResponseEntity<>(finalResponse, HttpStatus.OK);
	}

    @PostMapping("/fetch")
    public ResponseEntity<Object> getSFIOfDisclosure(@RequestBody ConflictOfInterestVO vo) {
        logger.info("Requesting for getSFIOfDisclosure");
        return personEntityService.getSFIOfDisclosure(vo);
    }

    @GetMapping("/details/{coiFinancialEntityId}")
    public ResponseEntity<Object> getSFIDetails(@PathVariable("coiFinancialEntityId") Integer coiFinancialEntityId) {
        logger.info("Requesting for getSFIDetails");
        return personEntityService.getSFIDetails(coiFinancialEntityId);
    }

    @PostMapping("/modify")
    public ResponseEntity<Object> modifyPersonEntity( @RequestBody PersonEntityDto personEntityDto) {
        logger.info("Requesting for modifyPersonEntity");
        ResponseEntity<Object> response = personEntityService.modifyPersonEntity(personEntityDto);
        personEntityService.markAsIncomplete(personEntityDto.getPersonEntityId());
        return response;
    }

    @GetMapping("/fetchPerEntDisclTypeSelection/{personEntityId}")
    public ResponseEntity<Object> fetchPerEntDisclTypeSelection(@PathVariable("personEntityId") Integer personEntityId) {
        log.info("Requesting for fetchPerEntDisclTypeSelection, personEntityId {}", personEntityId);
        return new ResponseEntity<Object>(personEntityService.fetchPerEntDisclTypeSelection(personEntityId), HttpStatus.OK); 
    }

    @DeleteMapping("/unifiedRelationship/{perEntDisclTypeSelectedId}/{personEntityId}")
    public ResponseEntity<Object> deletePerEntRelationshipByDisclType(@PathVariable Integer perEntDisclTypeSelectedId, @PathVariable Integer personEntityId) {
        logger.info("Request of unifiedRelationship | perEntDisclTypeSelectedId {} : personEntityId {}",perEntDisclTypeSelectedId, personEntityId);
        EngagementsDetailsDTO engDetailsDTO = new EngagementsDetailsDTO();
        engDetailsDTO.setPerEntDisclTypeSelectedId(perEntDisclTypeSelectedId);
        engDetailsDTO.setPersonEntityId(personEntityId);
    	PersonEntityDto personEntityDto = personEntityService.deletePerEntRelationshipByDisclType(engDetailsDTO);
        if (personEntityDto.getMessage() != null) {
        	return new ResponseEntity<>(personEntityDto.getMessage(), HttpStatus.METHOD_NOT_ALLOWED);
        }
        return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
    }

    @PostMapping("/updateEngRelation")
	public ResponseEntity<Object> updateEngRelation(@RequestBody EngagementsDetailsDTO engDetailsDTO) {
		logger.info("Received request to update engagement-financial relationship | person entity id : {}",
				engDetailsDTO.getUpdatePersonEntityDto().getPersonEntityId());
		ResponseEntity<Object> response = personEntityService.updateEngRelation(engDetailsDTO);
		return response;
	}

    @PostMapping("/updatePersonEntityUpdateDetails")
	public void updatePersonEntityUpdateDetails(@RequestBody Integer personEntityId) {
		logger.info("Received request to modify update details of person entity id : {}", personEntityId);
        personEntityService.updatePersonEntityUpdateDetails(personEntityId);
	}

    @PostMapping("/compensationAmount")
	public void updatePersonEntityCompensationAmount(@RequestBody PersonEntityDto personEntityDto) {
    	log.info("Received request to update compensation amount of person entity id : {}", personEntityDto.getPersonEntityId());
        personEntityService.updatePersonEntityCompensationAmount(personEntityDto.getPersonEntityId(), personEntityDto.getCompensationAmount());
	}

    @GetMapping("/compensationAmount/{personEntityId}")
    public ResponseEntity<BigDecimal> fetchCompensationAmount(@PathVariable("personEntityId") Integer personEntityId) {
        log.info("Requesting for fetchCompensationAmount, personEntityId {}", personEntityId);
        return new ResponseEntity<>(personEntityService.fetchCompensationAmount(personEntityId), HttpStatus.OK); 
    }

    @GetMapping("/evaluateSfi/{personEntityId}")
	public ResponseEntity<Boolean> evaluateSfi(@PathVariable("personEntityId") Integer personEntityId) {
		log.info("Requesting for evaluateSfi, personEntityId {}", personEntityId);
		return new ResponseEntity<>((Boolean) personEntityService.evaluateSfi(personEntityId).get("isSFI"),
				HttpStatus.OK);
	}

}
