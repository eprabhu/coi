package com.polus.fibicomp.coi.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.coi.dto.EngagementsDetailsDTO;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.PerEntDisclTypeSelection;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;

public interface PersonEntityService {

    /**
     * This method is used to create PersonEntity
     *
     * @param personEntity
     * @return vo
     */
    ResponseEntity<Object> createPersonEntity(PersonEntity personEntity);

    /**
     * This method is used to create CoiFinancialEntityDetails
     *
     * @param personEntityRelationship
     * @return COIFinancialEntityDetails
     */
    PersonEntityDto saveOrUpdatePersonEntityRelationship(PersonEntityRelationship personEntityRelationship);

    /**
     * This method fetches person entity details by person entity id
     *
     * @param personEntityId
     * @return
     */
    ConflictOfInterestVO getPersonEntityDetails(Integer personEntityId);

    /**
     * Person entity dashboard
     *
     * @param vo
     * @return
     */
    ResponseEntity<Object> getPersonEntityDashboard(CoiDashboardVO vo);

    /**
     * This method is used to update person entity
     *
     * @param personEntityDto
     * @return
     */
    PersonEntityDto updatePersonEntity(PersonEntityDto personEntityDto);

    /**
     * This method is used to delete Person Entity Relationship
     *
     * @param personEntityRelId
     * @param personEntityId
     * @return
     */
    ResponseEntity<Object> deletePersonEntityRelationship(Integer personEntityRelId, Integer personEntityId);

    /**
     * This method is used to activate/inactive  person entity
     *
     * @param personEntityDto
     * @return
     */
    ResponseEntity<Object> activateOrInactivatePersonEntity(PersonEntityDto personEntityDto);

    /**
     * This method is used to delete Person entity
     *
     * @param personEntityId
     * @return
     */
    ResponseEntity<PersonEntityDto> deletePersonEntity(Integer personEntityId);

    ResponseEntity<Object> getPersonEntityRelationship(ConflictOfInterestVO vo);

    /**
     * This service is used to fetch the latest active person entity
     *
     * @param personEntityNumber
     * @return
     */
    ResponseEntity<Object> getSFILatestVersion(Integer personEntityNumber);

    /**
     * This method fetches all person entity versions
     *
     * @param personEntityNumber person entity number
     * @return List of objects with version number and person entity id
     */
    ResponseEntity<Object> getAllPersonEntityVersions(Integer personEntityNumber);

    /**
     * This method checks the relationships forms are completed or not
     * and updates person entity  isFormCompleted flag
     *
     * @param personEntityId
     * @return
     */
    ResponseEntity<Map<String, Object>> updatePersonEntityCompleteFlag(Integer personEntityId);

    /**
     * This method is used for get list of sfi of a person
     * @param vo
     * @return A list of sfi
     */
    ResponseEntity<Object> getSFIOfDisclosure(ConflictOfInterestVO vo);

    /**
     * This method is used to get list of sfi details based on coiFinancialEntityId
     * @param coiFinancialEntityId
     * @return A list of sfi details
     */
    ResponseEntity<Object> getSFIDetails(Integer coiFinancialEntityId);

    /**
     * This method is used to validate and modify a person entity based on following condition
     * 1) if the current version of person entity is not used anywhere, makes this version to draft
     * 2) if the current version of person entity is used anywhere, creates a new version in draft status
     * @param personEntityDto
     * @return person entity
     */
    ResponseEntity<Object> modifyPersonEntity(PersonEntityDto personEntityDto);

    /**
	 * This method is used to fetch PerEntDisclTypeSelection by personEntityId
	 * @return List of PerEntDisclTypeSelection
	 */
	List<PerEntDisclTypeSelection> fetchPerEntDisclTypeSelection(Integer personEntityId);

	/**
	 * This method is used to delete PerEntRelationship by perEntDisclTypeSelectedId, personEntityId
	 * @return 
	 */
	PersonEntityDto deletePerEntRelationshipByDisclType(EngagementsDetailsDTO engagementsDetail);

    void saveRelationshipDetails(PersonEntity personEntity, String loginPersonId, String loginUserName, Boolean isSystemCreated);

    public void notifyUserAndAddtoInbox(PersonEntity personEntity, String entityName, String loginPersonId, String loginUserName);

    /**
     * This method is used to update person entity relationship based on parameters
     * @param engDetailsDTO
     * @return
     */
    ResponseEntity<Object> updateEngFinRelation(EngagementsDetailsDTO engDetailsDTO);

    /**
     * This method is used to send notification and action list based on the parameters passed
     * @param personEntity
     * @param engagementName
     * @param validPersonEntityRelTypeDesc
     * @param reporterName
     */
    public void notifyUserAndAddToInbox(PersonEntity personEntity, String engagementName, String validPersonEntityRelTypeDesc, String reporterName);

    /**
	 * This method is used to update PersonEntity header update details
	 * @param personEntityId
	 */
	void updatePersonEntityUpdateDetails(Integer personEntityId);

	/**
	 * Updates the compensation amount for a given person entity.
	 *
	 * @param personEntityId
	 * @param compensationAmount
	 */
	void updatePersonEntityCompensationAmount(Integer personEntityId, BigDecimal compensationAmount);

	/**
	 * To fetch compensation amount for a given person entity.
	 *
	 * @param personEntityId
	 */
	BigDecimal fetchCompensationAmount(Integer personEntityId);

	/**
	 * To evaluate whether given engagement is SFI.
	 *
	 * @param personEntityId
	 */
	Map<String, Object> evaluateSfi(Integer personEntityId);

    /**
     * Update Engagement Relationship
     * @param engDetailsDTO
     * @return
     */
    ResponseEntity<Object> updateEngRelation(EngagementsDetailsDTO engDetailsDTO);

    /**
	 * To mark engagement as incomplete.
	 *
	 * @param personEntityId
	 */
	void markAsIncomplete(Integer personEntityId);

}
