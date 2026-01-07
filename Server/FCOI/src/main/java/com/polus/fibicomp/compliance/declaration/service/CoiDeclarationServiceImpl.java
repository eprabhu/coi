package com.polus.fibicomp.compliance.declaration.service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.service.RMQMessagingQueueServiceImpl;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.messageq.vo.MessagingQueueProperties;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Unit;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.HistoryDto;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclActionLogTypeDao;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationDao;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationStatusDao;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationTypeDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationCommonDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationRequestDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationResponse;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLog;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationReviewStatusType;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationStatus;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.inbox.InboxService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service(value = "coiDeclarationService")
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CoiDeclarationServiceImpl implements CoiDeclarationService {

	private static final String DECLARATION_MESSAGE_TYPE_CODE = "8033";

	private static final String EXPIRY_DECL_NOTIFICATION_TYPE_ID = "8088";

	private static final String EXPIRED_DECL_NOTIFICATION_TYPE_ID = "8089";

	private static final String ACTION_TYPE_ADMIN_ASSIGN = "A";
	private static final String ACTION_TYPE_ADMIN_REASSIGN = "R";

	private final CoiDeclarationDao dao;

	private final CommonDao commonDao;

	private final ConflictOfInterestDao coiDao;

	private final CoiDeclarationTypeDao declarationTypeDao;

	private final CoiDeclarationStatusDao declarationStatusDao;

	private final PersonDao personDao;

	private final InboxService inboxService;

	private final RMQMessagingQueueServiceImpl rmqMessagingQueueService;

	private final MessagingQueueProperties messagingQueueProperties;

	private final ConflictOfInterestService coiService;

	private final InboxDao inboxDao;

	private final CommonService commonService;

	private final ActionLogService actionLogService;

	@Override
	public DeclarationResponse createDeclaration(DeclarationRequestDto request) {
		String personId = AuthenticatedUser.getLoginPersonId();
		try {
			String declarationNumber = dao.generateNextDeclarationNumber();
			log.info("Generated new declaration number: {} for personId: {}", declarationNumber, personId);

			CoiDeclaration declaration = CoiDeclaration.builder()
					.declarationNumber(declarationNumber)
					.personId(personId)
					.declarationTypeCode(request.getDeclarationTypeCode())
					.declarationType(declarationTypeDao.findById(request.getDeclarationTypeCode()))
					.declarationStatusCode(Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING)
					.declarationStatus(declarationStatusDao.findById(Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING))
					.reviewStatusCode(Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS)
					.declarationReviewStatusType(dao.getReviewStatusTypeByCode(Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS))
					.versionNumber(1)
					.versionStatus(Constants.COI_PENDING_STATUS)
					.createdBy(personId)
					.createTimestamp(commonDao.getCurrentTimestamp())
					.updatedBy(personId)
					.updateTimestamp(commonDao.getCurrentTimestamp())
					.build();
			dao.saveDeclaration(declaration);
			declaration.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getUpdatedBy()));
			declaration.setCreateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getCreatedBy()));
			declaration.setPerson(personDao.getPersonDetailById(declaration.getPersonId()));
			DeclarationResponse response = toResponse(declaration);
			actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_CREATED, DeclarationCommonDto.builder()
					.declarationId(declaration.getDeclarationId())
					.declarationNumber(declaration.getDeclarationNumber())
					.updateTimestamp(declaration.getUpdateTimestamp())
					.updateUserFullName(declaration.getUpdateUserFullName()).build()
			);
			log.info("Declaration saved successfully. Declaration ID: {}, Number: {}", declaration.getDeclarationId(), declaration.getDeclarationNumber());
			return response;

		} catch (Exception e) {
			log.error("Error occurred while creating COI Declaration for personId: {}. Error: {}", personId, e.getMessage(), e);
			throw new RuntimeException("Failed to create declaration. Please contact support.");
		}
	}

	@Override
	public DeclarationResponse submitDeclaration(DeclarationRequestDto request) {
        Integer declarationId = request.getDeclarationId();
        List<String> declarationStatus = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_SUBMIT);
        if (dao.isDeclarationWithStatuses(declarationStatus, declarationId)) {
            throw new ApplicationException("Declaration already submitted", Constants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiDeclaration declaration = dao.findByDeclarationId(declarationId);
        Timestamp updateTimestamp;
        if (dao.isReviewRequiredBasedonFormAns(declarationId)) {
			String reviewStatusCode = declaration.getReviewStatusCode().equals(Constants.COI_DECLARATION_REVIEW_STATUS_RETURN) &&
					declaration.getAdminPersonId() != null ? Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_IN_PROGRESS : Constants.COI_DECLARATION_REVIEW_STATUS_SUBMIT;
            updateTimestamp = dao.updateDeclarationStatues(declarationId,Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING,
					reviewStatusCode, Constants.COI_PENDING_STATUS, true, null);
            actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_SUBMITTED, DeclarationCommonDto.builder()
                    .declarationId(declaration.getDeclarationId())
                    .declarationNumber(declaration.getDeclarationNumber())
                    .updateTimestamp(updateTimestamp)
                    .updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build()
            );
			insertDeclarationSubmitInbox(declaration.getDeclarationId().toString(), AuthenticatedUser.getLoginUserFullName());

			String actionType = ActionTypes.DECLARATION_SUBMIT;
			if (reviewStatusCode.equals(Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_IN_PROGRESS)) {
				actionType = ActionTypes.DECLARATION_RESUBMIT;
			}
			Map<String, String> additionalDetails = new HashMap<>();
			additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
					commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
            additionalDetails.put(StaticPlaceholders.DECLARATION_STATUS, dao.getReviewStatusTypeByCode(reviewStatusCode).getDescription());
			coiService.processCoiMessageToQ(actionType, declarationId, null, additionalDetails,
					Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
            log.info("Declaration ID {} submitted successfully.", declarationId);
        } else {
            request.setIsApproval(Boolean.TRUE);
            updateTimestamp = dao.updateDeclarationStatues(declarationId, Constants.COI_DECLARATION_APPROVAL_STATUS_APPROVED,
                    Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_NOT_REQUIRED, Constants.COI_ACTIVE_STATUS, true, getExpirationTimestamp());
            actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_ADMIN_REVIEW_COMPLETED, DeclarationCommonDto.builder()
                    .declarationId(declaration.getDeclarationId())
                    .declarationNumber(declaration.getDeclarationNumber())
                    .updateTimestamp(updateTimestamp)
                    .updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build()
            );
            dao.archivePreviousVersionBasedOnStatus(declaration.getDeclarationNumber(), declaration.getVersionNumber(), Constants.COI_ACTIVE_STATUS);
            log.info("Declaration ID {} submitted successfully. Expiration set to {}", declarationId, getExpirationTimestamp());
        }
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE, declarationId.toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_RETURNED);
        return getDeclaration(declarationId);
    }

    private Timestamp getExpirationTimestamp() {
        Timestamp expirationTimestamp = Timestamp.valueOf(commonDao.getCurrentTimestamp().toLocalDateTime().plusYears(1).minusDays(1));
        return expirationTimestamp;
    }

    public void insertDeclarationSubmitInbox(String declarationId, String personName) {
		StringBuilder actionLogMessage = new StringBuilder("Declaration of ");
		String displayName = (personName != null && !personName.isEmpty()) ? personName
				: AuthenticatedUser.getLoginUserFullName();
		actionLogMessage.append(displayName).append(" submitted on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		personDao.getAdministratorsByModuleCode(Constants.COI_DECLARATION_MODULE_CODE).forEach(administratorPerId -> {
			addToInbox(declarationId, administratorPerId, Constants.COI_DECLARATION_INBOX_MSG_TYPE_SUBMIT,
					actionLogMessage.toString(), AuthenticatedUser.getLoginUserName(), Constants.COI_SUBMODULE_CODE);
		});
	}

	@Override
	public DeclarationResponse reviseDeclaration(DeclarationRequestDto request) {
		String personId = AuthenticatedUser.getLoginPersonId();

		CoiDeclaration existing = dao.findActiveDeclaration(personId, request.getDeclarationTypeCode());

		Timestamp currentTimestamp = commonDao.getCurrentTimestamp();

		CoiDeclaration newVersion = CoiDeclaration.builder()
				.declarationNumber(existing.getDeclarationNumber())
				.personId(existing.getPersonId())
				.declarationTypeCode(existing.getDeclarationTypeCode())
				.declarationType(declarationTypeDao.findById(existing.getDeclarationTypeCode()))
				.declarationType(declarationTypeDao.findById(request.getDeclarationTypeCode()))
				.declarationStatusCode(Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING)
				.declarationStatus(declarationStatusDao.findById(Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING))
				.reviewStatusCode(Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS)
				.declarationReviewStatusType(dao.getReviewStatusTypeByCode(Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS))
				.versionNumber(dao.getNextVersionNumber(existing.getDeclarationNumber()))
				.versionStatus(Constants.COI_PENDING_STATUS)
				.updatedBy(personId)
				.updateTimestamp(currentTimestamp)
				.createdBy(personId)
				.createTimestamp(currentTimestamp)
				.build();

		dao.saveDeclaration(newVersion);
		log.info("Created new declaration version: declarationNumber={}, versionNumber={}, personId={}", newVersion.getDeclarationNumber(), newVersion.getVersionNumber(), newVersion.getPersonId());

		newVersion.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(newVersion.getUpdatedBy()));
		newVersion.setCreateUserFullName(personDao.getPersonFullNameByPersonId(newVersion.getCreatedBy()));
		newVersion.setPerson(personDao.getPersonDetailById(newVersion.getPersonId()));

		DeclarationResponse response = toResponse(newVersion);
		actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_REVISED, DeclarationCommonDto.builder()
				.declarationId(newVersion.getDeclarationId())
				.declarationNumber(newVersion.getDeclarationNumber())
				.updateTimestamp(newVersion.getUpdateTimestamp())
				.updateUserFullName(newVersion.getUpdateUserFullName()).build()
		);

		return response;
	}

	@Override
	public DeclarationResponse getDeclaration(Integer id) {
		log.info("Fetching COI Declaration with ID: {}", id);
		CoiDeclaration declaration = dao.findByDeclarationId(id);
		declaration.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getUpdatedBy()));
		declaration.setCreateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getCreatedBy()));
		declaration.setPerson(personDao.getPersonDetailById(declaration.getPersonId()));
		declaration.setAdminPersonName(declaration.getAdminPersonId() != null
				? personDao.getPersonFullNameByPersonId(declaration.getAdminPersonId())
				: null);
		declaration.setAdminGroupName(declaration.getAdminGroupId() != null
				? commonDao.getAdminGroupByGroupId(declaration.getAdminGroupId()).getAdminGroupName()
				: null);
		if(!AuthenticatedUser.getLoginPersonId().equals(declaration.getPersonId())) {
			declaration.setIsHomeUnitSubmission(coiDao.getIsHomeUnitSubmission(id, Constants.COI_DECLARATION_MODULE_CODE));
        }
		DeclarationResponse response = toResponse(declaration);
		log.info("Successfully retrieved COI Declaration with declarationNumber: {}", declaration.getDeclarationNumber());
		return response;
	}

	@Override
	public void processExpiringDeclarations() {
		log.info("Started processing expiring COI declarations.");
		try {
			List<CoiDeclaration> alreadyExpiredDeclarations = dao.findExpiringDeclarations(commonDao.getCurrentTimestamp(),
                    Arrays.asList(Constants.COI_DECLARATION_APPROVAL_STATUS_APPROVED, Constants.COI_DECLARATION_APPROVAL_STATUS_REJECTED), false);

			if (alreadyExpiredDeclarations != null && !alreadyExpiredDeclarations.isEmpty()) {
				for (CoiDeclaration declaration : alreadyExpiredDeclarations) {
					log.info("Updating status to EXPIRED for Declaration ID: {}", declaration.getDeclarationId());
                    if (!dao.canCreateDeclaration(declaration.getPersonId(), declaration.getDeclarationTypeCode())) {
                        log.info("Declaration ID: {} | the person is not eligible now!", declaration.getDeclarationId());
                        return;
                    }

					updateDeclarationStatusToExpired(declaration);
					String formattedDate = commonDao.getDateFormat(declaration.getExpirationDate(), CoreConstants.DEFAULT_DATE_FORMAT);
					String declarationType = declaration.getDeclarationType().getDeclarationType();
					String expiredMessage = "Your " + declarationType + " certification expired on " + formattedDate + ". Please renew it to remain compliant.";

					log.info("Logging action for declaration ID: {}", declaration.getDeclarationId());
					actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_EXPIRED, DeclarationCommonDto.builder()
							.declarationId(declaration.getDeclarationId())
							.declarationNumber(declaration.getDeclarationNumber())
							.updateTimestamp(declaration.getUpdateTimestamp())
							.updateUserFullName(declaration.getUpdateUserFullName()).build()
					);
					log.info("Expired notification prepared for Declaration ID {}: {}", declaration.getDeclarationId(), expiredMessage);

					addToInbox(declaration.getDeclarationId().toString(), declaration.getPersonId(), DECLARATION_MESSAGE_TYPE_CODE, expiredMessage, "System", Integer.valueOf(declaration.getDeclarationTypeCode()));

				}
			} else {
				log.info("No COI declarations found that already expired.");
			}
			log.info("Completed processing expiring COI declarations.");

		} catch (Exception e) {
			log.error("Exception occurred while processing COI declaration expirations: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to process expiring declarations.", e);
		}
	}

	private void updateDeclarationStatusToExpired(CoiDeclaration declaration) {
		try {
			declaration.setReviewStatusCode(Constants.COI_DECLARATION_REVIEW_STATUS_EXPIRED);
			declaration.setDeclarationReviewStatusType(dao.getReviewStatusTypeByCode(Constants.COI_DECLARATION_REVIEW_STATUS_EXPIRED));
			declaration.setUpdateTimestamp(commonDao.getCurrentTimestamp());
			declaration.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
			dao.saveDeclaration(declaration);
			log.info("Declaration ID {} status updated to Expired.", declaration.getDeclarationId());
		} catch (Exception e) {
			log.error("Failed to update status to Expired for declaration ID {}.", declaration.getDeclarationId(), e);
		}
	}

	private DeclarationResponse toResponse(CoiDeclaration entity) {
		return DeclarationResponse.builder()
				.declaration(entity)
				.build();
	}

	@Override
	public DeclarationResponse findLatestDeclarationsByPersonId(String personId) {
		try {
			List<CoiDeclaration> declarations = dao.findLatestDeclarationsByPersonId(personId);

			if (declarations != null && !declarations.isEmpty()) {
				for (CoiDeclaration declaration : declarations) {
					declaration.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getUpdatedBy()));
					declaration.setCreateUserFullName(personDao.getPersonFullNameByPersonId(declaration.getCreatedBy()));
					declaration.setPerson(personDao.getPersonDetailById(declaration.getPersonId()));
				}
			}

			return DeclarationResponse.builder().declarations(declarations).build();
		} catch (Exception e) {
			throw new RuntimeException("Failed to retrieve latest COI declarations", e);
		}
	}

	@Override
	public List<HistoryDto> getActionLogsByDeclarationId(Integer declarationId) {
		List<CoiDeclActionLog> logs = dao.getActionLogsByDeclarationId(declarationId);
		List<HistoryDto> histories = new ArrayList<>();
		logs.forEach(actionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(actionLog.getCreateTimestamp());
			if (actionLog.getCreatedBy() != null) {
				historyDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(actionLog.getCreatedBy()));
			}
			historyDto.setActionTypeCode(actionLog.getActionTypeCode());
			historyDto.setMessage(actionLog.getActionMessage());
            historyDto.setComment(actionLog.getComment());
			histories.add(historyDto);
		});
		return histories;
	}

	public void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage, String updateUser, Integer subModuleCode) {
		Inbox inbox = new Inbox();
		inbox.setModuleCode(Constants.COI_DECLARATION_MODULE_CODE);
		inbox.setSubModuleCode(subModuleCode);
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
	public void initiateSyncCoiDeclaration(Integer declarationId) {
		MessageQVO messageVO = new MessageQVO();
		messageVO.setTriggerType(TriggerTypes.COI_DECLARATION_INTEGRATION);
		messageVO.setModuleCode(Constants.COI_DECLARATION_MODULE_CODE);
		messageVO.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
		messageVO.setOrginalModuleItemKey(declarationId);
		messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
		messageVO.setAdditionalDetails(Collections.EMPTY_MAP);
		messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
		messageVO.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
		messageVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		coiService.processCoiTriggerMessageToQ(messageVO);
	}

	@Override
	public ResponseEntity<Object> assignAdmin(DeclarationRequestDto assignAdminDto) {
		if ((assignAdminDto.getActionType().equals(ACTION_TYPE_ADMIN_REASSIGN) && dao.isSameAdminPersonOrGroupAdded(assignAdminDto.getAdminGroupId(), assignAdminDto.getAdminPersonId(), assignAdminDto.getDeclarationId()))
				|| (assignAdminDto.getActionType().equals(ACTION_TYPE_ADMIN_ASSIGN) && dao.isAdminPersonOrGroupAdded(assignAdminDto.getDeclarationId()))) {
			return new ResponseEntity<>("Admin already assigned", HttpStatus.METHOD_NOT_ALLOWED);
		} else if (assignAdminDto.getActionType().equals(ACTION_TYPE_ADMIN_ASSIGN)) {
			List<String> declarationStatuses = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_SUBMIT);
			if (!dao.isDeclarationWithStatuses(declarationStatuses, assignAdminDto.getDeclarationId())) {
				return new ResponseEntity<>("Assign admin action cannot be performed", HttpStatus.METHOD_NOT_ALLOWED);
			}
		} else if (assignAdminDto.getActionType().equals(ACTION_TYPE_ADMIN_REASSIGN)) {
			List<String> declarationStatuses = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_IN_PROGRESS);
			if (!dao.isDeclarationWithStatuses(declarationStatuses, assignAdminDto.getDeclarationId())) {
				return new ResponseEntity<>("Reassign admin action cannot be performed", HttpStatus.METHOD_NOT_ALLOWED);
			}
		}
		CoiDeclaration coiDeclaration = dao.findByDeclarationId(assignAdminDto.getDeclarationId());
		String previousAdminPersonName = personDao.getPersonFullNameByPersonId(coiDeclaration.getAdminPersonId());
		Timestamp updateTimestamp = dao.assignAdmin(assignAdminDto, Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_IN_PROGRESS);

		Map<String, String> additionalDetails = new HashMap<>();
		Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
		String actionType = null;
		String currentAdminPersonName = personDao.getPersonFullNameByPersonId(assignAdminDto.getAdminPersonId());
		if (assignAdminDto.getActionType().equals(ACTION_TYPE_ADMIN_REASSIGN)) {
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY, AuthenticatedUser.getLoginUserFullName());
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO,currentAdminPersonName);
			commonService.setNotificationRecipients(coiDeclaration.getAdminPersonId(), CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(dynamicEmailrecipients));
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, personDao.getPersonFullNameByPersonId(coiDeclaration.getAdminPersonId()));
			actionType = ActionTypes.DECLARATION_ADMIN_REMOVE;
		} else {
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY, AuthenticatedUser.getLoginUserFullName());
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO, currentAdminPersonName);
			CoiDeclarationReviewStatusType reviewStatus = dao.findByReviewStatusCode(Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_IN_PROGRESS);
			additionalDetails.put(StaticPlaceholders.REVIEW_STATUS, reviewStatus.getDescription());
			actionType = ActionTypes.DECLARATION_ASSIGN_ADMIN;
		}
		coiService.processCoiMessageToQ(actionType, assignAdminDto.getDeclarationId(), null, additionalDetails,
				Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		if (actionType == ActionTypes.DECLARATION_ADMIN_REMOVE) {
			additionalDetails.remove(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS);
			dynamicEmailrecipients.clear();
			commonService.setNotificationRecipients(assignAdminDto.getAdminPersonId(),
					CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailrecipients));
			coiService.processCoiMessageToQ(ActionTypes.DECLARATION_REASSIGN_ADMIN, assignAdminDto.getDeclarationId(), null,
					additionalDetails, Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		}
		DeclarationCommonDto declarationResponse = DeclarationCommonDto.builder().adminPersonName(currentAdminPersonName)
				.adminPersonId(assignAdminDto.getAdminPersonId())
				.updateTimestamp(updateTimestamp)
				.declarationId(coiDeclaration.getDeclarationId())
				.declarationNumber(coiDeclaration.getDeclarationNumber())
				.adminPersonName(currentAdminPersonName)
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.previousAdminPersonName(previousAdminPersonName)
				.personId(coiDeclaration.getPersonId())
				.adminPersonId(assignAdminDto.getAdminPersonId())
				.build();
		saveAssignAdminActionLog(declarationResponse, assignAdminDto.getActionType());
		return new ResponseEntity<>(getDeclaration(coiDeclaration.getDeclarationId()), HttpStatus.OK);
	}

	private void saveAssignAdminActionLog(DeclarationCommonDto declarationCommonDto, String actionType) {
		if (actionType.equals(ACTION_TYPE_ADMIN_REASSIGN)) {
			actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_ADMIN_REASSIGN, declarationCommonDto);
		} else {
			actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_ADMIN_ASSIGN, declarationCommonDto);
		}
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
				declarationCommonDto.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_SUBMIT);
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE, declarationCommonDto.getDeclarationId().toString(),
				Constants.COI_DECLARATION_INBOX_MSG_TYPE_WAITING_ADMIN_REVIEW);
		StringBuilder actionLogMessage = new StringBuilder("Declaration of ");
		actionLogMessage.append(personDao.getPersonFullNameByPersonId(declarationCommonDto.getPersonId())).append(" Submitted on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		addToInbox(declarationCommonDto.getDeclarationId().toString(), declarationCommonDto.getAdminPersonId(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_WAITING_ADMIN_REVIEW,
				actionLogMessage.toString(), AuthenticatedUser.getLoginUserName(), Constants.COI_SUBMODULE_CODE);
	}

	@Override
	public ResponseEntity<Object> completeDeclarationReview(DeclarationRequestDto declarationRequest) {
		List<String> declarationStatus = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_COMPLETED);
		if(dao.isDeclarationWithStatuses(declarationStatus, declarationRequest.getDeclarationId())) {
			return new ResponseEntity<>("Already approved", HttpStatus.METHOD_NOT_ALLOWED);
		}
		String declarationStatusCode = declarationRequest.getIsApproval()
				? Constants.COI_DECLARATION_APPROVAL_STATUS_APPROVED
				: Constants.COI_DECLARATION_APPROVAL_STATUS_REJECTED;
		Timestamp expirationTimestamp = Constants.COI_DECLARATION_APPROVAL_STATUS_APPROVED.equals(declarationStatusCode)
				? getExpirationTimestamp()
				: null;
        Timestamp updateTimestamp = dao.updateDeclarationStatues(declarationRequest.getDeclarationId(), declarationStatusCode,
                Constants.COI_DECLARATION_REVIEW_STATUS_REVIEW_COMPLETED, Constants.COI_ACTIVE_STATUS, false, expirationTimestamp);
		CoiDeclaration coiDeclaration = dao.findByDeclarationId(declarationRequest.getDeclarationId());
        dao.archivePreviousVersionBasedOnStatus(coiDeclaration.getDeclarationNumber(), coiDeclaration.getVersionNumber(), Constants.COI_ACTIVE_STATUS);
		DeclarationCommonDto declarationCommonDto = DeclarationCommonDto.builder()
				.updateTimestamp(updateTimestamp)
				.declarationId(coiDeclaration.getDeclarationId())
				.declarationNumber(coiDeclaration.getDeclarationNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.comment(declarationRequest.getComment())
				.build();
		actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_ADMIN_REVIEW_COMPLETED, declarationCommonDto);
        inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
                coiDeclaration.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_WAITING_ADMIN_REVIEW);
        inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
                declarationRequest.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_SUBMIT);
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
        additionalDetails.put(StaticPlaceholders.DECLARATION_STATUS, dao.getDeclarationStatusTypeByCode(declarationStatusCode).getDescription());
        additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
                new SimpleDateFormat(CoreConstants.DEFAULT_DATE_FORMAT).format(coiDeclaration.getSubmissionDate()));
		Map<String, String> statusToActionType = Map.of(
				Constants.COI_DECLARATION_APPROVAL_STATUS_APPROVED, ActionTypes.DECLARATION_REVIEW_APPROVED,
				Constants.COI_DECLARATION_APPROVAL_STATUS_REJECTED, ActionTypes.DECLARATION_REVIEW_REJECTED);
		String actionType = statusToActionType.get(coiDeclaration.getDeclarationStatusCode());
        coiService.processCoiMessageToQ(actionType, coiDeclaration.getDeclarationId(), null,
                additionalDetails, Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		return new ResponseEntity<>(getDeclaration(coiDeclaration.getDeclarationId()), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> withdrawDeclaration(DeclarationRequestDto declarationRequest) {
		List<String> opaDisclosureStatus = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_SUBMIT);
		if (!dao.isDeclarationWithStatuses(opaDisclosureStatus, declarationRequest.getDeclarationId())) {
			return new ResponseEntity<>("Already withdrawn", HttpStatus.METHOD_NOT_ALLOWED);
		}
		CoiDeclaration coiDeclaration = dao.findByDeclarationId(declarationRequest.getDeclarationId());
		Timestamp updateTimestamp = dao.returnOrWithdrawDeclaration(Constants.COI_DECLARATION_REVIEW_STATUS_WITHDRAW, declarationRequest.getDeclarationId());
		DeclarationCommonDto declarationCommonDto = DeclarationCommonDto.builder()
				.updateTimestamp(updateTimestamp)
				.declarationId(coiDeclaration.getDeclarationId())
				.declarationNumber(coiDeclaration.getDeclarationNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.comment(declarationRequest.getComment())
				.build();
		actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_WITHDRAWN, declarationCommonDto);
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
				declarationRequest.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_SUBMIT);
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.WITHDRAWAL_REASON, declarationRequest.getComment());
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, new SimpleDateFormat(CoreConstants.DEFAULT_DATE_FORMAT).format(coiDeclaration.getSubmissionDate()));
		coiService.processCoiMessageToQ(ActionTypes.DECLARATION_WITHDRAW, declarationRequest.getDeclarationId(),
				null, additionalDetails, Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		return new ResponseEntity<>(getDeclaration(coiDeclaration.getDeclarationId()), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> returnDeclaration(DeclarationRequestDto declarationRequest) {
		List<String> opaDisclosureStatus = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_RETURN);
		if (dao.isDeclarationWithStatuses(opaDisclosureStatus, declarationRequest.getDeclarationId())) {
			return new ResponseEntity<>("Already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		CoiDeclaration coiDeclaration = dao.findByDeclarationId(declarationRequest.getDeclarationId());
		Timestamp updateTimestamp = dao.returnOrWithdrawDeclaration(Constants.COI_DECLARATION_REVIEW_STATUS_RETURN, declarationRequest.getDeclarationId());
		DeclarationCommonDto declarationCommonDto = DeclarationCommonDto.builder()
				.updateTimestamp(updateTimestamp)
				.declarationId(coiDeclaration.getDeclarationId())
				.declarationNumber(coiDeclaration.getDeclarationNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.comment(declarationRequest.getComment())
				.build();
		actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_RETURN, declarationCommonDto);
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
				declarationRequest.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_SUBMIT);
		inboxDao.markAsReadBasedOnParams(Constants.COI_DECLARATION_MODULE_CODE,
				coiDeclaration.getDeclarationId().toString(), Constants.COI_DECLARATION_INBOX_MSG_TYPE_WAITING_ADMIN_REVIEW);
		insertDeclarationReturnInbox(declarationRequest.getDeclarationId().toString(), coiDeclaration.getPersonId());
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.RETURN_REASON, declarationRequest.getComment());
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
				new SimpleDateFormat(CoreConstants.DEFAULT_DATE_FORMAT).format(coiDeclaration.getSubmissionDate()));
		additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
		coiService.processCoiMessageToQ(ActionTypes.DECLARATION_RETURN, coiDeclaration.getDeclarationId(), null,
				additionalDetails, Constants.COI_DECLARATION_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		return new ResponseEntity<>(getDeclaration(coiDeclaration.getDeclarationId()), HttpStatus.OK);
	}

	private void insertDeclarationReturnInbox(String declarationId, String personId) {
		StringBuilder actionLogMessage = new StringBuilder("Declaration returned by ");
		actionLogMessage.append(AuthenticatedUser.getLoginUserFullName()).append(" on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			addToInbox(declarationId, personId, Constants.COI_DECLARATION_INBOX_MSG_TYPE_RETURNED,
					actionLogMessage.toString(), AuthenticatedUser.getLoginUserName(), Constants.COI_SUBMODULE_CODE);
	}

    @Override
    public boolean existsDeclarationByParams(DeclarationRequestDto request) {
        return dao.existsDeclarationByParams(AuthenticatedUser.getLoginPersonId(), request.getDeclarationTypeCode());
    }

    @Override
    public Boolean canCreateDeclaration(String personId, String declarationTypeCode) {
        return dao.canCreateDeclaration(personId, declarationTypeCode);
    }

    @Override
        public ResponseEntity<?> markDeclarationAsVoid(DeclarationRequestDto declarationRequest) {
        List<String> opaDisclosureStatus = Arrays.asList(Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS);
        if (!dao.isDeclarationWithStatuses(opaDisclosureStatus, declarationRequest.getDeclarationId())) {
            return new ResponseEntity<>("Declaration is not in inprogress status", HttpStatus.METHOD_NOT_ALLOWED);
        }
        List<String> declarationStatusCodes = Arrays.asList(Constants.COI_DECLARATION_APPROVAL_STATUS_VOID);
        if (dao.isDeclarationWithApprovalStatuses(declarationStatusCodes, declarationRequest.getDeclarationId())) {
            return new ResponseEntity<>("Declaration Already marked as void", HttpStatus.METHOD_NOT_ALLOWED);
        }
        Timestamp updateTimestamp = dao.updateDeclarationStatues(declarationRequest.getDeclarationId(), Constants.COI_DECLARATION_APPROVAL_STATUS_VOID,
                Constants.COI_DECLARATION_REVIEW_STATUS_IN_PROGRESS, Constants.COI_ARCHIVE_STATUS, false, null);
        CoiDeclaration coiDeclaration = dao.findByDeclarationId(declarationRequest.getDeclarationId());
        DeclarationCommonDto declarationCommonDto = DeclarationCommonDto.builder()
                .updateTimestamp(updateTimestamp)
                .declarationId(coiDeclaration.getDeclarationId())
                .declarationNumber(coiDeclaration.getDeclarationNumber())
                .updateUserFullName(AuthenticatedUser.getLoginUserFullName())
                .personId(coiDeclaration.getPersonId())
                .build();
        actionLogService.saveCoiDeclarationActionLog(Constants.COI_DECLARATION_ACTION_LOG_TYPE_MARKED_AS_VOID, declarationCommonDto);
        return new ResponseEntity<>(getDeclaration(coiDeclaration.getDeclarationId()), HttpStatus.OK);
    }
}
