package com.polus.fibicomp.disclosures.consultingdisclosure.controller;

import com.polus.core.security.AuthenticatedUser;
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
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclAssignAdminDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclCommonDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclCreatetDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclSubmitDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.service.ConsultingDisclosureService;

@RestController
@RequestMapping("/consultingDisclosure")
public class ConsultingDisclController {

	protected static Logger logger = LogManager.getLogger(ConsultingDisclController.class.getName());

	@Autowired
	private ConsultingDisclosureService consultDisclService;

	@Autowired
	private UserDocumentAuthorization documentAuthorization;

	@Autowired
	private ActionLogService actionLogService;

	@PostMapping("/create")
	public ResponseEntity<Object> createConsultingDisclosure(@RequestBody ConsultDisclCreatetDto dto) {
		logger.info("Request for createConsultingDisclosure");
		return consultDisclService.createConsultingDisclosure(dto.getPersonId(), dto.getHomeUnit());
	}

	@PatchMapping("/saveEntityDetails")
	public ResponseEntity<Object> saveEntityDetails(@RequestBody ConsultDisclCommonDto dto) {
		logger.info("Request for saveEntityDetails");
		return consultDisclService.saveEntityDetails(dto);
	}

	@PatchMapping("/submit")
	public ResponseEntity<Object> submitConsultingDisclosure(@RequestBody ConsultDisclSubmitDto dto) {
		logger.info("Request for submitConsultingDisclosure");
		return consultDisclService.submitConsultingDisclosure(dto);
	}

	@PatchMapping("/withdraw")
	public ResponseEntity<Object> withdrawConsultingDisclosure(@RequestBody ConsultDisclCommonDto dto) {
		logger.info("Request for withdrawConsultingDisclosure");
		return consultDisclService.withdrawConsultingDisclosure(dto);
	}

	@PatchMapping("/return")
	public ResponseEntity<Object> returnConsultingDisclosure(@RequestBody ConsultDisclCommonDto dto) {
		logger.info("Request for returnConsultingDisclosure");
		return consultDisclService.returnConsultingDisclosure(dto);
	}

	@PatchMapping("/assignAdmin")
	public ResponseEntity<Object> assignAdminConsultingDisclosure(@RequestBody ConsultDisclAssignAdminDto dto) {
		logger.info("Request for assignAdminConsultingDisclosure");
		return consultDisclService.assignAdminConsultingDisclosure(dto);
	}

	@PatchMapping("/complete/{disclosureId}")
	public ResponseEntity<Object> completeConsultingDisclosure(@PathVariable("disclosureId") Integer disclosureId) {
		logger.info("Request for completeConsultingDisclosure");
		return consultDisclService.completeConsultingDisclosure(disclosureId);
	}

	@GetMapping("/getDisclosureHeader/{disclosureId}")
	public ResponseEntity<Object> getConsultingDisclosure(@PathVariable("disclosureId") Integer disclosureId) {
		logger.info("Request for getConsultingDisclosure");
		if (!documentAuthorization.isAuthorized(Constants.CONSULT_DISCL_MODULE_CODE, disclosureId.toString(), AuthenticatedUser.getLoginPersonId())) {
			return new ResponseEntity<>("Not Authorized to view this Disclosure",HttpStatus.FORBIDDEN);
		}
		return consultDisclService.getConsultingDisclosure(disclosureId);
	}

	@GetMapping("/history/{disclosureId}")
	public ResponseEntity<Object> getConsultingDisclosureHistoryById(@PathVariable("disclosureId") Integer disclosureId) {
		return actionLogService.getConsultingDisclosureHistoryById(disclosureId);
	}

}
