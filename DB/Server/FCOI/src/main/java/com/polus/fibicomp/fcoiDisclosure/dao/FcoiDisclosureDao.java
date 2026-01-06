package com.polus.fibicomp.fcoiDisclosure.dao;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.polus.core.pojo.UnitAdministrator;
import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.coi.dto.CoiConflictStatusTypeDto;
import com.polus.fibicomp.coi.dto.CoiDisclEntProjDetailsDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.pojo.CoiProjConflictStatusType;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.MakeVoidDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.SFIJsonDetailsDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiConflictStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjectEntityRel;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjects;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureFcoiType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiRiskCategory;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;

public interface FcoiDisclosureDao {

    /**
     * This method is used for save disclosure details
     * @param coiDisclosure
     * @return
     */
    public CoiDisclosure saveOrUpdateCoiDisclosure(CoiDisclosure coiDisclosure);

    /**
     * This method is used to load disclosure
     *
     * @param disclosureId
     * @return
     */
    CoiDisclosure loadDisclosure(Integer disclosureId);

    /**
     * This method is used to modify disclosure risk
     *
     * @param coiDisclosureDto
     * @return
     */
    boolean isDisclosureRiskAdded(CoiDisclosureDto coiDisclosureDto);

    /**
     * This method is used to get RiskCategory by category code
     *
     * @param riskCategoryCode
     * @return
     */
    CoiRiskCategory getRiskCategoryStatusByCode(String riskCategoryCode);

    /**
     * This method updates disclosure risk category
     *
     * @param coiDisclosureDto
     * @return
     */
    Timestamp updateDisclosureRiskCategory(CoiDisclosureDto coiDisclosureDto);

    /**
     * This method fetches all disclosure risk categories
     *
     * @return
     */
    List<CoiRiskCategory> fetchDisclosureRiskCategory();

    /**
     * This method is used to Check if the risk status of the disclosure has been modified
     *
     * @return
     */
    Boolean isDisclosureRiskStatusModified(String riskCategoryCode, Integer disclosureId);

    /**
     * This method returns disclosure projects
     *
     * @param disclosureId
     * @return
     */
    List<DisclosureProjectDto> getDisclosureProjects(Integer disclosureId);

    /**
     * This method used to fetch all disclosure conflict Status Types
     *
     * @param
     * @return list of Coi Disclosure Detail Statuses
     */
    List<CoiConflictStatusType> getCoiConflictStatusTypes();

    /**
     * This method used to fetch all project conflict Status Types
     *
     * @return
     */
    List<CoiProjConflictStatusType> getProjConflictStatusTypes();

    /**
     * This method is used to check master disclosure exists or not
     * @param personId
     * @return
     */
    boolean isMasterDisclosurePresent(String personId);

    /**
     * This method is used to generate Disclosure number
     * @return
     */
    Integer generateMaxDisclosureNumber();

    /**
     * This method is used to fetch FCOI Disclosure Type
     * @param coiTypeCode
     * @return
     */
    CoiDisclosureFcoiType getCoiDisclosureFcoiTypeByCode(String coiTypeCode);

    /**
     * Fcoi disclosure section types
     * @return
     */
    List<CoiSectionsType> fetchCoiSections();

    /**
     * This method is used to Check if the disclosure have reviewers assigned
     * @return
     */
    Boolean isReviewerAssigned(Integer disclosureId);

    /**
     * This method is used to Check if the reviewers in the disclosure have completed their reviews
     * @return
     */
    Boolean isReviewerReviewCompleted(Integer disclosureId);

    /**
     * This method is used for certify disclosure
     * @param coiDisclosure
     */
    Timestamp certifyDisclosure(CoiDisclosureDto coiDisclosure);

    /**
     * This method is used to validate conflicts and update
     *
     * @param disclosureId disclosureId
     * @return CoiConflictStatusType
     */
    CoiConflictStatusTypeDto validateConflicts(Integer disclosureId);

    /**
     * This method is used to sync disclosure risk
     * @param disclosureId
     * @param disclosureNumber
     * @return CoiRiskCategory
     */
    CoiRiskCategory syncDisclosureRisk(Integer disclosureId, Integer disclosureNumber);

    /**
     * This method fetches the project entity relation ids
     * @param disclosureId
     * @return
     */
    List<CoiDisclProjectEntityRel> getProjEntityRelationshipsByDisclId(Integer disclosureId);

    /**
     * Fetch Latest ConflictHistory conflict status code by project entity rel id
     * @param coiDisclProjectEntityRelId
     * @return
     */
    String getLatestConflHisStatusCodeByProEntRelId(Integer coiDisclProjectEntityRelId);

    /**
     * This method used to save conflict history
     * @param coiConflictHistory
     */
    void saveOrUpdateCoiConflictHistory(CoiConflictHistory coiConflictHistory);

    /**
     * This method used to update conflict status against entity & project
     * @param entityProjectRelation
     */
    void saveOrUpdateCoiDisclEntProjDetails(ProjectEntityRequestDto entityProjectRelation);

    /**
     * Fetch DisclProjectEntityRelIds
     * @param entityProjectRelation
     * @return
     */
    List<Object[]> fetchDisclProjectEntityRelIds(ProjectEntityRequestDto entityProjectRelation);

    /**
     * This method is used to check if SFI is completed for a disclosure
     * @param personEntityId
     * @param disclosureId
     */
    Boolean isSFICompletedForDisclosure(Integer personEntityId, Integer disclosureId);

    /**
     *  This method checks the conflict is marked against project
     * @param
     * @return check if SFI Completed For Project
     */
    Boolean checkIsSFICompletedForProject(Integer moduleCode, Integer moduleItemId, Integer disclosureId);

    /**
     * This method is used to update disclosure header update details
     * @param disclosureId
     */
    Timestamp updateDisclosureUpdateDetails(Integer disclosureId);

    /**
     * This method fetches disclosure entity vs project relations
     * @param disclosureId
     * @return
     */
    List<CoiDisclEntProjDetailsDto> getDisclEntProjDetails(Integer disclosureId);

    /**
     * This method is used to check FCOI disclosure is exists or not
     * @param personId
     * @param versionStatus
     * @param fcoiTypeCodes
     * @return
     */
    CoiDisclosure isFCOIDisclosureExists(String personId, List<String> fcoiTypeCodes, String versionStatus);

    /**
     * This method is used for evaluate DisclosureQuestionnaire
     * @param moduleCode
     * @param submoduleCode
     * @param moduleItemKey
     * @return Boolean value
     */
    boolean evaluateDisclosureQuestionnaire(Integer moduleCode, Integer submoduleCode, String moduleItemKey);

    /**
     * This
     * @param projectConflictStatusCode
     * @param disclosureDetailsId
     * @return
     */
    boolean isDisclEntProjConflictAdded(String projectConflictStatusCode, Integer disclosureDetailsId);

    /**
     * This method fetches CoiDisclProjectEntityRel by id
     * @param coiDisclProjectEntityRelId
     * @return
     */
    CoiDisclProjectEntityRel getCoiDisclProjectEntityRelById(Integer coiDisclProjectEntityRelId);

    /**
     * This method used to update conflict status against project
     * @param conflictStatusCode
     * @param coiDisclProjectEntityRelId
     * @param projectEngagementDetails 
     * @return Timestamp
     */
    Timestamp updateCoiDisclEntProjDetails(String conflictStatusCode, Integer coiDisclProjectEntityRelId, String projectEngagementDetails);

    /**
     *
     * @param disclosureId
     * @param
     * @return list of Coi Disclosure Details
     */
    List<CoiDisclProjectEntityRel> getProjectRelationshipByParam(Integer moduleCode, Integer moduleItemId, String loginPersonId, Integer disclosureId);

    /**
     * This method return count of SFIs in a disclosure
     * @param disclosureId
     * @return
     */
    Long getNumberOfSFIBasedOnDisclosureId(Integer disclosureId);

    /**
     * This method is used to validate
     * 1) If selected project expired date passed
     * 2) Is part of any pending project disclosure
     * 3) If the selected project is part of any active/ pending  FCOi disclosure
     *
     * @param personId
     * @param moduleCode
     * @param moduleItemKey
     * @return Map of validated values
     */
    Map<String, Object> validateProjectDisclosure(String personId, Integer moduleCode, String moduleItemKey);

    /**
     * This method  used for convertJsonStringToListMap
     * @param jsonString
     * @return
     */
    List<Map<Object, Object>> convertJsonStringToListMap(String jsonString);

    /**
     * This method is used to save or update coiDisclProjects
     * @param coiDisclProjects
     */
    void saveOrUpdateCoiDisclProjects(CoiDisclProjects coiDisclProjects);


    List<CoiDisclProjects> syncFcoiDisclosureProjects(Integer disclosureId, Integer disclosureNumber, String loginPersonId);

    /**
     * This method is used to get person entities by person id
     * @param personId
     * @param engagementTypesNeeded
     */
    List<SFIJsonDetailsDto> getPersonEntitiesByPersonId(String personId, String engagementTypesNeeded);

    void syncFcoiDisclProjectsAndEntities(Integer disclosureId, Integer disclosureNumber,Integer coiDisclProjectId, Integer moduleCode,
                                          String moduleItemKey, String sfiJsonArray, String loginPersonId);

    /**
     * This method is used to Check if Admin is assigned
     * @param disclosureId
     * @return
     */
    boolean isAdminPersonOrGroupAdded(Integer disclosureId);

    /**
     * This method is used to check given admin person and group is added or not
     * @param adminGroupId
     * @param adminPersonId
     * @param disclosureId
     */
    boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer disclosureId);

    /**
     *This method updates the assign admin/group and changes the disclosure status to 3 review in progress
     *
     * @param adminGroupId
     * @param adminPersonId
     * @param disclosureId
     * @return Update Timestamp
     */
    Timestamp assignDisclosureAdmin(Integer adminGroupId, String adminPersonId, Integer disclosureId);

    /**
     * This method is used to sync the projects/SFIs with disclosure
     * @param disclosureId
     * @param disclosureNumber
     */
    void syncFCOIDisclosure(Integer disclosureId, Integer disclosureNumber);

    /**
     * Disclosure validation before submission.
     * @param disclosureId
     * @param personId
     * @return
     */
    List<COIValidateDto> evaluateValidation(CoiDisclosureDto coiDisclosureDto);

    /**
     * This method is used to check disclosure project sfi sync is needed
     * @param disclosureId
     * @return
     */
    boolean isProjectSFISyncNeeded(Integer disclosureId);

    /**
     * This method is used to update sync needed flag
     * @param disclosureId
     * @param syncNeeded
     */
    void updateDisclosureSyncNeeded(Integer disclosureId, boolean syncNeeded);

    /**
     * This method is used to update sync needed flag
     * @param personEntityId
     * @param syncNeeded
     */
    void updateDisclosureSyncNeededByPerEntId(Integer personEntityId, boolean syncNeeded);

    /**
     * This method is used to update the disclosures sync needed flag by certain condition
     * @param projectDto
     */
    void updateFcoiDisclSyncNeedStatus(DisclosureProjectDto projectDto);

    /**
     *
     * @param disclComment
     */
    DisclComment saveOrUpdateDisclComment(DisclComment disclComment);

    /**
     *
     * @param projectDto
     */
    void detachFcoiDisclProject(DisclosureProjectDto projectDto);

    /**
     * This method is used to make the disclosure's disposition status to void using certain conditions
     * @param integrationRequestDto
     * @return list of MakeVoidDto
     */
    List<MakeVoidDto> makeDisclosureVoid(IntegrationRequestDto integrationRequestDto);

    /**
     * Checking  the disclosure is of disposition status
     * @param dispositionStatusCode
     * @param disclosureId
     * @return
     */
    boolean isDisclDispositionInStatus(String dispositionStatusCode, Integer disclosureId);

    /**
     * Snapshotting disclosure projects
     * @param disclosureId
     * @param personId
     */
    void generateProjectSnapshot(Integer disclosureId, String personId);

    /**
     *
     * @param disclosureId
     * @return
     */
    List<CoiDisclProjects> getCoiDisclProjects(Integer disclosureId);

    /**
     *
     * @return
     */
    List<CoiProjectType> getCoiProjectTypes();

    /**
     *
     * @param disclosureId
     * @return
     */
    String getDisclosureFcoiTypeCode(Integer disclosureId);

    /**
     *Fetches expired FCOI disclosures
     * 
     */
    public List<Map<Integer, String>> getExpiredFcoiDisclosures(Integer daysToDueDate);

 	/**
 	 * Fetches immediate previous disclosure
 	 * 
 	 */
 	public CoiDisclosure getPreviousDisclosureVersion(Integer disclosureNumber, Integer versionNumber);

 	/**
 	 * Fetches expired FCOI disclosures from Inbox
 	 * 
 	 */
 	public List<String> getExpiredInboxFcoiDisclosureIds();

	/**
	 * @param personId
	 * @param moduleCode
	 * @param subModuleCode
	 * @param moduleItemKey
	 * @param subModuleItemKey
	 */
	public Boolean canNotifyUserForCreateAwardDisclosure(String personId, Integer moduleCode, Integer subModuleCode, String moduleItemKey, String subModuleItemKey);

	/**
	 * @param vo
	 * @param personId
	 * @return 
	 */
	public IntegrationNotificationRequestDto getAwardForNotifyDisclosureCreation(IntegrationNotificationRequestDto vo, String personId);

	/**
	 * @param moduleItemKey
	 * @param personId
	 * @param messageTypeCode
	 * @param fcoiTypeCode 
	 */
	public List<String> markReadMessageForDisclosureCreation(String moduleItemKey, String personId, String messageTypeCode, String fcoiTypeCode);

	/**
	 * @param disclosureId
	 * @param loginPersonId
	 * @return
	 */
	public List<String> getProjectNumbersBasedOnParam(Integer disclosureId, String loginPersonId);

    /**
     * This method make the requestWithdrawal true or false
     * @param disclosureId
     * @param withdrawalRequested
     * @param comment
     */
    void updateRequestForWithdrawal(Integer disclosureId, Boolean withdrawalRequested, String comment);

    /**
     *
     * @param disclosureId
     * @return
     */
    boolean isDisclRequestedWithdrawal(Integer disclosureId);

	/**
	 * @param loginPersonId
	 * @return
	 */
	public CoiDisclosure getLatestDisclosure(String loginPersonId, List<String> fcoiTypeCodes, String projectNumber);

	/**
	 * Check if new engagement created based on the passed parameters
	 * @param personId
	 * @param engagementTypesNeeded 
	 * @return
	 */
	public Boolean checkIfNewEngagementCreated(String personId, String engagementTypesNeeded);

	/**
	 * @param loginPersonId
	 * @return
	 */
	public List<String> getProjectDisclosuresForMarkAsVoid(String loginPersonId, Integer moduleCode);

	/**
	 * @param personId
	 * @param validTypeCodes
	 * @param personEntityId
	 * @param engagementTypesNeeded 
	 * @return
	 */
	public Boolean checkIfEngagementLinkedToFcoi(String personId, List<Integer> validTypeCodes, Integer personEntityId, String engagementTypesNeeded);

	/**
	 * @param personId
	 * @param moduleCode
	 * @param moduleItemKey
	 * @return
	 */
	public Boolean checkIfProjectDisclosureApproved(String personId, Integer moduleCode, String moduleItemKey);
	
	/**
	 * Used to check if the discloisure is synced with all the engagements 
	 * @param disclosureId
	 * @param documentOwnerId 
	 * @param engagementTypesNeeded 
	 * @return
	 */
	public Boolean isDisclosureSynced(Integer disclosureId, String documentOwnerId, String engagementTypesNeeded);

	/**
     * This method is used for update disclosure expiration date
     * @param disclosureId
	 * @param expirationDate 
     */
	public void updateDisclosureExpirationDate(Integer disclosureId, Timestamp expirationDate);

	 /**
     * This method fetches disclosure entity vs project relations of extended award disclosures
     * @param disclosureId
     * @param personId
     * @param disclosureNumber
     * @return list of ProjectEntityRequestDto
     */
	public List<ProjectEntityRequestDto> getDisclosureExtendingProjectDetails(Integer disclosureId, String personId, Integer disclosureNumber);

    	/**
     * This method is used to fetch the projects details based on Disclosure Review status.
     * @param disclosureId
	 * @param reviewTypeCode 
     */
	public List<DisclosureProjectDto> getAllSubmissionOrReviewDoneProjects(Integer disclosureId, String reviewTypeCode);

	/**
	 * This method is used to sync disclosure and person entities.
	 * 
	 * @param disclosureId
	 * @param sfiJsonString
	 */
	public void syncFcoiDisclAndPersonEntities(Integer disclosureId, String sfiJsonString);

	/**
	 * This method is used to get the count of active projects.
	 * 
	 * @param personId
	 * @param sfiJsonString
	 */
	Integer getActiveProjectsCount(String personId);

	/** To get the list of projects not yet synced with FCOI
	 * @param loginPersonId
	 * @return Map of projects along with module codes
	 */
	public Map<String, List<String>> getProjectDisclosuresForMarkAsVoid(String loginPersonId);
	
     /**
      * Retrieves a list of UnitAdministrator records matching the specified criteria.
      * 
      * @param adminTypeCode The type code of unit administrators to retrieve
      * @param unitNumber The unit number to filter administrators by
      * @return List of UnitAdministrator entities, or empty list if none found
      */
	List<UnitAdministrator> getUnitAdministrators(String adminTypeCode, String unitNumber);

    /**
     *
     * @param reviewStatusCode
     * @param disclosureId
     * @return
     */
    boolean isDisclReviewStatusIn(String reviewStatusCode, Integer disclosureId);

    /**
     *
     * @param disclosureId
     * @param updateTimesStamp
     * @param reviewStatusCode
     * @param dispositionStatusCode
     */
    void updateDisclosureStatuses(Integer disclosureId, Timestamp updateTimesStamp, String reviewStatusCode, String dispositionStatusCode);

    /**
     *
     * @param disclosureId
     * @return
     */
    Integer getDisclosureNumber(Integer disclosureId);

    /**
     *
     * @param disclosureId
     * @return
     */
    String getHomeUnit(Integer disclosureId);

    /**
     *
     * @param disclosureId
     * @return
     */
    CoiReviewStatusType getDisclosureReviewStatue(Integer disclosureId);

    /**
     * Get Expiring Disclosure Summary Data
     * @return
     */
    List<Map<String, String>> getExpiringDisclosureSumryData() throws SQLException;

    /**
     *
     * @param projectType
     * @param personId
     * @param moduleItemKey
     * @return
     */
    Integer getProjectDisclosureId(String projectType, String personId, String moduleItemKey);
    
    /**
   	 * This method is used to mark pending project disclosures as void
   	 * 
   	 * @param personId
   	 * @param actionType
   	 * @param moduleCode
   	 * @return list of MakeVoidDto
   	 */
    List<MakeVoidDto> markPendingDisclosuresAsVoid(String personId, String actionType, String moduleCode) throws SQLException;
}
