package com.polus.fibicomp.cmp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.cmp.dto.CmpActionRequestDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanEntityRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanProjectRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanRecipientDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionCompDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionRelDto;
import com.polus.fibicomp.cmp.dto.CoiMgmtPlanAvailableActionDto;
import com.polus.fibicomp.cmp.dto.ProjectSummarySearchRequest;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;
import com.polus.fibicomp.cmp.service.CoiManagementPlanService;
import com.polus.fibicomp.coi.dto.ProjectSummaryDto;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/cmp/plan")
@RequiredArgsConstructor
@Slf4j
public class CoiManagementPlanController {

	private final CoiManagementPlanService planService;
	private final UserDocumentAuthorization documentAuthorization;
	private final ActionLogService actionLogService;

	@PostMapping
	public CoiManagementPlan createPlan(@RequestBody CoiManagementPlanDto request) {
		log.info("Request to create CMP | personId: {}, cmpType: {}", request.getPersonId(), request.getCmpTypeCode());
		return planService.createPlan(request);
	}

	@PutMapping
	public CoiManagementPlan updatePlan(@RequestBody CoiManagementPlanDto request) {
		log.info("Request to update CMP | cmpId: {}", request.getCmpId());
		return planService.updatePlan(request);
	}

	@DeleteMapping("/{cmpId}")
	public void deletePlan(@PathVariable Integer cmpId) {
		log.info("Request to delete CMP | cmpId: {}", cmpId);
		planService.deletePlan(cmpId);
	}

	@GetMapping("/{cmpId}")
	public ResponseEntity<Object> getPlanById(@PathVariable Integer cmpId) {
		log.info("Request to fetch CMP | cmpId: {}", cmpId);
		if (!documentAuthorization.isAuthorized(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE, cmpId.toString(),
				AuthenticatedUser.getLoginPersonId())) {
			return new ResponseEntity<>("Not Authorized to view this cmp", HttpStatus.FORBIDDEN);
		}
		return new ResponseEntity<>(planService.getPlanById(cmpId), HttpStatus.OK);
	}

	@GetMapping
	public List<CoiManagementPlan> getAllPlans() {
		log.info("Request to fetch all CMP plans");
		return planService.getAllPlans();
	}

	@PostMapping("/section/rel")
	public CoiManagementPlanSectionRelDto createSectionRel(@RequestBody CoiManagementPlanSectionRelDto dto) {
		log.info("Request to create CMP section relation | cmpId: {}, sectionName: {}", dto.getCmpId(),
				dto.getSectionName());
		return planService.createPlanSectionRel(dto);
	}

	@PutMapping("/section/rel")
	public CoiManagementPlanSectionRelDto updateSectionRel(@RequestBody CoiManagementPlanSectionRelDto dto) {
		log.info("Request to update CMP section relation | cmpSectionRelId: {}", dto.getCmpSectionRelId());
		return planService.updatePlanSectionRel(dto);
	}

	@DeleteMapping("/section/rel/{cmpSectionRelId}")
	public void deleteSectionRel(@PathVariable Integer cmpSectionRelId) {
		log.info("Request to delete CMP section relation | cmpSectionRelId: {}", cmpSectionRelId);
		planService.deletePlanSectionRel(cmpSectionRelId);
	}

	@PostMapping("/section/comp")
	public CoiManagementPlanSectionCompDto createSectionComp(@RequestBody CoiManagementPlanSectionCompDto dto) {
		log.info("Request to create CMP section component | cmpSectionRelId: {}", dto.getCmpSectionRelId());
		return planService.createPlanSectionComp(dto);
	}

	@PutMapping("/section/comp")
	public CoiManagementPlanSectionCompDto updateSectionComp(@RequestBody CoiManagementPlanSectionCompDto dto) {
		log.info("Request to update CMP section component | secCompId: {}", dto.getSecCompId());
		return planService.updatePlanSectionComp(dto);
	}

	@DeleteMapping("/section/comp/{secCompId}")
	public void deleteSectionComp(@PathVariable Integer secCompId) {
		log.info("Request to delete CMP section component | secCompId: {}", secCompId);
		planService.deletePlanSectionComp(secCompId);
	}

	@GetMapping("/{cmpId}/section/hierarchy")
	public Map<String, Object> getSectionHierarchy(@PathVariable Integer cmpId) {
		log.info("Request to fetch CMP section hierarchy | cmpId: {}", cmpId);
		return planService.getSectionHierarchyByCmpId(cmpId);
	}

	@PostMapping("/updateCmpstatus")
	public CoiManagementPlan updateCmpStatus(@RequestBody CmpActionRequestDto request) {
		log.info("Request to update CMP status | cmpId: {}", request.getCmpId());
		return planService.updateCmpStatus(request);
	}

	@GetMapping("/getAvailableActions/{cmpId}")
	public List<CoiMgmtPlanAvailableActionDto> getAvailableActions(@PathVariable Integer cmpId) {
		log.info("Request to fetch available CMP actions | cmpId: {}", cmpId);
		return planService.getAvailableActions(cmpId);
	}

	@GetMapping("/getCmpAttachTypes")
	public ResponseEntity<Object> getCmpAttachTypes() {
		log.info("Requesting for getCmpAttachTypes");
		return planService.getCmpAttachTypes();
	}

	@PostMapping("/section/comp/lock/{secCompId}")
	public ResponseEntity<?> lockSectionComponent(@PathVariable Integer secCompId) {
		String loginUser = AuthenticatedUser.getLoginPersonId();
		return planService.lockSectionComponent(secCompId, loginUser);
	}

	@DeleteMapping("/section/comp/lock/{secCompId}")
	public void unlockSectionComponent(@PathVariable Integer secCompId) {
		String loginUser = AuthenticatedUser.getLoginPersonId();
		planService.unlockSectionComponent(secCompId, loginUser);
	}

	@PutMapping("/section/comp/lock/refresh/{secCompId}")
	public ResponseEntity<?> refreshSectionCompLock(@PathVariable Integer secCompId) {
		String loginUser = AuthenticatedUser.getLoginPersonId();
		return planService.refreshSectionComponentLock(secCompId, loginUser);
	}

	@GetMapping("/{cmpId}/print")
	public ResponseEntity<Object> printCmp(@PathVariable Integer cmpId) {
		log.info("Request to print CMP document | cmpId: {}", cmpId);
		planService.printCmpDocument(cmpId, Boolean.FALSE);
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PostMapping("/{cmpId}/document/generate")
    public ResponseEntity<Void> generateDocument(@PathVariable Integer cmpId) {
		log.info("Request for generateDocument with id: {}", cmpId);
		planService.printCmpDocument(cmpId, Boolean.FALSE);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cmpId}/document/regenerate")
    public ResponseEntity<Void> regenerateDocument(@PathVariable Integer cmpId) {
		log.info("Request for regenerateDocument with id: {}", cmpId);
    	planService.printCmpDocument(cmpId, Boolean.TRUE);
        return ResponseEntity.ok().build();
    }

	@GetMapping("/{cmpId}/entity/rel")
	public List<CoiManagementPlanEntityRelDto> getEntityRelations(@PathVariable Integer cmpId) {
		log.info("Request to fetch CMP entity relations | cmpId: {}", cmpId);
		return planService.getEntityRelations(cmpId);
	}

	@GetMapping("/{cmpId}/project/rel")
	public List<CoiManagementPlanProjectRelDto> getProjectRelations(@PathVariable Integer cmpId) {
		log.info("Request to fetch CMP project relations | cmpId: {}", cmpId);
		return planService.getProjectRelations(cmpId);
	}

	@PostMapping("/project/summary")
	public List<ProjectSummaryDto> getProjectSummaries(@RequestBody ProjectSummarySearchRequest request) {
		String personId = AuthenticatedUser.getLoginPersonId();
		return planService.getProjectSummaryDetails(request.getModuleCode(), personId, request.getSearchString());
	}

	@GetMapping("/project/types")
	public ResponseEntity<?> getAllValidProjectTypes() {
		return ResponseEntity.ok(planService.getAllValidProjectTypes());
	}

	@GetMapping("/section/rel/{cmpSectionRelId}/history")
	public List<CoiMgmtPlanSecRelHist> getSectionRelHistory(@PathVariable Integer cmpSectionRelId) {
		return planService.getSectionRelHistory(cmpSectionRelId);
	}

	@GetMapping("/section/comp/{secCompId}/history")
	public List<CoiMgmtPlanSecCompHist> getSectionCompHistory(@PathVariable Integer secCompId) {
		return planService.getSectionCompHistory(secCompId);
	}

	@PostMapping("/recipient")
	public ResponseEntity<CoiManagementPlanRecipientDto> createRecipient(
			@RequestBody CoiManagementPlanRecipientDto dto) {
		return ResponseEntity.ok(planService.createRecipient(dto));
	}

	@PutMapping("/recipient")
	public ResponseEntity<CoiManagementPlanRecipientDto> updateRecipient(
			@RequestBody CoiManagementPlanRecipientDto dto) {
		return ResponseEntity.ok(planService.updateRecipient(dto));
	}

	@GetMapping("/recipient/{cmpId}")
	public ResponseEntity<List<CoiManagementPlanRecipientDto>> getRecipients(@PathVariable Integer cmpId) {
		return ResponseEntity.ok(planService.getRecipientsByCmpId(cmpId));
	}

	@DeleteMapping("/recipient/{id}")
	public ResponseEntity<?> deleteRecipient(@PathVariable Integer id) {
		planService.deleteRecipient(id);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/history/{cmpId}")
	public ResponseEntity<Object> getCmpHistoryById(@PathVariable Integer cmpId) {
		return actionLogService.getCmpHistoryById(cmpId);
	}

}
