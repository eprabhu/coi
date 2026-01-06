package com.polus.fibicomp.globalentity.service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.polus.fibicomp.coi.clients.FibiCoiConnectClient;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import com.polus.fibicomp.globalentity.pojo.EntityFeedStatusType;
import com.polus.fibicomp.globalentity.repository.EntityFamilyTreeRoleRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.ElasticSyncOperation;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.config.MessageQServiceRouter;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.messageq.vo.MessagingQueueProperties;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.pojo.Currency;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.EntityActionLogDto;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.globalentity.dao.EntityDetailsDAO;
import com.polus.fibicomp.globalentity.dao.SponsorDAO;
import com.polus.fibicomp.globalentity.dao.SubAwdOrgDAO;
import com.polus.fibicomp.globalentity.dto.ActionLogRequestDTO;
import com.polus.fibicomp.globalentity.dto.ActivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityDocumentStatusesDTO;
import com.polus.fibicomp.globalentity.dto.EntityMandatoryFiledsDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestField;
import com.polus.fibicomp.globalentity.dto.EntityRiskActionLogResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntitySponsorField;
import com.polus.fibicomp.globalentity.dto.InactivateEntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.MarkDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.ResponseMessageDTO;
import com.polus.fibicomp.globalentity.dto.SponsorRequestDTO;
import com.polus.fibicomp.globalentity.dto.SubAwardOrgField;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.dto.ValidateDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.dto.validateDuplicateResponseDTO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityForeignName;
import com.polus.fibicomp.globalentity.pojo.EntityPriorName;
import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;
import com.polus.fibicomp.globalentity.repository.EntityForeignNameRepository;
import com.polus.fibicomp.globalentity.repository.EntityPriorNameRepository;
import com.polus.fibicomp.globalentity.repository.EntitySponsorInfoRepository;
import com.polus.fibicomp.globalentity.repository.EntitySubOrgInfoRepository;
import com.polus.fibicomp.globalentity.repository.GlobalEntityRepository;
import com.polus.fibicomp.inbox.InboxService;

@Service(value = "globalEntityService")
@Transactional
public class GlobalEntityServiceImpl implements GlobalEntityService {

	@Autowired
	@Lazy
	private GlobalEntityRepository entityRepository;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EntityDetailsDAO entityDetailsDAO;

	@Autowired
	private SubAwdOrgDAO subAwdOrgDAO;

	@Autowired
	private SponsorDAO sponsorDAO;

	@Autowired
	private MessagingQueueProperties messagingQueueProperties;

	@Autowired
	private MessageQServiceRouter messageQServiceRouter;

	@Autowired
	private EntitySponsorInfoRepository entitySponsorInfoRepository;

	@Autowired
	private EntitySubOrgInfoRepository entitySubOrgInfoRepository;

	@Autowired
	private EntityForeignNameRepository entityForeignNameRepository;

	@Autowired
	private EntityPriorNameRepository entityPriorNameRepository;

	@Autowired
    private EntityActionLogService actionLogService;

	@Autowired
	private CustomExceptionService exceptionService;

	@Autowired
	@Qualifier(value = "corporateFamilyService")
	private GlobalEntityService corporateFamilyService;

	@Autowired
	private ConflictOfInterestService coiService;

	@Autowired
	private ConflictOfInterestDao coiDao;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private InboxService inboxService;

	@Autowired
	private InboxDao inboxDao;

	@Autowired
	private EntityFamilyTreeRoleRepository familyTreeRoleRepository;

	@Autowired
	private FibiCoiConnectClient coiConnectClient;

	@Autowired
	@Qualifier(value = "entityDetailsService")
	private GlobalEntityService entityDetailsService;

	@Autowired
	private ElasticSyncOperation elasticSyncOperation;

	protected static Logger logger = LogManager.getLogger(GlobalEntityServiceImpl.class.getName());
	private static final Integer ENTITY_MODULE_CODE = 26;
	private static final String DOCUMENT_STATUS_FLAG_DUPLICATE = "3";
	private static final String VERIFY_ACTION_LOG_CODE = "4";
	private static final String DUPLICATE_ACTION_LOG_CODE = "7";
	private static final String SPONSOR_FEED_ACTION_LOG_CODE = "10";
	private static final String ORGANIZATION_FEED_ACTION_LOG_CODE = "11";
	private static final String FEED_STATUS_NOT_READY_TO_FEED = "Not Ready to Feed";
	private static final String FEED_STATUS_READY_TO_FEED = "Ready to Feed";
	private static final String ENTITY_SPONSOR_INFO_TAB = "entity_sponsor_info";
	private static final String ENTITY_SUB_ORG_INFO_TAB = "entity_sub_org_info";
	private static final String DOCUMENT_STATUS_FLAG_ACTIVE = "1";
	private static final String DOCUMENT_STATUS_FLAG_INACTIVE = "2";
	private static final String ACTIVATE_ACTION_LOG_CODE = "5";
	private static final String INACTIVATE_ACTION_LOG_CODE = "6";
	private static final String MODIFY_ACTION_LOG_CODE = "15";
	private static final String MODIFY_VERIFY_ACTION_LOG_CODE = "20";
	private static final String FEED_STATUS_CODE_READY_TO_FEED = "2";
	private static final String FEED_STATUS_CODE_NOT_READY_TO_FEED = "1";
	private static final String DUNS_MONITORING_VERIFY_ACTION_LOG_CODE = "24";


	@Override
	public ResponseEntity<Boolean> isDunsNumberExists(EntityRequestDTO dto) {
		return new ResponseEntity<>(entityRepository.isDunsNumberExists(dto.getDunsNumber(), dto.getEntityNumber(),
				Arrays.asList(Constants.COI_ACTIVE_STATUS, Constants.COI_PENDING_STATUS)) > 0, HttpStatus.OK);
	}

	@Override
	public Object[] getEntityIdByDunsNumber(String dunsNumber) {
		return entityDetailsDAO.getEntityIdByDunsNumber(dunsNumber);
	}

	@Override
	public ResponseEntity<Boolean> isCageNumberExists(EntityRequestDTO dto) {
		return new ResponseEntity<>(entityRepository.isCageNumberExists(dto.getCageNumber(), dto.getEntityNumber(),
				Arrays.asList(Constants.COI_ACTIVE_STATUS, Constants.COI_PENDING_STATUS)) > 0, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Boolean> isUeiNumberExists(EntityRequestDTO dto) {
		return new ResponseEntity<>(entityRepository.isUeiNumberExists(dto.getUeiNumber(), dto.getEntityNumber(),
				Arrays.asList(Constants.COI_ACTIVE_STATUS, Constants.COI_PENDING_STATUS)) > 0, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<List<Currency>> fetchCurrencyDetails(){
		return new ResponseEntity<>(commonDao.fetchCurrencyDetails(), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Map<String, Object>> verifyEntityDetails(Integer entityId, Boolean verifyFromFeed) {
		if (entityRepository.isEntityCancelledVersion(entityId, Constants.COI_CANCELLED_STATUS)) {
			return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
		}
		String loginPersonId = AuthenticatedUser.getLoginPersonId() != null ? AuthenticatedUser.getLoginPersonId() : Constants.UPDATED_BY_SYSTEM;
		Map<String, Object> entityTabStatus = entityDetailsDAO.getEntityTabStatus(entityId);
		Boolean isEntityModifyingVersion = entityRepository.isEntityModifyingVersion(entityId);
		Boolean isEntityDunsRefreshVersion = entityRepository.isEntityDunsRefreshVersion(entityId);
		EntityFeedStatusType sponFeedStatus = entitySponsorInfoRepository.findEntityFeedStatusTypeByEntityId(entityId);
		EntityFeedStatusType orgFeedStatus = entitySubOrgInfoRepository.findEntityFeedStatusTypeByEntityId(entityId);
		if ((isEntityModifyingVersion != null && isEntityModifyingVersion) || isEntityDunsRefreshVersion != null && isEntityDunsRefreshVersion) {
			Integer activeEntityId = entityRepository.getEntityIdByVersionStatus(entityId, Constants.COI_ACTIVE_STATUS);
			Map<EntityRequestField, Object> entityRequestFields = Map.of(EntityRequestField.versionStatus, Constants.COI_ARCHIVE_STATUS);
			entityDetailsDAO.updateEntity(EntityRequestDTO.builder().entityId(activeEntityId).entityRequestFields(entityRequestFields).build());
		}
		Map<EntityRequestField, Object> entityRequestFields = Map.of(EntityRequestField.entityStatusTypeCode, "1", 
				EntityRequestField.approvedBy, loginPersonId, EntityRequestField.approvedTimestamp, commonDao.getCurrentTimestamp(),
				EntityRequestField.versionStatus, Constants.COI_ACTIVE_STATUS);
		entityDetailsDAO.updateEntity(
				EntityRequestDTO.builder().entityId(entityId).approvedBy(loginPersonId)
						.approvedTimestamp(commonDao.getCurrentTimestamp()).entityStatusTypeCode("1").entityRequestFields(entityRequestFields).build());
		if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB))) {
			Map<EntitySponsorField, Object> entitySponsorFields = Map.of(EntitySponsorField.feedStatusCode, "2");
			sponsorDAO.updateDetails(SponsorRequestDTO.builder().entityId(entityId).entitySponsorFields(entitySponsorFields).build());
		} else {
			Map<EntitySponsorField, Object> entitySponsorFields = Map.of(EntitySponsorField.feedStatusCode, "1");
			sponsorDAO.updateDetails(SponsorRequestDTO.builder().entityId(entityId).entitySponsorFields(entitySponsorFields).build());
		}
		if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SUB_ORG_INFO_TAB)) && (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB)) ||
				subAwdOrgDAO.isOrgFromImportEntity(entityId))) {
			Map<SubAwardOrgField, Object> subAwardOrgFields = Map.of(SubAwardOrgField.feedStatusCode, "2"); 
			subAwdOrgDAO.updateDetails(SubAwdOrgRequestDTO.builder().entityId(entityId).subAwardOrgFields(subAwardOrgFields).build());
		} else {
			Map<SubAwardOrgField, Object> subAwardOrgFields = Map.of(SubAwardOrgField.feedStatusCode, "1");
			subAwdOrgDAO.updateDetails(SubAwdOrgRequestDTO.builder().entityId(entityId).subAwardOrgFields(subAwardOrgFields).build());
		}
		Entity entityDetails = entityDetailsDAO.fetchEntityDetails(entityId);
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entityId)
				.entityName(entityDetails.getEntityName()).updatedBy(loginPersonId)
				.updateTimestamp(updateTimestamp).build();
		if (!verifyFromFeed) {
			actionLogService.saveEntityActionLog(VERIFY_ACTION_LOG_CODE, logDTO, null);
		}
		if ((isEntityModifyingVersion != null && isEntityModifyingVersion) || (isEntityDunsRefreshVersion != null && isEntityDunsRefreshVersion)) {
			inboxActions(entityId, entityDetails.getEntityName(), MODIFY_ACTION_LOG_CODE);
		}
		updateEntityFeedActionLog(entityId, entityTabStatus, sponFeedStatus, entityDetails.getEntityName(), loginPersonId,
				updateTimestamp, orgFeedStatus);

		if (Boolean.TRUE.equals(entityDetails.getIsDunsMatched())) {
			corporateFamilyService.syncCorporateLinkage(entityDetails.getEntityNumber(), entityDetails.getDunsNumber(), loginPersonId, updateTimestamp);
			corporateFamilyService.createCorporateFamilyFromDnB(entityDetails.getDunsNumber());
		}
		inboxActions(entityId);
		if (isEntityModifyingVersion != null && isEntityModifyingVersion) {
			ExecutorService executorService = Executors.newSingleThreadExecutor();
			executorService.submit(() -> {
				Map<String, String> additionalDetails = new HashMap<>();
				entityDetailsDAO.fetchEntityUsedEngagements(entityDetails.getEntityNumber()).forEach(engagementDetail -> {
					additionalDetails.put(StaticPlaceholders.PERSON_ENTITY_ID,  engagementDetail[0].toString());
					additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENTS, engagementDetail[1].toString());
					additionalDetails.put(StaticPlaceholders.ENGAGEMENT_PERSON, engagementDetail[2].toString());
					additionalDetails.put(StaticPlaceholders.PERSON_ENTITY_NUMBER, engagementDetail[3].toString());
					coiService.processCoiMessageToQ(ActionTypes.ENTITY_MODIFY_NOTIFY, entityId, null,
							additionalDetails, Constants.GLOBAL_ENTITY_MODULE_CODE, null);
				});
			});
			coiService.processCoiMessageToQ(ActionTypes.ENTITY_MODIFY, entityId, null,
					Map.of(), Constants.GLOBAL_ENTITY_MODULE_CODE, null);
		}
		if (((entityDetails.getIsDunsMonitoringEnabled() != null && !entityDetails.getIsDunsMonitoringEnabled()) || entityDetails.getIsDunsMonitoringEnabled() == null)  &&
				commonDao.getParameterValueAsBoolean("ENABLE_ENTITY_MONITORING") &&
				entityDetails.getDunsNumber() != null && entityDetails.getIsDunsMatched() != null && entityDetails.getIsDunsMatched()) {
			coiConnectClient.registerDunsMonitoring(entityDetails.getDunsNumber());
			Map<EntityRequestField, Object> entityRequestForMon = Map.of(EntityRequestField.isDunsMonitoringEnabled, true);
			entityDetailsDAO.updateEntity(EntityRequestDTO.builder().entityId(entityDetails.getEntityId()).entityRequestFields(entityRequestForMon).build());
		}
		inboxDao.markAsReadBasedOnParams(CoreConstants.MODULE_CODE_GLOBAL_ENTITY, entityId.toString(), Constants.INBOX_DUNS_REFRESH_VERIFY);
		return new ResponseEntity<>(entityDetailsDAO.getEntityTabStatus(entityId), HttpStatus.OK);
	}

	@Override
	public void updateEntityFeedActionLog(Integer entityId, Map<String, Object> entityTabStatus, EntityFeedStatusType sponFeedStatus,
										  String entityName, String updatedBy, Timestamp updateTimestamp, EntityFeedStatusType orgFeedStatus) {
		ActionLogRequestDTO logDTO;
		if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB)) && (sponFeedStatus == null ||
				!sponFeedStatus.getFeedStatusCode().equals(FEED_STATUS_CODE_READY_TO_FEED))) {
			logDTO = ActionLogRequestDTO.builder().entityId(entityId).entityName(entityName)
					.updatedBy(updatedBy).oldFeedStatus(sponFeedStatus != null ? sponFeedStatus.getDescription() : FEED_STATUS_NOT_READY_TO_FEED)
					.newFeedStatus(FEED_STATUS_READY_TO_FEED).updateTimestamp(updateTimestamp).build();
			actionLogService.saveEntityActionLog(SPONSOR_FEED_ACTION_LOG_CODE, logDTO, null);
		} else if (Boolean.FALSE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB)) && sponFeedStatus != null &&
				!sponFeedStatus.getFeedStatusCode().equals(FEED_STATUS_CODE_READY_TO_FEED)) {
			logDTO = ActionLogRequestDTO.builder().entityId(entityId).entityName(entityName)
					.updatedBy(updatedBy).oldFeedStatus(sponFeedStatus.getDescription())
					.newFeedStatus(FEED_STATUS_NOT_READY_TO_FEED).updateTimestamp(updateTimestamp).build();
			actionLogService.saveEntityActionLog(SPONSOR_FEED_ACTION_LOG_CODE, logDTO, null);
		}
		if (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SUB_ORG_INFO_TAB))  && (orgFeedStatus == null ||
				!orgFeedStatus.getFeedStatusCode().equals(FEED_STATUS_CODE_READY_TO_FEED)) && (Boolean.TRUE.equals(entityTabStatus.get(ENTITY_SPONSOR_INFO_TAB)) ||
				subAwdOrgDAO.isOrgFromImportEntity(entityId))) {
			logDTO = ActionLogRequestDTO.builder().entityId(entityId).entityName(entityName)
					.updatedBy(updatedBy).oldFeedStatus(orgFeedStatus != null ? orgFeedStatus.getDescription() : FEED_STATUS_NOT_READY_TO_FEED)
					.newFeedStatus(FEED_STATUS_READY_TO_FEED).updateTimestamp(updateTimestamp).build();
			actionLogService.saveEntityActionLog(ORGANIZATION_FEED_ACTION_LOG_CODE, logDTO, null);
		} else if (Boolean.FALSE.equals(entityTabStatus.get(ENTITY_SUB_ORG_INFO_TAB))  && orgFeedStatus != null &&
				!orgFeedStatus.getFeedStatusCode().equals(FEED_STATUS_CODE_NOT_READY_TO_FEED)) {
			logDTO = ActionLogRequestDTO.builder().entityId(entityId).entityName(entityName)
					.updatedBy(updatedBy).oldFeedStatus(orgFeedStatus.getDescription())
					.newFeedStatus(FEED_STATUS_NOT_READY_TO_FEED).updateTimestamp(updateTimestamp).build();
			actionLogService.saveEntityActionLog(ORGANIZATION_FEED_ACTION_LOG_CODE, logDTO, null);
		}
	}

	private void inboxActions(Integer entityId) {
		inboxDao.markAsReadBasedOnParams(CoreConstants.MODULE_CODE_GLOBAL_ENTITY,
				entityId.toString(), Constants.INBOX_CREATE_ENTITY);
	}

	@Override
	public void processEntityMessageToQ(Integer entityId) {
		processEntityMessageToQ(null, entityId, null, null);
	}

	public void processEntityMessageToQ(String actionType, Integer moduleItemKey, Integer moduleSubItemKey, Map<String, String> additionDetails) {
        MessageQVO messageQVO = new MessageQVO();
        messageQVO.setActionType(actionType);
        messageQVO.setModuleCode(ENTITY_MODULE_CODE);
        messageQVO.setSubModuleCode(null);
        messageQVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		messageQVO.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
        messageQVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
        messageQVO.setOrginalModuleItemKey(moduleItemKey);
        messageQVO.setSubModuleItemKey(moduleSubItemKey);
        messageQVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
        messageQVO.setSourceQueueName(messagingQueueProperties.getQueues().get("entity.integration"));
        messageQVO.setAdditionalDetails(additionDetails);
        messageQServiceRouter.getMessagingQueueServiceBean().publishMessageToQueue(messageQVO);
    }

	@Override
	public Map<String, Object> fetchEntityTabStatus(Integer entityId) {
		return entityDetailsDAO.getEntityTabStatus(entityId);
	}

	@Override
	public List<validateDuplicateResponseDTO> validateDuplicate(ValidateDuplicateRequestDTO dto) {
		List<Entity> entities = new ArrayList<Entity>();
		entities = entityDetailsDAO.validateDuplicateByParams(dto);
		List<validateDuplicateResponseDTO> responseDto = entities.stream()
			    .map(entity -> mapToResponseDto(entity))
			    .collect(Collectors.toList());
		return responseDto;
	}

	private validateDuplicateResponseDTO mapToResponseDto(Entity entity) {
		EntitySponsorInfo sponsorDetails = entitySponsorInfoRepository.findByEntityId(entity.getEntityId());
		EntitySubOrgInfo organizationDetails = entitySubOrgInfoRepository.findByEntityId(entity.getEntityId());
		EntityForeignName entityForeignName = entityForeignNameRepository.findLatestByEntityId(entity.getEntityId());
		List<ForeignNameResponseDTO> foreignNames = mapForeignNameEntityToDTO(entityForeignNameRepository.findByEntityId(entity.getEntityId()));
		EntityPriorName entityPriorName = entityPriorNameRepository.findLatestByEntityId(entity.getEntityId());
		List<EntityFamilyTreeRole> entityFamilyTreeRoles = new ArrayList<>();
		familyTreeRoleRepository.findByEntityNumber(entity.getEntityId()).forEach(familyTreeRole -> {
			EntityFamilyTreeRole entityFamilyTreeRole = EntityFamilyTreeRole.builder().build();
			BeanUtils.copyProperties(familyTreeRole, entityFamilyTreeRole, "entity");
			entityFamilyTreeRoles.add(entityFamilyTreeRole);
		});
		return validateDuplicateResponseDTO.builder().entityId(entity.getEntityId()).entityName(entity.getEntityName())
				.ownershipType(entity.getEntityOwnershipType() != null ? entity.getEntityOwnershipType().getDescription() : null)
				.priorName(entityPriorName != null ? entityPriorName.getPriorName() : null)
				.foreignName(entityForeignName != null ? entityForeignName.getForeignName() : null)
				.primaryAddressLine1(entity.getPrimaryAddressLine1())
				.primaryAddressLine2(entity.getPrimaryAddressLine2()).country(entity.getCountry())
				.city(entity.getCity()).state(entity.getStateDetails() != null ? entity.getStateDetails().getStateName() : entity.getState()).dunsNumber(entity.getDunsNumber())
				.ueiNumber(entity.getUeiNumber()).cageNumber(entity.getCageNumber()).website(entity.getWebsiteAddress())
				.email(entity.getCertifiedEmail()).postalCode(entity.getPostCode()).phone(entity.getPhoneNumber())
				.sponsorCode(sponsorDetails != null ? sponsorDetails.getSponsorCode() : null)
				.organizationId(organizationDetails != null ? organizationDetails.getOrganizationId() : null)
				.entityBusinessType(entity.getEntityBusinessType())
				.entityFamilyTreeRoles(entityFamilyTreeRoles)
				.foreignNames(foreignNames)
				.isForeign(entity.getIsForeign())
				.entityNumber(entity.getEntityNumber())
				.entityStatusTypeCode(entity.getEntityStatusTypeCode())
				.build();
	}

	List<ForeignNameResponseDTO> mapForeignNameEntityToDTO(List<EntityForeignName> entityForeignNames) {
		return entityForeignNames.stream()
				.map(entityForeignName -> ForeignNameResponseDTO.builder()
						.id(entityForeignName.getId())
						.foreignName(entityForeignName.getForeignName())
						.build())
				.collect(Collectors.toList());
	}

	@Override
	public ResponseMessageDTO markDuplicate(MarkDuplicateRequestDTO dto) {
		Map<EntityRequestField, Object> entityRequestFields = Map.of(EntityRequestField.documentStatusTypeCode, DOCUMENT_STATUS_FLAG_DUPLICATE, 
				EntityRequestField.originalEntityId, dto.getOriginalEntityId());
		entityDetailsDAO.updateEntity(EntityRequestDTO.builder().documentStatusTypeCode(DOCUMENT_STATUS_FLAG_DUPLICATE)
				.entityId(dto.getDuplicateEntityId()).originalEntityId(dto.getOriginalEntityId()).entityRequestFields(entityRequestFields).build());
		entityDetailsDAO.updateDocWithOriginalEntity(dto.getDuplicateEntityId(), dto.getOriginalEntityId());
		try {
			Entity entityDetails = entityRepository.findByEntityId(dto.getDuplicateEntityId());
			ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entityDetails.getEntityId())
					.entityName(entityDetails.getEntityName()).updatedBy(AuthenticatedUser.getLoginPersonId()).build();
			actionLogService.saveEntityActionLog(DUPLICATE_ACTION_LOG_CODE, logDTO, dto.getDescription());
		} catch (Exception e) {
			logger.error("Exception in saveEntityActionLog in markDuplicate");
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return new ResponseMessageDTO("Entity marked as duplicate successfully");
	}

	@Override
	public List<EntityActionLogDto> fetchHistory(Integer entityId) {
		return actionLogService.fetchAllEntityActionLog(entityId);
	}

	@Override
	public List<EntityActionLogDto> fetchHistory(Integer entityId, Integer entityNumber) {
		return actionLogService.fetchAllEntityActionLog(entityId, entityNumber);
	}

	@Override
	public ResponseMessageDTO logAction(ActionLogRequestDTO dto) {
		if(dto.getActionLogCode().equals(MODIFY_ACTION_LOG_CODE)) {
			Entity entityDetails = entityRepository.findByEntityId(dto.getEntityId());
			inboxActions(dto.getEntityId(), entityDetails.getEntityName(), MODIFY_ACTION_LOG_CODE);
		}
		try {
			actionLogService.saveEntityActionLog(dto.getActionLogCode(), dto, null);
		} catch (Exception e) {
			logger.error("Exception in saveEntityActionLog in logAction");
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return new ResponseMessageDTO("Entity action log saved successfully");
	}

	@Override
	public List<EntityRiskActionLogResponseDTO> fetchRiskHistory(Integer entityRiskId) {
		return actionLogService.fetchAllEntityRiskActionLog(entityRiskId);
	}

	@Override
	public ResponseMessageDTO activateEntity(ActivateEntityRequestDTO dto) {
		Map<EntityRequestField, Object> entityRequestFields = Map.of(EntityRequestField.documentStatusTypeCode, DOCUMENT_STATUS_FLAG_ACTIVE);
		entityDetailsDAO.updateEntity(EntityRequestDTO.builder().entityId(dto.getEntityId()).entityRequestFields(entityRequestFields).build());
		try {
			Entity entityDetails = entityRepository.findByEntityId(dto.getEntityId());
			ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entityDetails.getEntityId())
					.entityName(entityDetails.getEntityName()).updatedBy(AuthenticatedUser.getLoginPersonId()).build();
			actionLogService.saveEntityActionLog(ACTIVATE_ACTION_LOG_CODE, logDTO, dto.getComment());
		} catch (Exception e) {
			logger.error("Exception in saveEntityActionLog in activateEntity");
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return new ResponseMessageDTO("Entity marked as active successfully");
	}

	@Override
	public ResponseMessageDTO inactivateEntity(InactivateEntityRequestDTO dto) {
		Map<EntityRequestField, Object> entityRequestFields = Map.of(EntityRequestField.documentStatusTypeCode, DOCUMENT_STATUS_FLAG_INACTIVE);
		entityDetailsDAO.updateEntity(EntityRequestDTO.builder().entityId(dto.getEntityId()).entityRequestFields(entityRequestFields).build());
		Entity entityDetails = entityRepository.findByEntityId(dto.getEntityId());
		inboxActions(dto.getEntityId(), entityDetails.getEntityName(), INACTIVATE_ACTION_LOG_CODE);
		try {
			ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entityDetails.getEntityId())
					.entityName(entityDetails.getEntityName()).updatedBy(AuthenticatedUser.getLoginPersonId()).build();
			actionLogService.saveEntityActionLog(INACTIVATE_ACTION_LOG_CODE, logDTO, dto.getComment());
			coiService.processCoiMessageToQ(ActionTypes.ENTITY_INACTIVATE, dto.getEntityId(), null,
					Map.of(StaticPlaceholders.ENTITY_INACTIVATE_REASON,  dto.getComment()), Constants.GLOBAL_ENTITY_MODULE_CODE, null);

			ExecutorService executorService = Executors.newSingleThreadExecutor();
			executorService.submit(() -> {
				Map<String, String> additionalDetails = new HashMap<>();
				entityDetailsDAO.fetchEntityUsedEngagements(entityDetails.getEntityNumber()).forEach(engagementDetail -> {
					additionalDetails.put(StaticPlaceholders.PERSON_ENTITY_ID,  engagementDetail[0].toString());
					additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENTS, engagementDetail[1].toString());
					additionalDetails.put(StaticPlaceholders.ENGAGEMENT_PERSON, engagementDetail[2].toString());
					additionalDetails.put(StaticPlaceholders.PERSON_ENTITY_NUMBER, engagementDetail[3].toString());
					additionalDetails.put(StaticPlaceholders.ENTITY_INACTIVATE_REASON,  dto.getComment());
					coiService.processCoiMessageToQ(ActionTypes.ENTITY_INACTIVATE_REP_NOTIFY, dto.getEntityId(), null,
							additionalDetails, Constants.GLOBAL_ENTITY_MODULE_CODE, null);
				});
			});
		} catch (Exception e) {
			logger.error("Exception in saveEntityActionLog in inactivateEntity");
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return new ResponseMessageDTO("Entity marked as inactive successfully");
	}

	@Override
	public void processEntityMessageToGraphSyncQ(Integer entityId) {
		processEntityMessageToGraphSyncQ(null, entityId, null, null);
	}

	private void processEntityMessageToGraphSyncQ(String actionType, Integer moduleItemKey, Integer moduleSubItemKey, Map<String, String> additionDetails) {
		MessageQVO messageQVO = new MessageQVO();
        messageQVO.setActionType(actionType);
        messageQVO.setModuleCode(ENTITY_MODULE_CODE);
        messageQVO.setSubModuleCode(null);
        messageQVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		messageQVO.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
        messageQVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
        messageQVO.setOrginalModuleItemKey(moduleItemKey);
        messageQVO.setSubModuleItemKey(moduleSubItemKey);
        messageQVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
        messageQVO.setSourceQueueName(messagingQueueProperties.getQueues().get("entity.graph.sync"));
        messageQVO.setAdditionalDetails(additionDetails);
        messageQServiceRouter.getMessagingQueueServiceBean().publishMessageToQueue(messageQVO);
	}

	@Override
	public EntityMandatoryFiledsDTO fetchEntityMandatoryFields(){
		return entityDetailsDAO.fetchEntityMandatoryFields();
	}

	@Override
	public ObjectNode validateEntityDetails(Integer entityId) {
		return entityDetailsDAO.validateEntityDetails(entityId);
	}

	@Override
	public List<EntityDocumentStatusesDTO> fetchEntityDocumentStatuses() {
		return entityDetailsDAO.fetchEntityDocumentStatuses();
	}

	private void inboxActions(Integer entityId, String entityName, String actionTypeCode) {
		if (MODIFY_ACTION_LOG_CODE.equals(actionTypeCode)) { // needed only when user manually modifies the entity
			return;
		}
		List<PersonEntity> personEntities = coiDao.getPersonEntityDetailsByEntityId(entityId);
		String loginPersonId = AuthenticatedUser.getLoginUserName() != null ? AuthenticatedUser.getLoginUserName() : Constants.UPDATED_BY_SYSTEM;
		if (!personEntities.isEmpty()) {
			StringBuilder userMessage = new StringBuilder();
			String[] messageTypeCode = new String[1];
			switch (actionTypeCode) {
			case INACTIVATE_ACTION_LOG_CODE:
				userMessage.append(personDao.getPersonFullNameByPersonId(loginPersonId))
						.append(" Inactivated ").append(entityName).append(" on ")
						.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT))
						.append(". Please revise your disclosure or modify your entity details accordingly");
				messageTypeCode[0] = Constants.INBOX_INACTIVATE_ENTITY;
				break;
			case MODIFY_ACTION_LOG_CODE:
				userMessage.append(personDao.getPersonFullNameByPersonId(loginPersonId))
						.append(" modified ").append(entityName).append(" on ")
						.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT))
						.append(". Please revise your disclosure or modify your engagement details accordingly");
				messageTypeCode[0] = Constants.INBOX_MODIFY_ENTITY;
				break;
			}
			Timestamp timestamp = commonDao.getCurrentTimestamp();
			personEntities.forEach(personEntity -> {
				Inbox inbox = new Inbox();
				inbox.setModuleCode(CoreConstants.MODULE_CODE_GLOBAL_ENTITY);
				inbox.setSubModuleCode(Constants.COI_SFI_SUBMODULE_CODE);
				inbox.setToPersonId(personEntity.getPersonId());
				inbox.setModuleItemKey(personEntity.getPersonEntityId().toString());
				inbox.setUserMessage(userMessage.toString());
				inbox.setMessageTypeCode(messageTypeCode[0]);
				inbox.setSubModuleItemKey(personEntity.getPersonEntityNumber().toString());
				inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
				inbox.setUpdateUser(loginPersonId);
				inbox.setOpenedFlag(Constants.NO);
				inbox.setArrivalDate(timestamp);
				inbox.setUpdateTimeStamp(timestamp);
				inboxService.addToInbox(inbox);
			});
		}
	}

	@Override
	public void updateEntityForeignFlag(Integer entityId, Integer entityNumber) {
		entityDetailsDAO.updateEntityForeignFlag(entityId, entityNumber);
	}

	@Override
	public void updateEntityForeignFlag(Integer entityId) {
		entityDetailsDAO.updateEntityForeignFlag(entityId, entityRepository.findEntityNumberByEntityId(entityId));
	}

	@Override
	public void updateEntityElastic(Integer entityId) {
		Object responseBody = entityDetailsService.getVersions(entityRepository.findEntityNumberByEntityId(entityId))
				.getBody();
		if (responseBody instanceof Stream) {
			try (Stream<?> rawStream = (Stream<?>) responseBody) {
				Object archivedEntityId = rawStream.filter(item -> item instanceof Map)
						.map(item -> ((Map<?, ?>) item).get("entityId")).skip(1).findFirst().orElse(null);
				if (archivedEntityId != null) {
					elasticSyncOperation.initiateSyncForElasticQueueRequest(archivedEntityId.toString(),
							Constants.ELASTIC_ACTION_DELETE, Constants.ELASTIC_INDEX_ENTITY);
					elasticSyncOperation.initiateSyncForElasticQueueRequest(entityId.toString(),
							Constants.ELASTIC_ACTION_INSERT, Constants.ELASTIC_INDEX_ENTITY);
				} else {
					elasticSyncOperation.initiateSyncForElasticQueueRequest(entityId.toString(),
							Constants.ELASTIC_ACTION_UPDATE, Constants.ELASTIC_INDEX_ENTITY);
				}
			}
		}
	}

	@Override
	public void insertDunsMonitoringVerifyLog(Integer entityId) {
		ActionLogRequestDTO logDTO = ActionLogRequestDTO.builder().entityId(entityId)
				.updatedBy(Constants.UPDATED_BY_SYSTEM)
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		actionLogService.saveEntityActionLog(DUNS_MONITORING_VERIFY_ACTION_LOG_CODE, logDTO, null);
	}
}
