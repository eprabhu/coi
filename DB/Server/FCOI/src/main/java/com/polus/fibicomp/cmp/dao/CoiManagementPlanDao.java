package com.polus.fibicomp.cmp.dao;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttaType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanEntityRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanProjectRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanRecipient;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSection;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionComp;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionRel;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanAvailableAction;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompLock;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;
import com.polus.fibicomp.coi.dto.ProjectSummaryDto;

public interface CoiManagementPlanDao {

	/**
	 * Generates the next sequential CMP number from the underlying store.
	 *
	 * @return next available CMP number
	 */
	Integer generateNextCmpNumber();

	/**
	 * Saves a CMP–entity relationship.
	 *
	 * @param entityRel the relation to persist
	 * @return the persisted entity relation
	 */
	CoiManagementPlanEntityRel saveEntityRelation(CoiManagementPlanEntityRel entityRel);

	/**
	 * Saves a CMP–project relationship.
	 *
	 * @param projectRel the relation to persist
	 * @return the persisted project relation
	 */
	CoiManagementPlanProjectRel saveProjectRelation(CoiManagementPlanProjectRel projectRel);

	/**
	 * Saves a CMP section relation.
	 *
	 * @param sectionRel section relation to persist
	 * @return the persisted section relation
	 */
	CoiManagementPlanSectionRel saveSectionRelation(CoiManagementPlanSectionRel sectionRel);

	/**
	 * Saves a section-relation history entry.
	 *
	 * @param history history entry to persist
	 * @return the persisted history record
	 */
	CoiMgmtPlanSecRelHist saveSectionRelationHistory(CoiMgmtPlanSecRelHist history);

	/**
	 * Saves a section component.
	 *
	 * @param comp component to persist
	 * @return the persisted component
	 */
	CoiManagementPlanSectionComp saveSectionComponent(CoiManagementPlanSectionComp comp);

	/**
	 * Saves a section-component history entry.
	 *
	 * @param history component history entry
	 * @return the persisted history entry
	 */
	CoiMgmtPlanSecCompHist saveSectionComponentHistory(CoiMgmtPlanSecCompHist history);

	/**
	 * Persists the CMP parent record.
	 *
	 * @param cmp CMP instance to save
	 * @return the persisted CMP
	 */
	CoiManagementPlan saveCmp(CoiManagementPlan cmp);

	/**
	 * Deletes all CMP–entity relations for the given CMP.
	 *
	 * @param cmpId CMP ID
	 */
	void deleteEntityRelations(Integer cmpId);

	/**
	 * Retrieves valid CMP attachment types.
	 *
	 * @return list of attachment types
	 */
	List<CoiManagementPlanAttaType> getCmpAttachTypes();

	/**
	 * Retrieves the lock record for a section component.
	 *
	 * @param secCompId section component ID
	 * @return lock record or null if unlocked
	 */
	CoiMgmtPlanSecCompLock getSectionCompLock(Integer secCompId);

	/**
	 * Creates a lock record for the section component.
	 *
	 * @param secCompId section component ID
	 * @param lockedBy  user acquiring lock
	 * @param lockedAt  timestamp of lock acquisition
	 */
	void insertSectionCompLock(Integer secCompId, String lockedBy, Timestamp lockedAt);

	/**
	 * Updates an existing lock record.
	 *
	 * @param secCompId section component ID
	 * @param lockedBy  user updating lock
	 * @param lockedAt  timestamp of update
	 */
	void updateSectionCompLock(Integer secCompId, String lockedBy, Timestamp lockedAt);

	/**
	 * Deletes a lock record if owned by the specified user.
	 *
	 * @param secCompId section component ID
	 * @param lockedBy  user identifier
	 */
	void deleteSectionCompLock(Integer secCompId, String lockedBy);

	/**
	 * Updates only the "lockedAt" timestamp.
	 *
	 * @param secCompId section component ID
	 * @param lockedAt  new timestamp
	 */
	void updateLockedAt(Integer secCompId, Timestamp lockedAt);

	/**
	 * Fetches all section relations linked to a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of section relations
	 */
	List<CoiManagementPlanSectionRel> getSectionRelationsByCmpId(Integer cmpId);

	/**
	 * Fetches section components for a list of section-relation IDs.
	 *
	 * @param sectionIds relation IDs
	 * @return list of section components
	 */
	List<CoiManagementPlanSectionComp> getSectionComponentsBySectionRelIds(List<Integer> sectionIds);

	/**
	 * Retrieves all CMP–entity relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return entity relations
	 */
	List<CoiManagementPlanEntityRel> getEntityRelationsByCmpId(Integer cmpId);

	/**
	 * Retrieves all CMP–project relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return project relations
	 */
	List<CoiManagementPlanProjectRel> getProjectRelationsByCmpId(Integer cmpId);

	/**
	 * Retrieves an award summary by project number.
	 *
	 * @param projectNumber award/project number
	 * @return summary DTO or null
	 */
	ProjectSummaryDto getAwardSummary(String projectNumber);

	/**
	 * Retrieves a proposal summary by proposal number.
	 *
	 * @param proposalNumber proposal number
	 * @return summary DTO or null
	 */
	ProjectSummaryDto getProposalSummary(String proposalNumber);

	/**
	 * Deletes all section components under a section relation.
	 *
	 * @param cmpSectionRelId section relation ID
	 */
	void deleteSectionComponentsByRelId(Integer cmpSectionRelId);

	/**
	 * Deletes section-relation history entries for a section relation.
	 *
	 * @param cmpSectionRelId section relation ID
	 */
	void deleteSectionRelationHistory(Integer cmpSectionRelId);

	/**
	 * Deletes a section relation.
	 *
	 * @param cmpSectionRelId section relation ID
	 */
	void deleteSectionRelation(Integer cmpSectionRelId);

	/**
	 * Retrieves a section relation by ID.
	 *
	 * @param cmpSectionRelId ID
	 * @return section relation or null
	 */
	CoiManagementPlanSectionRel getSectionRelationById(Integer cmpSectionRelId);

	/**
	 * Deletes all section-relation history entries for a CMP.
	 *
	 * @param cmpId CMP ID
	 */
	void deleteSectionRelationHistoryByCmpId(Integer cmpId);

	/**
	 * Deletes all section relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 */
	void deleteSectionRelationsByCmpId(Integer cmpId);

	/**
	 * Deletes a CMP record.
	 *
	 * @param cmpId CMP ID
	 */
	void deleteCmp(Integer cmpId);

	/**
	 * Deletes all CMP–project relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 */
	void deleteProjectRelations(Integer cmpId);

	/**
	 * Retrieves a CMP by its ID.
	 *
	 * @param cmpId CMP ID
	 * @return CMP instance or null
	 */
	CoiManagementPlan getCmpById(Integer cmpId);

	/**
	 * Retrieves a section component by its ID.
	 *
	 * @param secCompId component ID
	 * @return section component or null
	 */
	CoiManagementPlanSectionComp getSectionComponentById(Integer secCompId);

	/**
	 * Deletes a section component.
	 *
	 * @param secCompId component ID
	 */
	void deleteSectionComponent(Integer secCompId);

	/**
	 * Deletes component-history entries for a section component.
	 *
	 * @param secCompId component ID
	 */
	void deleteSectionComponentHistory(Integer secCompId);

	/**
	 * Searches projects for a person under a module and a search term.
	 *
	 * @param moduleCode module identifier
	 * @param personId   person identifier
	 * @param searchText search filter
	 * @return list of project summary DTOs
	 */
	List<ProjectSummaryDto> getProjectSummaryDetails(Integer moduleCode, String personId, String searchText);

	/**
	 * Retrieves history entries for a section relation.
	 *
	 * @param cmpSectionRelId section relation ID
	 * @return history records
	 */
	List<CoiMgmtPlanSecRelHist> getSectionRelHistory(Integer cmpSectionRelId);

	/**
	 * Retrieves history entries for a section component.
	 *
	 * @param secCompId component ID
	 * @return history records
	 */
	List<CoiMgmtPlanSecCompHist> getSectionCompHistory(Integer secCompId);

	/**
	 * Retrieves an available action by ID.
	 *
	 * @param availableActionId action ID
	 * @return action definition or null
	 */
	CoiMgmtPlanAvailableAction getAvailableAction(Integer availableActionId);

	/**
	 * Retrieves an action-type definition.
	 *
	 * @param actionTypeCode type code
	 * @return action type or null
	 */
	CoiManagementPlanActionType getActionType(String actionTypeCode);

	/**
	 * Saves a CMP recipient entry.
	 *
	 * @param r recipient to persist
	 * @return saved recipient
	 */
	CoiManagementPlanRecipient saveRecipient(CoiManagementPlanRecipient r);

	/**
	 * Retrieves a CMP recipient by ID.
	 *
	 * @param id recipient ID
	 * @return matching recipient or null
	 */
	CoiManagementPlanRecipient getRecipientById(Integer id);

	/**
	 * Retrieves all recipients linked to a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of recipients
	 */
	List<CoiManagementPlanRecipient> getRecipientsByCmpId(Integer cmpId);

	/**
	 * Deletes a CMP recipient.
	 *
	 * @param id recipient ID
	 */
	void deleteRecipient(Integer id);

	CoiManagementPlanSectionRel getSectionByCmpSectionRelId(Integer cmpSectionRelId);

	CoiManagementPlanSectionComp getSectionCompBySecCompId(Integer secCompId);
}
