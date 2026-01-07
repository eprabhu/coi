package com.polus.fibicomp.coi.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import com.polus.fibicomp.coi.notification.log.vo.CoiNotificationLogService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.coi.clients.model.EmailNotificationDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.CoiEntityDto;
import com.polus.fibicomp.coi.dto.CompleteReivewRequestDto;
import com.polus.fibicomp.coi.dto.EvaluateFormRequestDto;
import com.polus.fibicomp.coi.dto.NotesDto;
import com.polus.fibicomp.coi.dto.NotificationBannerDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.dto.SearchDto;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.coi.pojo.EntityRelationship;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.coi.service.GeneralService;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.globalentity.pojo.Entity;

import lombok.extern.slf4j.Slf4j;;

@RestController
@Slf4j
public class ConflictOfInterestController {

	protected static Logger logger = LogManager.getLogger(ConflictOfInterestController.class.getName());

	@Autowired
	@Qualifier(value = "conflictOfInterestService")
	private ConflictOfInterestService conflictOfInterestService;

	@Autowired
	private GeneralService generalService;

	@Autowired
	private UserDocumentAuthorization documentAuthorization;

	@Autowired
	private ActionLogService actionLogService;

	@Autowired
	private FcoiDisclosureDao fcoiDisclosureDao;

    @Autowired
    private CoiNotificationLogService coiNotificationLogService;

	@GetMapping("hello")
	public ResponseEntity<String> hello() {
		return new ResponseEntity<>("Hello from COI", HttpStatus.OK);
	}

	@PostMapping(value = "/searchEntity")
	public List<Entity> searchEnitiy(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for searchEntity");
		return conflictOfInterestService.searchEntity(vo);
	}

	@GetMapping("/loadSFILookups")
	public ResponseEntity<Object> loadSFILookups() {
		logger.info("Requesting for loadSFILookups");
		return conflictOfInterestService.loadAddSFILookups();
	}

	@GetMapping("/getDisclosureDetailsForSFI/{coiFinancialEntityId}")
	public ResponseEntity<Object> getDisclosureDetailsForSFI(
			@PathVariable("coiFinancialEntityId") Integer coiFinancialEntityId) {
		logger.info("Requesting for getDisclosureDetailsForSFI");
		logger.info("Coi Financial Entity Id : {}", coiFinancialEntityId);
		return conflictOfInterestService.getDisclosureDetailsForSFI(coiFinancialEntityId);
	}

	@PostMapping("/saveOrUpdateCoiReview")
	public ResponseEntity<Object> saveOrUpdateCoiReview(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for saveOrUpdateCoiReview");
		return conflictOfInterestService.saveOrUpdateCoiReview(vo);
	}

	@PostMapping("/getCoiReview")
	public List<CoiReview> getCoiReview(@RequestBody CoiDisclosureDto disclosureDto) {
		logger.info("Requesting for getCoiReview");
		return conflictOfInterestService.getCoiReview(disclosureDto);
	}

	@PostMapping("/startCOIReview")
	public ResponseEntity<Object> startReview(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Request for startReview");
		return conflictOfInterestService.startReview(vo);
	}

	@PostMapping("/completeCOIReview")
	public ResponseEntity<Object> completeReview(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Request for CompleteReview");
		return conflictOfInterestService.completeReview(vo);
	}

	@DeleteMapping(value = "/deleteReview/{coiReviewId}")
	public ResponseEntity<Object> deleteReview(@PathVariable(value = "coiReviewId", required = true) final Integer coiReviewId) {
		logger.info("Requesting for deleteReview");
		return conflictOfInterestService.deleteReview(coiReviewId);
	}

	@DeleteMapping(value = "/deleteCOIReviewCommentTags/{coiReviewCommentTagId}")
	public String deleteReviewCommentTag(@PathVariable(value = "coiReviewCommentTagId", required = true) final Integer coiReviewCommentTagId) {
		logger.info("Requesting for deleteReviewCommentTag");
		return conflictOfInterestService.deleteReviewCommentTag(coiReviewCommentTagId);
	}

	@PostMapping("/completeDisclosureReview")
	public ResponseEntity<Object> completeDisclosureReview(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Request for completeDisclosureReview");
		return conflictOfInterestService.completeDisclosureReview(vo.getDisclosureId(), vo.getDisclosureNumber(), vo.getDescription());
	}

	@PatchMapping("/completeDisclosureReviews")
	public ResponseEntity<Object> completeDisclosureReviews(@RequestBody List<CompleteReivewRequestDto> requestDto) {
		logger.info("Request for completeDisclosureReviews");
		return conflictOfInterestService.completeDisclosureReviews(requestDto);
	}
	
	@GetMapping("/loadProjectConflictHistory/{disclosureDetailsId}")
	public List<CoiConflictHistory> getCoiConflictHistory(@PathVariable("disclosureDetailsId") Integer disclosureDetailsId) {
		logger.info("Request for getCoiConflictHistory");
		return conflictOfInterestService.getCoiConflictHistory(disclosureDetailsId);
	}

	@PostMapping(value = "/loadProposalsForDisclosure")
	public String loadProposalsForDisclosure(@RequestBody SearchDto searchDto) {
		logger.info("Request for loadProposalsForDisclosure");
		logger.info("searchString : {}", searchDto.getSearchString());
		return conflictOfInterestService.loadProposalsForDisclosure(searchDto.getSearchString());
	}

	@PostMapping(value = "/loadAwardsForDisclosure")
	public String loadAwardsForDisclosure(@RequestBody SearchDto searchDto) {
		logger.info("Request for loadAwardsForDisclosure");
		logger.info("searchString : {}", searchDto.getSearchString());
		return conflictOfInterestService.loadAwardsForDisclosure(searchDto.getSearchString());
	}

	@PostMapping(value = "/loadDisclosureHistory")
	public String loadDisclosureHistory(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Request for loadDisclosureHistory");
		logger.info("DisclosureNumber : {}", vo.getDisclosureNumber());
		return conflictOfInterestService.loadDisclosureHistory(vo);
	}
	
	@PostMapping(value = "/saveOrUpdateEntity")
	public ResponseEntity<Object> saveOrUpdateEntity(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for createEntity");
		return conflictOfInterestService.saveOrUpdateEntity(vo);
	}
	
	@GetMapping("/getEntityDetails/{coiEntityId}")
	public ResponseEntity<Object> getEntityDetails(@PathVariable("coiEntityId") Integer coiEntityId) {
		logger.info("Requesting for getEntityDetails");
		return conflictOfInterestService.getEntityDetails(coiEntityId);
	}
	
	@GetMapping("/getActiveDisclosures")
	public ResponseEntity<Object> getActiveDisclosure() {
		logger.info("Requesting for getActiveDisclosure");
		return conflictOfInterestService.getActiveDisclosure();
	}
	
	@PostMapping(value = "/getCOIDashboard")
	public String getCOIDashboard(@Valid @RequestBody CoiDashboardVO vo, HttpServletRequest request) {
		logger.info("Requesting for getCOIDashboard");
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		return conflictOfInterestService.getCOIDashboard(vo);
	}

	@PostMapping(value = "/getCOIAdminDashboard")
	public String getCOIAdminDashboard(@Valid @RequestBody CoiDashboardVO vo, HttpServletRequest request) {
		logger.info("Requesting for getCOIAdminDashboard");
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		return conflictOfInterestService.getCOIAdminDashboard(vo);
	}
	
	@PostMapping(value = "/getTabCount")
	public String getCOIDashboardCount(@Valid @RequestBody CoiDashboardVO vo, HttpServletRequest request) {
		logger.info("Requesting for getTabCount");
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		return conflictOfInterestService.getCOIDashboardCount(vo);
	}
	
	@PostMapping(value = "/getAdminDashboardTabCount")
	public String getAdminDashboardTabCount(@Valid @RequestBody CoiDashboardVO vo, HttpServletRequest request) {
		logger.info("Requesting for getAdminDashboardTabCount");
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		return conflictOfInterestService.getCOIAdminDashTabCount(vo);
	}
	
	@PostMapping(value = "/getAllEntityList")
	public ResponseEntity<Object> getAllEntityList(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for getAllEntityList");
		return conflictOfInterestService.getAllEntityList(vo);
	}
	
	@PostMapping(value = "/setEntityStatus")
	public ResponseEntity<Object> setEntityStatus(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for setEntityStatus");
		return conflictOfInterestService.setEntityStatus(vo);
	}

	@GetMapping("/getCoiProjectTypes")
	public ResponseEntity<Object> getCoiProjectTypes() {
		logger.info("Requesting for getCoiProjectTypes");
		return conflictOfInterestService.getCoiProjectTypes();
	}

	@PostMapping(value = "/getCOIReviewerDashboard")
	public ResponseEntity<Object> getCOIReviewerDashboard(@Valid @RequestBody CoiDashboardVO vo) {
		logger.info("Requesting for getCOIReviewerDashboard");
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		return conflictOfInterestService.getCOIReviewerDashboard(vo);
	}
	
	@GetMapping("/getCoiEntityDetails/{personEntityId}")
	public ResponseEntity<Object> getCoiEntityDetails(@PathVariable("personEntityId") Integer personEntityId) {
		logger.info("Requesting for getCoiEntityDetails : personEntityId : {}", personEntityId);
		return new ResponseEntity<>(conflictOfInterestService.getCoiEntityDetails(personEntityId), HttpStatus.OK);
	}

	
	@GetMapping("/getRelationshipLookup")
	public ResponseEntity<Object> getValidPersonRelationshipLookUp() {
		logger.info("Requesting for getValidPersonRelationshipLookUp");
		return conflictOfInterestService.getValidPersonRelationshipLookUp();
	}

//	@GetMapping("/fetchAllCoiRights")
//	public ResponseEntity<Object> fetchAllCoiRights(){
//		return generalService.fetchAllCoiOpaRights();
//	}

	@GetMapping("/entity/isLinked/{entityNumber}/personEntity")
	public ResponseEntity<Object> checkEntityAdded(@PathVariable("entityNumber") Integer entityNumber) {
		return conflictOfInterestService.checkEntityAdded(entityNumber);
	}

	@GetMapping("/adminGroup/adminPersons/{moduleCode}")
	public ResponseEntity<Object> fetchAdminGroupsAndPersons(@PathVariable("moduleCode") Integer moduleCode) {
		return generalService.fetchAdminGroupsAndPersons(moduleCode);
	}


	@PutMapping("/entity/activateInactivate")
	public ResponseEntity<Object> activateOrInactivateEntity(@RequestBody CoiEntityDto coiEntityDto) {
		return conflictOfInterestService.activateOrInactivateEntity(coiEntityDto);
	}

	@GetMapping("/entity/relationshipTypes")
	public ResponseEntity<Object> fetchAllRelationshipTypes() {
		return conflictOfInterestService.fetchAllRelationshipTypes();
	}

	@PutMapping("/entity/approval")
	public ResponseEntity<Object> approveEntity(@RequestBody EntityRelationship entityRelationship) {
		return conflictOfInterestService.approveEntity(entityRelationship);
	}

	@PostMapping(value = "/withdrawDisclosure")
	 public ResponseEntity<Object> withdrawDisclosure(@RequestBody ConflictOfInterestVO vo) {
        logger.info("Request for withdrawing Disclosure");
        ResponseEntity<Object> response = conflictOfInterestService.withdrawDisclosure(vo.getDisclosureId(), vo.getDescription());
//        Need refactoring
        CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(vo.getDisclosureId());
        conflictOfInterestService.updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), vo.getDisclosureId(), disclosure.getFcoiTypeCode());
        return response;
    }

    @PostMapping(value = "/returnDisclosure")
    public ResponseEntity<Object> returnDisclosure(@RequestBody ConflictOfInterestVO vo) {
        logger.info("Request for returning Disclosure");
        return conflictOfInterestService.returnDisclosure(vo.getDisclosureId(), vo.getDescription());
    }

    @GetMapping("/disclosureHistory/{disclosureId}")
	public ResponseEntity<Object> getDisclosureHistoryById(@PathVariable("disclosureId") Integer disclosureId) {
		return actionLogService.getDisclosureHistoryById(disclosureId);
	}

    @PostMapping("/getCoiSectionsTypeCode")
	public ResponseEntity<Object> getCoiSectionsTypeCode(@RequestBody ConflictOfInterestVO vo) {
		logger.info("Requesting for getCoiSectionsTypeCode");
		return conflictOfInterestService.getCoiSectionsTypeCode(vo);
	}

    @GetMapping("/reviewHistory/{disclosureId}")
   	public ResponseEntity<Object> getReviewHistoryById(@PathVariable("disclosureId") Integer disclosureId) {
   		return actionLogService.getReviewHistoryById(disclosureId);
   	}

	@GetMapping("/loadDisclAttachTypes")
	public ResponseEntity<Object> loadDisclAttachTypes() {
		logger.info("Requesting for loadDisclAttachTypes");
		return conflictOfInterestService.loadDisclAttachTypes();
	}

	@PostMapping("/fetchAllActiolListEntriesForBanners")
	public List<Inbox> fetchAllActiolListEntriesForBanners(@RequestBody NotificationBannerDto notifyBannerDto) {
		logger.info("Request for fetchAllActiolListEntriesForBanners");
		return conflictOfInterestService.fetchAllActiolListEntriesForBanners(notifyBannerDto);
	}

	@PostMapping("/notes/save")
	public ResponseEntity<Object> savePersonNote(@RequestBody NotesDto notesDto) {
		log.info("Request for savePersonNote");
		return conflictOfInterestService.savePersonNote(notesDto);
	}

	@PatchMapping("/notes/update")
	public ResponseEntity<Object> updatePersonNote(@RequestBody NotesDto notesDto) {
		log.info("Request for updatePersonNote");
		return conflictOfInterestService.updatePersonNote(notesDto);
	}

	@GetMapping("/notes/fetch/{personId}")
	public ResponseEntity<Object> fetchAllNotesForPerson(@PathVariable("personId") String personId) {
		log.info("Request for fetchAllNotesForPerson, personId: {}", personId);
		return conflictOfInterestService.fetchAllNotesForPerson(personId);
	}

	@DeleteMapping(value = "/notes/delete/{noteId}/{personId}")
	public ResponseEntity<String> deleteNote(@PathVariable("noteId") Integer noteId, @PathVariable("personId") String personId) {
		log.info("Requesting for deleteNote, noteId: {}, personId: {}", noteId, personId);
		return conflictOfInterestService.deleteNote(noteId, personId);
	}

	@PostMapping(value = "/saveOrUpdateAttachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> saveOrUpdateAttachments(@RequestParam(value = "files", required = false) MultipartFile[] files,
			@RequestParam("formDataJson") String formDataJson) {
		logger.info("Request for saveOrUpdateAttachments");
		return conflictOfInterestService.saveOrUpdateAttachments(files, formDataJson);
	}

    @GetMapping("/loadAllAttachmentsForPerson/{personId}")
   	public List<PersonAttachmentDto> loadAllAttachmentsForPerson(@PathVariable("personId") String personId) {
    	log.info("Request for loadAllAttachmentsForPerson: {}", personId);
   		return conflictOfInterestService.loadAllAttachmentsForPerson(personId);
   	}

	@GetMapping("/getSFIRelationshipDetails")
   	public ResponseEntity<Object> getSFIRelationshipDetails() {
    	logger.info("Request for getSFIRelationshipDetails");
   		return conflictOfInterestService.getSFIRelationshipDetails();
   	}

	@PostMapping("/projectPersonNotify")
    public ResponseEntity<Object> projectPersonNotify(@RequestBody NotificationDto notificationDto) {
        logger.info("Requesting for projectPersonNotify");
        return conflictOfInterestService.projectPersonNotify(notificationDto);
    }

	@PostMapping("/mailPreview")
	public ResponseEntity<Object> getEmailPreview(@RequestBody EmailNotificationDto emailNotificationDto) {
		return conflictOfInterestService.getEmailPreview(emailNotificationDto);
	}

	@GetMapping("/getDisclosureCreationDetails")
   	public ResponseEntity<Map<String, Boolean>> getDisclosureCreationDetails() {
    	logger.info("Request for getDisclosureCreationDetails");
   		return conflictOfInterestService.getDisclosureCreationDetails();
   	}

	@PostMapping("/evaluateFormResponse")
	public Map<String, Boolean> evaluateFormResponse(@RequestBody EvaluateFormRequestDto dto) {
		return generalService.evaluateFormResponse(dto);
	}

    @PostMapping("/sendCommonNotification")
    public ResponseEntity<Object> sendCommonNotification(@RequestBody NotificationDto notificationDto) {
        logger.info("Requesting for sendCommonNotification");
        return conflictOfInterestService.sendNotification(notificationDto);
    }

    @PostMapping("/notificationHistory")
       	public ResponseEntity<Object> getNotificationHistory(@RequestBody NotificationDto notificationDto) {
        logger.info("Request for getNotificationHistory");
        return new ResponseEntity<>(coiNotificationLogService.fetchNotificationHistory(notificationDto), HttpStatus.OK);
    }

}
