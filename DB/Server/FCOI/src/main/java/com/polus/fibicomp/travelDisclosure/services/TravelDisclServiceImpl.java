package com.polus.fibicomp.travelDisclosure.services;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.transaction.Transactional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.clients.FormBuilderClient;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.EngagementsDetailsDTO;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.coi.service.PersonEntityService;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.inbox.InboxService;
import com.polus.fibicomp.travelDisclosure.dao.TravelDisclDao;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclLookups;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclValidateDto;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclosureDto;
import com.polus.fibicomp.travelDisclosure.dtos.TravelDisclosureActionLogDto;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosure;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class TravelDisclServiceImpl implements TravelDisclService {

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private PersonDao personDao;

    @Autowired
    private ConflictOfInterestDao coiDao;

    @Autowired
    private TravelDisclDao travelDisclDao;


    @Autowired
    private FormBuilderClient formBuilderClient;

    @Autowired
    private PersonEntityService personEntityService;

    @Autowired
    private InboxService inboxService;

    @Autowired
    private ConflictOfInterestService coiService;

    @Autowired
    private InboxDao inboxDao;

    @Autowired
    private FcoiDisclosureDao fcoiDisclosureDao;
    
	@Autowired
	private CommonService commonService;
	
	@Autowired
	private FcoiDisclosureService fcoiDisclosureService;

    @Override
    public ResponseEntity<Object> createCoiTravelDisclosure(CoiTravelDisclosureDto dto) {
        CoiTravelDisclosure coiTravelDisclosure = new CoiTravelDisclosure();
        coiTravelDisclosure.setPersonId(AuthenticatedUser.getLoginPersonId());
        coiTravelDisclosure.setTravellerHomeUnit(AuthenticatedUser.getLoginPersonUnit());
        coiTravelDisclosure.setPersonEntityId(dto.getPersonEntityId());
        coiTravelDisclosure.setPersonEntityNumber(dto.getPersonEntityNumber());
        coiTravelDisclosure.setEntityId(dto.getEntityId());
        coiTravelDisclosure.setEntityNumber(dto.getEntityNumber());
        Integer maxTravelNumber = travelDisclDao.maxDisclosureNumber();
        coiTravelDisclosure.setTravelNumber( maxTravelNumber == null ? 1 : maxTravelNumber + 1);
        coiTravelDisclosure.setVersionNumber(1);
        coiTravelDisclosure.setVersionStatus(Constants.COI_PENDING_STATUS);
        coiTravelDisclosure.setReviewStatusCode(Constants.TRAVEL_REVIEW_STATUS_CODE_PENDING);
        coiTravelDisclosure.setDocumentStatusCode(Constants.TRAVEL_DOCUMENT_STATUS_CODE_DRAFT);
        coiTravelDisclosure.setTravelerFundingTypeCode(dto.getTravelerFundingTypeCode());
        coiTravelDisclosure.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        coiTravelDisclosure.setCreatedBy(AuthenticatedUser.getLoginPersonId());
        coiTravelDisclosure.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        travelDisclDao.save(coiTravelDisclosure);
        if (!coiTravelDisclosure.getTravelerFundingTypeCode().equals(Constants.TRAVEL_FUNDING_TYPE_INTERNAL)
                && !coiDao.isRelationshipAdded(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP), dto.getPersonEntityId())) {
            PersonEntity personEntity = new PersonEntity();
            personEntity.setPersonEntityId(dto.getPersonEntityId());
            personEntity.setPerEntDisclTypeSelection(Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_TRAVEL));
            personEntity.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP));
            personEntityService.saveRelationshipDetails(personEntity, AuthenticatedUser.getLoginPersonId(), AuthenticatedUser.getLoginUserName(), Boolean.TRUE);
        }
        TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder()
                .actionTypeCode(Constants.TRAVEL_ACTION_LOG_CREATED)
                .travelDisclosureId(coiTravelDisclosure.getTravelDisclosureId())
                .travelNumber(coiTravelDisclosure.getTravelNumber())
                .reporter(AuthenticatedUser.getLoginUserFullName()).build();
        actionLogService.saveTravelDisclosureActionLog(actionLogDto);
        BeanUtils.copyProperties(coiTravelDisclosure, dto);
        dto.setCreateUserFullName(AuthenticatedUser.getLoginUserFullName());
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        if (dto.getPersonEntityId() != null) {
        	inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, dto.getPersonEntityId().toString(), AuthenticatedUser.getLoginPersonId(),
    				Constants.INBOX_TRAVEL_DISCLOSURE_CREATION, CoreConstants.SUBMODULE_ITEM_KEY,
    				CoreConstants.SUBMODULE_CODE);
        }
        Map<String, String> additionalDetails = new HashMap<>();
        coiService.processCoiMessageToQ(ActionTypes.TRAVEL_CREATION, coiTravelDisclosure.getTravelDisclosureId(),
                null, additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);

        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> updateCoiTravelDisclosure(CoiTravelDisclosureDto dto) {
        CoiTravelDisclosure coiTravelDisclosure = travelDisclDao.findByTravelDisclosureId(dto.getTravelDisclosureId());
        if (coiTravelDisclosure == null) {
            return new ResponseEntity<>("Travel Disclosure not found against ID : " + dto.getTravelDisclosureId(), HttpStatus.BAD_REQUEST);
        }
        Integer previousPersonEntityId = null;
        if (dto.getPersonEntityId()!= null && coiTravelDisclosure.getPersonEntityId() != dto.getPersonEntityId()) {
            if (!coiDao.isRelationshipAdded(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP), dto.getPersonEntityId())) {
                PersonEntity personEntity = new PersonEntity();
                personEntity.setPersonEntityId(dto.getPersonEntityId());
                personEntity.setPerEntDisclTypeSelection(Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_TRAVEL));
                personEntity.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP));
                personEntityService.saveRelationshipDetails(personEntity, AuthenticatedUser.getLoginPersonId(), AuthenticatedUser.getLoginUserName(), Boolean.TRUE);
            }
            previousPersonEntityId = coiTravelDisclosure.getPersonEntityId();
        } else if (dto.getTravelerFundingTypeCode().equals(Constants.TRAVEL_FUNDING_TYPE_INTERNAL)) {
            previousPersonEntityId = coiTravelDisclosure.getPersonEntityId();
        }
        coiTravelDisclosure.setTravelerFundingTypeCode(dto.getTravelerFundingTypeCode());
        coiTravelDisclosure.setPersonEntityId(dto.getPersonEntityId());
        coiTravelDisclosure.setPersonEntityNumber(dto.getPersonEntityNumber());
        coiTravelDisclosure.setEntityId(dto.getEntityId());
        coiTravelDisclosure.setEntityNumber(dto.getEntityNumber());
        coiTravelDisclosure.setDocumentStatusCode(Constants.TRAVEL_DOCUMENT_STATUS_CODE_DRAFT);
        coiTravelDisclosure.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        coiTravelDisclosure.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        travelDisclDao.save(coiTravelDisclosure);
        if (previousPersonEntityId != null) {
            travelDisclDao.removeRelationShipIfNotUsed(previousPersonEntityId, Constants.TRAVEL_SELF_RELATIONSHIP, Boolean.TRUE, coiTravelDisclosure.getTravelDisclosureId());
        }
        dto.setUpdatedBy(coiTravelDisclosure.getUpdatedBy());
        dto.setUpdateTimestamp(coiTravelDisclosure.getUpdateTimestamp());
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        Map<String, String> additionalDetails = new HashMap<>();
        coiService.processCoiMessageToQ(ActionTypes.TRAVEL_CREATION, coiTravelDisclosure.getTravelDisclosureId(),
                null, additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> loadTravelDisclosure(Integer travelDisclosureId) {
        CoiTravelDisclosure coiTravelDisclosure = travelDisclDao.findByTravelDisclosureId(travelDisclosureId);
        if (coiTravelDisclosure == null) {
            return new ResponseEntity<>("Travel Disclosure not found against ID : " + travelDisclosureId, HttpStatus.BAD_REQUEST);
        }
        List<String> editModeStatuses = Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_PENDING, Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED, Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN);
		if (editModeStatuses.contains(coiTravelDisclosure.getReviewStatusCode())) {
			travelDisclDao.syncEngagementDetails(coiTravelDisclosure);
		}
        CoiTravelDisclosureDto travelDisclosureDto = CoiTravelDisclosureDto.builder().build();
        BeanUtils.copyProperties(coiTravelDisclosure, travelDisclosureDto, "personEntity", "entity", "unitAdministrators", "unitType", "currency", "travelDestinations");
        travelDisclosureDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(coiTravelDisclosure.getUpdatedBy()));
        travelDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(coiTravelDisclosure.getCreatedBy()));
        travelDisclosureDto.setPersonEntitiesCount(coiDao.getSFIOfDisclosureCount(ConflictOfInterestVO.builder().personId(coiTravelDisclosure.getPersonId()).build()));
        travelDisclosureDto.setPersonAttachmentsCount(coiDao.personAttachmentsCount(coiTravelDisclosure.getPersonId()));
        travelDisclosureDto.setPersonNotesCount(coiDao.personNotesCount(coiTravelDisclosure.getPersonId()));
        if (coiTravelDisclosure.getAdminGroupId() != null) {
            travelDisclosureDto.setAdminGroupName(commonDao.getAdminGroupByGroupId(coiTravelDisclosure.getAdminGroupId()).getAdminGroupName());
        }
        if(coiTravelDisclosure.getAdminPersonId() != null) {
            travelDisclosureDto.setAdminPersonName(personDao.getPersonFullNameByPersonId(coiTravelDisclosure.getAdminPersonId()));
        }
        if (travelDisclosureDto.getPersonEntityId() != null) {
            ConflictOfInterestVO perEntityVo = personEntityService.getPersonEntityDetails(travelDisclosureDto.getPersonEntityId());
            PersonEntity personEntity = perEntityVo.getPersonEntity();
            personEntity.setValidPersonEntityRelTypes(perEntityVo.getValidPersonEntityRelTypes());
            personEntity.setPerEntDisclTypeSelections(perEntityVo.getPerEntDisclTypeSelections());
            personEntity.setPersonEntityRelationships(perEntityVo.getPersonEntityRelationships());
            ConflictOfInterestVO coiEntityVo = coiService.getCoiEntityDetails(travelDisclosureDto.getPersonEntityId());
            Entity coiEntity = coiEntityVo.getCoiEntity();
            coiEntity.setEntityFamilyTreeRoles(coiEntityVo.getEntityFamilyTreeRoles());
            personEntity.setCoiEntity(coiEntity);
            travelDisclosureDto.setPersonEntity(personEntity);
        }
        if(!AuthenticatedUser.getLoginPersonId().equals(coiTravelDisclosure.getPersonId())) {
        	travelDisclosureDto.setIsHomeUnitSubmission(coiDao.getIsHomeUnitSubmission(travelDisclosureId, Constants.TRAVEL_MODULE_CODE));
        }
        return new ResponseEntity<>(travelDisclosureDto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> assignAdmin(CoiTravelDisclosureDto dto) {
        if (travelDisclDao.isAdminAlreadyAssigned(dto.getAdminGroupId(), dto.getAdminPersonId(), dto.getTravelDisclosureId())) {
            return new ResponseEntity<>("Admin already assigned", HttpStatus.METHOD_NOT_ALLOWED);
        }
        if (travelDisclDao.isReviewStatusIsIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_PENDING,
                Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED, Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN, Constants.TRAVEL_REVIEW_STATUS_CODE_COMPLETED))) {
            return new ResponseEntity<>("Admin assign not allowed", HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiTravelDisclosure travelDiscl = travelDisclDao.findByTravelDisclosureId(dto.getTravelDisclosureId());
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        travelDisclDao.assignAdmin(dto.getAdminPersonId(), dto.getAdminGroupId(), AuthenticatedUser.getLoginPersonId(),
                currentTimestamp, Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS, dto.getTravelDisclosureId());
        saveTravelDisclosureAssignAdminActionLog(dto.getAdminPersonId(), travelDiscl.getAdminPersonId(), dto.getTravelDisclosureId(), dto.getTravelNumber());
        inboxDao.markAsReadBasedOnParams(Constants.TRAVEL_MODULE_CODE, dto.getTravelDisclosureId().toString(), Constants.INBOX_SUBMIT_TRAVEL_DISCLOSURE);
        inboxDao.markAsReadBasedOnParams(Constants.TRAVEL_MODULE_CODE, dto.getTravelDisclosureId().toString(), Constants.INBOX_TRAVEL_WAITING_ADMIN_REVIEW);
        StringBuilder actionLogMessage = new StringBuilder("Travel disclosure of ");
        actionLogMessage.append(travelDiscl.getPerson().getFullName())
                .append(" Submitted on ")
                .append(commonDao.getDateFormat(new Date(),CoreConstants.DEFAULT_DATE_FORMAT));
        addToInbox(dto.getTravelDisclosureId().toString(), dto.getAdminPersonId(), Constants.INBOX_TRAVEL_WAITING_ADMIN_REVIEW, actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
        dto.setUpdateTimestamp(currentTimestamp);
        dto.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        dto.setAdminPersonName(personDao.getPersonFullNameByPersonId(dto.getAdminPersonId()));
        if (dto.getAdminGroupId() != null) {
            dto.setAdminGroupName(commonDao.getAdminGroupByGroupId(dto.getAdminGroupId()).getAdminGroupName());
        }
        dto.setReviewStatusCode(Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS);
        dto.setTravelReviewStatusType(travelDisclDao.findTravelReviewStatusTypeById(Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS));
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    private void saveTravelDisclosureAssignAdminActionLog(String adminPersonId, String oldAdminPersonId,  Integer travelDisclosureId, Integer travelNumber) {
        String oldAdminPerson = oldAdminPersonId != null ? personDao.getPersonFullNameByPersonId(oldAdminPersonId) : null;
        String newAdminPerson = personDao.getPersonFullNameByPersonId(adminPersonId);
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY, personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId()));
        additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO, newAdminPerson);
        if (oldAdminPerson != null) {
            TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder().actionTypeCode(Constants.TRAVEL_ACTION_LOG_REASSIGN_ADMIN)
                    .travelDisclosureId(travelDisclosureId)
                    .travelNumber(travelNumber)
                    .oldAdmin(oldAdminPerson)
                    .newAdmin(newAdminPerson)
                    .coiAdmin(AuthenticatedUser.getLoginUserFullName())
                    .build();
            actionLogService.saveTravelDisclosureActionLog(actionLogDto);
            additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENTS, oldAdminPersonId);
            additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, oldAdminPerson);
			coiService.processCoiMessageToQ(ActionTypes.TRAVEL_ADMIN_REMOVE, travelDisclosureId, null,
					additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
			// Sends notification to the newly assigned admin after reassignment
			Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
			additionalDetails.remove(StaticPlaceholders.NOTIFICATION_RECIPIENTS);
			commonService.setNotificationRecipients(adminPersonId, CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO,
					dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailrecipients));
			coiService.processCoiMessageToQ(ActionTypes.TRAVEL_REASSIGN_ADMIN, travelDisclosureId, null, additionalDetails,
					Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        }
        else {
            TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder().actionTypeCode(Constants.TRAVEL_ACTION_LOG_ASSIGN_ADMIN)
                    .travelDisclosureId(travelDisclosureId)
                    .travelNumber(travelNumber)
                    .newAdmin(newAdminPerson)
                    .coiAdmin(AuthenticatedUser.getLoginUserFullName())
                    .build();
            actionLogService.saveTravelDisclosureActionLog(actionLogDto);
            coiService.processCoiMessageToQ(ActionTypes.TRAVEL_ASSIGN_ADMIN, travelDisclosureId,
                    null, additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        }
    }

    @Override
    public ResponseEntity<Object> fetchHistory(Integer travelDisclosureId) {
        return new ResponseEntity<>(actionLogService.getTravelDisclosureHistoryById(travelDisclosureId), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> certifyTravelDisclosure(CoiTravelDisclosureDto dto) {
        if (travelDisclDao.isReviewStatusIsNotIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED,
                Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN, Constants.TRAVEL_REVIEW_STATUS_CODE_PENDING))) {
            return new ResponseEntity<>("Travel Disclosure already certified!", HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiTravelDisclosure travelDiscl = travelDisclDao.findByTravelDisclosureId(dto.getTravelDisclosureId());
        PersonEntity personEntity = coiDao.getPersonEntityByNumberAndStatus(travelDiscl.getPersonEntityNumber(), Constants.COI_ACTIVE_STATUS);
        if (personEntity == null) {
            return new ResponseEntity<>( "This Travel Disclosure cannot be submitted because the linked Engagement is inactive."
            		+ " Please activate your Engagement to proceed with the submission.", HttpStatus.NOT_ACCEPTABLE);
        }
        if (!personEntity.getIsFormCompleted()) {
            return new ResponseEntity<>( "This Travel Disclosure cannot be submitted because the linked Engagement is incomplete."
            		+ " Please complete your Engagement to proceed with the submission.", HttpStatus.NOT_ACCEPTABLE);
        }
        String reviewStatusCode = Constants.TRAVEL_REVIEW_STATUS_CODE_SUBMITTED;
        String actionType = ActionTypes.TRAVEL_SUBMIT;
        if (travelDisclDao.isReviewStatusIsIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED))) {
            reviewStatusCode = Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS;
        }
        if (travelDisclDao.isReviewStatusIsIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED))) {
            actionType = ActionTypes.TRAVEL_RETURNED_RESUBMISSION;
        } else if (travelDisclDao.isReviewStatusIsIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN))) {
            actionType = ActionTypes.TRAVEL_WITHDRAWN_RESUBMISSION;
        }
        Timestamp expirationTimestamp = Timestamp.valueOf(LocalDateTime.now().plusYears(1).minusDays(1));
        travelDisclDao.certify(AuthenticatedUser.getLoginPersonId(), commonDao.getCurrentTimestamp(), dto.getCertificationText(),
                reviewStatusCode, dto.getTravelDisclosureId(), expirationTimestamp);
        TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder()
                .actionTypeCode(Constants.TRAVEL_ACTION_LOG_SUBMITTED)
                .travelDisclosureId(dto.getTravelDisclosureId())
                .travelNumber(dto.getTravelNumber())
                .reporter(AuthenticatedUser.getLoginUserFullName()).build();
        actionLogService.saveTravelDisclosureActionLog(actionLogDto);
        dto.setTravelReviewStatusType(travelDisclDao.findTravelReviewStatusTypeById(reviewStatusCode));
        if (travelDiscl.getPersonEntityId() != null) {
            List<CoiTravelDisclValidateDto> validatedDataDtos;
			try {
				validatedDataDtos = validateReimbursementCostAndProcess(travelDiscl.getPersonEntityNumber(), travelDiscl.getTravelDisclosureId(), personEntity);
			} catch (SQLException e) {
				log.error("Error in validateReimbursementCostAndProcess", e.getMessage());
			    Map<String, String> error = new HashMap<>();
	            error.put("error", "Validation of reimbursement cost operation failed");
	            error.put("reason", e.getMessage());
				return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
			}
            if (validatedDataDtos != null && !validatedDataDtos.isEmpty()) {
                CoiTravelDisclValidateDto validatedData = validatedDataDtos.get(0);
                validatedData.setFcoiDisclosureDetails(coiDao.getActiveOrPendingDiscl());
                dto.setDisclValidatedObject(validatedData);
            }
            dto.setPersonEntityId(travelDiscl.getPersonEntityId());
        }
        if (actionType.equals(ActionTypes.TRAVEL_RETURNED_RESUBMISSION)) {
            inboxDao.markAsReadBasedOnParams(Constants.TRAVEL_MODULE_CODE, dto.getTravelDisclosureId().toString(), Constants.INBOX_TRAVEL_RETURNED);
        }
        StringBuilder actionLogMessage = new StringBuilder("Travel disclosure of ");
        actionLogMessage.append(AuthenticatedUser.getLoginUserFullName())
                .append(" Submitted on ")
                .append(commonDao.getDateFormat(new Date(),CoreConstants.DEFAULT_DATE_FORMAT));
        personDao.getAdministratorsByModuleCode(Constants.TRAVEL_MODULE_CODE).forEach(administratorPerId -> {
            addToInbox(dto.getTravelDisclosureId().toString(), administratorPerId, Constants.INBOX_SUBMIT_TRAVEL_DISCLOSURE,
                    actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
        });
        coiService.processCoiMessageToQ(actionType, dto.getTravelDisclosureId(),
                null, Map.of(), Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<Object> withdrawTravelDisclosure(CoiTravelDisclosureDto dto) {
        if (travelDisclDao.isReviewStatusIsNotIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_SUBMITTED))) {
            return new ResponseEntity<>("Travel Disclosure Review Status Changed!", HttpStatus.METHOD_NOT_ALLOWED);
        }
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        CoiTravelDisclosure travelDiscl = travelDisclDao.findByTravelDisclosureId(dto.getTravelDisclosureId());
        travelDisclDao.changeReviewStatus(Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN, currentTimestamp, AuthenticatedUser.getLoginPersonId(),
                dto.getTravelDisclosureId());
        TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder()
                .actionTypeCode(Constants.TRAVEL_ACTION_LOG_WITHDRAWN)
                .travelDisclosureId(dto.getTravelDisclosureId())
                .travelNumber(dto.getTravelNumber())
                .reporter(AuthenticatedUser.getLoginUserFullName())
                .comment(dto.getDescription()).build();
        actionLogService.saveTravelDisclosureActionLog(actionLogDto);
        dto.setUpdateTimestamp(currentTimestamp);
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        dto.setTravelReviewStatusType(travelDisclDao.findTravelReviewStatusTypeById(Constants.TRAVEL_REVIEW_STATUS_CODE_WITHDRAWN));
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.WITHDRAWAL_REASON, dto.getDescription());
        additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, travelDiscl.getCertifiedAt().toString());
        coiService.processCoiMessageToQ(ActionTypes.TRAVEL_WITHDRAW, dto.getTravelDisclosureId(),
                null, additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<Object> returnTravelDisclosure(CoiTravelDisclosureDto dto) {
        if (travelDisclDao.isReviewStatusIsNotIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS))) {
            return new ResponseEntity<>("Travel Disclosure Review Status Changed!", HttpStatus.METHOD_NOT_ALLOWED);
        }
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        CoiTravelDisclosure travelDiscl = travelDisclDao.findByTravelDisclosureId(dto.getTravelDisclosureId());
        travelDisclDao.changeReviewStatus(Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED, currentTimestamp, AuthenticatedUser.getLoginPersonId(),
                dto.getTravelDisclosureId());
        TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder()
                .actionTypeCode(Constants.TRAVEL_ACTION_LOG_RETURNED)
                .travelDisclosureId(dto.getTravelDisclosureId())
                .travelNumber(dto.getTravelNumber())
                .administratorName(AuthenticatedUser.getLoginUserFullName())
                .comment(dto.getDescription()).build();
        actionLogService.saveTravelDisclosureActionLog(actionLogDto);
        dto.setUpdateTimestamp(currentTimestamp);
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        dto.setTravelReviewStatusType(travelDisclDao.findTravelReviewStatusTypeById(Constants.TRAVEL_REVIEW_STATUS_CODE_RETURNED));
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.RETURN_REASON, dto.getDescription());
        additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, travelDiscl.getCertifiedAt().toString());
        additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
        coiService.processCoiMessageToQ(ActionTypes.TRAVEL_RETURN, dto.getTravelDisclosureId(),
                null, additionalDetails, Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        StringBuilder actionLogMessage = new StringBuilder("Travel disclosure returned by ");
        actionLogMessage.append(AuthenticatedUser.getLoginUserFullName())
                .append(" on ")
                .append(commonDao.getDateFormat(new Date(),CoreConstants.DEFAULT_DATE_FORMAT));
        addToInbox(dto.getTravelDisclosureId().toString(), travelDisclDao.findPersonIdByTravelDisclosureId(dto.getTravelDisclosureId()),
                Constants.INBOX_TRAVEL_RETURNED, actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<Object> approveTravelDisclosure(CoiTravelDisclosureDto dto) {
        if (travelDisclDao.isReviewStatusIsNotIn(dto.getTravelDisclosureId(), Arrays.asList(Constants.TRAVEL_REVIEW_STATUS_CODE_REVIEW_INPROGRESS,
                Constants.TRAVEL_REVIEW_STATUS_CODE_SUBMITTED))) {
            return new ResponseEntity<>("Travel Disclosure Review Status Changed!", HttpStatus.METHOD_NOT_ALLOWED);
        }
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        travelDisclDao.changeReviewStatusAndDocumentStatusCode(Constants.TRAVEL_REVIEW_STATUS_CODE_APPROVED, Constants.TRAVEL_DOCUMENT_STATUS_CODE_APPROVED,
                currentTimestamp, AuthenticatedUser.getLoginPersonId(), dto.getTravelDisclosureId());
        TravelDisclosureActionLogDto actionLogDto = TravelDisclosureActionLogDto.builder()
                .actionTypeCode(Constants.TRAVEL_ACTION_LOG_APPROVED)
                .travelDisclosureId(dto.getTravelDisclosureId())
                .travelNumber(dto.getTravelNumber())
                .reporter(AuthenticatedUser.getLoginUserFullName())
                .comment(dto.getDescription()).build();
        actionLogService.saveTravelDisclosureActionLog(actionLogDto);
        dto.setUpdateTimestamp(currentTimestamp);
        dto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        dto.setTravelDocumentStatusType(travelDisclDao.findTravelDocumentStatusTypeById(Constants.TRAVEL_DOCUMENT_STATUS_CODE_APPROVED));
        dto.setTravelReviewStatusType(travelDisclDao.findTravelReviewStatusTypeById(Constants.TRAVEL_REVIEW_STATUS_CODE_APPROVED));
        dto.setReviewStatusCode(Constants.TRAVEL_REVIEW_STATUS_CODE_APPROVED);
        dto.setDocumentStatusCode(Constants.TRAVEL_DOCUMENT_STATUS_CODE_APPROVED);
        inboxDao.markAsReadBasedOnParams(Constants.TRAVEL_MODULE_CODE, dto.getTravelDisclosureId().toString(), Constants.INBOX_TRAVEL_WAITING_ADMIN_REVIEW);
        inboxDao.markAsReadBasedOnParams(Constants.TRAVEL_MODULE_CODE, dto.getTravelDisclosureId().toString(), Constants.INBOX_SUBMIT_TRAVEL_DISCLOSURE);
        coiService.processCoiMessageToQ(ActionTypes.TRAVEL_ADMIN_APPROVE, dto.getTravelDisclosureId(),
                null, Map.of(), Constants.TRAVEL_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<Object> getRelatedDisclosures(Integer personEntityNumber) {
        List<CoiTravelDisclosureDto> travelDisclosureDtos = new ArrayList<>();
        return ResponseEntity.ok(travelDisclDao.findCoiTravelDisclosureByPersonEntityNumber(personEntityNumber));
    }

    @Override
    public ResponseEntity<Object> getLookups() {
        return ResponseEntity.ok(CoiTravelDisclLookups.builder()
                        .travelDisclosureStatusTypes(travelDisclDao.getAllCoiTravelDisclosureStatusType())
                        .travelFundingAgencyTypes(travelDisclDao.getAllCoiTravelFundingAgencyType())
                .build());
    }

    @Override
    public List<CoiTravelDisclValidateDto> validateReimbursementCostAndProcess(Integer personEntityNumber, Integer travldisclosureId, PersonEntity personEntity) throws SQLException {
    	String engagementTypesNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
        List<CoiTravelDisclValidateDto> travelDisclValidateDto = travelDisclDao.getReimbursementValidatedDetails(personEntityNumber);
        boolean isFinancialRelExists = false;
        PersonEntityDto personEntityDto = new PersonEntityDto();
        BeanUtils.copyProperties(personEntity, personEntityDto);
        CoiDisclosure pendingDisclosure = fcoiDisclosureDao.isFCOIDisclosureExists(AuthenticatedUser.getLoginPersonId(), Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), Constants.COI_PENDING_STATUS);
        if (travelDisclValidateDto == null || travelDisclValidateDto.isEmpty()) {
            EngagementsDetailsDTO engagementsDetail = new EngagementsDetailsDTO();
            engagementsDetail.setIsSystemCreated(Boolean.TRUE);
            engagementsDetail.setIsEngagementCompensated(Boolean.FALSE);
            engagementsDetail.setPersonEntityRelationship(new PersonEntityRelationship());
            engagementsDetail.getPersonEntityRelationship().setDisclTypeCodes(Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI));
            engagementsDetail.getPersonEntityRelationship().setPersonEntityId(personEntity.getPersonEntityId());
            engagementsDetail.getPersonEntityRelationship().setIsSystemCreated(Boolean.TRUE);
            engagementsDetail.setPersonEntityId(personEntity.getPersonEntityId());
            engagementsDetail.setUpdatePersonEntityDto(personEntityDto);
            engagementsDetail.getUpdatePersonEntityDto().setIsCompensated(Boolean.FALSE);
            personEntityService.updateEngFinRelation(engagementsDetail);
        	personEntityService.evaluateSfi(personEntity.getPersonEntityId());
        }
        for (CoiTravelDisclValidateDto travelDisclValidatedRes : travelDisclValidateDto) {
            EngagementsDetailsDTO engagementsDetail = new EngagementsDetailsDTO();
            engagementsDetail.setIsSystemCreated(Boolean.TRUE);
            engagementsDetail.setIsEngagementCompensated(Boolean.TRUE);
            PersonEntityRelationship perEntityRelationship = new PersonEntityRelationship();
            perEntityRelationship.setDisclTypeCodes(Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI));
            perEntityRelationship.setPersonEntityId(personEntity.getPersonEntityId());
            perEntityRelationship.setIsSystemCreated(Boolean.TRUE);
            perEntityRelationship.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.FINANCIAL_SELF_RELATION_TYPE));
            engagementsDetail.setPersonEntityRelationship(perEntityRelationship);
            engagementsDetail.setPersonEntityId(personEntity.getPersonEntityId());
            engagementsDetail.setUpdatePersonEntityDto(personEntityDto);
            engagementsDetail.getUpdatePersonEntityDto().setIsCompensated(Boolean.TRUE);
            ResponseEntity<Object> response = personEntityService.updateEngFinRelation(engagementsDetail);
            if(Constants.ALL_FINANCIAL_ENGAGEMENT.equals(engagementTypesNeeded) && response.getStatusCode().is4xxClientError()) {
            	 isFinancialRelExists = true;
                 break;
            }
            Map<String, Object> sfiEvalResult = personEntityService.evaluateSfi(personEntity.getPersonEntityId());
			Boolean isSfiRelExists = (Boolean) sfiEvalResult.get("alreadySFI");
			if (Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypesNeeded) && isSfiRelExists) {
				isFinancialRelExists = true;
                break;
			}
			if ((Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypesNeeded) && (boolean) sfiEvalResult.get("isSFI"))
					|| Constants.ALL_FINANCIAL_ENGAGEMENT.equals(engagementTypesNeeded)) {
				String messageTypeCode = pendingDisclosure != null ? Constants.INBOX_FCOI_DISCLOSURE_REVISION
						: Constants.INBOX_TRAVEL_DISCL_REIMBURSED_COST_LIMIT_EXCEEDED;
				String disclosureId = pendingDisclosure != null ? pendingDisclosure.getDisclosureId().toString()
						: Constants.DEFAULT_MODULE_ITEM_KEY;
				addToInbox(disclosureId, travelDisclValidatedRes.getPersonId(), messageTypeCode,
						"Your travel reimbursement for " + personEntity.getCoiEntity().getEntityName()
								+ " has exceeded the limit set by the university",
						"System");
				Map<String, String> additionalDetails = new HashMap<>();
				additionalDetails.put("notificationTypeId", Constants.COI_REIMBURSE_COST_EXCEEDED_NOTIFICATION_TYPE_ID);
				additionalDetails.put(StaticPlaceholders.TOTAL_REIMBURSED_COST,
						String.valueOf(travelDisclValidatedRes.getReimbursedCost()));
				additionalDetails.put(StaticPlaceholders.NO_OF_TRAVELS,
						String.valueOf(travelDisclValidatedRes.getNoOfTravels()));
				additionalDetails.put(StaticPlaceholders.ENGAGEMENT_NAME, personEntity.getCoiEntity().getEntityName());
				MessageQVO messageVO = new MessageQVO();
				messageVO.setTriggerType(TriggerTypes.TRAVEL_DISCL_REIMBURSED_COST_LIMIT_EXCEEDED);
				messageVO.setModuleCode(Constants.TRAVEL_MODULE_CODE);
				messageVO.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
				messageVO.setOrginalModuleItemKey(travldisclosureId);
				messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
				messageVO.setAdditionalDetails(additionalDetails);
				messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
				coiService.processCoiTriggerMessageToQ(messageVO);
			}
	        if ((Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypesNeeded)) && ((boolean) sfiEvalResult.get("isSFI")))
	        		fcoiDisclosureService.markPendingDisclosuresAsVoid(Constants.AWARD_MODULE_CODE.toString(), Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_ENG);
        }
        if (pendingDisclosure != null && !(Constants.DISCLOSURE_REVIEW_SUBMITTED.equals(pendingDisclosure.getReviewStatusCode())
				|| Constants.DISCLOSURE_REVIEW_IN_PROGRESS.equals(pendingDisclosure.getReviewStatusCode())
				|| Constants.DISCLOSURE_REVIEW_ASSIGNED.equals(pendingDisclosure.getReviewStatusCode())
				|| Constants.DISCLOSURE_ASSIGNED_REVIEW_COMPLETED.equals(pendingDisclosure.getReviewStatusCode()))) {
            return null;
        }
        return isFinancialRelExists ? null : travelDisclValidateDto;
    }

    public void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage, String updateUser) {
        Inbox inbox = new Inbox();
        inbox.setModuleCode(Constants.TRAVEL_MODULE_CODE);
        inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
        inbox.setToPersonId(personId);
        inbox.setModuleItemKey(moduleItemKey);
        inbox.setUserMessage(userMessage);
        inbox.setMessageTypeCode(messageTypeCode);
        inbox.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY.toString());
        inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
        inbox.setUpdateUser(updateUser);
        inboxService.addToInbox(inbox);
    }

    @Override
	public Boolean isTravelDisclosureCreated(Integer personEntityId, String personId) {
		return travelDisclDao.isTravelDisclosureCreated(personEntityId, personId);
	}

}
