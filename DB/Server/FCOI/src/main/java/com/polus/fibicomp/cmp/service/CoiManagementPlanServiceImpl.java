package com.polus.fibicomp.cmp.service;

import java.sql.Timestamp;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dao.CoiManagementPlanDao;
import com.polus.fibicomp.cmp.dto.CmpActionRequestDto;
import com.polus.fibicomp.cmp.dto.CmpCommonDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanEntityRelDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanFileAttachmentDto;
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
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanEntityRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanProjectRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanRecipient;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSection;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionComp;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanStatusType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanTemplate;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanAvailableAction;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompLock;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanTmplSecMapping;
import com.polus.fibicomp.cmp.repository.CmpTypeProjectTypeRelRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanActionTypeRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanSectionCompRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanSectionRelRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanSectionRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanStatusTypeRepository;
import com.polus.fibicomp.cmp.repository.CoiManagementPlanTemplateRepository;
import com.polus.fibicomp.cmp.repository.CoiMgmtPlanAvailableActionRepository;
import com.polus.fibicomp.cmp.repository.CoiMgmtPlanSecCompHistRepository;
import com.polus.fibicomp.cmp.repository.CoiMgmtPlanSecRelHistRepository;
import com.polus.fibicomp.cmp.repository.CoiMgmtPlanTmplSecMappingRepository;
import com.polus.fibicomp.coi.clients.PrintServiceClient;
import com.polus.fibicomp.coi.clients.model.PrintRequestDto;
import com.polus.fibicomp.coi.dto.ProjectSummaryDto;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoiManagementPlanServiceImpl implements CoiManagementPlanService {

	private final CoiManagementPlanTemplateRepository templateRepo;
	private final CoiManagementPlanSectionRepository sectionRepo;
	private final CoiMgmtPlanTmplSecMappingRepository mappingRepo;
	private final CoiManagementPlanRepository cmpRepo;
	private final CoiManagementPlanSectionRelRepository cmpSectionRelRepo;
	private final CoiManagementPlanSectionCompRepository cmpSecCompRepo;
	private final CommonDao commonDao;
	private final CoiManagementPlanDao dao;
	private final CoiMgmtPlanSecRelHistRepository secRelHistRepo;
	private final CoiMgmtPlanSecCompHistRepository secCompHistRepo;
	private final CoiMgmtPlanAvailableActionRepository availableActionRepo;
	private final CoiManagementPlanActionTypeRepository actionTypeRepo;
	private final CoiManagementPlanStatusTypeRepository statusRepo;
	private final PrintServiceClient printServiceClient;
	private final GlobalEntityService entityDetailsService;
	private final CoiManagementPlanFileAttachmentService fileAttachmentService;
	private final PersonDao personDao;
	private final CmpTypeProjectTypeRelRepository typeRelRepo;
	private final ActionLogService actionLogService;
	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	private static final String ADDENDUM_SECTION_NAME = "Addendum";

	@Override
	public CoiManagementPlanTemplate createTemplate(CoiManagementPlanTemplateDto templateDto) {
		CoiManagementPlanTemplate template = CoiManagementPlanTemplate.builder()
				.templateName(templateDto.getTemplateName()).description(templateDto.getDescription())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updatedTimestamp(commonDao.getCurrentTimestamp())
				.build();
		return templateRepo.save(template);
	}

	@Override
	public CoiManagementPlanTemplate updateTemplate(CoiManagementPlanTemplateDto templateDto) {
		CoiManagementPlanTemplate existingTemplate = templateRepo.findById(templateDto.getTemplateId()).orElseThrow(
				() -> new IllegalArgumentException("Template not found with ID: " + templateDto.getTemplateId()));
		CoiManagementPlanTemplate updatedTemplate = CoiManagementPlanTemplate.builder()
				.templateId(existingTemplate.getTemplateId())
				.templateName(templateDto.getTemplateName() != null ? templateDto.getTemplateName()
						: existingTemplate.getTemplateName())
				.description(templateDto.getDescription() != null ? templateDto.getDescription()
						: existingTemplate.getDescription())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updatedTimestamp(commonDao.getCurrentTimestamp())
				.build();
		return templateRepo.save(updatedTemplate);
	}

	@Override
	public void deleteTemplate(Integer id) {
		templateRepo.findById(id).ifPresent(templateRepo::delete);
	}

	@Override
	public List<CoiManagementPlanTemplate> getAllTemplates() {
		List<CoiManagementPlanTemplate> templates = templateRepo.findAll();
		return templates;
	}

	@Override
	public CoiManagementPlanTemplate getTemplateById(Integer id) {
		return templateRepo.findById(id).orElse(null);
	}

	@Override
	public CoiManagementPlanSection createSection(CoiManagementPlanSectionDto sectionDto) {
		CoiManagementPlanSection section = CoiManagementPlanSection.builder().sectionName(sectionDto.getSectionName())
				.description(sectionDto.getDescription()).updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		return sectionRepo.save(section);
	}

	@Override
	public CoiManagementPlanSection updateSection(CoiManagementPlanSectionDto sectionDto) {
		CoiManagementPlanSection existingSection = sectionRepo.findById(sectionDto.getSectionId()).orElseThrow(
				() -> new IllegalArgumentException("Section not found with ID: " + sectionDto.getSectionId()));
		CoiManagementPlanSection updatedSection = CoiManagementPlanSection.builder()
				.sectionId(existingSection.getSectionId())
				.sectionName(sectionDto.getSectionName() != null ? sectionDto.getSectionName()
						: existingSection.getSectionName())
				.description(sectionDto.getDescription() != null ? sectionDto.getDescription()
						: existingSection.getDescription())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
		return sectionRepo.save(updatedSection);
	}

	@Override
	public void deleteSection(Integer id) {
		sectionRepo.findById(id).ifPresent(sectionRepo::delete);
	}

	@Override
	public List<CoiManagementPlanSection> getAllSections() {
		List<CoiManagementPlanSection> sections = sectionRepo.findAll();
		return sections;
	}

	@Override
	public CoiManagementPlanSection getSectionById(Integer id) {
		return sectionRepo.findById(id).orElse(null);
	}

	@Override
	public CoiMgmtPlanTmplSecMapping createMapping(CoiManagementPlanSecTmplMappingDto mappingDto) {
		CoiMgmtPlanTmplSecMapping mapping = CoiMgmtPlanTmplSecMapping.builder().templateId(mappingDto.getTemplateId())
				.sectionId(mappingDto.getSectionId()).sortOrder(mappingDto.getSortOrder())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
		return mappingRepo.save(mapping);
	}

	@Override
	public CoiMgmtPlanTmplSecMapping updateMapping(CoiManagementPlanSecTmplMappingDto mappingDto) {
		CoiMgmtPlanTmplSecMapping existingMapping = mappingRepo.findById(mappingDto.getTmplSecMappingId()).orElseThrow(
				() -> new IllegalArgumentException("Template not found with ID: " + mappingDto.getTmplSecMappingId()));
		CoiMgmtPlanTmplSecMapping updatedMapping = CoiMgmtPlanTmplSecMapping.builder()
				.tmplSecMappingId(existingMapping.getTmplSecMappingId())
				.templateId(mappingDto.getTemplateId() != null ? mappingDto.getTemplateId()
						: existingMapping.getTemplateId())
				.sectionId(
						mappingDto.getSectionId() != null ? mappingDto.getSectionId() : existingMapping.getSectionId())
				.sortOrder(
						mappingDto.getSortOrder() != null ? mappingDto.getSortOrder() : existingMapping.getSortOrder())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
		return mappingRepo.save(updatedMapping);
	}

	@Override
	public Map<String, List<CoiMgmtPlanTmplSecMapping>> getAllMappings() {
		List<CoiMgmtPlanTmplSecMapping> mappings = mappingRepo.findAll();
		Map<String, List<CoiMgmtPlanTmplSecMapping>> grouped = mappings.stream()
				.collect(Collectors.groupingBy(CoiMgmtPlanTmplSecMapping::getName));
		return grouped;
	}

	@Override
	public CoiMgmtPlanTmplSecMapping getMappingById(Integer id) {
		return mappingRepo.findById(id).orElse(null);
	}

	@Override
	public void deleteMapping(Integer id) {
		mappingRepo.findById(id).ifPresent(mappingRepo::delete);
	}

	@Override
	public List<CoiMgmtPlanTmplSecMapping> getMappingBySectionId(Integer sectionId) {
		List<CoiMgmtPlanTmplSecMapping> mappings = mappingRepo.findBySectionId(sectionId);
		return mappings;
	}

	@Transactional
	@Override
	public CoiManagementPlan createPlan(CoiManagementPlanDto cmpDto) {
		validateCreateRequest(cmpDto);
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		Integer cmpNumber = dao.generateNextCmpNumber();
		log.info("Generated new CMP number: {} for personId: {}", cmpNumber, cmpDto.getPersonId());
		CoiManagementPlan cmp = buildNewCoiManagementPlan(cmpDto, cmpNumber, loginUser, updateTimestamp);
		cmp = dao.saveCmp(cmp);
		CmpCommonDto logDto = CmpCommonDto.builder().cmpId(cmp.getCmpId()).cmpNumber(cmp.getCmpNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build();
		actionLogService.saveCMPActionLog(Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_CREATED, logDto);
		Integer cmpId = cmp.getCmpId();
		saveEntityRelations(cmpId, cmpDto.getEntityRelations(), loginUser, updateTimestamp);
		saveProjectRelations(cmpId, cmpDto.getProjectRelations(), loginUser, updateTimestamp);
		saveSectionHierarchyWithHistoryOnCreate(cmpId, cmpDto.getSectionRelations(), loginUser, updateTimestamp);
		createAddendumSection(cmpId, loginUser, updateTimestamp);
		log.info("Created COI Management Plan with ID: {}", cmpId);
		return cmp;
	}

	private void createAddendumSection(Integer cmpId, String loginUser, Timestamp ts) {
		List<CoiManagementPlanSectionRel> existing = dao.getSectionRelationsByCmpId(cmpId).stream()
				.filter(sec -> ADDENDUM_SECTION_NAME.equalsIgnoreCase(sec.getSectionName())).toList();
		if (!existing.isEmpty()) {
			return;
		}
		CoiManagementPlanSectionRel rel = CoiManagementPlanSectionRel.builder().cmpId(cmpId)
				.sectionName(ADDENDUM_SECTION_NAME).description(null).sortOrder(null).updatedBy(loginUser)
				.updateTimestamp(ts).build();
		rel = dao.saveSectionRelation(rel);
		dao.saveSectionRelationHistory(CoiMgmtPlanSecRelHist.builder().cmpId(cmpId)
				.cmpSectionRelId(rel.getCmpSectionRelId()).actionType(CoreConstants.acTypeInsert).oldData(null)
				.newData(cmpSectionRelToJson(rel)).updatedBy(loginUser).updateTimestamp(ts).build());
	}

	private void validateCreateRequest(CoiManagementPlanDto cmpDto) {
		if (cmpDto == null) {
			throw new IllegalArgumentException("CMP DTO cannot be null");
		}
		boolean hasPersonId = cmpDto.getPersonId() != null && !cmpDto.getPersonId().isBlank();
		boolean hasRolodexId = cmpDto.getRolodexId() != null;
		if (!hasPersonId && !hasRolodexId) {
			throw new IllegalArgumentException("Either Person ID or Rolodex ID is required to create a CMP");
		}
		if (cmpDto.getCmpTypeCode() == null) {
			throw new IllegalArgumentException("CMP Type Code is required");
		}
	}

	private CoiManagementPlan buildNewCoiManagementPlan(CoiManagementPlanDto cmpDto, Integer cmpNumber,
			String loginUser, Timestamp updateTimestamp) {
		return CoiManagementPlan.builder().cmpNumber(cmpNumber).cmpTypeCode(cmpDto.getCmpTypeCode())
				.personId(cmpDto.getPersonId()).versionNumber(Constants.COI_INITIAL_VERSION_NUMBER)
				.versionStatus(Constants.COI_PENDING_STATUS)
				.cmpStatusCode(Constants.COI_MANAGEMENT_PLAN_REVIEW_STATUS_IN_PROGRESS)
				.academicDepartmentNumber(cmpDto.getAcademicDepartmentNumber())
				.labCenterNumber(cmpDto.getLabCenterNumber()).subAwardInstituteCode(cmpDto.getSubAwardInstituteCode())
				.rolodexId(cmpDto.getRolodexId()).createdBy(loginUser).createdTimestamp(updateTimestamp)
				.updatedBy(loginUser).updateTimestamp(updateTimestamp).build();
	}

	private void saveEntityRelations(Integer cmpId, List<CoiManagementPlanEntityRelDto> entityRelations,
			String loginUser, Timestamp updateTimestamp) {
		if (entityRelations == null || entityRelations.isEmpty()) {
			return;
		}
		for (CoiManagementPlanEntityRelDto rel : entityRelations) {
			if (rel == null)
				continue;
			CoiManagementPlanEntityRel entityRel = CoiManagementPlanEntityRel.builder().cmpId(cmpId)
					.personEntityNumber(rel.getPersonEntityNumber()).entityNumber(rel.getEntityNumber())
					.updatedBy(loginUser).updateTimestamp(updateTimestamp).build();
			dao.saveEntityRelation(entityRel);
		}
	}

	private void saveProjectRelations(Integer cmpId, List<CoiManagementPlanProjectRelDto> projectRelations,
			String loginUser, Timestamp updateTimestamp) {
		if (projectRelations == null || projectRelations.isEmpty()) {
			return;
		}
		for (CoiManagementPlanProjectRelDto rel : projectRelations) {
			if (rel == null)
				continue;
			CoiManagementPlanProjectRel projectRel = CoiManagementPlanProjectRel.builder().cmpId(cmpId)
					.moduleCode(rel.getModuleCode()).moduleItemKey(rel.getModuleItemKey()).updatedBy(loginUser)
					.updateTimestamp(updateTimestamp).build();
			dao.saveProjectRelation(projectRel);
		}
	}

	private void saveSectionHierarchyWithHistoryOnCreate(Integer cmpId,
			List<CoiManagementPlanSectionRelDto> sectionRelations, String loginUser, Timestamp updateTimestamp) {
		if (sectionRelations == null || sectionRelations.isEmpty()) {
			return;
		}
		Map<String, List<CoiManagementPlanSectionRelDto>> grouped = sectionRelations.stream().filter(Objects::nonNull)
				.collect(Collectors.groupingBy(CoiManagementPlanSectionRelDto::getSectionName));
		for (Map.Entry<String, List<CoiManagementPlanSectionRelDto>> entry : grouped.entrySet()) {
			List<CoiManagementPlanSectionRelDto> secList = entry.getValue();
			CoiManagementPlanSectionRelDto first = secList.get(0);
			CoiManagementPlanSectionRel section = CoiManagementPlanSectionRel.builder().cmpId(cmpId)
					.sectionName(first.getSectionName()).description(first.getDescription()).createdBy(loginUser)
					.createTimestamp(updateTimestamp).sortOrder(first.getSortOrder()).updatedBy(loginUser)
					.updateTimestamp(updateTimestamp).build();
			section = dao.saveSectionRelation(section);
			logSectionAction(cmpId, dao.getCmpById(cmpId).getCmpNumber(), section.getSectionName(),
					Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_SECTION_ADDED);
			CoiMgmtPlanSecRelHist sectionHistory = CoiMgmtPlanSecRelHist.builder().cmpId(cmpId)
					.cmpSectionRelId(section.getCmpSectionRelId()).actionType(CoreConstants.acTypeInsert).oldData(null)
					.newData(cmpSectionRelToJson(section)).updatedBy(loginUser).updateTimestamp(updateTimestamp)
					.build();
			dao.saveSectionRelationHistory(sectionHistory);
			List<CoiManagementPlanSectionCompDto> mergedComponents = secList.stream()
					.flatMap(sec -> sec.getComponents().stream()).collect(Collectors.toList());
			saveSectionComponentsWithHistoryOnCreate(section.getCmpSectionRelId(), mergedComponents, loginUser,
					updateTimestamp);
		}
	}

	private void saveSectionComponentsWithHistoryOnCreate(Integer cmpSectionRelId,
			List<CoiManagementPlanSectionCompDto> components, String loginUser, Timestamp updateTimestamp) {
		if (components == null || components.isEmpty()) {
			return;
		}
		for (CoiManagementPlanSectionCompDto comp : components) {
			if (comp == null)
				continue;
			CoiManagementPlanSectionComp sectionComp = CoiManagementPlanSectionComp.builder()
					.cmpSectionRelId(cmpSectionRelId).description(comp.getDescription()).sortOrder(comp.getSortOrder())
					.createdBy(loginUser).createTimestamp(updateTimestamp).updatedBy(loginUser)
					.updateTimestamp(updateTimestamp).build();
			sectionComp = dao.saveSectionComponent(sectionComp);
			CoiMgmtPlanSecCompHist compHist = CoiMgmtPlanSecCompHist.builder().cmpSectionRelId(cmpSectionRelId)
					.secCompId(sectionComp.getSecCompId()).actionType(CoreConstants.acTypeInsert).oldData(null)
					.newData(cmpSectionCompToJson(sectionComp)).updatedBy(loginUser).updateTimestamp(updateTimestamp)
					.build();
			dao.saveSectionComponentHistory(compHist);
		}
	}

	@Override
	@Transactional
	public CoiManagementPlan updatePlan(CoiManagementPlanDto cmpDto) {
		if (cmpDto == null || cmpDto.getCmpId() == null) {
			throw new IllegalArgumentException("CMP ID is required for update");
		}
		CoiManagementPlan existing = dao.getCmpById(cmpDto.getCmpId());
		if (existing == null) {
			log.warn("CMP not found with ID: {}", cmpDto.getCmpId());
			return null;
		}
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		if (cmpDto.getVersionStatus() != null) {
			existing.setVersionStatus(cmpDto.getVersionStatus());
		}
		if (cmpDto.getCmpStatusCode() != null) {
			existing.setCmpStatusCode(cmpDto.getCmpStatusCode());
		}
		if (cmpDto.getCmpTypeCode() != null) {
			existing.setCmpTypeCode(cmpDto.getCmpTypeCode());
		}
		if (cmpDto.getAcademicDepartmentNumber() != null) {
			existing.setAcademicDepartmentNumber(cmpDto.getAcademicDepartmentNumber());
		}
		if (cmpDto.getLabCenterNumber() != null) {
			existing.setLabCenterNumber(cmpDto.getLabCenterNumber());
		}
		existing.setUpdatedBy(loginUser);
		existing.setUpdateTimestamp(updateTimestamp);
		if (cmpDto.getEntityRelations() != null && !cmpDto.getEntityRelations().isEmpty()) {
			clearEntityRelations(existing.getCmpId());
			saveEntityRelations(existing.getCmpId(), cmpDto.getEntityRelations(), loginUser, updateTimestamp);
		}
		if (cmpDto.getProjectRelations() != null && !cmpDto.getProjectRelations().isEmpty()) {
			clearProjectRelations(existing.getCmpId());
			saveProjectRelations(existing.getCmpId(), cmpDto.getProjectRelations(), loginUser, updateTimestamp);
		}
		dao.saveCmp(existing);
		log.info("Updated COI Management Plan with ID: {}", existing.getCmpId());
		return existing;
	}

	private void clearEntityRelations(Integer cmpId) {
		dao.deleteEntityRelations(cmpId);
	}

	private void clearProjectRelations(Integer cmpId) {
		dao.deleteProjectRelations(cmpId);
	}

	@Override
	@Transactional
	public void deletePlan(Integer cmpId) {
		if (cmpId == null) {
			throw new IllegalArgumentException("CMP ID is required to delete a plan");
		}
		CoiManagementPlan cmp = dao.getCmpById(cmpId);
		if (cmp == null) {
			log.warn("Attempted to delete non-existing plan with ID: {}", cmpId);
			return;
		}
		List<CoiManagementPlanSectionRel> sectionRels = dao.getSectionRelationsByCmpId(cmpId);
		for (CoiManagementPlanSectionRel rel : sectionRels) {
			Integer relId = rel.getCmpSectionRelId();
			List<CoiManagementPlanSectionComp> comps = dao
					.getSectionComponentsBySectionRelIds(Collections.singletonList(relId));
			for (CoiManagementPlanSectionComp comp : comps) {
				dao.deleteSectionComponentHistory(comp.getSecCompId());
			}
			dao.deleteSectionComponentsByRelId(relId);
		}
		dao.deleteSectionRelationHistoryByCmpId(cmpId);
		dao.deleteSectionRelationsByCmpId(cmpId);
		dao.deleteEntityRelations(cmpId);
		dao.deleteProjectRelations(cmpId);
		dao.deleteCmp(cmpId);
		log.info("Deleted COI Management Plan and all related data for CMP ID: {}", cmpId);
	}

	@Override
	public CoiManagementPlanSectionRelDto createPlanSectionRel(CoiManagementPlanSectionRelDto dto) {
		if (dto == null || dto.getCmpId() == null) {
			throw new IllegalArgumentException("CMP ID is required to create section relation");
		}
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp ts = commonDao.getCurrentTimestamp();
		CoiManagementPlanSectionRel rel = CoiManagementPlanSectionRel.builder().cmpId(dto.getCmpId())
				.sectionName(dto.getSectionName()).description(dto.getDescription()).sortOrder(dto.getSortOrder())
				.createdBy(loginUser).createTimestamp(ts).updatedBy(loginUser).updateTimestamp(ts).build();
		rel = cmpSectionRelRepo.save(rel);
		CoiManagementPlan cmp = dao.getCmpById(rel.getCmpId());
		logSectionAction(rel.getCmpId(), cmp.getCmpNumber(), rel.getSectionName(),
				Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_SECTION_ADDED);
		secRelHistRepo.save(CoiMgmtPlanSecRelHist.builder().cmpId(rel.getCmpId())
				.cmpSectionRelId(rel.getCmpSectionRelId()).actionType(CoreConstants.acTypeInsert).oldData(null)
				.newData(cmpSectionRelToJson(rel)).updatedBy(loginUser).updateTimestamp(ts).build());
		String fullName = loginUser == null ? null : personDao.getPersonFullNameByPersonId(loginUser);
		return CoiManagementPlanSectionRelDto.builder().cmpId(rel.getCmpId()).cmpSectionRelId(rel.getCmpSectionRelId())
				.sectionName(rel.getSectionName()).description(rel.getDescription()).sortOrder(rel.getSortOrder())
				.createdBy(rel.getCreatedBy()).createTimestamp(rel.getCreateTimestamp())
				.updateTimestamp(rel.getUpdateTimestamp()).updatedBy(fullName).components(Collections.emptyList())
				.build();
	}

	@Override
	public CoiManagementPlanSectionRelDto updatePlanSectionRel(CoiManagementPlanSectionRelDto dto) {
		CoiManagementPlanSectionRel existing = cmpSectionRelRepo.findById(dto.getCmpSectionRelId())
				.orElseThrow(() -> new IllegalArgumentException("Section relation not found"));
		String oldJson = cmpSectionRelToJson(existing);
		Map<String, Object> oldMap = entityToMap(existing);
		Map<String, Object> newMap = dtoToMap(dto, existing);
		if (isOnlySortOrderChange(oldMap, newMap)) {
			String loginUser = AuthenticatedUser.getLoginPersonId();
			Timestamp timestamp = commonDao.getCurrentTimestamp();
			existing.setSortOrder((Integer) newMap.get("sortOrder"));
			existing.setUpdatedBy(loginUser);
			existing.setUpdateTimestamp(timestamp);
			cmpSectionRelRepo.save(existing);
			return mapToDto(existing);
		}
		if (mapsEqual(oldMap, newMap)) {
			return mapToDto(existing);
		}
		existing.setSectionName((String) newMap.get("sectionName"));
		existing.setDescription((String) newMap.get("description"));
		existing.setSortOrder((Integer) newMap.get("sortOrder"));
		String loginUser = AuthenticatedUser.getLoginPersonId();
		Timestamp timestamp = commonDao.getCurrentTimestamp();
		existing.setUpdatedBy(loginUser);
		existing.setUpdateTimestamp(timestamp);
		cmpSectionRelRepo.save(existing);
		secRelHistRepo.save(CoiMgmtPlanSecRelHist.builder().cmpId(existing.getCmpId())
				.cmpSectionRelId(existing.getCmpSectionRelId()).actionType(CoreConstants.acTypeUpdate).oldData(oldJson)
				.newData(cmpSectionRelToJson(existing)).updatedBy(loginUser).updateTimestamp(timestamp).build());
		return mapToDto(existing);
	}

	private CoiManagementPlanSectionRelDto mapToDto(CoiManagementPlanSectionRel rel) {
		String fullName = personDao.getPersonFullNameByPersonId(rel.getUpdatedBy());
		return CoiManagementPlanSectionRelDto.builder().cmpId(rel.getCmpId()).cmpSectionRelId(rel.getCmpSectionRelId())
				.sectionName(rel.getSectionName()).description(rel.getDescription()).sortOrder(rel.getSortOrder())
				.createdBy(rel.getCreatedBy()).createTimestamp(rel.getCreateTimestamp()).updatedBy(fullName)
				.updateTimestamp(rel.getUpdateTimestamp()).components(Collections.emptyList()).build();
	}

	private boolean mapsEqual(Map<String, Object> m1, Map<String, Object> m2) {
		return Objects.equals(m1, m2);
	}

	private Map<String, Object> entityToMap(CoiManagementPlanSectionRel rel) {
		Map<String, Object> map = new HashMap<>();
		map.put("sectionName", rel.getSectionName());
		map.put("description", rel.getDescription());
		map.put("sortOrder", rel.getSortOrder());
		return map;
	}

	private Map<String, Object> dtoToMap(CoiManagementPlanSectionRelDto dto, CoiManagementPlanSectionRel existing) {
		Map<String, Object> map = new HashMap<>();
		map.put("sectionName", dto.getSectionName() != null ? dto.getSectionName() : existing.getSectionName());
		map.put("description", dto.getDescription() != null ? dto.getDescription() : existing.getDescription());
		map.put("sortOrder", dto.getSortOrder() != null ? dto.getSortOrder() : existing.getSortOrder());
		return map;
	}

	@Override
	@Transactional
	public void deletePlanSectionRel(Integer cmpSectionRelId) {
		if (cmpSectionRelId == null) {
			throw new IllegalArgumentException("SECTION_REL_ID is required to delete");
		}
		CoiManagementPlanSectionRel rel = dao.getSectionRelationById(cmpSectionRelId);
		if (rel == null) {
			throw new IllegalArgumentException("Section relation not found");
		}
		String sectionName = rel.getSectionName();
		CoiManagementPlan cmp = dao.getCmpById(rel.getCmpId());
		List<CoiManagementPlanSectionComp> comps = dao
				.getSectionComponentsBySectionRelIds(Collections.singletonList(cmpSectionRelId));
		for (CoiManagementPlanSectionComp comp : comps) {
			dao.deleteSectionComponentHistory(comp.getSecCompId());
		}
		dao.deleteSectionComponentsByRelId(cmpSectionRelId);
		dao.deleteSectionRelationHistory(cmpSectionRelId);
		dao.deleteSectionRelation(cmpSectionRelId);
		logSectionAction(rel.getCmpId(), cmp.getCmpNumber(), sectionName,
				Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_SECTION_DELETED);
	}

	@Override
	public CoiManagementPlanSectionCompDto createPlanSectionComp(CoiManagementPlanSectionCompDto dto) {
		if (dto == null || dto.getCmpSectionRelId() == null) {
			throw new IllegalArgumentException("CMP_SECTION_REL_ID is required to create component");
		}
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp timetamp = commonDao.getCurrentTimestamp();
		CoiManagementPlanSectionComp comp = CoiManagementPlanSectionComp.builder()
				.cmpSectionRelId(dto.getCmpSectionRelId()).description(dto.getDescription())
				.sortOrder(dto.getSortOrder()).createdBy(loginUser).createTimestamp(timetamp).updatedBy(loginUser)
				.updateTimestamp(timetamp).build();
		comp = cmpSecCompRepo.save(comp);
		secCompHistRepo.save(CoiMgmtPlanSecCompHist.builder().cmpSectionRelId(comp.getCmpSectionRelId())
				.secCompId(comp.getSecCompId()).actionType(CoreConstants.acTypeInsert).oldData(null)
				.newData(cmpSectionCompToJson(comp)).updatedBy(loginUser).updateTimestamp(timetamp).build());
		String fullName = loginUser == null ? null : personDao.getPersonFullNameByPersonId(loginUser);
		return CoiManagementPlanSectionCompDto.builder().secCompId(comp.getSecCompId())
				.cmpSectionRelId(comp.getCmpSectionRelId()).description(comp.getDescription())
				.sortOrder(comp.getSortOrder()).updateTimestamp(comp.getUpdateTimestamp()).updatedBy(fullName)
				.createdBy(comp.getCreatedBy()).createTimestamp(comp.getCreateTimestamp()).build();
	}

	@Override
	public CoiManagementPlanSectionCompDto updatePlanSectionComp(CoiManagementPlanSectionCompDto dto) {
		if (dto == null || dto.getSecCompId() == null) {
			throw new IllegalArgumentException("SEC_COMP_ID is required for update");
		}
		CoiManagementPlanSectionComp existing = cmpSecCompRepo.findById(dto.getSecCompId())
				.orElseThrow(() -> new IllegalArgumentException("Section component not found"));
		String oldJson = cmpSectionCompToJson(existing);
		Map<String, Object> oldMap = compEntityToMap(existing);
		Map<String, Object> newMap = compDtoToMap(dto, existing);
		if (isOnlySortOrderChange(oldMap, newMap)) {
			String loginUser = AuthenticatedUser.getLoginPersonId();
			Timestamp timestamp = commonDao.getCurrentTimestamp();
			existing.setSortOrder((Integer) newMap.get("sortOrder"));
			existing.setUpdatedBy(loginUser);
			existing.setUpdateTimestamp(timestamp);
			cmpSecCompRepo.save(existing);
			return compToDto(existing);
		}
		if (mapsEqual(oldMap, newMap)) {
			return compToDto(existing);
		}
		existing.setDescription((String) newMap.get("description"));
		existing.setSortOrder((Integer) newMap.get("sortOrder"));
		String loginUser = AuthenticatedUser.getLoginPersonId();
		Timestamp timestamp = commonDao.getCurrentTimestamp();
		existing.setUpdatedBy(loginUser);
		existing.setUpdateTimestamp(timestamp);
		cmpSecCompRepo.save(existing);
		secCompHistRepo.save(CoiMgmtPlanSecCompHist.builder().cmpSectionRelId(existing.getCmpSectionRelId())
				.secCompId(existing.getSecCompId()).actionType(CoreConstants.acTypeUpdate).oldData(oldJson)
				.newData(cmpSectionCompToJson(existing)).updatedBy(loginUser).updateTimestamp(timestamp).build());
		return compToDto(existing);
	}

	private Map<String, Object> compEntityToMap(CoiManagementPlanSectionComp comp) {
		Map<String, Object> map = new HashMap<>();
		map.put("description", comp.getDescription());
		map.put("sortOrder", comp.getSortOrder());
		return map;
	}

	private Map<String, Object> compDtoToMap(CoiManagementPlanSectionCompDto dto,
			CoiManagementPlanSectionComp existing) {
		Map<String, Object> map = new HashMap<>();
		map.put("description", dto.getDescription() != null ? dto.getDescription() : existing.getDescription());
		map.put("sortOrder", dto.getSortOrder() != null ? dto.getSortOrder() : existing.getSortOrder());
		return map;
	}

	private CoiManagementPlanSectionCompDto compToDto(CoiManagementPlanSectionComp c) {
		String fullName = c.getUpdatedBy() == null ? null : personDao.getPersonFullNameByPersonId(c.getUpdatedBy());
		return CoiManagementPlanSectionCompDto.builder().secCompId(c.getSecCompId())
				.cmpSectionRelId(c.getCmpSectionRelId()).description(c.getDescription()).sortOrder(c.getSortOrder())
				.updatedBy(fullName).updateTimestamp(c.getUpdateTimestamp()).createdBy(c.getCreatedBy())
				.createTimestamp(c.getCreateTimestamp()).build();
	}

	private boolean isOnlySortOrderChange(Map<String, Object> oldMap, Map<String, Object> newMap) {
		Map<String, Object> o = new HashMap<>(oldMap);
		Map<String, Object> n = new HashMap<>(newMap);
		o.remove("sortOrder");
		n.remove("sortOrder");
		return Objects.equals(o, n) && !Objects.equals(oldMap.get("sortOrder"), newMap.get("sortOrder"));
	}

	@Override
	@Transactional
	public void deletePlanSectionComp(Integer secCompId) {
		if (secCompId == null) {
			throw new IllegalArgumentException("SEC_COMP_ID is required for delete");
		}
		CoiManagementPlanSectionComp comp = dao.getSectionComponentById(secCompId);
		if (comp == null) {
			throw new IllegalArgumentException("Section component not found");
		}
		dao.deleteSectionComponentHistory(secCompId);
		dao.deleteSectionComponent(secCompId);
	}

	@Override
	public CoiManagementPlanResponseDto getPlanById(Integer cmpId) {
		if (cmpId == null) {
			return null;
		}
		CoiManagementPlan cmp = cmpRepo.findById(cmpId).orElse(null);
		if (cmp == null) {
			return null;
		}
		String initiator = personDao.getPersonFullNameByPersonId(cmp.getCreatedBy());
		return CoiManagementPlanResponseDto.builder().plan(cmp).initiator(initiator).build();
	}

	@Override
	public List<CoiManagementPlan> getAllPlans() {
		return cmpRepo.findAll();
	}

	@Override
	@Transactional
	public CoiManagementPlan updateCmpStatus(CmpActionRequestDto request) {
		if (request == null || request.getCmpId() == null || request.getAvailableActionId() == null) {
			throw new IllegalArgumentException("CMP ID and Available Action ID are required");
		}
		CoiManagementPlan cmp = dao.getCmpById(request.getCmpId());
		if (cmp == null) {
			throw new IllegalArgumentException("Invalid CMP ID: " + request.getCmpId());
		}
		CoiMgmtPlanAvailableAction availableAction = dao.getAvailableAction(request.getAvailableActionId());
		if (availableAction == null) {
			throw new IllegalArgumentException("Invalid Available Action ID: " + request.getAvailableActionId());
		}
		CoiManagementPlanActionType actionType = dao.getActionType(availableAction.getActionTypeCode().toString());
		if (actionType == null) {
			throw new IllegalArgumentException("Invalid Action Type Code: " + availableAction.getActionTypeCode());
		}
		cmp.setCmpStatusCode(actionType.getStatusCode());
		cmp.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
		cmp.setUpdateTimestamp(commonDao.getCurrentTimestamp());
		if (request.getApprovalDate() != null) {
			cmp.setApprovalDate(request.getApprovalDate());
		}
		if (request.getExpirationDate() != null) {
			cmp.setExpirationDate(request.getExpirationDate());
		}
		dao.saveCmp(cmp);
		CmpCommonDto logDto = CmpCommonDto.builder().cmpId(cmp.getCmpId()).cmpNumber(cmp.getCmpNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).comment(request.getDescription()).build();
		actionLogService.saveCMPActionLog(actionType.getActionTypeCode(), logDto);
		cmp.setStatusType(actionType.getStatusType());
		return cmp;
	}

	private String cmpSectionRelToJson(CoiManagementPlanSectionRel rel) {
		if (rel == null) {
			return null;
		}
		try {
			Map<String, Object> map = new LinkedHashMap<>();
			map.put("cmpId", rel.getCmpId());
			map.put("sectionName", rel.getSectionName());
			map.put("description", rel.getDescription());
			map.put("updatedBy", personDao.getPersonFullNameByPersonId(rel.getUpdatedBy()));
			map.put("updateTimestamp", rel.getUpdateTimestamp());
			return OBJECT_MAPPER.writeValueAsString(map);
		} catch (Exception e) {
			log.error("Error serializing SectionRel history JSON", e);
			return null;
		}
	}

	private String cmpSectionCompToJson(CoiManagementPlanSectionComp comp) {
		if (comp == null) {
			return null;
		}
		try {
			Map<String, Object> map = new LinkedHashMap<>();
			map.put("secCompId", comp.getSecCompId());
			map.put("cmpSectionRelId", comp.getCmpSectionRelId());
			map.put("description", comp.getDescription());
			map.put("updatedBy", personDao.getPersonFullNameByPersonId(comp.getUpdatedBy()));
			map.put("updateTimestamp", comp.getUpdateTimestamp());
			return OBJECT_MAPPER.writeValueAsString(map);
		} catch (Exception e) {
			log.error("Error serializing SectionComp history JSON", e);
			return null;
		}
	}

	@Override
	public List<CoiMgmtPlanAvailableActionDto> getAvailableActions(Integer cmpId) {
		CoiManagementPlan cmp = cmpRepo.findById(cmpId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid CMP ID"));
		String currentStatus = cmp.getCmpStatusCode();
		List<CoiMgmtPlanAvailableAction> actions = availableActionRepo.findByStatusCode(currentStatus);
		if (actions.isEmpty()) {
			return List.of();
		}
		Map<String, CoiManagementPlanActionType> actionTypeMap = actionTypeRepo.findAll().stream()
				.collect(Collectors.toMap(CoiManagementPlanActionType::getActionTypeCode, at -> at));
		Set<String> statusCodesToLoad = new HashSet<>();
		statusCodesToLoad.add(currentStatus);
		statusCodesToLoad.addAll(actions.stream().map(a -> actionTypeMap.get(a.getActionTypeCode()))
				.filter(Objects::nonNull).map(CoiManagementPlanActionType::getStatusCode).filter(Objects::nonNull)
				.collect(Collectors.toSet()));
		Map<String, CoiManagementPlanStatusType> statusMap = statusRepo.findAllById(statusCodesToLoad).stream()
				.collect(Collectors.toMap(CoiManagementPlanStatusType::getStatusCode, st -> st));
		CoiManagementPlanStatusType currentStatusObj = statusMap.get(currentStatus);
		return actions.stream().map(a -> {
			CoiManagementPlanActionType actionType = actionTypeMap.get(a.getActionTypeCode());
			String resultingStatus = actionType != null ? actionType.getStatusCode() : null;
			CoiManagementPlanStatusType resultingStatusObj = resultingStatus != null ? statusMap.get(resultingStatus)
					: null;
			return CoiMgmtPlanAvailableActionDto.builder().availableActionId(a.getAvailableActionId())
					.currentStatus(currentStatus)
					.currentStatusDescription(currentStatusObj != null ? currentStatusObj.getDescription() : null)
					.currentStatusBadgeColor(currentStatusObj != null ? currentStatusObj.getBadgeColor() : null)
					.actionTypeCode(a.getActionTypeCode())
					.actionDescription(actionType != null ? actionType.getDescription() : null)
					.actionMessage(actionType != null ? actionType.getMessage() : null).resultingStatus(resultingStatus)
					.resultingStatusDescription(resultingStatusObj != null ? resultingStatusObj.getDescription() : null)
					.resultingStatusBadgeColor(resultingStatusObj != null ? resultingStatusObj.getBadgeColor() : null)
					.sortOrder(a.getSortOrder()).build();
		}).collect(Collectors.toList());
	}

	@Override
	public ResponseEntity<Object> getCmpAttachTypes() {
		return new ResponseEntity<>(dao.getCmpAttachTypes(), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<?> lockSectionComponent(Integer secCompId, String loginUser) {
		final int TIMEOUT_MIN = 10;
		CoiMgmtPlanSecCompLock lock = dao.getSectionCompLock(secCompId);
		Timestamp now = commonDao.getCurrentTimestamp();
		if (lock == null) {
			dao.insertSectionCompLock(secCompId, loginUser, now);
			return ResponseEntity.ok("LOCK_ACQUIRED");
		}
		long minutes = ChronoUnit.MINUTES.between(lock.getLockedAt().toInstant(), now.toInstant());
		if (minutes >= TIMEOUT_MIN) {
			dao.updateSectionCompLock(secCompId, loginUser, now);
			return ResponseEntity.ok("LOCK_REACQUIRED_AFTER_TIMEOUT");
		}
		if (lock.getLockedBy().equals(loginUser)) {
			dao.updateSectionCompLock(secCompId, loginUser, now);
			return ResponseEntity.ok("LOCK_REFRESHED");
		}
		return ResponseEntity.status(423).body("Locked by " + lock.getLockedBy() + " since " + lock.getLockedAt());
	}

	@Override
	public void unlockSectionComponent(Integer secCompId, String loginUser) {
		dao.deleteSectionCompLock(secCompId, loginUser);
	}

	@Override
	public ResponseEntity<?> refreshSectionComponentLock(Integer secCompId, String loginUser) {
		Timestamp now = commonDao.getCurrentTimestamp();
		CoiMgmtPlanSecCompLock lock = dao.getSectionCompLock(secCompId);
		if (lock == null) {
			return ResponseEntity.status(404).body("Lock does not exist.");
		}
		if (!lock.getLockedBy().equals(loginUser)) {
			return ResponseEntity.status(423).body("Locked by " + lock.getLockedBy() + ". Cannot refresh lock.");
		}
		dao.updateLockedAt(secCompId, now);
		return ResponseEntity.ok("LOCK_UPDATED");
	}

	@Override
	public void printCmpDocument(Integer cmpId, Boolean isRegenerate) {
		CoiManagementPlan cmp = cmpRepo.findById(cmpId)
				.orElseThrow(() -> new IllegalArgumentException("CMP not found: " + cmpId));
		String sanitizedName = sanitizePersonName(cmp.getPerson().getFullName());
		int version = getNextVersionNumber(cmpId, "1");
		generateAndSave(cmp, sanitizedName, "docx", "_CMP.docx", version);
		generateAndSave(cmp, sanitizedName, "pdf", "_CMP.pdf", version);
		logDocumentAction(cmp, isRegenerate);
	}

	private void logDocumentAction(CoiManagementPlan cmp, boolean isRegenerate) {
		String actionCode = isRegenerate ? Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_DOCUMET_REGENERATED
				: Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_DOCUMENT_GENERATED;
		CmpCommonDto logDto = CmpCommonDto.builder().cmpId(cmp.getCmpId()).cmpNumber(cmp.getCmpNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build();
		actionLogService.saveCMPActionLog(actionCode, logDto);
	}

	private int getNextVersionNumber(Integer cmpId, String attachmentTypeCode) {
		List<CoiManagementPlanFileAttachmentDto> attachments = fileAttachmentService.getCmpAttachmentsByCmpId(cmpId);
		if (attachments == null || attachments.isEmpty())
			return 1;
		return attachments.stream().filter(a -> attachmentTypeCode.equals(a.getAttaTypeCode()))
				.map(a -> a.getVersionNumber() == null ? 1 : a.getVersionNumber()).max(Integer::compareTo).orElse(1);
	}

	private void generateAndSave(CoiManagementPlan cmp, String sanitizedName, String fileType, String suffix,
			int versionNumber) {
		Integer cmpId = cmp.getCmpId();
		byte[] fileBytes = printServiceClient.generateDocument(PrintRequestDto.builder()
				.moduleItemCode(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE).moduleItemKey(cmpId)
				.moduleItemNumber(cmp.getCmpNumber()).moduleSubItemCode(0).fileType(fileType)
				.letterTemplateTypeCodes(List.of(Constants.COI_MANAGEMENT_PLAN_LETTER_TEMPLATE_TYPE_CODE)).build());
		String fileName = sanitizedName + suffix;
		saveGeneratedCmpAttachment(cmpId, fileBytes, fileName, "1", versionNumber);
	}

	private void saveGeneratedCmpAttachment(Integer cmpId, byte[] fileBytes, String fileName, String attachmentTypeCode,
			int versionNumber) {
		List<CoiManagementPlanFileAttachmentDto> attachments = fileAttachmentService.getCmpAttachmentsByCmpId(cmpId);
		Integer attachmentNumber = null;
		if (attachments != null && !attachments.isEmpty()) {
			Optional<CoiManagementPlanFileAttachmentDto> anyExisting = attachments.stream()
					.filter(a -> attachmentTypeCode.equals(a.getAttaTypeCode())).findFirst();
			if (anyExisting.isPresent()) {
				attachmentNumber = anyExisting.get().getAttachmentNumber();
			}
		}
		String mimeType = getMimeType(fileName);
		MultipartFile multipartFile = new MockMultipartFile(fileName, fileName, mimeType, fileBytes);
		Map<String, Object> attach = new HashMap<>();
		attach.put("fileDataId", null);
		attach.put("fileName", fileName);
		attach.put("mimeType", mimeType);
		attach.put("description", "Auto-generated CMP document");
		attach.put("attaTypeCode", attachmentTypeCode);
		attach.put("attachmentNumber", attachmentNumber);
		attach.put("versionNumber", versionNumber);
		Map<String, Object> wrapper = new HashMap<>();
		wrapper.put("cmpId", cmpId);
		wrapper.put("attachments", List.of(attach));
		try {
			String formDataJson = OBJECT_MAPPER.writeValueAsString(wrapper);
			fileAttachmentService.saveOrReplaceCmpAttachments(new MultipartFile[] { multipartFile }, formDataJson);
		} catch (Exception e) {
			throw new RuntimeException("Failed to build JSON", e);
		}
	}

	private String sanitizePersonName(String name) {
		if (name == null || name.trim().isEmpty()) {
			return "Unknown";
		}
		return name.trim().replace(",", "").replace(" ", "_").replaceAll("[^a-zA-Z0-9_.-]", "_");
	}

	private String getMimeType(String fileName) {
		if (fileName.endsWith(".pdf"))
			return "application/pdf";
		if (fileName.endsWith(".docx"))
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		return "application/octet-stream";
	}

	@Override
	public Map<String, Object> getSectionHierarchyByCmpId(Integer cmpId) {
		if (cmpId == null) {
			throw new IllegalArgumentException("cmpId required");
		}
		List<CoiManagementPlanSectionRel> sections = dao.getSectionRelationsByCmpId(cmpId);
		if (sections == null || sections.isEmpty()) {
			Map<String, Object> empty = new HashMap<>();
			empty.put("sections", Collections.emptyList());
			empty.put("addendum", null);
			return empty;
		}
		List<Integer> sectionIds = sections.stream().map(CoiManagementPlanSectionRel::getCmpSectionRelId)
				.filter(Objects::nonNull).collect(Collectors.toList());
		Map<Integer, List<CoiManagementPlanSectionComp>> compsMap = Collections.emptyMap();
		if (!sectionIds.isEmpty()) {
			List<CoiManagementPlanSectionComp> comps = dao.getSectionComponentsBySectionRelIds(sectionIds);
			compsMap = comps.stream().collect(Collectors.groupingBy(CoiManagementPlanSectionComp::getCmpSectionRelId));
		}
		List<CoiManagementPlanSectionRelDto> dtoList = new ArrayList<>();
		for (CoiManagementPlanSectionRel s : sections) {
			List<CoiManagementPlanSectionCompDto> compDtos = compsMap
					.getOrDefault(s.getCmpSectionRelId(), Collections.emptyList()).stream().map(c -> {
						String updatedBy = c.getUpdatedBy();
						String fullName = updatedBy == null ? null : personDao.getPersonFullNameByPersonId(updatedBy);
						return CoiManagementPlanSectionCompDto.builder().secCompId(c.getSecCompId())
								.cmpSectionRelId(c.getCmpSectionRelId()).description(c.getDescription())
								.sortOrder(c.getSortOrder()).updateTimestamp(c.getUpdateTimestamp()).updatedBy(fullName)
								.createdBy(c.getCreatedBy()).createTimestamp(c.getCreateTimestamp()).build();
					}).sorted(Comparator.comparing(CoiManagementPlanSectionCompDto::getSortOrder,
							Comparator.nullsLast(Integer::compareTo)))
					.collect(Collectors.toList());
			String updatedBy = s.getUpdatedBy();
			String fullName = updatedBy == null ? null : personDao.getPersonFullNameByPersonId(updatedBy);
			dtoList.add(
					CoiManagementPlanSectionRelDto.builder().cmpId(s.getCmpId()).cmpSectionRelId(s.getCmpSectionRelId())
							.sectionName(s.getSectionName()).description(s.getDescription()).sortOrder(s.getSortOrder())
							.createdBy(s.getCreatedBy()).createTimestamp(s.getCreateTimestamp())
							.updateTimestamp(s.getUpdateTimestamp()).updatedBy(fullName).components(compDtos).build());
		}
		CoiManagementPlanSectionRelDto addendum = null;
		List<CoiManagementPlanSectionRelDto> normalSections = new ArrayList<>();
		for (CoiManagementPlanSectionRelDto dto : dtoList) {
			if ("Addendum".equalsIgnoreCase(dto.getSectionName())) {
				addendum = dto;
			} else {
				normalSections.add(dto);
			}
		}
		normalSections.sort(Comparator.comparing(CoiManagementPlanSectionRelDto::getSortOrder,
				Comparator.nullsLast(Integer::compareTo)));
		Map<String, Object> response = new HashMap<>();
		response.put("sections", normalSections);
		response.put("addendum", addendum);
		return response;
	}

	@Override
	public List<CoiManagementPlanEntityRelDto> getEntityRelations(Integer cmpId) {
		List<CoiManagementPlanEntityRel> list = dao.getEntityRelationsByCmpId(cmpId);
		return list.stream().map(e -> {
			Integer activeEntityId = getActiveEntityId(e.getEntityNumber());
			EntityResponseDTO details = (activeEntityId != null) ? loadEntityDetails(activeEntityId) : null;
			return CoiManagementPlanEntityRelDto.builder().cmpId(e.getCmpId()).entityNumber(e.getEntityNumber())
					.personEntityNumber(e.getPersonEntityNumber()).entity(details).build();
		}).collect(Collectors.toList());
	}

	@Override
	public List<CoiManagementPlanProjectRelDto> getProjectRelations(Integer cmpId) {
		return dao.getProjectRelationsByCmpId(cmpId).stream()
				.map(p -> CoiManagementPlanProjectRelDto.builder().cmpId(p.getCmpId()).moduleCode(p.getModuleCode())
						.moduleItemKey(p.getModuleItemKey())
						.projectDetails(resolveProjectDetails(p.getModuleCode(), p.getModuleItemKey())).build())
				.collect(Collectors.toList());
	}

	private Object resolveProjectDetails(Integer moduleCode, String moduleItemKey) {
		switch (moduleCode) {
		case 1:
			return dao.getAwardSummary(moduleItemKey);
		case 3:
			return dao.getProposalSummary(moduleItemKey);
		default:
			return null;
		}
	}

	private EntityResponseDTO loadEntityDetails(Integer entityId) {
		ResponseEntity<EntityResponseDTO> response = entityDetailsService.fetchEntityDetails(entityId);
		return (response != null) ? response.getBody() : null;
	}

	private Integer getActiveEntityId(Integer entityNumber) {
		ResponseEntity<Object> versionResponse = entityDetailsService.getVersions(entityNumber);
		List<Map<String, Object>> versions = extractVersions(versionResponse.getBody());
		if (versions == null)
			return null;
		return versions.stream().filter(v -> "ACTIVE".equalsIgnoreCase(String.valueOf(v.get("versionStatus"))))
				.map(v -> (Integer) v.get("entityId")).findFirst().orElse(null);
	}

	private List<Map<String, Object>> extractVersions(Object body) {
		ObjectMapper mapper = new ObjectMapper();
		return mapper.convertValue(body, new TypeReference<List<Map<String, Object>>>() {
		});
	}

	@Override
	public List<ProjectSummaryDto> getProjectSummaryDetails(Integer moduleCode, String personId, String searchText) {
		return dao.getProjectSummaryDetails(moduleCode, personId, searchText);
	}

	@Override
	public List<CoiCmpTypeProjectTypeRel> getAllValidProjectTypes() {
		return typeRelRepo.findAllRelations();
	}

	@Override
	public List<CoiMgmtPlanSecRelHist> getSectionRelHistory(Integer cmpSectionRelId) {
		List<CoiMgmtPlanSecRelHist> list = dao.getSectionRelHistory(cmpSectionRelId);
		return list.stream().map(hist -> {
			String fullName = personDao.getPersonFullNameByPersonId(hist.getUpdatedBy());
			hist.setUpdatedBy(fullName);
			return hist;
		}).toList();
	}

	@Override
	public List<CoiMgmtPlanSecCompHist> getSectionCompHistory(Integer secCompId) {
		List<CoiMgmtPlanSecCompHist> list = dao.getSectionCompHistory(secCompId);
		return list.stream().map(hist -> {
			String fullName = personDao.getPersonFullNameByPersonId(hist.getUpdatedBy());
			hist.setUpdatedBy(fullName);
			return hist;
		}).toList();
	}

	@Override
	@Transactional
	public CoiManagementPlanRecipientDto createRecipient(CoiManagementPlanRecipientDto dto) {
		if (dto == null || dto.getCmpId() == null) {
			throw new IllegalArgumentException("CMP_ID is required");
		}
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp timestamp = commonDao.getCurrentTimestamp();
		CoiManagementPlanRecipient recipient = CoiManagementPlanRecipient.builder().cmpId(dto.getCmpId())
				.signOrder(dto.getSignOrder()).signatureBlock(dto.getSignatureBlock()).personId(dto.getPersonId())
				.designation(dto.getDesignation()).attestationStatement(dto.getAttestationStatement())
				.createdBy(loginUser).createTimestamp(timestamp).updatedBy(loginUser).updateTimestamp(timestamp)
				.build();
		recipient = dao.saveRecipient(recipient);
		String fullName = dto.getPersonId() == null ? null : personDao.getPersonFullNameByPersonId(dto.getPersonId());
		return CoiManagementPlanRecipientDto.builder().cmpRecipientId(recipient.getCmpRecipientId())
				.cmpId(recipient.getCmpId()).signOrder(recipient.getSignOrder())
				.signatureBlock(recipient.getSignatureBlock()).personId(recipient.getPersonId()).fullName(fullName)
				.designation(recipient.getDesignation()).attestationStatement(recipient.getAttestationStatement())
				.updatedBy(recipient.getUpdatedBy()).updateTimestamp(timestamp).build();
	}

	@Override
	@Transactional
	public CoiManagementPlanRecipientDto updateRecipient(CoiManagementPlanRecipientDto dto) {
		if (dto == null || dto.getCmpRecipientId() == null) {
			throw new IllegalArgumentException("CMP_RECIPIENT_ID is required for update");
		}
		CoiManagementPlanRecipient existing = dao.getRecipientById(dto.getCmpRecipientId());
		if (existing == null) {
			throw new IllegalArgumentException("Recipient not found");
		}
		final String loginUser = AuthenticatedUser.getLoginPersonId();
		final Timestamp timestamp = commonDao.getCurrentTimestamp();
		if (dto.getSignOrder() != null)
			existing.setSignOrder(dto.getSignOrder());
		if (dto.getSignatureBlock() != null)
			existing.setSignatureBlock(dto.getSignatureBlock());
		if (dto.getPersonId() != null)
			existing.setPersonId(dto.getPersonId());
		if (dto.getDesignation() != null)
			existing.setDesignation(dto.getDesignation());
		if (dto.getAttestationStatement() != null)
			existing.setAttestationStatement(dto.getAttestationStatement());
		existing.setUpdatedBy(loginUser);
		existing.setUpdateTimestamp(timestamp);
		dao.saveRecipient(existing);
		String fullName = existing.getPersonId() == null ? null
				: personDao.getPersonFullNameByPersonId(existing.getPersonId());
		return CoiManagementPlanRecipientDto.builder().cmpRecipientId(existing.getCmpRecipientId())
				.cmpId(existing.getCmpId()).signOrder(existing.getSignOrder())
				.signatureBlock(existing.getSignatureBlock()).personId(existing.getPersonId()).fullName(fullName)
				.designation(existing.getDesignation()).attestationStatement(existing.getAttestationStatement())
				.updatedBy(existing.getUpdatedBy()).updateTimestamp(timestamp).build();
	}

	@Override
	public List<CoiManagementPlanRecipientDto> getRecipientsByCmpId(Integer cmpId) {
		List<CoiManagementPlanRecipient> list = dao.getRecipientsByCmpId(cmpId);
		return list.stream().map(recipient -> {
			String fullName = recipient.getPersonId() == null ? null
					: personDao.getPersonFullNameByPersonId(recipient.getPersonId());
			return CoiManagementPlanRecipientDto.builder().cmpRecipientId(recipient.getCmpRecipientId())
					.cmpId(recipient.getCmpId()).signOrder(recipient.getSignOrder())
					.signatureBlock(recipient.getSignatureBlock()).personId(recipient.getPersonId()).fullName(fullName)
					.designation(recipient.getDesignation()).attestationStatement(recipient.getAttestationStatement())
					.updatedBy(recipient.getUpdatedBy()).updateTimestamp(recipient.getUpdateTimestamp()).build();
		}).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void deleteRecipient(Integer cmpRecipientId) {
		if (cmpRecipientId == null) {
			throw new IllegalArgumentException("CMP_RECIPIENT_ID is required to delete recipient");
		}
		dao.deleteRecipient(cmpRecipientId);
	}

	private void logSectionAction(Integer cmpId, Integer cmpNumber, String sectionName, String actionTypeCode) {
		CmpCommonDto logDto = CmpCommonDto.builder().cmpId(cmpId).cmpNumber(cmpNumber)
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).sectionName(sectionName).build();
		actionLogService.saveCMPActionLog(actionTypeCode, logDto);
	}

}
