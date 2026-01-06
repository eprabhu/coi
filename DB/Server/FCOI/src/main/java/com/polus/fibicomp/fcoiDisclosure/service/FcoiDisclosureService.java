package com.polus.fibicomp.fcoiDisclosure.service;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.polus.core.person.pojo.Person;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.PersonEntityRelationshipDto;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProposalIntegrationNotifiyDto;

public interface FcoiDisclosureService {

    /**
     * This method is used to create Disclosure
     * @param vo
     * @return created disclosure details, person details and number of sfi
     */
    ResponseEntity<Object> createDisclosure(CoiDisclosureDto vo) throws JsonProcessingException;

    /**
     * This method is used to get list of disclosure
     * @param disclosureId
     * @return
     */
    ResponseEntity<Object> loadDisclosure(Integer disclosureId);

    /**
     * This method is used to certifyDisclosure
     * @param coiDisclosure
     * @return vo
     */
    ResponseEntity<Object> certifyDisclosure(CoiDisclosureDto coiDisclosure);

    /**
     * This method is used to modify disclosure risk
     * @param disclosureDto
     * @return
     */
    ResponseEntity<Object> modifyDisclosureRisk(CoiDisclosureDto disclosureDto);

    /**
     * This method fetches all disclosure risks
     * @return
     */
    ResponseEntity<Object> fetchAllDisclosureRisk();

    /**
     * This method is used to fetch disclosure history
     * @param actionLogDto
     * @return
     */
    ResponseEntity<Object> fetchDisclosureHistory(DisclosureActionLogDto actionLogDto);

    /**
     * This method is used to Check if the risk status of the disclosure has been modified
     * @return
     */
    ResponseEntity<Object> checkDisclosureRiskStatus(CoiDisclosureDto disclosureDto);

    /**
     * This method returns projects of a disclosure
     * @param disclosureId
     * @return
     */
    ResponseEntity<Object> getDisclosureProjects(Integer disclosureId);

    /**
     * This method fetches disclosure lookups
     * @return
     */
    ResponseEntity<Object> getDisclosureLookups();

    /**
     * This method is used to fetch disclosure project entity relations
     * @param vo
     * @return
     */
    List<DisclosureProjectDto> getDisclProjectEntityRelations(ProjectEntityRequestDto vo);

    /**
     * This method is used to fetch disclosure project entity relations
     * @param vo
     * @return
     */
    List<PersonEntityRelationshipDto> getDisclosureEntityRelations(ProjectEntityRequestDto vo);

    /**
     * This method is used to save disclosure Relationship conflict details.
     * @return vo
     */
    ResponseEntity<Object> saveDisclosureConflict(ProjectEntityRequestDto vo);

    /**
     * This method is used to revise Coi disclosure
     * @return counts
     */
    ResponseEntity<Object> reviseDisclosure(ConflictOfInterestVO vo);

    /**
     * This method is used for evaluate DisclosureQuestionnaire
     * @param vo
     * @return boolean value
     */
    boolean evaluateDisclosureQuestionnaire(ConflictOfInterestVO vo);

    /**
     * This method updates conflicts
     * @param vo
     * @return
     */
    ResponseEntity<Object> updateProjectRelationship(ConflictOfInterestVO vo);

    /**
     * This method is used to validate conflicts and update
     * Validates
     * 1) If selected project expired date passed
     * 2) Is part of any pending project disclosure
     * 3) If the selected project is part of any active/ pending  FCOi disclosure
     *
     * @param disclosureId
     * @return
     */
    ResponseEntity<Object> validateConflicts(Integer disclosureId);

    /**
     * This method is used to validate to create a disclosure
     * @param disclosureDto
     * @return
     */
    ResponseEntity<Object> validateDisclosure(CoiDisclosureDto disclosureDto);

    /**
     * This method is used to update administrator
     * @param dto
     * @return
     */
    ResponseEntity<Object> assignDisclosureAdmin(CoiDisclosureDto dto);

    /**
     * This method syncs the projects with person entities(SFIs)
     * @param coiDisclosureDto
     */
    void syncFCOIDisclosure(CoiDisclosureDto coiDisclosureDto);

    /**
     * This method is used to evaluate validation conditions:
     * 1.If SFI has to be defined based on questionnaire evaluation.
     * 2.Is there any SFI's with relationship not defined.
     * 3.Is there any SFI in draft status
     */
    ResponseEntity<Object> evaluateValidation(CoiDisclosureDto coiDisclosureDto);

    /**
     * This method is used to update sync needed status from integration side
     * @param projectDto
     */
    void updateFcoiDisclSyncNeedStatus(DisclosureProjectDto projectDto);

    /**
     * This method is used to detach projects on certain conditions configured on procedure
     * @param projectDto
     */
    void detachFcoiDisclProject(DisclosureProjectDto projectDto);

    /**
     *
     * @param integrationRequestDto
     */
    void makeDisclosureVoid(IntegrationRequestDto integrationRequestDto);

    /**
     * Check disposition status is void
     * @param dispositionStatusCode
     */
    void checkDispositionStatusIsVoid(String dispositionStatusCode);

    /**
     * Check disclosure's disposition status is void
     * @param disclosureId
     */
    void checkDispositionStatusIsVoid(Integer disclosureId);

    /**
     * Fetch Disclosure projects by disposition status
     * @param disclosureId
     * @return
     */
    List<DisclosureProjectDto> getDisclProjectsByDispStatus(Integer disclosureId);

	/**
	 * @param vo
	 */
	void notifyUserCreateDisclosure(IntegrationNotificationRequestDto vo);

	/**
	 * Adds expired FCOI disclosure to Inbox
	 */
	void addExpiredFcoiDisclosuresToInbox(Integer daysToDueDate);

    /**
     *
     * @param vo
     */
    ResponseEntity<Object> requestWithdrawal(ConflictOfInterestVO vo);

    /**
     *
     * @param vo
     */
    ResponseEntity<Object> denyRequestWithdrawal(ConflictOfInterestVO vo);

	/**
	 * @param moduleCode
	 * @return
	 */
	ResponseEntity<Object> markProjectDisclosureAsVoid(Integer moduleCode);

	/**
	 * @param moduleItemKey
	 * @param personId
	 * @param messageTypeCode
	 * @param userMessage
	 * @param updateUser
	 */
	void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage,
			String updateUser);

	/**
	 * @param moduleCode
	 * @return
	 */
	ResponseEntity<Object> getProjectDisclosures(Integer moduleCode);

	/**
	 * Used to check if the discloisure is synced with all the engagements 
	 * @param disclosureId
	 * @param documentOwnerId 
	 * @return
	 */
	Boolean isDisclosureSynced(Integer disclosureId, String documentOwnerId);

	/**
	 * @param vo
	 */
	void deleteUserInboxForDisclosureCreation(IntegrationNotificationRequestDto vo);

	/**
	 * @param vo
	 */
	void notifyUserBasedOnAwardHierarchy(IntegrationNotificationRequestDto vo);

	/**
	 * @param moduleCode
	 * @param subModuleCode
	 * @param notifyVO
	 * @param personId
	 * @param person
	 */
	void prepareAndSendUserNotification(Integer moduleCode, Integer subModuleCode, IntegrationNotificationRequestDto notifyVO, String personId, Person person);

	/**
	 * Used to notify user to submit proposal disclosure 
	 * @param vo
	 */
	void notifyUserForDisclSubmission(ProposalIntegrationNotifiyDto vo);

	/**
	 * @param personId
	 */
	public ResponseEntity<Object> checkFinancialEngagementCreated(String personId);

	/**
	 * Used to get disclosure extending project entity relationships
	 * @param ProjectEntityRequestDto
	 * @return list of DisclosureProjectDto
	 */
	List<DisclosureProjectDto> getExtendedDisclProjectEntityRelations(ProjectEntityRequestDto dto);
	
	/**
	 * Used to retrieve active projects to determine if the person is eligible to create a disclosure.
	 * @param personId
	 */
	public ResponseEntity<Object> checkDisclCreationEligibility(String personId);

	/**
	 *
	 * @param adminGroupId
	 * @param disclosureId
	 * @param adminPersonId
	 * @param fcoiTypeCode
	 * @param coiProjectType
	 * @param disclosureOwner
	 */
	void prepareInboxObject(Integer adminGroupId, Integer disclosureId, String adminPersonId, String fcoiTypeCode, CoiProjectType coiProjectType, String disclosureOwner);

	/**
	 *
	 * @param disclosureId
	 * @param fcoiTypeCode
	 * @param coiProjectType
	 * @param disclosureOwner
	 */
	void prepareInboxObject(Integer disclosureId, String fcoiTypeCode, CoiProjectType coiProjectType, String disclosureOwner);

	/**
	 *
	 * @param disclosureId
	 * @param fcoiTypeCode
	 * @param isReturnedOrWithdrawn
	 * @param conflictStatus
	 * @param certificationDate
	 */
	void sentSubmitOrResubmitNotification(CoiDisclosure coiDisclosure, String conflictStatus, Timestamp certificationDate);

	/**
	 *
	 * @param disclosureId
	 */
	void triggerProjectSubmissionNotification(Integer disclosureId);

	/**
	 * Get Expiring Disclosure Summary Data
	 */
    void sendMonthlyExpiringSummary() throws SQLException;

	/**
	 * Get Project Disclosure Id by projectType, personId, moduleItemKey
	 * @param projectType
	 * @param personId
	 * @param moduleItemKey
	 * @return
	 */
	ResponseEntity<Object> getProjectDisclosureId(String projectType, String personId, String moduleItemKey);
	
    /**
	 * This method is used to mark pending disclosures as void
	 * 
	 * @param moduleCode
	 * @param actionType
	 */
	void markPendingDisclosuresAsVoid(String moduleCode, String actionType) throws SQLException;
}
