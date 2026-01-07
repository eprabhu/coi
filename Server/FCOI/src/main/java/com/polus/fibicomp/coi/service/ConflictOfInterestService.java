package com.polus.fibicomp.coi.service;


import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.fibicomp.coi.clients.model.EmailNotificationDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.CoiEntityDto;
import com.polus.fibicomp.coi.dto.CommonRequestDto;
import com.polus.fibicomp.coi.dto.CompleteReivewRequestDto;
import com.polus.fibicomp.coi.dto.NotesDto;
import com.polus.fibicomp.coi.dto.NotificationBannerDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.hierarchy.dto.DisclosureDto;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.coi.pojo.EntityRelationship;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.globalentity.pojo.Entity;

@Transactional
@Service(value = "conflictOfInterestService")
public interface ConflictOfInterestService {

	/**
	 * This method is used for get list of entity table values(enpoint for entity)
	 * @param vo
	 * @return A list of entity
	 */
	List<Entity> searchEntity(ConflictOfInterestVO vo);

	/**
	 * This method is used for get lookup table of sfi
	 * @return EntityStatus, EntityType, CoiFinancialEntityRelType
	 */
	ResponseEntity<Object> loadAddSFILookups();

	/**
	 * This method is used to get disclosure details for SFI
	 * @param coiFinancialEntityId
	 * @return list of SFI details
	 */
	ResponseEntity<Object> getDisclosureDetailsForSFI(Integer coiFinancialEntityId);

	/**
	 * This method is used for save review details
	 * @param vo
	 * @return saved CoiReview object
	 */
	ResponseEntity<Object> saveOrUpdateCoiReview(ConflictOfInterestVO vo);

	/**
	 * This method is used for get CoiReview based on disclosureId
	 * @param disclosureDto
	 * @return List of CoiReview
	 */
	List<CoiReview> getCoiReview(CoiDisclosureDto disclosureDto);

	/**
	 * This method is used for Start review
	 * @param vo
	 * @return CoiReview
	 */
	ResponseEntity<Object> startReview(ConflictOfInterestVO vo);

	/**
	 * This method is used for complete review
	 * @param vo
	 * @return CoiReview
	 */
	ResponseEntity<Object> completeReview(ConflictOfInterestVO vo);

	/**
	 * This method is used for delete review
	 * @param coiReviewId
	 * @return
	 */
	ResponseEntity<Object> deleteReview(Integer coiReviewId);

	/**
	 * This method is used for complete Disclosure
	 * @param disclosureId
	 * @param disclosureNumber
	 * @param description 
	 * @return Disclosure details
	 */
	ResponseEntity<Object> completeDisclosureReview(Integer disclosureId, Integer disclosureNumber, String description);

	/**
	 * This method is used for get Project Conflict History
	 * @param coiConflictHistoryId
	 * @return list of CoiConflictHistory
	 */
	List<CoiConflictHistory> getCoiConflictHistory(Integer coiConflictHistoryId);

	/**
	 * This method is used to get proposals for Disclosure
	 * @param searchString
	 * @return list of proposals
	 */
	String loadProposalsForDisclosure(String searchString);

	String loadAwardsForDisclosure(String searchString);

	/**
	 * @param vo
	 * @return
	 */
	String loadDisclosureHistory(ConflictOfInterestVO vo);

	/**
	 * This method is used to create Entity
	 * @param vo
	 * @return vo
	 */
	ResponseEntity<Object> saveOrUpdateEntity(ConflictOfInterestVO vo);

	/**
	 * This method is used to get entity details based on coiEntityId
	 * @param coiEntityId
	 * @return A list of entity details
	 */
	ResponseEntity<Object> getEntityDetails(Integer coiEntityId);

	ResponseEntity<Object> getActiveDisclosure();

	/**
	 * This method is used to get COI dasboard data .
	 * @param vo -
	 * @return A list of dashboard COI data.
	 */
	String getCOIDashboard(CoiDashboardVO vo);

	/**
	 * This method is used to get COI Admin dasboard data .
	 * @param vo -
	 * @return A list of dashboard COI data.
	 */
	String getCOIAdminDashboard(@Valid CoiDashboardVO vo);

	String getCOIDashboardCount(CoiDashboardVO vo);
	
	/**
	 * This method is used to Retrieves the count of disclosures of the Admin Dashboard tabs.
	 * @param vo
	 * @return the number of records across all dashboard tabs.
	 */
	String getCOIAdminDashTabCount(@Valid CoiDashboardVO vo);

	ResponseEntity<Object> getAllEntityList(ConflictOfInterestVO vo);

	ResponseEntity<Object> setEntityStatus(ConflictOfInterestVO vo);

	ResponseEntity<Object> getAllCoiTravelDisclosureList();

	ResponseEntity<Object> getCoiProjectTypes();

	/**
	 *
	 * @param vo
	 * @return
	 */
	ResponseEntity<Object> getCOIReviewerDashboard(CoiDashboardVO vo);

	ConflictOfInterestVO getCoiEntityDetails(Integer personEntityId);

	ResponseEntity<Object> getValidPersonRelationshipLookUp();

	ResponseEntity<Object> loadTravelStatusTypesLookup();

	/**
	 * This method is used to check a enitity is added againt a person or not
	 *
	 * @param entityNumber entityNumber
	 * @return
	 */
	ResponseEntity<Object> checkEntityAdded(Integer entityNumber);

	/**
	 *This method is used to activate/inactive entity by checking the entity is used anywhere.
	 * If entity is linked on a SFI new version will be created
	 * @param coiEntityDto
	 * @return
	 */
	ResponseEntity<Object> activateOrInactivateEntity(CoiEntityDto coiEntityDto);

	/**
	 * This method is used to fetch all entity relationship types
	 * @return
	 */
	ResponseEntity<Object> fetchAllRelationshipTypes();

	/**
	 * This method is used to approve Entity
	 * @param entityRelationship
	 * @return
	 */
	ResponseEntity<Object> approveEntity(EntityRelationship entityRelationship);

	/**
	 * This method is used to fetch disclosure history
	 * @param dashboardVO
	 */
	ResponseEntity<Object> getDisclosureHistory(CoiDashboardVO dashboardVO);

	/**
	 * This method is used to modify risk
	 * @param entityDto
	 * @return
	 */
	ResponseEntity<Object> modifyRisk(CoiEntityDto entityDto);

	ResponseEntity<Object> withdrawDisclosure(Integer disclosureId, String description);

    ResponseEntity<Object> returnDisclosure(Integer disclosureId, String description);

	/**
	 * This method is used to modify disclosure risk
	 * @param disclosureDto
	 * @return
	 */
//	ResponseEntity<Object> modifyDisclosureRisk(CoiDisclosureDto disclosureDto);

	/**
	 * This method is used to fetch all disclosure risk
	 * @return
	 */
//	ResponseEntity<Object> fetchAllDisclosureRisk();

	/**
	 * This method is used to fetch disclosure history
	 * @param actionLogDto
	 * @return
	 */
//	ResponseEntity<Object> fetchDisclosureHistory(DisclosureActionLogDto actionLogDto);

	/**
	 * This method is used to fetch section type codes
	 * @param conflictOfInterestVO
	 * @return
	 */
	ResponseEntity<Object> getCoiSectionsTypeCode(ConflictOfInterestVO conflictOfInterestVO);

	String deleteReviewCommentTag(Integer coiReviewCommentTagId);

    /**
	 * This method is used to fetch disclosure attachment types
	 * @return
	 */
    ResponseEntity<Object> loadDisclAttachTypes();
    
    List<Inbox> fetchAllActiolListEntriesForBanners(NotificationBannerDto notifyBannerDto);

	/**
	 * This method fetches all notes for a given personId. It checks permissions to
	 * ensure notes can only be retrieved if the person has either
	 * VIEW_DISCLOSURE_NOTE or MANAGE_DISCLOSURE_NOTE rights.
	 * 
	 * @param personId
	 * @return
	 */
    ResponseEntity<Object> fetchAllNotesForPerson(String personId);

	/**
	 * This method save or update person's note. It includes a rights check to
	 * ensure that only users with the MANAGE_DISCLOSURE_NOTE permission can perform
	 * this action.
	 * 
	 * @param dto
	 * @return
	 */
	ResponseEntity<Object> savePersonNote(NotesDto notesDto);

	/**
	 * This method update person's note. It includes a rights check to
	 * ensure that only users with the MANAGE_DISCLOSURE_NOTE permission can perform
	 * this action.
	 * 
	 * @param dto
	 * @return
	 */
	ResponseEntity<Object> updatePersonNote(NotesDto notesDto);

	/**
	 * This method deletes a note using a given note Id. It includes a rights check
	 * to ensure that only users with the VIEW_DISCLOSURE_NOTE permission can delete
	 * the note.
	 * 
	 * @param noteId
	 * @param personId 
	 * @return
	 */
    ResponseEntity<String> deleteNote(Integer noteId, String personId);
    
    ResponseEntity<Object> saveOrUpdateAttachments(MultipartFile[] files, String formDataJSON);
    
    List<PersonAttachmentDto> loadAllAttachmentsForPerson(String personId);

	/**
	 * This method fetches all person entity with entity and relationship of a person
	 * @param requestDto
	 * @return
	 */
    ResponseEntity<Object> getEntityWithRelationShipInfo(CommonRequestDto requestDto);

    /**
	 * This method fetches SFI relationship details
	 * @return
	 */
	ResponseEntity<Object> getSFIRelationshipDetails();

	/**
	 * This method used to complete disclosure reviews
	 * @param requestDto
	 * @return
	 */
	ResponseEntity<Object> completeDisclosureReviews(List<CompleteReivewRequestDto> requestDto);

	/**
	 * This method is used to Check if the risk status of the disclosure has been modified
	 * @return
	 */
//	ResponseEntity<Object> checkDisclosureRiskStatus(CoiDisclosureDto disclosureDto);

	/**
	 * This method is used to Check if the risk status of the Entity has been modified
	 * @return
	 */
	ResponseEntity<Object> checkEntityRiskStatus(CoiEntityDto entityDto);

	/**
	 * This method is used to build & push message to queue
	 * @param actionType
	 * @param moduleItemKey
	 * @param moduleSubItemKey
	 * @param additionDetails
	 * @param moduleCode
	 * @param subModuleCode
	 */
	String processCoiMessageToQ(String actionType, Integer moduleItemKey, Integer moduleSubItemKey, Map<String, String> additionDetails,
							  Integer moduleCode, Integer subModuleCode);

	/**
	 * Defining action type based on disclosure type code
	 * @param fcoiType
	 * @param actionTypes
	 * @return
	 */
	String getDisclosureActionType(String fcoiType, Map<String, String> actionTypes);

	/**
	 * For notifying person
	 * @param notificationDto
	 * @return
	 */
	ResponseEntity<Object> projectPersonNotify(NotificationDto notificationDto);

	/**
	 * Fetch Email preview
	 * @param emailNotificationDto
	 * @return
	 */
	ResponseEntity<Object> getEmailPreview(EmailNotificationDto emailNotificationDto);

	/**
	 * @param actionType
	 * @param moduleItemKey
	 * @param moduleSubItemKey
	 * @param additionDetails
	 * @param userName
	 */
	void processCoiTriggerMessageToQ(MessageQVO messageQVO);

	/**
	 * Retrieves the details whether disclosure creation is required
	 * 
	 * @return ResponseEntity containing a map where the keys represent disclosure
	 *         types and the values are Boolean flags indicating whether disclosure
	 *         creation is required.
	 */
	ResponseEntity<Map<String, Boolean>> getDisclosureCreationDetails();
	
	/**
	 * This method identifies and updates expired disclosures to 'expired' status, then returns a list of these newly expired disclosures.
	 * 
	 * @return  Returns a list of these newly expired disclosures.
	 */
	List<DisclosureDto> checkAndMarkDisclosuresAsExpired();
	
	/**
	 * Sends notifications to reporters regarding their expiring or expired disclosures.
	 * 
	 * @param expiringDisclosures List of disclosures that are either expiring soon or have already expired
	 * @param isRenewalReminder Flag indicating whether this is a renewal reminder (true) 
	 *                          or an expiration notification (false)
	 */
	void notifyUsers(List<DisclosureDto> expiredDisclosures, boolean isRenewalReminder);

	/**
	 * This method is used to update the overall disclosure status based on the parameters.
	 * @param projectTypeCode
	 * @param disclosureId
	 * @param fcoiTypeCode
	 */
	void updateOverallDisclosureStatus(String projectTypeCode, Integer disclosureId, String fcoiTypeCode);
	
	/**
	 * Adds expiring disclosures to Inbox.
	 * @param expiringDisclosures List of Expiring disclosures 
	 * @param isRenewalReminder If true, shows "will expire" message; if false, shows "expired" message
	 */
	void addExpiringDisclosuresToInbox(List<DisclosureDto> expiringDisclosures, boolean isRenewalReminder);
	
	/**
	 * Retrieves a list of FCOI  and OPA disclosures that are approaching their expiration date.
	 * @return List of DisclosureDto objects containing expiring disclosures.
	 */
	List<DisclosureDto> getExpiringFcoiAndOpaDisclosures();

    /**
     * This method is used to send notification
     * @param notificationDto
     * @return
     */
    ResponseEntity<Object> sendNotification(NotificationDto notificationDto);
}
