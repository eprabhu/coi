package com.polus.fibicomp.globalentity.service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.core.customdataelement.service.CustomDataElementService;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.service.QuestionnaireService;
import com.polus.fibicomp.globalentity.dao.SponsorDAO;
import com.polus.fibicomp.globalentity.dao.SubAwdOrgDAO;
import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntitySponsorField;
import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwardOrgField;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import com.polus.fibicomp.globalentity.pojo.EntityFeedStatusType;
import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;
import com.polus.fibicomp.globalentity.repository.EntityFamilyTreeRoleRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dao.EntityDetailsDAO;
import com.polus.fibicomp.globalentity.dao.EntityRiskDAO;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityFeedRequestDto;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestField;
import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameResponseDTO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;
import com.polus.fibicomp.globalentity.pojo.EntityExternalIdMapping;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityMailingAddress;
import com.polus.fibicomp.globalentity.pojo.EntityRegistration;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.repository.EntityComplianceInfoRepository;
import com.polus.fibicomp.globalentity.repository.EntityExternalIdMappingRepository;
import com.polus.fibicomp.globalentity.repository.EntityIndustryClassificationRepository;
import com.polus.fibicomp.globalentity.repository.EntityMailingAddressRepository;
import com.polus.fibicomp.globalentity.repository.EntityRegistrationRepository;
import com.polus.fibicomp.globalentity.repository.EntitySponsorInfoRepository;
import com.polus.fibicomp.globalentity.repository.EntitySubOrgInfoRepository;
import com.polus.fibicomp.globalentity.repository.GlobalEntityRepository;
import com.polus.fibicomp.inbox.InboxService;

import lombok.extern.slf4j.Slf4j;

@Service(value = "entityDetailsService")
@Transactional
@Slf4j
public class EntityDetailsServiceImpl implements EntityDetailsService {

	@Autowired
	private EntityDetailsDAO entityDetailsDAO;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private CompanyDetailsService companyDetailsService;

	@Autowired
	private EntityIndustryClassificationRepository entityIndustryClassificationRepository;

	@Autowired
	private EntityRegistrationRepository entityRegistrationRepository;

	@Autowired
	private EntityMailingAddressRepository entityMailingAddressRepository;

	@Autowired
	private EntityExternalIdMappingRepository externalIdMappingRepository;

	@Autowired
	private GlobalEntityRepository entityRepository;

	@Autowired
	private EntityRiskDAO entityRiskDAO;

	@Autowired
	private EntityFileAttachmentService entityFileAttachmentService;

	@Autowired
    private EntityActionLogService actionLogService;

	@Autowired
	private SponsorDetailsService sponsorDetailsService;

	@Autowired
	private SubAwdOrgDetailsService subAwdOrgDetailsService;

	@Autowired
	@Qualifier(value = "corporateFamilyService")
	private GlobalEntityService corporateFamilyService;

	@Autowired
	@Qualifier(value = "entityExternalReferenceService")
	private EntityExternalReferenceService entityExternalReferenceService;

	@Autowired
	private EntitySponsorInfoRepository entitySponsorInfoRepository;

	@Autowired
	private EntitySubOrgInfoRepository entitySubOrgInfoRepository;

	@Autowired
	private ConflictOfInterestService coiService;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private InboxService inboxService;

	@Autowired
	private SubAwdOrgDAO subAwdOrgDAO;

	@Autowired
	private SponsorDAO sponsorDAO;

	@Autowired
	private GlobalEntityService globalEntityService;

	@Autowired
	private EntityFamilyTreeRoleRepository familyTreeRoleRepository;

	@Autowired
	private EntityRiskService entityRiskService;

	@Autowired
	private CustomDataElementService customDataElementService;

	@Autowired
	private QuestionnaireService questionnaireService;

	@Autowired
	private ComplianceService complianceService;

	@Autowired
	private EntityComplianceInfoRepository complianceInfoRepository;

	protected static Logger logger = LogManager.getLogger(EntityDetailsServiceImpl.class.getName());
	private static final String GENERAL_SECTION_CODE = "1";
	private static final String DOCUMENT_STATUS_ACTIVE = "1";
	private static final String CREATE_ACTION_LOG_CODE = "1";
	private static final String ENTITY_STATUS_TYPE_CODE_UNVERIFIED = "2";
	private static final String ENTITY_STATUS_TYPE_CODE_VERIFIED = "1";
	private static final Integer VERSION_NUMBER = 1;
	private static final String VERSION_STATUS = "ACTIVE";
	private static final String VERIFY_ENTITY = "VERIFY_ENTITY";
	private static final String ENTITY_SPONSOR_INFO_TAB = "entity_sponsor_info";
	private static final String ENTITY_SUB_ORG_INFO_TAB = "entity_sub_org_info";
	private static final String CREATE_WITH_DUNS_VERIFY_ACTION_LOG_CODE = "19";
	private static final String CREATE_WITHOUT_DUNS_VERIFY_ACTION_LOG_CODE = "18";
	private static final String CREATE_WITH_DUNS_UNVERIFY_ACTION_LOG_CODE = "17";
	private static final String CREATE_WITHOUT_DUNS_UNVERIFY_ACTION_LOG_CODE = "16";
	private static final String CREATED_FROM_CORP_FAMILY_ACTION_LOG_CODE = "21";
	private static final String DEFAULT_RISK_UNDETERMINED_CODE = "4";
	private static final String DEFAULT_RISK_TYPE_ORG_CODE = "4";
	private static final String ADD_DEFAULT_RISK_FOR_ENTITY_ORG = "ADD_DEFAULT_RISK_FOR_ENTITY_ORG";
	private static final String MODIFY_ACTION_LOG_CODE = "15";
	private static final String CANCEL_ACTION_LOG_CODE = "22";
	private static final String DUNS_MONITORING_MODIFY_ACTION_LOG_CODE = "23";


	@Override
	public ResponseEntity<Map<String, Integer>> createEntity(EntityRequestDTO dto) {
		Entity entity = null;
		Integer entityId = null;

		try {
			entity = mapDTOToEntity(dto);

			if (entity == null) {
				logger.error("Entity mapping failed for DTO: {}", dto);
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
//			Integer maxEntityNumber = entityRepository.getMaxOfEntityNumber();
//			entity.setEntityNumber(maxEntityNumber != null ? maxEntityNumber + 1 : 1);
			entityId = entityDetailsDAO.createEntity(entity);

			ComplianceRequestDTO complianceDTO = dto.getComplianceRequestDTO();
			if (complianceDTO != null) {
				complianceDTO.setEntityId(entityId);
				complianceService.saveComplianceInfo(complianceDTO);
			}

			if (commonDao.getParameterValueAsBoolean("ADD_DEFAULT_RISK_FOR_ENTITY_ORG")) {
				EntityRiskRequestDTO entityRisk = EntityRiskRequestDTO.builder()
						.entityId(entityId)
						.description("Undetermined")
						.riskLevelCode(DEFAULT_RISK_UNDETERMINED_CODE)
						.riskTypeCode(DEFAULT_RISK_TYPE_ORG_CODE)
						.riskLevel(entityRiskDAO.findEntityRiskLevel(DEFAULT_RISK_UNDETERMINED_CODE).getDescription())
						.riskType(entityRiskDAO.findEntityRiskType(DEFAULT_RISK_TYPE_ORG_CODE).getDescription())
						.build();
				entityRiskService.saveRisk(entityRisk);
			}
			if (ENTITY_STATUS_TYPE_CODE_UNVERIFIED.equals(entity.getEntityStatusTypeCode()) && (dto.getIsCreatingFromFeed() == null || !dto.getIsCreatingFromFeed())) {
				inboxActions(entityId, entity.getEntityName());
			}
			ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder()
					.entityId(entityId)
					.entityName(entity.getEntityName())
					.updatedBy(entity.getUpdatedBy())
					.build();
			if ((dto.getCreatedFromCorFamily() == null || !dto.getCreatedFromCorFamily()) && (dto.getIsCreatingFromFeed() == null || !dto.getIsCreatingFromFeed())) {
				actionLogService.saveEntityActionLog(CREATE_ACTION_LOG_CODE, logDTO, null);
			} else if (dto.getCreatedFromCorFamily() != null && dto.getCreatedFromCorFamily()) {
				actionLogService.saveEntityActionLog(CREATED_FROM_CORP_FAMILY_ACTION_LOG_CODE, logDTO, null);
			}
			logger.info("Entity created successfully with ID: {}", entityId);


		if (dto.getIsCreatingFromFeed() == null || !dto.getIsCreatingFromFeed()) {
			coiService.processCoiMessageToQ(ActionTypes.ENTITY_CREATION, entityId, null, new HashMap<>(),
					Constants.GLOBAL_ENTITY_MODULE_CODE, null);
		}
		subAwdOrgDetailsService.saveCopyFromEntity(entity);
		sponsorDetailsService.saveCopyFromEntity(entity);
		} catch (Exception e) {
			logger.error("Error in createEntity: {}", e.getMessage(), e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		Map<String, Integer> response = new HashMap<>();
		response.put("entityId", entityId);
		response.put("entityNumber", entityId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	private void inboxActions(Integer entityId, String entityName) {
		StringBuilder userMessage = new StringBuilder();
		userMessage.append(personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId()))
				.append(" Created ").append(entityName).append(" on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		List<String> personIds = personDao.getAdminPersonIdsByRightName(VERIFY_ENTITY);
		personIds.forEach(personId -> {
			Inbox inbox = new Inbox();
			inbox.setModuleCode(CoreConstants.MODULE_CODE_GLOBAL_ENTITY);
			inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
			inbox.setToPersonId(personId);
			inbox.setModuleItemKey(entityId.toString());
			inbox.setUserMessage(userMessage.toString());
			inbox.setMessageTypeCode(Constants.INBOX_CREATE_ENTITY);
			inbox.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY);
			inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
			inboxService.addToInbox(inbox);
		});
	}

	private Entity mapDTOToEntity(EntityRequestDTO dto) {
		if (dto == null || dto.getEntityRequestFields() == null || dto.getEntityRequestFields().isEmpty()) {
			logger.error("Invalid EntityRequestDTO: DTO or fields are null/empty");
			return null;
		}

		try {
			Map<EntityRequestField, Object> entityRequestFields = dto.getEntityRequestFields();
			Entity.EntityBuilder entityBuilder = Entity.builder()
					.entityStatusTypeCode(ENTITY_STATUS_TYPE_CODE_UNVERIFIED)
					.updatedBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : AuthenticatedUser.getLoginPersonId())
					.createdBy(dto.getUpdatedBy() != null ? dto.getUpdatedBy() : AuthenticatedUser.getLoginPersonId())
					.updateTimestamp(commonDao.getCurrentTimestamp())
					.createTimestamp(commonDao.getCurrentTimestamp())
					.documentStatusTypeCode(DOCUMENT_STATUS_ACTIVE)
					.versionNumber(VERSION_NUMBER)
					.versionStatus(VERSION_STATUS)
					.comments(dto.getComments())
					.isActive(Boolean.TRUE);

			entityRequestFields.forEach((field, value) -> mapFieldToEntity(entityBuilder, field, value));

			return entityBuilder.build();

		} catch (Exception e) {
			logger.error("Error mapping DTO to Entity: {}", e.getMessage(), e);
			return null;
		}
	}

	private void mapFieldToEntity(Entity.EntityBuilder entityBuilder, EntityRequestField field, Object value) {
		switch (field) {
			case entityName:
				entityBuilder.entityName(castToString(value));
				break;
			case phoneNumber:
				entityBuilder.phoneNumber(castToString(value));
				break;
			case entityOwnershipTypeCode:
				entityBuilder.entityOwnershipTypeCode(castToString(value));
				break;
			case primaryAddressLine1:
				entityBuilder.primaryAddressLine1(castToString(value));
				break;
			case primaryAddressLine2:
				entityBuilder.primaryAddressLine2(castToString(value));
				break;
			case city:
				entityBuilder.city(castToString(value));
				break;
			case state:
				entityBuilder.state(castToString(value));
				break;
			case postCode:
				entityBuilder.postCode(castToString(value));
				break;
			case countryCode:
				entityBuilder.countryCode(castToString(value));
				break;
			case certifiedEmail:
				entityBuilder.certifiedEmail(castToString(value));
				break;
			case websiteAddress:
				entityBuilder.websiteAddress(castToString(value));
				break;
			case dunsNumber:
				entityBuilder.dunsNumber(castToString(value));
				break;
			case ueiNumber:
				entityBuilder.ueiNumber(castToString(value));
				break;
			case cageNumber:
				entityBuilder.cageNumber(castToString(value));
				break;
			case animalAccreditation:
				entityBuilder.animalAccreditation(castToString(value));
				break;
			case anumalWelfareAssurance:
				entityBuilder.anumalWelfareAssurance(castToString(value));
				break;
			case approvedBy:
				entityBuilder.approvedBy(castToString(value));
				break;
			case approvedTimestamp:
				entityBuilder.approvedTimestamp(castToTimestamp(value));
				break;
			case documentStatusTypeCode:
				entityBuilder.documentStatusTypeCode(castToString(value));
				break;
			case entityNumber:
				entityBuilder.entityNumber(castToInteger(value));
				break;
			case entityStatusTypeCode:
				entityBuilder.entityStatusTypeCode(castToString(value));
				break;
			case humanSubAssurance:
				entityBuilder.humanSubAssurance(castToString(value));
				break;
			case isDunsMatched:
				entityBuilder.isDunsMatched(castToBoolean(value));
				break;
			case originalEntityId:
				entityBuilder.originalEntityId(castToInteger(value));
				break;
			case entitySourceTypeCode:
				entityBuilder.entitySourceTypeCode(castToString(value));
				break;
			default:
				logger.warn("Unhandled EntityRequestField: {}", field);
				break;
		}
	}

	private String castToString(Object value) {
		 return value instanceof String && !((String) value).isEmpty() ? (String) value : null;
	}

	private Integer castToInteger(Object value) {
		return value instanceof Integer ? (Integer) value : null;
	}

	private Timestamp castToTimestamp(Object value) {
		return value instanceof Timestamp ? (Timestamp) value : null;
	}

	private Boolean castToBoolean(Object value) {
		return value instanceof Boolean ? (Boolean) value : null;
	}

	@Override
	public ResponseEntity<String> updateEntityDetails(EntityRequestDTO dto) {
		if (dto.getCountryCode() != null && dto.getCountryCode().length() == 2) {
			dto.setCountryCode(commonDao.fetchCountryByCountryTwoCode(dto.getCountryCode()).getCountryCode());
		}
		entityDetailsDAO.updateEntity(dto);
		Entity entityDetails = entityRepository.findByEntityId(dto.getEntityId());
		if (!dto.getModificationIsInProgress() && Boolean.TRUE.equals(dto.getIsDunsMatched()) && entityDetails.getEntityStatusTypeCode().equals(ENTITY_STATUS_TYPE_CODE_VERIFIED)) {
			corporateFamilyService.createCorporateFamilyFromDnB(entityDetails.getDunsNumber());
		}
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Entity updated successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<EntityResponseDTO> fetchEntityDetails(Integer entityId) {
		String originalName = null;
		Integer originalEntityId;
		List<EntityIndustryClassification> entityIndustryClassifications = entityIndustryClassificationRepository
				.findByEntityId(entityId);
		List<EntityRegistration> entityRegistrations = entityRegistrationRepository.findByEntityId(entityId);
		List<EntityMailingAddress> entityMailingAddresses = entityMailingAddressRepository.findByEntityId(entityId);
		List<EntityRisk> entityRisks = entityRiskDAO.findEntityRiskByEntityId(entityId);
		List<EntityExternalIdMapping> EntityExternalIdMappings = externalIdMappingRepository.findByEntityId(entityId);
		List<PriorNameResponseDTO> priorNames = companyDetailsService.fetchPriorNames(entityId);
		List<ForeignNameResponseDTO> foreignNames = companyDetailsService.fetchForeignNames(entityId);
		List<EntityAttachmentResponseDTO> attachments = entityFileAttachmentService.getAttachmentsBySectionCode(GENERAL_SECTION_CODE, entityId);
		EntitySponsorInfo sponsorInfo = entitySponsorInfoRepository.findByEntityId(entityId);
		EntitySubOrgInfo organizationInfo = entitySubOrgInfoRepository.findByEntityId(entityId);
		Entity entityDetails = entityRepository.findByEntityId(entityId);
		originalEntityId = entityDetails.getOriginalEntityId();
		log.info("originalEntityId : {}", originalEntityId);
		if (originalEntityId != null) {
			originalName = entityRepository.fetchEntityNameByEntityId(originalEntityId);
			log.info("originalName : {}", originalName);
		}
		Map<String, Object> entityTabStatus = entityDetailsDAO.getEntityTabStatus(entityId);
		Optional<EntityComplianceInfo> complianceInfoOpt = complianceInfoRepository.findByEntityId(entityId);
		return new ResponseEntity<>(EntityResponseDTO.builder().entityDetails(entityDetails)
				.entityIndustryClassifications(entityIndustryClassifications)
				.entityMailingAddresses(entityMailingAddresses).entityRegistrations(entityRegistrations)
				.entityRisks(entityRisks).entityExternalIdMappings(EntityExternalIdMappings).priorNames(priorNames)
				.foreignNames(foreignNames).attachments(attachments).entityTabStatus(entityTabStatus).originalName(originalName)
				.modificationIsInProgress(entityRepository.entityCopyVersionExists(entityId, Constants.COI_PENDING_STATUS) == null ? Boolean.FALSE : Boolean.TRUE)
				.sponsorCode(sponsorInfo != null ? sponsorInfo.getSponsorCode() : null)
				.organizationId(organizationInfo != null ? organizationInfo.getOrganizationId() : null)
				.isDunsMatchedOnActiveVersion(entityRepository.isDunsMatchedOnActiveVersion(entityDetails.getEntityNumber(), Constants.COI_ACTIVE_STATUS))
				.entityFamilyTreeRoles(getFamilyTreeRoles(entityDetails.getEntityNumber()))
				.complianceInfo(complianceInfoOpt.orElse(null))
				.dunsRefVersionIsInProgress(entityRepository.entityDunsRefreshVersionExists(entityId, Constants.COI_PENDING_STATUS) == null ? Boolean.FALSE : Boolean.TRUE)
                .hasPersonEntityLinked(entityRepository.hasActivePersonEntityLinkage(entityDetails.getEntityNumber()))
				.sponsorTypeCode(sponsorInfo != null ? sponsorInfo.getSponsorTypeCode() : null)
				.organizationTypeCode(organizationInfo != null ? organizationInfo.getOrganizationTypeCode() : null)
                .build(), HttpStatus.OK);
	}

	@Override
	public List<EntityFamilyTreeRole> getFamilyTreeRoles(Integer entityNumber) {
		List<EntityFamilyTreeRole> entityFamilyTreeRoles = new ArrayList<>();
		familyTreeRoleRepository.findByEntityNumber(entityNumber).forEach(familyTreeRole -> {
			EntityFamilyTreeRole entityFamilyTreeRole = EntityFamilyTreeRole.builder().build();
			BeanUtils.copyProperties(familyTreeRole, entityFamilyTreeRole, "entity");
			entityFamilyTreeRoles.add(entityFamilyTreeRole);
		});
		return entityFamilyTreeRoles;
	}

	@Override
	public void postCreationProcessFromFeed(EntityFeedRequestDto dto, Integer entityId) {
		AddressDetailsRequestDTO additionalAddress = dto.getAdditionalAddress();
		if (additionalAddress != null) {
			saveAdditionalAddressFromFeed(additionalAddress, entityId);
		}
		if (dto.getEntitySponsor() != null) {
			SponsorRequestDTO sponsorDetails = dto.getEntitySponsor();
			sponsorDetails.getEntitySponsorFields().put(EntitySponsorField.rolodexId, dto.getEntity().getRolodexId());
			sponsorDAO.updateDetails(SponsorRequestDTO.builder().entityId(entityId).entitySponsorFields(sponsorDetails.getEntitySponsorFields()).build());
			subAwdOrgDetailsService.updateOrgAddressBySponAddress(entityId, sponsorDAO.findByEntityId(entityId));
		}
		if (dto.getEntitySubAward() != null) {
			dto.getEntitySubAward().setEntityId(entityId);
			SubAwdOrgRequestDTO orgDetails = dto.getEntitySubAward();
			orgDetails.getSubAwardOrgFields().put(SubAwardOrgField.rolodexId, dto.getEntity().getRolodexId());
			subAwdOrgDAO.updateDetails(SubAwdOrgRequestDTO.builder().entityId(entityId).subAwardOrgFields(orgDetails.getSubAwardOrgFields()).build());
			if (dto.getEntityRisk() != null) {
				List<EntityRisk> riskResults = entityRiskDAO.findSubAwdOrgRiskByEntityId(entityId);
				if (riskResults != null && !riskResults.isEmpty()) {
					EntityRisk entityRisk = riskResults.get(0);
					dto.getEntityRisk().setEntityId(entityId);
					dto.getEntityRisk().setEntityRiskId(entityRisk.getEntityRiskId());
					dto.getEntityRisk().setRiskLevel(entityRiskDAO.findEntityRiskLevel(dto.getEntityRisk().getRiskLevelCode()).getDescription());
					dto.getEntityRisk().setRiskType(entityRiskDAO.findEntityRiskType(dto.getEntityRisk().getRiskTypeCode()).getDescription());
					dto.getEntityRisk().setOldRiskLevel(entityRiskDAO.findEntityRiskLevel(entityRisk.getRiskLevelCode()).getDescription());
					dto.getEntityRisk().setOldRiskLevelCode(entityRisk.getRiskLevelCode());
					entityRiskService.updateRisk(dto.getEntityRisk());
				} else {
					EntityRiskRequestDTO entityRisk = EntityRiskRequestDTO.builder()
							.entityId(entityId)
							.description(dto.getEntityRisk().getDescription())
							.riskLevelCode(dto.getEntityRisk().getRiskLevelCode())
							.riskLevel(entityRiskDAO.findEntityRiskLevel(dto.getEntityRisk().getRiskLevelCode()).getDescription())
							.riskType(entityRiskDAO.findEntityRiskType(DEFAULT_RISK_TYPE_ORG_CODE).getDescription())
							.riskTypeCode(DEFAULT_RISK_TYPE_ORG_CODE)
							.build();
					entityRiskService.saveRisk(entityRisk);
				}
			}
		}
		if (dto.getExternalReferences() != null && !dto.getExternalReferences().isEmpty()) {
			dto.getExternalReferences().forEach(externalRefObj -> {
				externalRefObj.setEntityId(entityId);
				entityExternalReferenceService.saveExternalReference(externalRefObj);
			});
		}
	}

	private void saveAdditionalAddressFromFeed(AddressDetailsRequestDTO additionalAddress, Integer entityId) {
		if (additionalAddress.getAddressTypeCode().equals(Constants.ADDITIONAL_ADDRESS_TYPE_SPONSOR_ADDRESS)) {
			Map<EntitySponsorField, Object> sponsorFields = new HashMap<>();
			sponsorFields.put(EntitySponsorField.primaryAddressLine1, additionalAddress.getAddressLine1());
			sponsorFields.put(EntitySponsorField.primaryAddressLine2, additionalAddress.getAddressLine2());
			sponsorFields.put(EntitySponsorField.city, additionalAddress.getCity());
			sponsorFields.put(EntitySponsorField.state, additionalAddress.getState());
			sponsorFields.put(EntitySponsorField.postCode, additionalAddress.getPostCode());
			sponsorFields.put(EntitySponsorField.countryCode, additionalAddress.getCountryCode());
			sponsorDAO.updateDetails(SponsorRequestDTO.builder().entityId(entityId).entitySponsorFields(sponsorFields).build());
		} else if (additionalAddress.getAddressTypeCode().equals(Constants.ADDITIONAL_ADDRESS_TYPE_ORGANIZATION_ADDRESS)) {
			Map<SubAwardOrgField, Object> subAwardOrgFields = new HashMap<>();
			subAwardOrgFields.put(SubAwardOrgField.primaryAddressLine1, additionalAddress.getAddressLine1());
			subAwardOrgFields.put(SubAwardOrgField.primaryAddressLine2, additionalAddress.getAddressLine2());
			subAwardOrgFields.put(SubAwardOrgField.city, additionalAddress.getCity());
			subAwardOrgFields.put(SubAwardOrgField.state, additionalAddress.getState());
			subAwardOrgFields.put(SubAwardOrgField.postCode, additionalAddress.getPostCode());
			subAwardOrgFields.put(SubAwardOrgField.countryCode, additionalAddress.getCountryCode());
			subAwdOrgDAO.updateDetails(SubAwdOrgRequestDTO.builder().entityId(entityId).subAwardOrgFields(subAwardOrgFields).build());
		}
	}

	@Override
	public void feedVerifyEntity(EntityRequestDTO dto) {
		String entityActionLogCode;
		boolean canVerifyEntity = canVerifyEntity(entityDetailsDAO.validateEntityDetails(dto.getEntityId()));
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder()
				.entityId(dto.getEntityId())
				.entityName(dto.getEntityName())
				.updatedBy(AuthenticatedUser.getLoginPersonId())
				.dunsNumber(dto.getDunsNumber())
				.build();
		if (canVerifyEntity) {
			if (canVerifyEntity && dto.getCreateWithDuns() != null && dto.getCreateWithDuns()) {
				entityActionLogCode = CREATE_WITH_DUNS_VERIFY_ACTION_LOG_CODE;
			} else {
				entityActionLogCode = CREATE_WITHOUT_DUNS_VERIFY_ACTION_LOG_CODE;
			}
			actionLogService.saveEntityActionLog(entityActionLogCode, logDTO, null);
			globalEntityService.verifyEntityDetails(dto.getEntityId(), Boolean.TRUE);
		} else {
			if (dto.getCreateWithDuns() != null && dto.getCreateWithDuns()) {
				actionLogService.saveEntityActionLog(CREATE_WITH_DUNS_UNVERIFY_ACTION_LOG_CODE, logDTO, null);
			} else {
				actionLogService.saveEntityActionLog(CREATE_WITHOUT_DUNS_UNVERIFY_ACTION_LOG_CODE, logDTO, null);
			}
			coiService.processCoiMessageToQ(ActionTypes.ENTITY_CREATION, dto.getEntityId(), null, new HashMap<>(),
					Constants.GLOBAL_ENTITY_MODULE_CODE, null);
		}
	}

	private boolean canVerifyEntity(ObjectNode rootNode) {
		// Iterate over the nodes (overview, sponsor, organization,...)
		AtomicBoolean canVerifyEntity = new AtomicBoolean(true);
		rootNode.fields().forEachRemaining(entry -> {
			String sectionName = entry.getKey();
			JsonNode sectionNode = entry.getValue();
			// Check if "ValidationType" exists and its value is "VE"
			if (sectionNode.has("ValidationType")) {
				String validationType = sectionNode.get("ValidationType").asText();
				if ("VE".equals(validationType)) {
					canVerifyEntity.set(false);
				}
			}
		});
		return canVerifyEntity.get();
	}


	@Override
	public void updateEntitySponsorOrgDetailsFromFeed(EntityFeedRequestDto dto) {
		AddressDetailsRequestDTO additionalAddress = dto.getAdditionalAddress();
		if (dto.getEntitySponsor() != null) {
			entityRepository.getEntityIdByEntityIdAndVersionStatus(dto.getEntitySponsor().getEntityId(), Arrays.asList(Constants.COI_ACTIVE_STATUS, Constants.COI_PENDING_STATUS)).forEach(resultObj -> {
				Integer entityId = (Integer) resultObj[0];
				EntitySponsorInfo sponsorInfo = entitySponsorInfoRepository.findByEntityId(entityId);
				dto.getEntitySponsor().setEntityId(entityId);

				if (sponsorInfo == null) {
					sponsorDetailsService.saveDetails(dto.getEntitySponsor());
					if (additionalAddress != null) {
						saveAdditionalAddressFromFeed(dto.getAdditionalAddress(), entityId);
					}
				} else if (sponsorInfo.getSponsorCode() == null) {
					sponsorInfo.setAcronym(dto.getEntitySponsor().getAcronym());
					sponsorInfo.setSponsorCode(dto.getEntitySponsor().getEntitySponsorFields().get(EntitySponsorField.sponsorCode).toString());
					sponsorInfo.setComments(castToString(dto.getEntitySponsor().getEntitySponsorFields().get(EntitySponsorField.comments)));
					sponsorInfo.setSponsorTypeCode(dto.getEntitySponsor().getSponsorTypeCode());
					sponsorInfo.setIsCopy(false);
					sponsorInfo.setRolodexId(castToInteger(dto.getEntitySponsor().getEntitySponsorFields().get(EntitySponsorField.rolodexId)));
					if (additionalAddress != null) {
//						saveAdditionalAddressFromFeed(dto.getAdditionalAddress(), entityId);
						sponsorInfo.setPrimaryAddressLine1(additionalAddress.getAddressLine1());
						sponsorInfo.setPrimaryAddressLine2(additionalAddress.getAddressLine2());
						sponsorInfo.setState(additionalAddress.getState());
						sponsorInfo.setCity(additionalAddress.getCity());
						sponsorInfo.setPostCode(additionalAddress.getPostCode());
						sponsorInfo.setCountryCode(additionalAddress.getCountryCode());
					}
				}
				subAwdOrgDetailsService.updateOrgAddressBySponAddress(entityId, sponsorInfo);
			});
		} else if (dto.getEntitySubAward() != null) {
			entityRepository.getEntityIdByEntityIdAndVersionStatus(dto.getEntitySubAward().getEntityId(), Arrays.asList(Constants.COI_ACTIVE_STATUS, Constants.COI_PENDING_STATUS)).forEach(resultObj -> {
				Integer entityId = (Integer) resultObj[0];
				String versionStatus = (String) resultObj[1];
				EntitySubOrgInfo orgInfo = entitySubOrgInfoRepository.findByEntityId(entityId);
				dto.getEntitySubAward().setEntityId(entityId);
				if (orgInfo == null) {
					subAwdOrgDetailsService.saveDetails(dto.getEntitySubAward());
					updateFeedRiskForOrg(dto, entityId, versionStatus);
				} else if (orgInfo.getOrganizationId() == null) {
					orgInfo.setOrganizationId(castToString(dto.getEntitySubAward().getSubAwardOrgFields().get(SubAwardOrgField.organizationId)));
					orgInfo.setOrganizationTypeCode(castToString(dto.getEntitySubAward().getSubAwardOrgFields().get(SubAwardOrgField.organizationTypeCode)));
					orgInfo.setSamExpirationDate(dto.getEntitySubAward().getDateFromMap(SubAwardOrgField.samExpirationDate));
					orgInfo.setSubAwdRiskAssmtDate(dto.getEntitySubAward().getDateFromMap(SubAwardOrgField.subAwdRiskAssmtDate));
					orgInfo.setIsCopy(false);
					orgInfo.setRolodexId(castToInteger(dto.getEntitySubAward().getSubAwardOrgFields().get(SubAwardOrgField.rolodexId)));
					updateFeedRiskForOrg(dto, entityId, versionStatus);
				}
			});
		}
	}

	@Override
	public Integer updateActiveEntitySponOrgFeedStatus(Integer currentEntityId) {
		logger.info("Current Entity Id : {}", currentEntityId);
		Integer activeEntityId = null;
		List<Object[]> resultActiveEntity = entityRepository.getEntityIdByEntityIdAndVersionStatus(currentEntityId, Arrays.asList(Constants.COI_ACTIVE_STATUS), ENTITY_STATUS_TYPE_CODE_VERIFIED);
		for(Object[] resultObj : resultActiveEntity) {
			activeEntityId = (Integer) resultObj[0];
			String entityName = (String) resultObj[2];
			Map<String, Object> entityTabStatus = entityDetailsDAO.getEntityTabStatus(activeEntityId);
			EntityFeedStatusType sponFeedStatus = entitySponsorInfoRepository.findEntityFeedStatusTypeByEntityId(activeEntityId);
			EntityFeedStatusType orgFeedStatus = entitySubOrgInfoRepository.findEntityFeedStatusTypeByEntityId(activeEntityId);
			if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB))) {
				Map<EntitySponsorField, Object> entitySponsorFields = Map.of(EntitySponsorField.feedStatusCode, "2");
				sponsorDAO.updateDetails(SponsorRequestDTO.builder().entityId(activeEntityId).entitySponsorFields(entitySponsorFields).build());
			}
			if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SUB_ORG_INFO_TAB))) {
				Map<SubAwardOrgField, Object> subAwardOrgFields = Map.of(SubAwardOrgField.feedStatusCode, "2");
				subAwdOrgDAO.updateDetails(SubAwdOrgRequestDTO.builder().entityId(activeEntityId).subAwardOrgFields(subAwardOrgFields).build());
			}
			globalEntityService.updateEntityFeedActionLog(activeEntityId, entityTabStatus, sponFeedStatus, entityName, AuthenticatedUser.getLoginPersonId(), commonDao.getCurrentTimestamp(), orgFeedStatus);
		}
		return activeEntityId;
	}

	private void updateFeedRiskForOrg(EntityFeedRequestDto dto, Integer entityId, String versionStatus) {
		if (dto.getEntityRisk() != null) {
			dto.getEntityRisk().setEntityId(entityId);
			List<EntityRisk> entityRisks = entityRiskDAO.findSubAwdOrgRiskByEntityId(entityId);
			if (entityRisks != null && !entityRisks.isEmpty() && !entityRisks.get(0).getRiskLevelCode().equals(dto.getEntityRisk().getRiskLevelCode())) {
				dto.getEntityRisk().setModificationIsInProgress(versionStatus.equals(Constants.COI_ACTIVE_STATUS) ? Boolean.FALSE : Boolean.TRUE);
				EntityRisk entityRisk = entityRisks.get(0);
				dto.getEntityRisk().setEntityRiskId(entityRisk.getEntityRiskId());
				dto.getEntityRisk().setRiskLevel(entityRiskDAO.findEntityRiskLevel(dto.getEntityRisk().getRiskLevelCode()).getDescription());
				dto.getEntityRisk().setRiskType(entityRisk.getRiskType().getDescription());
				dto.getEntityRisk().setOldRiskLevel(entityRiskDAO.findEntityRiskLevel(entityRisk.getRiskLevelCode()).getDescription());
				dto.getEntityRisk().setOldRiskLevelCode(entityRisk.getRiskLevelCode());
				entityRiskService.updateRisk(dto.getEntityRisk());
			} else if(entityRisks == null || entityRisks.isEmpty()) {
				EntityRiskRequestDTO entityRisk = EntityRiskRequestDTO.builder()
						.entityId(entityId)
						.description(dto.getEntityRisk().getDescription())
						.riskLevelCode(dto.getEntityRisk().getRiskLevelCode())
						.riskLevel(entityRiskDAO.findEntityRiskLevel(dto.getEntityRisk().getRiskLevelCode()).getDescription())
						.riskType(entityRiskDAO.findEntityRiskType(DEFAULT_RISK_TYPE_ORG_CODE).getDescription())
						.riskTypeCode(DEFAULT_RISK_TYPE_ORG_CODE)
						.build();
				entityRiskService.saveRisk(entityRisk);
			}
		}
	}

	@Override
	public ResponseEntity<Object> modifyEntity(Integer entityId, Integer entityNumber) {
		Boolean isPendingVersionExists = entityRepository.entityCopyVersionExists(entityId, Constants.COI_PENDING_STATUS);
		if (isPendingVersionExists != null && isPendingVersionExists) {
			return new ResponseEntity<>("Modification is already in progress", HttpStatus.METHOD_NOT_ALLOWED);
		}
		Integer copiedEntityId = null;
		copiedEntityId = copyEntity(entityId, entityNumber, Constants.GLOBAL_ENTITY_STATUS_CODE_MODIFYING);
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(copiedEntityId)
				.updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		actionLogService.saveEntityActionLog(MODIFY_ACTION_LOG_CODE, logDTO, null);
		return new ResponseEntity<>(Map.of("copiedEntityId", copiedEntityId), HttpStatus.OK);
	}

	private Integer copyEntity(Integer entityId, Integer entityNumber, String entityStatusTypeCode) {
		Integer copiedEntityId;
		copiedEntityId = entityDetailsDAO.copyEntity(entityId, entityNumber, entityStatusTypeCode);
		customDataElementService.copyCustomDataBasedOnModule(entityId, copiedEntityId,
				Constants.GLOBAL_ENTITY_MODULE_CODE, Constants.COI_SUBMODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, Boolean.FALSE, Boolean.FALSE, null);
		copyEntityQuestionnaireData(entityId, copiedEntityId, Constants.GLOBAL_ENTITY_SUB_MODULE_CODE_SPONSOR);
		copyEntityQuestionnaireData(entityId, copiedEntityId, Constants.GLOBAL_ENTITY_SUB_MODULE_CODE_SUB_AWARD);
		copyEntityQuestionnaireData(entityId, copiedEntityId, Constants.GLOBAL_ENTITY_SUB_MODULE_CODE_COMPLIANCE);
		return copiedEntityId;
	}

	private void copyEntityQuestionnaireData(Integer entityId, Integer copiedEntityId, Integer moduleSubItemCode) {
		QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
		questionnaireDataBus.setActionPersonId(AuthenticatedUser.getLoginPersonId());
		questionnaireDataBus.setActionUserId(AuthenticatedUser.getLoginUserName());
		questionnaireDataBus.setModuleItemCode(Constants.GLOBAL_ENTITY_MODULE_CODE);
		questionnaireDataBus.setModuleItemKey(entityId.toString());
		questionnaireDataBus.setModuleSubItemCodes(Arrays.asList(moduleSubItemCode));
		questionnaireDataBus.setModuleSubItemKey("0");
		questionnaireDataBus.setCopyModuleItemKey(copiedEntityId.toString());
		questionnaireService.copyQuestionnaireForVersion(questionnaireDataBus, false);
	}

	@Override
	public ResponseEntity<Object> getActiveModifyingVersion(Integer entityNumber) {
		List<EntityResponseDTO> entityResponseDTOList = new ArrayList<>();
		entityRepository.fetchActiveModifyingVersionByEntityNumber(entityNumber, Constants.COI_PENDING_STATUS, Constants.COI_ACTIVE_STATUS).forEach(entityDetail -> {
			String originalName = null;
			Integer originalEntityId;
			List<EntityIndustryClassification> entityIndustryClassifications = entityIndustryClassificationRepository.findByEntityId(entityDetail.getEntityId());
			List<PriorNameResponseDTO> priorNames = companyDetailsService.fetchPriorNames(entityDetail.getEntityId());
			List<ForeignNameResponseDTO> foreignNames = companyDetailsService.fetchForeignNames(entityDetail.getEntityId());
			originalEntityId = entityDetail.getOriginalEntityId();
			log.info("originalEntityId : {}", originalEntityId);
			if (originalEntityId != null) {
				originalName = entityRepository.fetchEntityNameByEntityId(originalEntityId);
				log.info("originalName : {}", originalName);
			}
			entityResponseDTOList.add(EntityResponseDTO.builder().entityDetails(entityDetail)
				.entityIndustryClassifications(entityIndustryClassifications).priorNames(priorNames)
				.foreignNames(foreignNames).originalName(originalName)
				.build());
		});
		return ResponseEntity.ok(entityResponseDTOList);
	}

	@Override
	public ResponseEntity<Object> getVersions(Integer entityNumber) {
	    return ResponseEntity.ok(
	        entityRepository.fetchEntityVersions(entityNumber).stream()
	            .sorted(Comparator.comparing(row -> (Integer) row[0], Comparator.reverseOrder()))
	            .map(row -> {
	                Map<String, Object> map = new HashMap<>();
	                map.put("versionNumber", row[0]);
	                map.put("entityId", row[1]);
	                map.put("versionStatus", row[2]);
	                return map;
	            }).collect(Collectors.toList())
	    );
	}

	@Override
	public Map<String, Object> cancelEntityModification(EntityRequestDTO entityRequestDTO) {
		Boolean isEntityCancelled = entityRepository.isEntityCancelledVersion(entityRequestDTO.getEntityId(), Constants.COI_CANCELLED_STATUS);
		if (isEntityCancelled != null && isEntityCancelled) {
			return null;
		}
		Map<EntityRequestField, Object> entityRequestFields = new HashMap<>();
		entityRequestFields.put(EntityRequestField.versionStatus, Constants.COI_CANCELLED_STATUS);
		entityDetailsDAO.updateEntity(EntityRequestDTO.builder().entityId(entityRequestDTO.getEntityId()).entityRequestFields(entityRequestFields).build());
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder()
				.entityId(entityRequestDTO.getEntityId())
				.updatedBy(AuthenticatedUser.getLoginPersonId())
				.build();
		actionLogService.saveEntityActionLog(CANCEL_ACTION_LOG_CODE, logDTO, entityRequestDTO.getDescription());
		Map<String, Object> response = new HashMap<>();
		response.put("activeEntityId", entityRepository.getEntityIdByVersionStatus(entityRequestDTO.getEntityId(), Constants.COI_ACTIVE_STATUS));
		response.put("versionStatus", Constants.COI_CANCELLED_STATUS);
		return response;
	}

	@Override
	public Boolean isEntityForeign(Integer entityId) {
		return entityDetailsDAO.isEntityForeign(entityId);
	}

	@Override
	public void verifyEntityFromCorporateTree(Integer entityId) {
		boolean canVerifyEntity = canVerifyEntity(entityDetailsDAO.validateEntityDetails(entityId));
		if (canVerifyEntity) {
			globalEntityService.verifyEntityDetails(entityId, Boolean.TRUE);
		}
	}

	@Override
	public Entity fetchEntityByEntityId(Integer entityId) {
		return entityDetailsDAO.fetchEntityDetails(entityId);
	}

	@Override
	public ResponseEntity<String> unlinkDnbMatchDetails(Integer entityId) {
		entityDetailsDAO.unlinkDnbMatchDetails(entityId, AuthenticatedUser.getLoginPersonId());
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Dnb unlinked successfully"), HttpStatus.OK);
	}


	@Override
	public ResponseEntity<Object> createDunsRefreshVersion(Integer entityId, Integer entityNumber) {
		Integer copiedEntityId = copyEntity(entityId, entityNumber, Constants.GLOBAL_ENTITY_STATUS_CODE_DUNS_REFRESH_MODIFYING);
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(copiedEntityId)
				.updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		actionLogService.saveEntityActionLog(DUNS_MONITORING_MODIFY_ACTION_LOG_CODE, logDTO, null);
		return new ResponseEntity<>(Map.of("copiedEntityId", copiedEntityId), HttpStatus.OK);
	}
}
