package com.polus.fibicomp.opa.controller;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.constants.Constants;

import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.coi.exception.DisclosureValidationException;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.PersonEntityService;
import com.polus.fibicomp.opa.dto.CreateOpaDto;
import com.polus.fibicomp.opa.dto.OPAAssignAdminDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPASubmitDto;
import com.polus.fibicomp.opa.service.OPAService;

@RestController
@RequestMapping("/opa")
public class OPAController {

	protected static Logger logger = LogManager.getLogger(OPAController.class.getName());

	@Autowired
	private OPAService opaService;

	@Autowired
	private UserDocumentAuthorization documentAuthorization;

	@Autowired
	private ActionLogService actionLogService;

	@Autowired
	private PersonEntityService personEntityService;

	@PostMapping("/createOPA")
	public ResponseEntity<Object> createOPADisclosure(@RequestBody CreateOpaDto dto) {
		logger.info("Request for createOPADisclosure | personId: {}", dto.getPersonId());
		try {
			if (Boolean.TRUE.equals(opaService.canCreateOpaDisclosure(dto.getPersonId()))) {
				ResponseEntity<Object> response = opaService.createOpaDisclosure(dto.getPersonId());
				OPACommonDto opaDetails = (OPACommonDto) response.getBody();
				opaService.updateSebbatical(AuthenticatedUser.getLoginPersonId(), opaDetails.getOpaDisclosureId());
				return response;
			} else {
				return new ResponseEntity<>("Person has no right/entry to create OPA", HttpStatus.NO_CONTENT);
			}
		} catch (DisclosureValidationException ex) {
			logger.warn("Unable to Create OPA Disclosure : {}", ex.getMessage());
			return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_ACCEPTABLE);
		} catch (Exception ex) {
			logger.error("Unexpected error while creating disclosure: {}", ex.getMessage(), ex);
			return new ResponseEntity<>("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PatchMapping("/submit")
	public ResponseEntity<Object> submitOPADisclosure(@RequestBody OPASubmitDto opaSubmitDto) {
		try {
			logger.info("Request for submitOPADisclosure");
			return opaService.submitOPADisclosure(opaSubmitDto);
		} catch (DisclosureValidationException ex) {
			logger.warn("Unable to Submit OPA Disclosure : {}", ex.getMessage());
			return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_ACCEPTABLE);
		}
	}

	@PatchMapping("/withdraw")
	public ResponseEntity<Object> withdrawOPADisclosure(@RequestBody OPACommonDto opaCommonDto) {
		logger.info("Request for withdrawOPADisclosure");
		return opaService.withdrawOPADisclosure(opaCommonDto);
	}

	@PatchMapping("/return")
	public ResponseEntity<Object> returnOPADisclosure(@RequestBody OPACommonDto opaCommonDto) {
		logger.info("Request for returnOPADisclosure");
		return opaService.returnOPADisclosure(opaCommonDto);
	}

	@PatchMapping("/assignAdmin")
	public ResponseEntity<Object> assignAdminOPADisclosure(@RequestBody OPAAssignAdminDto assignAdminDto) {
		logger.info("Request for assignAdminOPADisclosure");
		return opaService.assignAdminOPADisclosure(assignAdminDto);
	}

	@PatchMapping("/complete")
	public ResponseEntity<Object> completeOPADisclosure(@RequestBody OPACommonDto opaCommonDto) {
		logger.info("Request for completeOPADisclosure");
		return opaService.completeOPADisclosure(opaCommonDto.getOpaDisclosureId(), opaCommonDto.getOpaDisclosureNumber(), opaCommonDto.getDescription(), null);
	}

	@GetMapping("/getOPADisclosureHeader/{opaDisclosureId}")
	public ResponseEntity<Object> getOPADisclosure(@PathVariable("opaDisclosureId") Integer opaDisclosureId) {
		logger.info("Request for getOPADisclosure");
		if (!documentAuthorization.isAuthorized(Constants.OPA_MODULE_CODE, opaDisclosureId.toString(), AuthenticatedUser.getLoginPersonId())) {
			return new ResponseEntity<>("Not Authorized to view this Disclosure",HttpStatus.FORBIDDEN);
		}
		return opaService.getOPADisclosure(opaDisclosureId);
	}

	@PostMapping("/dashboard")
	public ResponseEntity<Object> dashboard(@RequestBody OPADashboardRequestDto requestDto) {
		logger.info("Request for opa dashboard");
		return opaService.getOPADashboard(requestDto);
	}
	
	@PostMapping("/getOPADashboardTabCount")
	public ResponseEntity<Object> getOPADashboardTabCount(@RequestBody OPADashboardRequestDto requestDto) {
		logger.info("Request for opa dashboardCount");
		return opaService.getOPADashboardTabCount(requestDto);
	}

	@GetMapping("/opaDisclosureHistory/{opaDisclosureId}")
	public ResponseEntity<Object> geOpatDisclosureHistoryById(@PathVariable("opaDisclosureId") Integer opaDisclosureId) {
		return actionLogService.getOpaDisclosureHistoryById(opaDisclosureId);
	}

	@GetMapping("/getOpaPersonType")
	public ResponseEntity<Object> getOpaPersonType() {
		return opaService.getOpaPersonType();
	}

	@GetMapping("/evaluateOPAQuestionnaire/{personEntityId}")
	public Map<String, String> evaluateOPAQuestionnaire(@PathVariable("personEntityId") Integer personEntityId) {
		Map<String, String> response = opaService.evaluateOPAQuestionnaire(personEntityId);
		return response;
	}

	@PostMapping("/reviseOPA")
	public ResponseEntity<Object> reviseOPADisclosure(@RequestBody OPACommonDto dto) {
		logger.info("Request to revise OPA Disclosure with ID: {}, Number: {} and Home Unit: {}",
				dto.getOpaDisclosureId(), dto.getOpaDisclosureNumber(), dto.getHomeUnit());
		try {
			ResponseEntity<Object> response = opaService.reviseOpaDisclosure(dto);
			OPACommonDto opaDetails = (OPACommonDto) response.getBody();
			opaService.updateSebbatical(AuthenticatedUser.getLoginPersonId(), opaDetails.getOpaDisclosureId());
			return response;
		} catch (DisclosureValidationException ex) {
			logger.warn("Unable to Revise OPA Disclosure : {}", ex.getMessage());
			return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_ACCEPTABLE);
		} catch (Exception ex) {
			logger.error("Unexpected error while revising disclosure: {}", ex.getMessage(), ex);
			return new ResponseEntity<>("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/validateOPA/{disclosureId}")
	public List<COIValidateDto> validateOPA(@PathVariable("disclosureId") String disclosureId) {
		return opaService.validateOPA(disclosureId);
	}
}
