package com.polus.fibicomp.cmp.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.cmp.dto.CmpActionRequestDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanEntityRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanProjectRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanRecipientDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanResponseDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSecTmplMappingDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionCompDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanTemplateDto;
import com.polus.fibicomp.cmp.dto.CoiMgmtPlanAvailableActionDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpTypeProjectTypeRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSection;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanTemplate;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanTmplSecMapping;
import com.polus.fibicomp.coi.dto.ProjectSummaryDto;

public interface CoiManagementPlanService {

	/**
	 * Creates a new CMP template.
	 *
	 * @param template template DTO
	 * @return created template entity
	 */
	CoiManagementPlanTemplate createTemplate(CoiManagementPlanTemplateDto template);

	/**
	 * Updates an existing CMP template.
	 *
	 * @param template template DTO
	 * @return updated template entity
	 */
	CoiManagementPlanTemplate updateTemplate(CoiManagementPlanTemplateDto template);

	/**
	 * Deletes a CMP template.
	 *
	 * @param id template ID
	 */
	void deleteTemplate(Integer id);

	/**
	 * Retrieves all CMP templates.
	 *
	 * @return list of templates
	 */
	List<CoiManagementPlanTemplate> getAllTemplates();

	/**
	 * Fetches a CMP template by ID.
	 *
	 * @param id template ID
	 * @return matching template or null
	 */
	CoiManagementPlanTemplate getTemplateById(Integer id);

	/**
	 * Creates a CMP section definition.
	 *
	 * @param section section DTO
	 * @return created section
	 */
	CoiManagementPlanSection createSection(CoiManagementPlanSectionDto section);

	/**
	 * Updates a CMP section definition.
	 *
	 * @param section section DTO
	 * @return updated section
	 */
	CoiManagementPlanSection updateSection(CoiManagementPlanSectionDto section);

	/**
	 * Deletes a CMP section definition.
	 *
	 * @param id section ID
	 */
	void deleteSection(Integer id);

	/**
	 * Retrieves all CMP section definitions.
	 *
	 * @return list of sections
	 */
	List<CoiManagementPlanSection> getAllSections();

	/**
	 * Retrieves a CMP section definition by ID.
	 *
	 * @param id section ID
	 * @return matching section or null
	 */
	CoiManagementPlanSection getSectionById(Integer id);

	/**
	 * Creates a template–section mapping.
	 *
	 * @param mapping mapping DTO
	 * @return created mapping
	 */
	CoiMgmtPlanTmplSecMapping createMapping(CoiManagementPlanSecTmplMappingDto mapping);

	/**
	 * Updates a template–section mapping.
	 *
	 * @param mapping mapping DTO
	 * @return updated mapping
	 */
	CoiMgmtPlanTmplSecMapping updateMapping(CoiManagementPlanSecTmplMappingDto mapping);

	/**
	 * Retrieves all template–section mappings grouped by template name.
	 *
	 * @return grouped mappings
	 */
	Map<String, List<CoiMgmtPlanTmplSecMapping>> getAllMappings();

	/**
	 * Retrieves a mapping entry by ID.
	 *
	 * @param id mapping ID
	 * @return mapping entry or null
	 */
	CoiMgmtPlanTmplSecMapping getMappingById(Integer id);

	/**
	 * Deletes a template–section mapping.
	 *
	 * @param id mapping ID
	 */
	void deleteMapping(Integer id);

	/**
	 * Retrieves all mappings linked to a given section.
	 *
	 * @param id section ID
	 * @return list of mappings
	 */
	List<CoiMgmtPlanTmplSecMapping> getMappingBySectionId(Integer id);

	/**
	 * Creates a new CMP record.
	 *
	 * @param requestDto CMP DTO
	 * @return created CMP
	 */
	CoiManagementPlan createPlan(CoiManagementPlanDto requestDto);

	/**
	 * Updates an existing CMP.
	 *
	 * @param requestDto CMP DTO
	 * @return updated CMP
	 */
	CoiManagementPlan updatePlan(CoiManagementPlanDto requestDto);

	/**
	 * Deletes a CMP.
	 *
	 * @param cmpId CMP ID
	 */
	void deletePlan(Integer cmpId);

	/**
	 * Retrieves a CMP with full details.
	 *
	 * @param cmpId CMP ID
	 * @return response wrapper DTO
	 */
	CoiManagementPlanResponseDto getPlanById(Integer cmpId);

	/**
	 * Retrieves all CMPs.
	 *
	 * @return list of CMPs
	 */
	List<CoiManagementPlan> getAllPlans();

	/**
	 * Creates a CMP–section relation.
	 *
	 * @param dto relation DTO
	 * @return created relation
	 */
	CoiManagementPlanSectionRelDto createPlanSectionRel(CoiManagementPlanSectionRelDto dto);

	/**
	 * Updates a CMP–section relation.
	 *
	 * @param dto relation DTO
	 * @return updated relation
	 */
	CoiManagementPlanSectionRelDto updatePlanSectionRel(CoiManagementPlanSectionRelDto dto);

	/**
	 * Deletes a CMP–section relation.
	 *
	 * @param cmpSectionRelId relation ID
	 */
	void deletePlanSectionRel(Integer cmpSectionRelId);

	/**
	 * Creates a CMP section component.
	 *
	 * @param dto component DTO
	 * @return created component
	 */
	CoiManagementPlanSectionCompDto createPlanSectionComp(CoiManagementPlanSectionCompDto dto);

	/**
	 * Updates a CMP section component.
	 *
	 * @param dto component DTO
	 * @return updated component
	 */
	CoiManagementPlanSectionCompDto updatePlanSectionComp(CoiManagementPlanSectionCompDto dto);

	/**
	 * Deletes a section component.
	 *
	 * @param secCompId component ID
	 */
	void deletePlanSectionComp(Integer secCompId);

	/**
	 * Executes a workflow action and updates CMP status accordingly.
	 *
	 * @param request action request DTO
	 * @return updated CMP
	 */
	CoiManagementPlan updateCmpStatus(CmpActionRequestDto request);

	/**
	 * Fetches all workflow actions available for a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of actions
	 */
	List<CoiMgmtPlanAvailableActionDto> getAvailableActions(Integer cmpId);

	/**
	 * Retrieves supported CMP attachment types.
	 *
	 * @return HTTP response with attachment-type list
	 */
	ResponseEntity<Object> getCmpAttachTypes();

	/**
	 * Attempts to lock a section component for editing.
	 *
	 * @param secCompId component ID
	 * @param loginUser user requesting the lock
	 * @return lock status response
	 */
	ResponseEntity<?> lockSectionComponent(Integer secCompId, String loginUser);

	/**
	 * Releases a component lock if held by the specified user.
	 *
	 * @param secCompId component ID
	 * @param loginUser user releasing the lock
	 */
	void unlockSectionComponent(Integer secCompId, String loginUser);

	/**
	 * Refreshes an existing component lock to extend its timeout.
	 *
	 * @param secCompId component ID
	 * @param loginUser user refreshing the lock
	 * @return refresh result
	 */
	ResponseEntity<?> refreshSectionComponentLock(Integer secCompId, String loginUser);

	/**
	 * Generates and stores CMP print documents (PDF/DOCX).
	 *
	 * @param cmpId CMP ID
	 * @param isRegenerate 
	 */
	void printCmpDocument(Integer cmpId, Boolean isRegenerate);

	/**
	 * Retrieves the full hierarchical structure of CMP sections and components.
	 *
	 * @param cmpId CMP ID
	 * @return hierarchical response map
	 */
	Map<String, Object> getSectionHierarchyByCmpId(Integer cmpId);

	/**
	 * Retrieves CMP–entity relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of entity-rel DTOs
	 */
	List<CoiManagementPlanEntityRelDto> getEntityRelations(Integer cmpId);

	/**
	 * Retrieves CMP–project relations for a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of project-rel DTOs
	 */
	List<CoiManagementPlanProjectRelDto> getProjectRelations(Integer cmpId);

	/**
	 * Performs a project search filtered by module, person, and text.
	 *
	 * @param moduleCode module code
	 * @param personId   person ID
	 * @param searchText search text
	 * @return list of project summaries
	 */
	List<ProjectSummaryDto> getProjectSummaryDetails(Integer moduleCode, String personId, String searchText);

	/**
	 * Retrieves all valid CMP-project type relationships.
	 *
	 * @return list of valid type relations
	 */
	List<CoiCmpTypeProjectTypeRel> getAllValidProjectTypes();

	/**
	 * Fetches section-relation history for a relation ID.
	 *
	 * @param cmpSectionRelId relation ID
	 * @return history entries
	 */
	List<CoiMgmtPlanSecRelHist> getSectionRelHistory(Integer cmpSectionRelId);

	/**
	 * Fetches section-component history for a component ID.
	 *
	 * @param secCompId component ID
	 * @return history entries
	 */
	List<CoiMgmtPlanSecCompHist> getSectionCompHistory(Integer secCompId);

	/**
	 * Creates a CMP recipient entry.
	 *
	 * @param dto recipient DTO
	 * @return created recipient
	 */
	CoiManagementPlanRecipientDto createRecipient(CoiManagementPlanRecipientDto dto);

	/**
	 * Updates a CMP recipient entry.
	 *
	 * @param dto recipient DTO
	 * @return updated recipient
	 */
	CoiManagementPlanRecipientDto updateRecipient(CoiManagementPlanRecipientDto dto);

	/**
	 * Retrieves all CMP recipients linked to a CMP.
	 *
	 * @param cmpId CMP ID
	 * @return list of recipients
	 */
	List<CoiManagementPlanRecipientDto> getRecipientsByCmpId(Integer cmpId);

	/**
	 * Deletes a CMP recipient record.
	 *
	 * @param cmpRecipientId recipient ID
	 */
	void deleteRecipient(Integer cmpRecipientId);
}
