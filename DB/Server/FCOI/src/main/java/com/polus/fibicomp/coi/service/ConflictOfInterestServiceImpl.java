
package com.polus.fibicomp.coi.service;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.config.MessageQServiceRouter;
import com.polus.core.messageq.service.RMQMessagingQueueServiceImpl;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.messageq.vo.MessagingQueueProperties;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.UnitAdministrator;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.service.QuestionnaireService;
import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dao.CoiCmpDashboardDao;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;
import com.polus.fibicomp.coi.clients.NotificationServiceClients;
import com.polus.fibicomp.coi.clients.model.EmailNotificationDto;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.CoiDisclEntProjDetailsDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.CoiEntityDto;
import com.polus.fibicomp.coi.dto.CoiSectionTypeDto;
import com.polus.fibicomp.coi.dto.CommonRequestDto;
import com.polus.fibicomp.coi.dto.CompleteReivewRequestDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureDetailDto;
import com.polus.fibicomp.coi.dto.DisclosureHistoryResponse;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.NotesDto;
import com.polus.fibicomp.coi.dto.NotificationBannerDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.dto.WithdrawDisclosureDto;
import com.polus.fibicomp.coi.hierarchy.dto.DisclosureDto;
import com.polus.fibicomp.coi.notification.log.vo.CoiNotificationLogService;
import com.polus.fibicomp.coi.pojo.Attachments;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.coi.pojo.CoiReviewAssigneeHistory;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import com.polus.fibicomp.coi.pojo.DisclAttaType;
import com.polus.fibicomp.coi.pojo.EntityRelationship;
import com.polus.fibicomp.coi.pojo.Notes;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.vo.CoiAdminDashTabCountVO;
import com.polus.fibicomp.coi.vo.CoiDashboardCountVO;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.coi.vo.DashBoardProfile;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationTypeDao;
import com.polus.fibicomp.compliance.declaration.dao.DeclarationDashboardDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardRequest;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.dto.COICommonDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjects;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.globalentity.dao.EntityRiskDAO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;
import com.polus.fibicomp.globalentity.repository.EntityComplianceInfoRepository;
import com.polus.fibicomp.globalentity.service.EntityDetailsService;
import com.polus.fibicomp.inbox.InboxService;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPADashboardResponseDto;
import com.polus.fibicomp.opa.service.OPAService;
import com.polus.fibicomp.reviewcomments.dao.ReviewCommentDao;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import com.polus.fibicomp.reviewcomments.service.ReviewCommentService;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosure;
import com.polus.fibicomp.workflowBusinessRuleExt.service.WorkflowCOIExtService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service(value = "conflictOfInterestService")
@Transactional
public class ConflictOfInterestServiceImpl implements ConflictOfInterestService {

	protected static Logger logger = LogManager.getLogger(ConflictOfInterestServiceImpl.class.getName());

	@Autowired
	@Qualifier(value = "conflictOfInterestDao")
	private ConflictOfInterestDao conflictOfInterestDao;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private QuestionnaireService questionnaireService;

	@Autowired
    private ActionLogService actionLogService;

	@Autowired
    private COIFileAttachmentService coiFileAttachmentService;

	@Autowired
	private OPADao opaDao;

	@Autowired
	private ReviewCommentDao reviewCommentDao;

	@Autowired
	private ReviewCommentService reviewCommentService;

	@Autowired
	private PersonEntityService personEntityService;
	
    @Autowired
    private RMQMessagingQueueServiceImpl rmqMessagingQueueService;

	@Autowired
	private MessageQServiceRouter messageQServiceRouter;

	@Autowired
	private MessagingQueueProperties messagingQueueProperties;

	@Autowired
	private FcoiDisclosureDao fcoiDisclosureDao;

	@Autowired
	private FcoiDisclosureService fcoiDisclosureService;

	@Autowired
	private NotificationServiceClients notificationServiceClients;

	@Autowired
	private CustomExceptionService exceptionService;

	@Autowired
	private InboxService inboxService;

	@Autowired
	private InboxDao inboxDao;
  
	@Autowired
	private PersonRoleRightDao personRoleRightDao;

	@Autowired
	private EntityDetailsService entityDetailsService;

	@Autowired
	private OPAService opaService;

	@Autowired
	private EntityRiskDAO entityRiskDAO;

	@Autowired
	private EntityComplianceInfoRepository complianceInfoRepository;

	@Autowired
	private CoiNotificationLogService coiNotificationLogService;
	
	@Autowired
    private CommonService commonService;

	@Autowired
    private DeclarationDashboardDao declarationDashboardDao;

	@Autowired
    private CoiDeclarationTypeDao coiDeclarationTypeDao;

	@Autowired
	private WorkflowCOIExtService workflowCOIExtService;
	
	@Autowired
	private CoiCmpDashboardDao cmpDashboardDao;

	private static final String DISPOSITION_STATUS_TYPE_CODE = "1";
	private static final String DISPOSITION_STATUS_PENDING = "1";
	private static final String REVIEW_STATUS_TYPE_CODE = "1";
	private static final String REVIEW_STATUS_PENDING = "1";
	private static final String RISK_CATEGORY_LOW = "3";
	private static final String SUBMITTED_FOR_REVIEW = "2";
	private static final String DELETE_MSG = "deleted successfully";
	private static final String COMPLETE_ACTIVIVITY ="4";
	private static final String START_ACTIVIVITY ="3";
	private static final String CREATE_ACTIVIVITY ="2";
	private static final String APPROVED = "3";
	private static final String REVIEW_STATUS_COMPLETE = "4";
	private static final String DISCLOSURE_REVIEW_IN_PROGRESS = "3";
	private static final String DISCLOSURE_REVIEW_COMPLETED = "4";
	private static final String RISK_CAT_CODE_LOW = "3";
	private static final String REVIEW_STATUS_WITHDRAWN = "6";
	private static final String REVIEW_STATUS_RETURNED = "5";
	private static final String ACTION_LOG_SUBMITTED = "2";
	private static final String ACTION_LOG_WITHDRAWN = "3";
	private static final String ACTION_LOG_RETURNED = "6";
	private static final String ACTION_LOG_ADMIN_REVIEW_COMPLETED = "11";
	private static final String ACTION_LOG_ASSIGNED_FOR_REVIEW = "7";
	private static final String ACTION_LOG_ASSIGNED_REVIEW_COMPLETED = "8";
	private static final String ACTION_LOG_APPROVED = "13";
	private static final String TRAVEL_DISCLOSURE_STATUS_NO_CONFLICT = "1";
	private static final String ACTION_LOG_RISK_ADDED = "9";
	private static final String ACTION_LOG_DISCLOSURE_STATUS_CREATED = "14";
	private static final String ACTION_LOG_DISCLOSURE_STATUS_CHANGED = "15";
	private static final String TYPE_DISCLOSURE_DETAIL_COMMENT = "1";
	private static final String RISK_CATEGORY_LOW_DESCRIPTION = "Low";
	private static final String TRAVEL_DISCLOSURE_CONFLICT_COMMENT = "2";
	private static final String FILTER_TYPE_ALL = "ALL";
	private static final String FILTER_TYPE_OPA = "OPA";
	private static final String FILTER_TYPE_DECLARATION = "DECLARATION";
	private static final String FILTER_TYPE_CMP = "CMP";
	private static final String TAB_TYPE_TRAVEL_DISCLOSURES = "TRAVEL_DISCLOSURES";
	private static final String TAB_TYPE_CONSULTING_DISCLOSURES = "CONSULTING_DISCLOSURES";
	private static final String TAB_TYPE_MY_DASHBOARD = "MY_DASHBOARD";
	private static final String TAB_TYPE_IN_PROGRESS_DISCLOSURES = "IN_PROGRESS_DISCLOSURES";
	private static final String TAB_TYPE_APPROVED_DISCLOSURES = "APPROVED_DISCLOSURES";
	private static final String FCOI_DISCLOSURE = "FCOI_DISCLOSURE";
	private static final String PROJECT_DISCLOSURE = "PROJECT_DISCLOSURE";
	private static final String NOTIFICATION_RECIPIENT_OBJECTS = "NOTIFICATION_RECIPIENT_OBJECTS";
	private static final String NOTIFICATION_SUBJECT = "NOTIFICATION_SUBJECT";
	private static final String NOTIFICATION_BODY = "NOTIFICATION_BODY";
	private static final String ACTION_TYPE_RETURN = "RETURN";
	private static final String ACTION_TYPE_WITHDRAW = "WITHDRAW";
	private static final String REVIEW_STATUS_COMPLETED = "Completed";
	private static final String VIEW_DISCLOSURE_NOTES = "VIEW_DISCLOSURE_NOTES";
	private static final String MANAGE_DISCLOSURE_NOTES = "MANAGE_DISCLOSURE_NOTES";
	private static final String COI_PROJECT_TYPE_AWARD = "1";
	private static final String COI_PROJECT_TYPE_PROPOSAL = "3";
	private static final String FCOI_DISCLOSURE_TYPE = "FCOI";
	private static final String PROJECT_DISCLOSURE_TYPE = "PROJECT";
	private static final String OPA_DISCLOSURE_TYPE = "OPA";
	private static final String OVERALL_AWARD_DISCL_STATUS_UPDATE_PROC = "GET_AWD_OVERALL_DISCL_STS";
	private static final String OVERALL_PROPOSAL_DISCL_STATUS_UPDATE_PROC = "GET_PROP_OVERALL_DISCL_STS";
	private static final int THREAD_COUNT = 5; // Number of parallel threads
	private static final String DAYS_LEFT_TO_EXPIRE = "DAYS_LEFT_TO_EXPIRE";
	private static final String OSP_UNIT_ADMIN_TYPE_CODE = "2";
	private static final String APPROVED_DISPOSITION_STATUS = "Approved";
	private static final Integer MODULE_SUB_ITEM_KEY = 0;

	@Override
	public List<Entity> searchEntity(ConflictOfInterestVO vo) {
		return conflictOfInterestDao.searchEntity(vo);
	}

	@Override
	public ResponseEntity<Object> loadAddSFILookups() {
		ConflictOfInterestVO conflictOfInterestVO = new ConflictOfInterestVO();
		conflictOfInterestVO.setEntityStatus(conflictOfInterestDao.fetchEntityStatus());
		conflictOfInterestVO.setEntityType(conflictOfInterestDao.fetchEntityType());
		conflictOfInterestVO.setPersonEntityRelType(conflictOfInterestDao.fetchPersonEntityRelType());
		conflictOfInterestVO.setEntityRiskCategories(conflictOfInterestDao.fetchEntityRiskCategory());
		conflictOfInterestVO.setValidPersonEntityRelTypes(conflictOfInterestDao.fetchAllValidPersonEntityRelTypes());
		conflictOfInterestVO.setCoiDisclosureTypes(conflictOfInterestDao.fetchAllCoiDisclosureTypes());
		return new ResponseEntity<>(conflictOfInterestVO, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getDisclosureDetailsForSFI(Integer coiFinancialEntityId) {
		List<Integer> disclosureIds = conflictOfInterestDao.getDisclosureIdsByCOIFinancialEntityId(coiFinancialEntityId);
		List<CoiDisclosure> disclosures = new ArrayList<>();
		if (disclosureIds != null && !disclosureIds.isEmpty()) {
			List<String> sequenceStatusCodes = new ArrayList<>();
			sequenceStatusCodes.add(Constants.DISCLOSURE_SEQUENCE_STATUS_PENDING);
			sequenceStatusCodes.add(Constants.DISCLOSURE_SEQUENCE_STATUS_ACTIVE);
			disclosures = conflictOfInterestDao.getActiveAndPendingCoiDisclosureDetailsByDisclosureIdsAndSequenceStatus(disclosureIds, sequenceStatusCodes);
			if (disclosures != null && !disclosures.isEmpty()) {
				disclosures.forEach(disclosure -> {
					disclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(disclosure.getUpdatedBy()));
				});
			}
		}
		return new ResponseEntity<>(disclosures, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> saveOrUpdateCoiReview(ConflictOfInterestVO vo){
		fcoiDisclosureService.checkDispositionStatusIsVoid(vo.getCoiReview().getDisclosureId());
		String actionTypeCode = null;
		CoiReview coiReview = vo.getCoiReview();
		CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(coiReview.getDisclosureId());
		if (fcoiDisclosureDao.isDisclRequestedWithdrawal(vo.getDisclosureId())) {
			return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (coiReview.getCoiReviewId() == null && conflictOfInterestDao.isReviewAdded(coiReview)) {
			return new ResponseEntity<>(commonDao.convertObjectToJSON("Review already added"), HttpStatus.INTERNAL_SERVER_ERROR);
		} else if (coiReview.getCoiReviewId() != null) {
			if (conflictOfInterestDao.isReviewStatusChanged(coiReview)) {
				return new ResponseEntity<>(commonDao.convertObjectToJSON("Review status changed"), HttpStatus.METHOD_NOT_ALLOWED);
			}
			if (!coiReview.getReviewStatusTypeCode().equalsIgnoreCase("2") && conflictOfInterestDao.isReviewPresent(coiReview)) {
				return new ResponseEntity<>(commonDao.convertObjectToJSON("Review already added"), HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
		CoiReview currentCoiReviewObj = coiReview.getCoiReviewId() != null ? conflictOfInterestDao.loadCoiReview(coiReview.getCoiReviewId()) : null;
		String currentAssignedPersonName = currentCoiReviewObj != null && currentCoiReviewObj.getAssigneePersonId() != null ?
				personDao.getPersonFullNameByPersonId(currentCoiReviewObj.getAssigneePersonId()) : null;
		String currentAssignedPersonId = currentCoiReviewObj != null && currentCoiReviewObj.getAssigneePersonId() != null ?
				currentCoiReviewObj.getAssigneePersonId() : null;
		CoiReviewAssigneeHistory coiReviewAssigneeHistory = new CoiReviewAssigneeHistory();
		List<Map<String, String>> actionTypesList = new ArrayList<>();
		Map<String, String> additionalDetails = new HashMap<>();
		if (coiReview.getCoiReviewId() == null) {
			// TODO If needed can split the notification now it's commented
			Map<String, String> actionTypes = new HashMap<>();
			if (coiReview.getAssigneePersonId() != null) {
				actionTypeCode = Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER;
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_ASSIGN);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_REVIEWER_ASSIGN);
				actionTypesList.add(actionTypes);
			} else {
				actionTypeCode = Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER;
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER);
				actionTypesList.add(actionTypes);
			}
		}
		else {
			Map<String, String> actionTypes = new HashMap<>();
			if (coiReview.getAssigneePersonId() != null &&
					currentCoiReviewObj.getAssigneePersonId() != null && currentCoiReviewObj.getAssigneePersonId().equals(coiReview.getAssigneePersonId())) {
				actionTypeCode = Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER;
				if (currentCoiReviewObj.getReviewStatusTypeCode().equals(coiReview.getReviewStatusTypeCode())) {
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_LOCATION_UPDATE);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_LOCATION_UPDATE);
					actionTypesList.add(actionTypes);
				}
			} else if (coiReview.getAssigneePersonId() != null && currentCoiReviewObj.getAssigneePersonId() == null) {
				actionTypeCode = Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER;
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_ASSIGN);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_REVIEWER_ASSIGN);
				actionTypesList.add(actionTypes);
			} else {
				actionTypeCode = Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER;
				if (coiReview.getAssigneePersonId() != null && currentCoiReviewObj.getAssigneePersonId() != null) {
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_ASSIGN);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_REVIEWER_ASSIGN);
					actionTypesList.add(actionTypes);
				} else if (coiReview.getAssigneePersonId() == null && currentCoiReviewObj.getAssigneePersonId() != null) {
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER );
					actionTypesList.add(actionTypes);
				}
				if (currentCoiReviewObj.getAssigneePersonId() != null) {
					actionTypes = new HashMap<>();
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REMOVE);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_REVIEWER_REMOVE);
					additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_OLD_LOCATION,
							currentCoiReviewObj.getReviewLocationType().getDescription());
					additionalDetails.put(StaticPlaceholders.OLD_REVIEWER_NAME, currentAssignedPersonName);
					actionTypesList.add(actionTypes);
				}
			}
			if (coiReview.getReviewStatusTypeCode().equals(Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED)) {
				actionTypes = new HashMap<>();
				if (!coiReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
					Map<String, String> reviewerMailDetails = new HashMap<>();
					reviewerMailDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION, coiReview.getReviewLocationType().getDescription());
					reviewerMailDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_LOCATION_REVIEW_COMPLETED_ACK);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_LOCATION_REVIEW_COMPLETED_ACK);
					processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), coiReview.getCoiReviewId(), reviewerMailDetails, null, null);
				}
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
				actionTypesList.add(actionTypes);
			}
		}
		if (currentCoiReviewObj != null) {
			BeanUtils.copyProperties(vo.getCoiReview(), currentCoiReviewObj);
		} else {
			currentCoiReviewObj = new CoiReview();
			BeanUtils.copyProperties(vo.getCoiReview(), currentCoiReviewObj);
		}
		if (coiReview.getCoiReviewId() != null) {
			inboxActions(disclosure, coiReview, Boolean.TRUE);
		}
		coiReview = conflictOfInterestDao.saveOrUpdateCoiReview(currentCoiReviewObj);
		CoiDisclosure coiDisclosure = new CoiDisclosure();
		coiDisclosure.setDispositionStatusCode(DISPOSITION_STATUS_PENDING);
		coiDisclosure.setVersionStatus(Constants.COI_PENDING_STATUS);
		coiDisclosure.setDisclosureId(coiReview.getDisclosureId());
		if (coiReview.getReviewStatusTypeCode() != null &&
				coiReview.getReviewStatusTypeCode().equals(Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED) &&
				conflictOfInterestDao.numberOfReviewNotOfStatus(coiReview.getDisclosureId(), Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED).equals(0)) {
			coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
			disclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
			disclosure.setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED));
		} else {
			coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED);
			disclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED);
			disclosure.setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED));
		}
		conflictOfInterestDao.completeDisclosureReview(coiDisclosure);
		try {
			DisclosureActionLogDto  actionLogDto = DisclosureActionLogDto.builder()
					.actionTypeCode(actionTypeCode).disclosureId(disclosure.getDisclosureId())
					.disclosureNumber(disclosure.getDisclosureNumber()).fcoiTypeCode(disclosure.getFcoiTypeCode())
					.revisionComment(coiReview.getDescription())
					.oldReviewer(currentAssignedPersonName!=null ? currentAssignedPersonName :coiReview.getAssigneePersonName())
					.newReviewer(coiReview.getAssigneePersonName())
					.administratorName(AuthenticatedUser.getLoginUserFullName())
					.reviewerStatusType(coiReview.getReviewerStatusType())
					.reviewLocationType(coiReview.getReviewLocationType())
					.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription())
					.build();
			actionLogService.saveDisclosureActionLog(actionLogDto);
			coiReview.setCoiDisclosure(disclosure);
		} catch (Exception e) {
			logger.error("saveOrUpdateCoiReview : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		fcoiDisclosureDao.updateDisclosureUpdateDetails(coiReview.getDisclosureId());
		/*Need clarification*/
		coiReviewAssigneeHistory.setAdminGroupId(coiReview.getAdminGroupId());
		coiReviewAssigneeHistory.setAssigneePersonId(coiReview.getAssigneePersonId());
		coiReviewAssigneeHistory.setAssigneeType(coiReview.getAdminGroupId() != null ? "G" :"P");
		coiReviewAssigneeHistory.setCoiReviewId(coiReview.getCoiReviewId());
		coiReviewAssigneeHistory.setCoiReviewActivityId(CREATE_ACTIVIVITY);
		conflictOfInterestDao.saveOrUpdateCoiReviewAssigneeHistory(coiReviewAssigneeHistory);
		//Publishing to queue
		additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_STATUS, coiReview.getReviewerStatusType().getDescription());
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION, coiReview.getReviewLocationType().getDescription());
		additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
		additionalDetails.put(StaticPlaceholders.REVIEW_ASSIGNED_DATE, new SimpleDateFormat(Constants.DATE_FORMAT).format(new Date()));
        for (Map<String, String> actionTypes : actionTypesList) {
        	String actionType = getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes);
        	if (actionType.equals(ActionTypes.FCOI_REVIEWER_REMOVE) || actionType.equals(ActionTypes.PROJECT_REVIEWER_REMOVE)) {
        		Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
        		commonService.setNotificationRecipients(currentAssignedPersonId,
				CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
				additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
				commonDao.convertObjectToJSON(dynamicEmailrecipients));
        	}
         processCoiMessageToQ(actionType, disclosure.getDisclosureId(), coiReview.getCoiReviewId(), additionalDetails, null, null);
         additionalDetails.remove(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS);
        }
      	/*Need clarification*/
        inboxActions(disclosure, coiReview, Boolean.FALSE);
		coiReview.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
		coiReview.setUpdateTimestamp(disclosure.getUpdateTimestamp());
		updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosure.getDisclosureId(), disclosure.getFcoiTypeCode());
		return new ResponseEntity<>(coiReview, HttpStatus.OK);
	}

	private void inboxActions(CoiDisclosure disclosure, CoiReview coiReview, Boolean isReviewEdit) {
		if (isReviewEdit) {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), null,
					Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())
							? Constants.INBOX_REVIEW_ASSIGN_PROJECT_DISCLOSURE
							: Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE,
					coiReview.getCoiReviewId().toString(), CoreConstants.SUBMODULE_CODE);
		}
		prepareInboxObject(disclosure, coiReview);
		if (REVIEW_STATUS_COMPLETED.equals(coiReview.getReviewerStatusType().getDescription())) {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), null,
					Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())
							? Constants.INBOX_REVIEW_ASSIGN_PROJECT_DISCLOSURE
							: Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE,
					coiReview.getCoiReviewId().toString(), CoreConstants.SUBMODULE_CODE);
		}
	}

	private void prepareInboxObject(CoiDisclosure disclosure, CoiReview coiReview) {
		StringBuilder userMessage = new StringBuilder();
		if (Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())) {
			List<CoiDisclProjects> coiDisclProject = fcoiDisclosureDao.getCoiDisclProjects(disclosure.getDisclosureId());
			List<DisclosureDetailDto> disclosureDetailDto = conflictOfInterestDao.getProjectsBasedOnParams(
					coiDisclProject.get(0).getModuleCode(), AuthenticatedUser.getLoginPersonId(), null,
					coiDisclProject.get(0).getModuleItemKey());
			userMessage.append("Project disclosure for ").append(disclosure.getCoiProjectType().getDescription()).append(" : ")
					.append(disclosureDetailDto.get(0).getModuleItemKey()).append(" - ")
					.append(disclosureDetailDto.get(0).getTitle()).append(" of ")
					.append(personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId()))
					.append(" submitted on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		} else {
			userMessage.append("COI disclosure of ")
			.append(personDao.getPersonFullNameByPersonId(disclosure.getPersonId())).append(" submitted on ")
			.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		}
		Set<String> personIds = new HashSet<>();
		if (coiReview.getAssigneePersonId() != null) {
			personIds.add(coiReview.getAssigneePersonId());
		} else {
			personIds.addAll(personDao.getAdministratorsByModuleCode(CoreConstants.COI_MODULE_CODE));
		}
		personIds.forEach(personId -> {
			String messageTypeCode = Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())
					? Constants.INBOX_REVIEW_ASSIGN_PROJECT_DISCLOSURE
					: Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE;
			if (!conflictOfInterestDao.isDisclosureActionlistSent(Arrays.asList(messageTypeCode),
					CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), personId)) {
				Inbox inbox = new Inbox();
				inbox.setModuleCode(CoreConstants.COI_MODULE_CODE);
				inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
				inbox.setToPersonId(personId);
				inbox.setModuleItemKey(disclosure.getDisclosureId().toString());
				inbox.setUserMessage(userMessage.toString());
				inbox.setMessageTypeCode(messageTypeCode);
				inbox.setSubModuleItemKey(coiReview.getCoiReviewId().toString());
				inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
				inboxService.addToInbox(inbox);
			}
		});
	}

//	private void prepareInboxObject(Integer coiReviewId, CoiReviewerStatusType reviewerStatusType,
//			String assigneePersonId, String disclosurePersonId, Integer disclosureId) {
//		StringBuilder userMessage = new StringBuilder();
//		userMessage.append("COI Annual disclosure of ")
//				.append(personDao.getPersonFullNameByPersonId(disclosurePersonId)).append(" submitted on ")
//				.append(new SimpleDateFormat("MM/dd/yyyy").format(new Date()));
//		if (coiReviewId != null) {
//			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, disclosureId.toString(), null,
//					Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE, coiReviewId.toString(), CoreConstants.SUBMODULE_CODE);
//		}
//		Set<String> personIds = new HashSet<>();
//		if (assigneePersonId != null) {
//			personIds.add(assigneePersonId);
//		} else {
//			personIds.addAll(personDao.getAdministratorsByModuleCode(CoreConstants.COI_MODULE_CODE));
//		}
//		personIds.forEach(personId -> {
//			Inbox inbox = new Inbox();
//			inbox.setModuleCode(CoreConstants.COI_MODULE_CODE);
//			inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
//			inbox.setToPersonId(personId);
//			inbox.setModuleItemKey(disclosureId.toString());
//			inbox.setUserMessage(userMessage.toString());
//			inbox.setMessageTypeCode(Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE);
//			inbox.setSubModuleItemKey(coiReviewId.toString());
//			inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
//			inboxService.addToInbox(inbox);
//		});
//		if (reviewerStatusType.getDescription().equals("Completed")) {
//			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, disclosureId.toString(), null,
//					Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE, coiReviewId.toString(), 0);
//		}
//	}

	@Override
	public List<CoiReview> getCoiReview(CoiDisclosureDto disclosureDto){
		if (!disclosureDto.getDispositionStatusCode().equals(Constants.COI_DISCL_DISPOSITION_STATUS_VOID) &&
				fcoiDisclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_VOID, disclosureDto.getDisclosureId())) {
			throw new ApplicationException("Disclosure is in void status!",CoreConstants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
		}
		List<CoiReview> coiReviews = conflictOfInterestDao.getCoiReview(disclosureDto.getDisclosureId());
		coiReviews.forEach(coiReview -> {
			coiReview.setAssigneePersonName(personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId()));
		});
		return conflictOfInterestDao.getCoiReview(disclosureDto.getDisclosureId());
	}

	@Override
	public ResponseEntity<Object> startReview(ConflictOfInterestVO vo){
		fcoiDisclosureService.checkDispositionStatusIsVoid(vo.getCoiReview().getDisclosureId());
		CoiReviewAssigneeHistory coiReviewAssigneeHistory = new CoiReviewAssigneeHistory();
		if (conflictOfInterestDao.isReviewStatus(vo.getCoiReview().getCoiReviewId(),
				Arrays.asList(Constants.COI_REVIEWER_REVIEW_STATUS_START, Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED))) {
			return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
		}
		CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(vo.getCoiReview().getDisclosureId());
		if (disclosure.getReviewStatusCode().equalsIgnoreCase(REVIEW_STATUS_RETURNED)) {
			return new ResponseEntity<>("Disclosure already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (fcoiDisclosureDao.isDisclRequestedWithdrawal(vo.getCoiReview().getDisclosureId())) {
			return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
		}
		conflictOfInterestDao.startReview(DISCLOSURE_REVIEW_IN_PROGRESS,vo.getCoiReview().getCoiReviewId(), null);
		CoiReview coiReview = conflictOfInterestDao.loadCoiReview(vo.getCoiReview().getCoiReviewId());
		coiReviewAssigneeHistory.setAdminGroupId(coiReview.getAdminGroupId());
		coiReviewAssigneeHistory.setAssigneePersonId(coiReview.getAssigneePersonId());
		coiReviewAssigneeHistory.setAssigneeType(coiReview.getAdminGroupId() != null ? "G" :"P");
		coiReviewAssigneeHistory.setCoiReviewId(coiReview.getCoiReviewId());
		coiReviewAssigneeHistory.setCoiReviewActivityId(START_ACTIVIVITY);
		conflictOfInterestDao.saveOrUpdateCoiReviewAssigneeHistory(coiReviewAssigneeHistory);
		try {
			String actionTypeCode;
			String reviewerName = "";
			if (coiReview.getAssigneePersonId() != null &&
					coiReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_START_REVIEW;
				reviewerName = personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId());
				coiReview.setAssigneePersonName(reviewerName);
			} else if (coiReview.getAssigneePersonId() != null) {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER;
				reviewerName = personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId());
				coiReview.setAssigneePersonName(reviewerName);
			} else {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER;
			}
			DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
					.actionTypeCode(actionTypeCode)
					.disclosureId(coiReview.getDisclosureId())
					.disclosureNumber(coiReview.getCoiDisclosure().getDisclosureNumber())
					.fcoiTypeCode(coiReview.getCoiDisclosure().getFcoiTypeCode())
					.reviewername(reviewerName)
					.reviewLocationType(coiReview.getReviewLocationType())
					.administratorName(AuthenticatedUser.getLoginUserFullName())
					.fcoiTypeDescription(coiReview.getCoiDisclosure().getCoiDisclosureFcoiType().getDescription())
					.revisionComment(vo.getCoiReview().getDescription())
					.build();
			actionLogService.saveDisclosureActionLog(actionLogDto);
		} catch (Exception e) {
			logger.error("startReview : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		Timestamp updateTimestamp = fcoiDisclosureDao.updateDisclosureUpdateDetails(coiReview.getDisclosureId());
		coiReview.setUpdateTimestamp(updateTimestamp);
		coiReview.setUpdateUser(AuthenticatedUser.getLoginUserName());
		coiReview.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
		return new ResponseEntity<>(coiReview, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> completeReview(ConflictOfInterestVO vo){
		if (conflictOfInterestDao.isReviewStatus(vo.getCoiReview().getCoiReviewId(), Arrays.asList(Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED))) {
			return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
		}
		CoiDisclosure disclObj = fcoiDisclosureDao.loadDisclosure(vo.getCoiReview().getDisclosureId());
		if (disclObj.getReviewStatusCode().equalsIgnoreCase(REVIEW_STATUS_RETURNED)) {
			return new ResponseEntity<>("Disclosure already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (fcoiDisclosureDao.isDisclRequestedWithdrawal(vo.getCoiReview().getDisclosureId())) {
			return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
		}
		fcoiDisclosureService.checkDispositionStatusIsVoid(disclObj.getDispositionStatusCode());
		CoiReviewAssigneeHistory coiReviewAssigneeHistory = new CoiReviewAssigneeHistory();
		conflictOfInterestDao.startReview(Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED,
				vo.getCoiReview().getCoiReviewId(), vo.getCoiReview().getEndDate());
		String personName = vo.getCoiReview().getAssigneePersonName();
		CoiReview coiReview = conflictOfInterestDao.loadCoiReview(vo.getCoiReview().getCoiReviewId());
		coiReview.setAssigneePersonName(personName);
		String completeReviewComment = vo.getCoiReview().getDescription();
		vo.setCoiReview(coiReview);
		coiReviewAssigneeHistory.setAdminGroupId(coiReview.getAdminGroupId());
		coiReviewAssigneeHistory.setAssigneePersonId(coiReview.getAssigneePersonId());
		coiReviewAssigneeHistory.setAssigneeType(coiReview.getAdminGroupId() != null ? "G" :"P");
		coiReviewAssigneeHistory.setCoiReviewId(coiReview.getCoiReviewId());
		coiReviewAssigneeHistory.setCoiReviewActivityId(COMPLETE_ACTIVIVITY);
		conflictOfInterestDao.saveOrUpdateCoiReviewAssigneeHistory(coiReviewAssigneeHistory);
		CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(coiReview.getDisclosureId());
		DisclosureActionLogDto actionLogDto;
		if (conflictOfInterestDao.numberOfReviewNotOfStatus(coiReview.getDisclosureId(), Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED).equals(0)) {
			CoiDisclosure coiDisclosure = new CoiDisclosure();
			coiDisclosure.setDisclosureId(coiReview.getDisclosureId());
			coiDisclosure.setDispositionStatusCode(DISPOSITION_STATUS_PENDING);
			coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
			coiDisclosure.setVersionStatus(Constants.COI_PENDING_STATUS);
			conflictOfInterestDao.completeDisclosureReview(coiDisclosure);
			coiReview.getCoiDisclosure().setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
			coiReview.getCoiDisclosure().setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED));
		}
		Timestamp updateTimestamp = fcoiDisclosureDao.updateDisclosureUpdateDetails(coiReview.getDisclosureId());
		coiReview.setUpdateTimestamp(updateTimestamp);
		coiReview.setUpdateUser(AuthenticatedUser.getLoginUserName());
		coiReview.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
		if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(disclosure.getFcoiTypeCode())
				||Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(disclosure.getFcoiTypeCode())) {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, coiReview.getDisclosureId().toString(), null,
					Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE, coiReview.getCoiReviewId().toString(), CoreConstants.SUBMODULE_CODE);
		} else {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, coiReview.getDisclosureId().toString(), null,
					Constants.INBOX_REVIEW_ASSIGN_PROJECT_DISCLOSURE, coiReview.getCoiReviewId().toString(), CoreConstants.SUBMODULE_CODE);
		}
		try {
			Map<String, String> actionTypes = new HashMap<>();
			String actionTypeCode;
			String reviewerName = "";
			String reviewedAdminName = (coiReview.getAssigneePersonId() == null || !coiReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) 
					? AuthenticatedUser.getLoginUserFullName() : "";
			if (coiReview.getAssigneePersonId() != null && coiReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_COMPLETE_REVIEW;
				reviewerName = personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId());
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REVIEW_COMPLETE);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_REVIEWER_REVIEW_COMPLETE);
			} else if (coiReview.getAssigneePersonId() != null) {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER;
				reviewerName = personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId());
				if (!coiReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
					Map<String, String> reviewerMailDetails = new HashMap<>();
					reviewerMailDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION, coiReview.getReviewLocationType().getDescription());
					reviewerMailDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, reviewedAdminName);
					actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_LOCATION_REVIEW_COMPLETED_ACK);
					actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_LOCATION_REVIEW_COMPLETED_ACK);
					processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), coiReview.getCoiReviewId(), reviewerMailDetails, null, null);
				}
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
			} else {
				actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER;
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJ_REVIEWER_REVIEW_COMPLETE_BY_ADMIN);
			}
			actionLogDto = DisclosureActionLogDto.builder()
					.actionTypeCode(actionTypeCode)
					.disclosureId(disclosure.getDisclosureId())
					.disclosureNumber(disclosure.getDisclosureNumber()).fcoiTypeCode(disclosure.getFcoiTypeCode())
					.reviewername(reviewerName)
					.reviewLocationType(coiReview.getReviewLocationType())
					.administratorName(AuthenticatedUser.getLoginUserFullName())
					.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription())
					.revisionComment(completeReviewComment)
					.build();
			actionLogService.saveDisclosureActionLog(actionLogDto);
			Map<String, String> additionalDetails = new HashMap<>();
			additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_STATUS, coiReview.getReviewerStatusType().getDescription());
			additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION, coiReview.getReviewLocationType().getDescription());
			additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
			if (reviewerName.isEmpty()) {
				reviewerName = AuthenticatedUser.getLoginUserFullName();
			}
			additionalDetails.put(StaticPlaceholders.REVIEWER_NAME, reviewerName);
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, reviewedAdminName);
			if (!actionTypeCode.isEmpty()) {
				processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), coiReview.getCoiReviewId(), additionalDetails, null, null);
			}
		} catch (Exception e) {
			logger.error("completeReview : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		updateOverallDisclosureStatus(disclObj.getCoiProjectTypeCode(), disclObj.getDisclosureId(),
				disclObj.getFcoiTypeCode());
		return new ResponseEntity<>(coiReview, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> deleteReview(Integer coiReviewId){
		try {
			CoiReview coiReview = conflictOfInterestDao.loadCoiReview(coiReviewId);
			if (coiReview == null) {
				return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
			}
			if (fcoiDisclosureDao.isDisclRequestedWithdrawal(coiReview.getDisclosureId())) {
				return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
			}
			fcoiDisclosureService.checkDispositionStatusIsVoid(coiReview.getDisclosureId());
			conflictOfInterestDao.deleteReviewAssigneeHistory(coiReviewId);

			reviewCommentDao.fetchReviewComments(ReviewCommentsDto.builder()
					.componentTypeCode(Constants.COI_DISCL_REVIEW_COMPONENT_TYPE)
					.moduleCode(Constants.COI_MODULE_CODE)
					.subModuleItemKey(String.valueOf(coiReviewId))
					.moduleItemKey(coiReview.getDisclosureId()).build()).forEach(reviewComment -> {
				reviewCommentService.deleteReviewComment(reviewComment.getCommentId(), null);
			});
			conflictOfInterestDao.deleteReview(coiReviewId);
			Timestamp updateTimestamp = fcoiDisclosureDao.updateDisclosureUpdateDetails(coiReview.getDisclosureId());
			CoiDisclosure coiDisclosure = new CoiDisclosure();
			coiDisclosure.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
			coiDisclosure.setUpdateTimestamp(updateTimestamp);
			if (conflictOfInterestDao.numberOfReviewNotOfStatus(coiReview.getDisclosureId(), Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED).equals(0)) {
				Boolean checkIfFinalReviewerIsBeingDeleted = conflictOfInterestDao.checkIfFinalReviewerIsBeingDeleted(coiReview.getDisclosureId());
				if (Boolean.TRUE.equals(checkIfFinalReviewerIsBeingDeleted)) {
					coiDisclosure.setReviewStatusCode(Constants.COI_REVIEWER_REVIEW_STATUS_START);
					coiDisclosure.setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_REVIEWER_REVIEW_STATUS_START));
				} else {
					coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
					coiDisclosure.setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED));
				}
				coiDisclosure.setDisclosureId(coiReview.getDisclosureId());
				coiDisclosure.setDispositionStatusCode(DISPOSITION_STATUS_PENDING);
				coiDisclosure.setVersionStatus(Constants.COI_PENDING_STATUS);
				conflictOfInterestDao.completeDisclosureReview(coiDisclosure);
			} else {
				coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED);
				coiDisclosure.setCoiReviewStatusType(conflictOfInterestDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED));
			}
			inboxActions(coiReview.getCoiDisclosure(), coiReviewId);
			try {
				String actionTypeCode;
				String reviewerName = "";
				String currentAssignedPersonId = (coiReview != null && coiReview.getAssigneePersonId() != null) ? coiReview.getAssigneePersonId() : null;
				if (coiReview.getAssigneePersonId() != null ) {
					actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITH_REVIEWER;
					reviewerName = personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId());
				} else {
					actionTypeCode = Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITHOUT_REVIEWER;
				}
				DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
						.actionTypeCode(actionTypeCode)
						.disclosureId(coiReview.getDisclosureId())
						.disclosureNumber(coiReview.getCoiDisclosure().getDisclosureNumber())
						.fcoiTypeCode(coiReview.getCoiDisclosure().getFcoiTypeCode())
						.reviewername(reviewerName)
						.reviewLocationType(coiReview.getReviewLocationType())
						.administratorName(AuthenticatedUser.getLoginUserFullName())
						.fcoiTypeDescription(coiReview.getCoiDisclosure().getCoiDisclosureFcoiType().getDescription())
						.build();
				actionLogService.saveDisclosureActionLog(actionLogDto);
				Map<String, String> additionalDetails = new HashMap<>();
				Map<String, String> actionTypes = new HashMap<>();
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_REVIEWER_REMOVE);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_REVIEWER_REMOVE);
				additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_OLD_LOCATION, coiReview.getReviewLocationType().getDescription());
				additionalDetails.put(StaticPlaceholders.OLD_REVIEWER_NAME, reviewerName);
				additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
				Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
        		commonService.setNotificationRecipients(currentAssignedPersonId,CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
				additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(dynamicEmailrecipients));
				processCoiMessageToQ(getDisclosureActionType(coiReview.getCoiDisclosure().getFcoiTypeCode(), actionTypes), coiReview.getDisclosureId(),
						coiReview.getCoiReviewId(), additionalDetails, null, null);
			} catch (Exception e) {
				logger.error("saveOrUpdateCoiReview : {}", e.getMessage());
				exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
			}
			updateOverallDisclosureStatus(coiReview.getCoiDisclosure().getCoiProjectTypeCode(),
					coiReview.getCoiDisclosure().getDisclosureId(), coiReview.getCoiDisclosure().getFcoiTypeCode());
			return new ResponseEntity<>(coiDisclosure, HttpStatus.OK);
		} catch(Exception e) {
			throw new ApplicationException("deleteCoiReview",e, Constants.JAVA_ERROR);
		}
	}

	private void inboxActions(CoiDisclosure coiDisclosure, Integer coiReviewId) {
		if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(coiDisclosure.getFcoiTypeCode())
				|| Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(coiDisclosure.getFcoiTypeCode())) {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, coiDisclosure.getDisclosureId().toString(), null,
					Constants.INBOX_REVIEW_ASSIGN_FCOI_DISCLOSURE, coiReviewId.toString(), CoreConstants.SUBMODULE_CODE);
		} else {
			inboxDao.markReadMessage(CoreConstants.COI_MODULE_CODE, coiDisclosure.getDisclosureId().toString(), null,
					Constants.INBOX_REVIEW_ASSIGN_PROJECT_DISCLOSURE, coiReviewId.toString(), CoreConstants.SUBMODULE_CODE);
		}
	}

	@Override
	public ResponseEntity<Object> completeDisclosureReview(Integer disclosureId, Integer disclosureNumber, String description){
		fcoiDisclosureService.checkDispositionStatusIsVoid(disclosureId);
		return completeReview(disclosureId, disclosureNumber, description, false);
	}

	@Override
	public List<CoiConflictHistory> getCoiConflictHistory(Integer disclosureDetailsId){
		List<CoiConflictHistory> coiConflictHistoryList = conflictOfInterestDao.getCoiConflictHistory(disclosureDetailsId);
		coiConflictHistoryList.forEach(conflictHistory -> {
			conflictHistory.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(conflictHistory.getUpdatedBy()));
			conflictHistory.setConflictStatusDescription(conflictOfInterestDao.getCoiConflictStatusByStatusCode(conflictHistory.getConflictStatusCode()));
		});
		return coiConflictHistoryList;
	}

	@Override
	public String loadProposalsForDisclosure(String searchString) {
		List<DisclosureDetailDto> proposalDetails = conflictOfInterestDao.getProjectsBasedOnParams(Constants.DEV_PROPOSAL_MODULE_CODE,
				AuthenticatedUser.getLoginPersonId(), searchString, null);
		return commonDao.convertObjectToJSON(proposalDetails);
	}

	@Override
	public String loadAwardsForDisclosure(String searchString) {
		List<DisclosureDetailDto> awardDetails = conflictOfInterestDao.getProjectsBasedOnParams(Constants.AWARD_MODULE_CODE,
				AuthenticatedUser.getLoginPersonId(), searchString, null);
		return commonDao.convertObjectToJSON(awardDetails);
	}

	@Override
	public String loadDisclosureHistory(ConflictOfInterestVO vo) {
		List<CoiDisclosure> coiDisclosures = conflictOfInterestDao.getCoiDisclosuresByDisclosureNumber(vo.getDisclosureNumber());
		if (coiDisclosures != null && !coiDisclosures.isEmpty()) {
			Set<String> userIds = coiDisclosures.stream().map(CoiDisclosure::getUpdatedBy).collect(Collectors.toSet());
			if (!userIds.isEmpty()) {
				List<Person> personDetails = commonDao.getPersonDetailByPersonId(new ArrayList<>(userIds));
				Map<String, String> collect = personDetails.stream().collect(Collectors.toMap(Person::getPersonId,
						person -> person.getFullName()));
				coiDisclosures.stream().filter(item -> item.getUpdatedBy() != null).filter(item ->
						collect.containsKey(item.getUpdatedBy().toUpperCase())).forEach(item ->
						item.setUpdateUserFullName(collect.get(item.getUpdatedBy().toUpperCase())));
			}
			vo.setPerson(coiDisclosures.get(0).getPersonId() != null ? personDao.getPersonDetailById(coiDisclosures.get(0).getPersonId()) : null);
			vo.setCoiDisclosures(coiDisclosures);
		}
		return commonDao.convertObjectToJSON(vo);
	}

	@Override
	public ResponseEntity<Object> saveOrUpdateEntity(ConflictOfInterestVO vo) {
		Entity coiEntity = vo.getCoiEntity();
//		coiEntity.setUpdateUser(AuthenticatedUser.getLoginUserName());
//		if (coiEntity.getEntityId() == null) { // on creation
//			coiEntity.setCreateUser(AuthenticatedUser.getLoginUserName());
//			coiEntity.setUpdateUser(AuthenticatedUser.getLoginUserName());
//			coiEntity.setIsActive(true); // Y
//			coiEntity.setVersionStatus(Constants.COI_ACTIVE_STATUS);
//			coiEntity.setVersionNumber(Constants.COI_INITIAL_VERSION_NUMBER);
//			coiEntity.setEntityNumber(conflictOfInterestDao.generateMaxEntityNumber());
//			if (coiEntity.getRiskCategoryCode() == null) {
//				coiEntity.setRiskCategoryCode(RISK_CAT_CODE_LOW);
//				coiEntity.setEntityRiskCategory(conflictOfInterestDao.getEntityRiskDetails(RISK_CAT_CODE_LOW));
//			}
//			conflictOfInterestDao.saveOrUpdateEntity(coiEntity);
//			actionLogService.saveEntityActionLog(Constants.COI_ENTITY_CREATE_ACTION_LOG_CODE, coiEntity, null);
//		} else { // on update or patch checks its a major change or not
//			Integer entityId = coiEntity.getEntityId();
//			coiEntity.setUpdateTimestamp(commonDao.getCurrentTimestamp());
//			coiEntity.setUpdateUser(AuthenticatedUser.getLoginUserName());
//			coiEntity.setVersionStatus(Constants.COI_ACTIVE_STATUS);
//			if (coiEntity.isMajorVersion() && conflictOfInterestDao.checkEntityAdded(entityId, null)) { // checks the entity is linked to a SFI or not
//				coiEntity.setIsActive(true); // N
//				conflictOfInterestDao.archiveEntity(entityId);
//				coiEntity.setEntityId(null);
//				coiEntity.setVersionNumber(conflictOfInterestDao.getMaxEntityVersionNumber(coiEntity.getEntityNumber()) + 1);
//				coiEntity.setCreateUser(AuthenticatedUser.getLoginUserName());
//				coiEntity.setCreateTimestamp(commonDao.getCurrentTimestamp());
//				conflictOfInterestDao.saveOrUpdateEntity(coiEntity);
//				conflictOfInterestDao.syncEntityWithPersonEntity(coiEntity.getEntityId(), coiEntity.getEntityNumber(), null);
//			} else {
//				conflictOfInterestDao.saveOrUpdateEntity(coiEntity);
//			}
//			actionLogService.saveEntityActionLog(Constants.COI_ENTITY_MODIFY_ACTION_LOG_CODE, coiEntity, coiEntity.getRevisionReason());
//		}
		return new ResponseEntity<>(coiEntity, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getEntityDetails(Integer coiEntityId) {
		ConflictOfInterestVO vo = new ConflictOfInterestVO();
		vo.setCoiEntity(conflictOfInterestDao.getEntityDetailsById(coiEntityId));
//		vo.getEntity().setUpdatedUserFullName(personDao.getPersonFullNameByPersonId(vo.getEntity().getUpdatedBy()));
//		vo.getEntity().setCreateUserFullName(personDao.getPersonFullNameByPersonId(vo.getEntity().getCreatedBy()));
		return new ResponseEntity<>(vo, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getActiveDisclosure() {
		String personId = AuthenticatedUser.getLoginPersonId();
		ConflictOfInterestVO conflictOfInterestVO = new ConflictOfInterestVO();
		conflictOfInterestVO.setCoiDisclosures(conflictOfInterestDao.getActiveDisclosure(personId));
		conflictOfInterestVO.setOpaDisclosure(opaDao.getActiveAndPendingOpaDisclosure(personId));
		return new ResponseEntity<>(conflictOfInterestVO, HttpStatus.OK);
	}

	@Override
	public String getCOIDashboard(CoiDashboardVO vo) {
		DashBoardProfile dashBoardProfile = new DashBoardProfile();
		if (!vo.getFilterType().equalsIgnoreCase(FILTER_TYPE_OPA)) {
			boolean isFinancialDisclosureActive = conflictOfInterestDao.isDisclosureActive(Constants.DISCLOSURE_TYPE_CODE_FCOI);
			if (Boolean.TRUE.equals(isFinancialDisclosureActive) || (Boolean.FALSE.equals(isFinancialDisclosureActive) && (vo.getTabName().equalsIgnoreCase(TAB_TYPE_TRAVEL_DISCLOSURES)|| vo.getTabName().equalsIgnoreCase(TAB_TYPE_CONSULTING_DISCLOSURES)))) {
				dashBoardProfile = conflictOfInterestDao.getCOIDashboard(vo);
			}
		}
		if ((vo.getFilterType().equalsIgnoreCase(FILTER_TYPE_ALL)|| vo.getFilterType().equalsIgnoreCase(FILTER_TYPE_OPA))
				&& (!(vo.getTabName().equalsIgnoreCase(TAB_TYPE_TRAVEL_DISCLOSURES)|| vo.getTabName().equalsIgnoreCase(TAB_TYPE_CONSULTING_DISCLOSURES)))) {
			boolean isOPADisclosureActive = conflictOfInterestDao.isDisclosureActive(Constants.DISCLOSURE_TYPE_CODE_OPA);
			if (Boolean.TRUE.equals(isOPADisclosureActive)) {
				OPADashboardRequestDto opaDashboardRequestDto = new OPADashboardRequestDto();
				opaDashboardRequestDto.setFetchAllRecords(false);
				opaDashboardRequestDto.setTabType(TAB_TYPE_MY_DASHBOARD);
				if (vo.getTabName().equalsIgnoreCase(TAB_TYPE_IN_PROGRESS_DISCLOSURES)) {
					opaDashboardRequestDto
							.setDispositionStatusCodes(Arrays.asList(Constants.OPA_DISPOSITION_STATUS_PENDING));
				} else if (vo.getTabName().equalsIgnoreCase(TAB_TYPE_APPROVED_DISCLOSURES)) {
					opaDashboardRequestDto
							.setDispositionStatusCodes(Arrays.asList(Constants.OPA_DISPOSITION_STATUS_COMPLETED));
				}
				opaDashboardRequestDto.setCurrentPage(vo.getCurrentPage());
				opaDashboardRequestDto.setPageNumber(vo.getPageNumber());
				OPADashboardResponseDto opaDashboardResponseDto = opaDao.getOPADashboard(opaDashboardRequestDto);
				dashBoardProfile.setOpaDashboardDto(opaDashboardResponseDto.getData());
			}
		}
		return commonDao.convertObjectToJSON(dashBoardProfile);
	}

	@Override
	public String getCOIAdminDashboard(@Valid CoiDashboardVO vo) {
		DashBoardProfile dashBoardProfile = conflictOfInterestDao.getCOIAdminDashboard(vo);
		return commonDao.convertObjectToJSON(dashBoardProfile);
	}
	
	@Override
	public String getCOIAdminDashTabCount(@Valid CoiDashboardVO vo) {
	    ExecutorService executor = Executors.newFixedThreadPool(4);
	    CompletableFuture<Integer> newSubmissionCountFuture = 
	        CompletableFuture.supplyAsync(() -> conflictOfInterestDao.getCOIAdminDashboardCount(vo, "NEW_SUBMISSIONS"), executor);
	    CompletableFuture<Integer> newSubmissionWithoutSfiCountFuture = 
	        CompletableFuture.supplyAsync(() -> conflictOfInterestDao.getCOIAdminDashboardCount(vo, "NEW_SUBMISSIONS_WITHOUT_SFI"), executor);
	    CompletableFuture<Integer> myReviewsCountFuture = 
	        CompletableFuture.supplyAsync(() -> conflictOfInterestDao.getCOIAdminDashboardCount(vo, "MY_REVIEWS"), executor);
	    CompletableFuture<Integer> allReviewsCountFuture = 
	        CompletableFuture.supplyAsync(() -> conflictOfInterestDao.getCOIAdminDashboardCount(vo, "ALL_REVIEWS"), executor);
	    CompletableFuture.allOf(
	        newSubmissionCountFuture,
	        newSubmissionWithoutSfiCountFuture,
	        myReviewsCountFuture,
	        allReviewsCountFuture
	    ).join();
	    CoiAdminDashTabCountVO coiAdminDashTabCountVO = new CoiAdminDashTabCountVO();
	    try {
	        coiAdminDashTabCountVO.setNewSubmissionTabCount(newSubmissionCountFuture.get());
	        coiAdminDashTabCountVO.setNewSubmissionWithoutSfiTabCount(newSubmissionWithoutSfiCountFuture.get());
	        coiAdminDashTabCountVO.setMyReviewsTabCount(myReviewsCountFuture.get());
	        coiAdminDashTabCountVO.setAllReviewsTabCount(allReviewsCountFuture.get());
	    } catch (Exception e) {
	        throw new RuntimeException("Error in fetching admin dashboard tab counts", e);
	    } finally {
	        executor.shutdown();
	    }
	    return commonDao.convertObjectToJSON(coiAdminDashTabCountVO);
	}

	@Override
	public String getCOIDashboardCount(CoiDashboardVO vo) {
		CoiDashboardCountVO coiDashboardCountVO = new CoiDashboardCountVO();
		OPADashboardRequestDto opaDashboardRequestDto = new OPADashboardRequestDto();
		ResultSet rset;
		opaDashboardRequestDto.setTabType(TAB_TYPE_MY_DASHBOARD);
		vo.setTabName("IN_PROGRESS_DISCLOSURES");
		Integer inProgressDisclosureCount = conflictOfInterestDao.getCOIDashboardCount(vo);
		vo.setTabName("APPROVED_DISCLOSURES");
		Integer approvedDisclosureCount = conflictOfInterestDao.getCOIDashboardCount(vo);
		vo.setTabName("TRAVEL_DISCLOSURES");
		coiDashboardCountVO.setTravelDisclosureCount(conflictOfInterestDao.getCOIDashboardCount(vo));
		vo.setTabName("CONSULTING_DISCLOSURES");
		coiDashboardCountVO.setConsultDisclCount(conflictOfInterestDao.getCOIDashboardCount(vo));
		vo.setTabName("DISCLOSURE_HISTORY");
		vo.setFilterType("ALL");
		Integer disclosureHistoryCount = conflictOfInterestDao.getDisclosureHistoryCount(vo);
		coiDashboardCountVO.setDisclosureHistoryCount(disclosureHistoryCount);
		opaDashboardRequestDto.setDispositionStatusCodes(Arrays.asList(Constants.OPA_DISPOSITION_STATUS_PENDING));
		try {
			boolean isOPADisclosureActive = conflictOfInterestDao.isDisclosureActive(Constants.DISCLOSURE_TYPE_CODE_OPA);
			if (Boolean.TRUE.equals(isOPADisclosureActive)) {
				rset = opaDao.getOPADashboardResultSet(opaDashboardRequestDto, true);
				while (rset.next()) {
						inProgressDisclosureCount += rset.getInt(1);
				}
				opaDashboardRequestDto.setDispositionStatusCodes(Arrays.asList(Constants.OPA_DISPOSITION_STATUS_COMPLETED));
				rset = opaDao.getOPADashboardResultSet(opaDashboardRequestDto, true);
				while (rset.next()) {
						approvedDisclosureCount += rset.getInt(1);	
				}	
			}
		} catch (SQLException e) {
			logger.error("Exception on getOPADashboard {}", e.getMessage());
            throw new ApplicationException("Unable to fetch opa dashboard details", e, Constants.DB_PROC_ERROR);
		}
		coiDashboardCountVO.setInProgressDisclosureCount(inProgressDisclosureCount);
		coiDashboardCountVO.setApprovedDisclosureCount(approvedDisclosureCount);
		Integer declarationCount = declarationDashboardDao.fetchDashboardCount(getDeclDashboardRequest()); //Declaration count
		coiDashboardCountVO.setDeclarationCount(declarationCount);
		Integer cmpCount = cmpDashboardDao.fetchCmpReporterDashboardCount(getCmpDashboardRequest()); //CMP count
		coiDashboardCountVO.setCmpCount(cmpCount);
		return commonDao.convertObjectToJSON(coiDashboardCountVO);
	}

	@Override
	public ResponseEntity<Object> getAllEntityList(ConflictOfInterestVO vo) {
		String personId = AuthenticatedUser.getLoginPersonId();
		vo.setPersonId(personId);
		vo.setEntityList(conflictOfInterestDao.getAllEntityList(vo));
		return new ResponseEntity<>(vo, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> setEntityStatus(ConflictOfInterestVO vo) {
		conflictOfInterestDao.setEntityStatus(vo);
		return new ResponseEntity<>(vo, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getAllCoiTravelDisclosureList() {
		ConflictOfInterestVO vo = new ConflictOfInterestVO();
		vo.setCoiTravelDisclosureList(conflictOfInterestDao.getAllCoiTravelDisclosureList(vo));
		return new ResponseEntity<>(vo, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getCoiProjectTypes() {
		ConflictOfInterestVO vo = new ConflictOfInterestVO();
		List<CoiProjectType> coiProjectTypes = conflictOfInterestDao.getCoiProjectTypes();
		List<CoiProjectType> filteredProjectTypes = coiProjectTypes.stream()
		        .filter(projectType -> !projectType.getDescription().contains("Ad-hoc"))
		        .collect(Collectors.toList());
		vo.setCoiProjectTypes(filteredProjectTypes);
		return new ResponseEntity<>(vo, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getCOIReviewerDashboard(CoiDashboardVO vo) {
		DashBoardProfile dashBoardProfile = new DashBoardProfile();
		try {
			dashBoardProfile = conflictOfInterestDao.getCOIReviewerDashboard(vo);
			return new ResponseEntity<>(dashBoardProfile, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in method getCOIReviewerDashboard", e);
			return new ResponseEntity<>(dashBoardProfile, HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@Override
	public ConflictOfInterestVO getCoiEntityDetails(Integer personEntityId) {
		ConflictOfInterestVO vo = new ConflictOfInterestVO();
		Entity entity = conflictOfInterestDao.getEntityByPersonEntityId(personEntityId);
		List<EntityRisk> entityRisks = entityRiskDAO.findComplianceRiskByEntityId(entity.getEntityId());
		if (entityRisks != null && !entityRisks.isEmpty()) {
			EntityRisk entityRisk = entityRisks.get(0);
			entity.setEntityRiskId(entityRisk.getEntityRiskId());
			entity.setEntityRiskLevelCode(entityRisk.getRiskLevelCode());
			entity.setEntityRiskLevel(entityRisk.getRiskLevel().getDescription());
			entity.setEntityRiskCategory(entityRisk.getRiskType().getRiskCategoryCode());
			entity.setEntityRiskCategoryCode(entityRisk.getRiskType().getDescription());
		}
		vo.setCoiEntity(entity);
		vo.setEntityFamilyTreeRoles(entityDetailsService.getFamilyTreeRoles(vo.getCoiEntity().getEntityNumber()));
		Optional<EntityComplianceInfo> complianceInfoOpt = complianceInfoRepository.findByEntityId(vo.getCoiEntity().getEntityId());
		vo.setComplianceInfo(complianceInfoOpt.orElse(null));
		return vo;
	}

	@Override
	public ResponseEntity<Object> getValidPersonRelationshipLookUp() {
		return new ResponseEntity<>(conflictOfInterestDao.fetchAllValidPersonEntityRelTypes(), HttpStatus.OK);
	}

	private void addEntryToPersonEntity(CoiTravelDisclosure coiTravelDisclosure, ConflictOfInterestVO vo) {
			Integer personEntityId;
			personEntityId = conflictOfInterestDao.fetchMaxPersonEntityId(vo.getPersonId(), vo.getEntityId());
			if (personEntityId != null) {
				coiTravelDisclosure.setPersonEntityId(personEntityId);
				try {
					PersonEntityRelationship personEntityRelationship = new PersonEntityRelationship();
					personEntityRelationship.setPersonEntityId(personEntityId);
					personEntityRelationship.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP));
					personEntityService.saveOrUpdatePersonEntityRelationship(personEntityRelationship);
				} catch (Exception e) {
					logger.error("Exception on saveOrUpdatePersonEntityRelationship from create travel", e.getMessage());
					exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
				}
			} else {
				PersonEntity personEntity = new PersonEntity();
				personEntity.setEntityId(vo.getEntityId());
				personEntity.setEntityNumber(vo.getEntityNumber());
				personEntity.setInvolvementStartDate(coiTravelDisclosure.getTravelStartDate());
				personEntity.setInstituteResourceInvolvement("Relationship with Entity");
				personEntity.setStudentInvolvement("Relationship with Entity");
				personEntity.setStaffInvolvement("Relationship with Entity");
				personEntity.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP));
				ResponseEntity<Object> response = personEntityService.createPersonEntity(personEntity);
				personEntity = (PersonEntity)response.getBody();
				coiTravelDisclosure.setPersonEntityId(personEntity.getPersonEntityId());
			}
	}

	@Override
	public ResponseEntity<Object> loadTravelStatusTypesLookup() {
		return new ResponseEntity<>(conflictOfInterestDao.loadTravelStatusTypesLookup(),  HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> checkEntityAdded(Integer entityNumber) {
		List<PersonEntity> personEntities = conflictOfInterestDao.fetchPersonEntityByEntityNum(entityNumber, AuthenticatedUser.getLoginPersonId());
		if (personEntities != null && !personEntities.isEmpty()) {
			PersonEntity personEntity = personEntities.get(0);
			PersonEntityDto personEntityDto = new PersonEntityDto();
			BeanUtils.copyProperties(personEntity, personEntityDto);
			Entity coiEntityObj = conflictOfInterestDao.getEntityDetails(personEntity.getEntityId());
			personEntityDto.setEntityOwnershipType(coiEntityObj.getEntityOwnershipType());
			personEntityDto.setCountry(coiEntityObj.getCountry());
			personEntityDto.setPersonFullName(personDao.getPersonFullNameByPersonId(personEntity.getPersonId()));
			personEntityDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(personEntity.getUpdatedBy()));
			List<PersonEntityRelationship> PersonEntityRelationships = conflictOfInterestDao.getPersonEntityRelationshipByPersonEntityId(personEntity.getPersonEntityId());
			PersonEntityRelationships.forEach(PersonEntityRelationship -> {
				conflictOfInterestDao.getValidPersonEntityRelTypeByTypeCode(PersonEntityRelationship.getValidPersonEntityRelTypeCode());
			});
			personEntityDto.setPersonEntityRelationships(PersonEntityRelationships);
			return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
		}
		return new ResponseEntity<>("Person Entity not found", HttpStatus.NO_CONTENT);
	}

	@Override
	public ResponseEntity<Object> activateOrInactivateEntity(CoiEntityDto coiCoiEntityDto) {
//		if (conflictOfInterestDao.isEntityActiveOrNot(null, coiCoiEntityDto.getEntityNumber(), coiCoiEntityDto.getIsActive(), Constants.COI_ACTIVE_STATUS)) {
//			if (coiCoiEntityDto.getIsActive()) {
//				return new ResponseEntity<>(" Entity already activated", HttpStatus.METHOD_NOT_ALLOWED);
//			} else {
//				return new ResponseEntity<>(" Entity already inactivated", HttpStatus.METHOD_NOT_ALLOWED);
//			}
//		}
//		Entity coiEntityObj = conflictOfInterestDao.getEntityDetails(coiCoiEntityDto.getEntityId());
//		if (conflictOfInterestDao.checkEntityAdded(coiCoiEntityDto.getEntityId(), null)) { // checks the entity is linked to a SFI or not
//			Entity coiEntity = new Entity();
//			BeanUtils.copyProperties(coiEntityObj, coiEntity);
//			coiEntity.setIsActive(coiCoiEntityDto.getIsActive());
//			conflictOfInterestDao.archiveEntity(coiCoiEntityDto.getEntityId());
//			coiEntity.setEntityId(null);
//			coiEntity.setVersionNumber(conflictOfInterestDao.getMaxEntityVersionNumber(coiEntity.getEntityNumber()) + 1);
//			coiEntity.setVersionStatus(Constants.COI_ACTIVE_STATUS);
//			coiEntity.setUpdateUser(AuthenticatedUser.getLoginUserName());
//			coiEntity.setCreateUser(AuthenticatedUser.getLoginUserName());
//			coiEntity.setRevisionReason(coiCoiEntityDto.getRevisionReason());
//			conflictOfInterestDao.saveOrUpdateEntity(coiEntity);
//			coiCoiEntityDto.setEntityId(coiEntity.getEntityId());
//		} else {
//			conflictOfInterestDao.activateOrInactivateEntity(coiCoiEntityDto);
//		}
//		if (Boolean.TRUE.equals(coiCoiEntityDto.getIsActive())) {
//			actionLogService.saveEntityActionLog(Constants.COI_ENTITY_ACTIVATE_ACTION_LOG_CODE, coiEntityObj, coiCoiEntityDto.getRevisionReason());
//		} else {
//			actionLogService.saveEntityActionLog(Constants.COI_ENTITY_INACTIVATE_ACTION_LOG_CODE, coiEntityObj, coiCoiEntityDto.getRevisionReason());
//		}
//		return new ResponseEntity<>(coiCoiEntityDto, HttpStatus.OK);
		return null;
	}

	@Override
	public ResponseEntity<Object> fetchAllRelationshipTypes() {
		return new ResponseEntity<>(conflictOfInterestDao.fetchAllRelationshipTypes(), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> approveEntity(EntityRelationship entityRelationship) {
//		if(conflictOfInterestDao.isEntityApproved(entityRelationship.getEntityId())) {
//			return new ResponseEntity<>("Entity already approved", HttpStatus.METHOD_NOT_ALLOWED);
//		}
//		CoiEntityDto coiCoiEntityDto = new CoiEntityDto();
//		coiCoiEntityDto.setEntityId(entityRelationship.getEntityId());
//		coiCoiEntityDto.setUpdateTimestamp(conflictOfInterestDao.approveEntity(entityRelationship.getEntityId()));
//		if (entityRelationship.getEntityRelTypeCode() != 1) { //  entityRelTypeCode = 1 (new)
//			entityRelationship.setUpdateUser(AuthenticatedUser.getLoginUserName());
//			entityRelationship.setUpdateTimestamp(commonDao.getCurrentTimestamp());
//			conflictOfInterestDao.saveOrUpdateEntityRelationship(entityRelationship);
//		}
//		coiCoiEntityDto.setEntityStatusCode(Constants.COI_ENTITY_STATUS_VERIFIED);
//		coiCoiEntityDto.setUpdatedUserFullName(personDao.getUserFullNameByUserName(AuthenticatedUser.getLoginUserFullName()));
//		Entity coiEntity = conflictOfInterestDao.getEntityDetailsById(coiCoiEntityDto.getEntityId());
//		Entity coiEntityCopy = new Entity();
//		BeanUtils.copyProperties(coiEntity, coiEntityCopy);
//		coiEntityCopy.setUpdatedUserFullName(personDao.getUserFullNameByUserName(coiEntity.getUpdateUser()));
//		actionLogService.saveEntityActionLog(Constants.COI_ENTITY_VERIFY_ACTION_LOG_CODE, coiEntityCopy, null);
//		return new ResponseEntity<>(coiCoiEntityDto, HttpStatus.OK);
		return null;
	}

	@Override
	public ResponseEntity<Object> getDisclosureHistory(CoiDashboardVO dashboardVO) {
		DisclosureHistoryResponse disclosureHistoryResponse = new DisclosureHistoryResponse();
		if ((dashboardVO.getFilterType().equalsIgnoreCase(FILTER_TYPE_ALL) || dashboardVO.getFilterType().equalsIgnoreCase(FILTER_TYPE_OPA))) {
			boolean isOPADisclosureActive = conflictOfInterestDao.isDisclosureActive(Constants.DISCLOSURE_TYPE_CODE_OPA);
			if (Boolean.TRUE.equals(isOPADisclosureActive)) {
				OPADashboardRequestDto opaDashboardRequestDto = new OPADashboardRequestDto();
				opaDashboardRequestDto.setTabType(TAB_TYPE_MY_DASHBOARD);
				opaDashboardRequestDto.setFetchAllRecords(true);
				opaDashboardRequestDto.setDocumentOwner(dashboardVO.getDocumentOwner());
				OPADashboardResponseDto opaDashboardResponseDto = opaDao.getOPADashboard(opaDashboardRequestDto);
				disclosureHistoryResponse.setOpaDashboardDtos(opaDashboardResponseDto.getData());
			}
		}

		if (FILTER_TYPE_ALL.equalsIgnoreCase(dashboardVO.getFilterType()) || FILTER_TYPE_DECLARATION.equalsIgnoreCase(dashboardVO.getFilterType())) {
			List<CoiDeclarationType> coiDeclarationTypes = coiDeclarationTypeDao.findActiveTypes();
			if (!CollectionUtils.isEmpty(coiDeclarationTypes)) {
				List<String> declarationTypeCodes = coiDeclarationTypes.stream().map(CoiDeclarationType::getDeclarationTypeCode).collect(Collectors.toList());

				DeclDashboardRequest dashboardRequest = new DeclDashboardRequest();
				Map<String, Object> requestParams = new HashMap<>();
				requestParams.put("SORT_TYPE", "UPDATE_TIMESTAMP DESC");
				requestParams.put("UNLIMITED", true);
				requestParams.put("VERSION_STATUS", "ALL");
				requestParams.put("DECLARATION_TYPE", String.join(",", declarationTypeCodes));
				requestParams.put("TYPE", "A");
				if (dashboardVO.getDocumentOwner() != null && !dashboardVO.getDocumentOwner().isEmpty()) {
					requestParams.put("PERSON", dashboardVO.getDocumentOwner());
				} else {
					requestParams.put("PERSON", AuthenticatedUser.getLoginPersonId());
				}
				requestParams.put("LOGIN_PERSON_ID", AuthenticatedUser.getLoginPersonId());
				requestParams.put("DASHBOARD_TYPE", "H");

				dashboardRequest.setDeclarationDashboardData(requestParams);

				disclosureHistoryResponse.setDeclDashboardResponses(declarationDashboardDao.fetchDashboardList(dashboardRequest));
			}
		}

		if (!dashboardVO.getFilterType().equalsIgnoreCase(FILTER_TYPE_OPA)
				&& !dashboardVO.getFilterType().equalsIgnoreCase(FILTER_TYPE_DECLARATION)
				&& !FILTER_TYPE_CMP.equalsIgnoreCase(dashboardVO.getFilterType())) {
			List<CoiDisclosureType> activeDisclosureTypes = conflictOfInterestDao.getCoiDisclosureTypes();
			boolean isFinancialDisclosureActive = false;
			boolean isTravelDisclosureActive = false;
			boolean isConsultingDisclosureActive = false;
			for (CoiDisclosureType type : activeDisclosureTypes) {
			    if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(type.getDisclosureTypeCode())) {
			        isFinancialDisclosureActive = true;
			    } else if (Constants.TRAVEL_DISCLOSURE_TYPE_CODE.equals(type.getDisclosureTypeCode())) {
			        isTravelDisclosureActive = true;
			    } else if (Constants.CONSULTING_DISCLOSURE_TYPE_CODE.equals(type.getDisclosureTypeCode())) {
			        isConsultingDisclosureActive = true;
			    }
			}
			if (Boolean.TRUE.equals(isFinancialDisclosureActive) || (Boolean.FALSE.equals(isFinancialDisclosureActive) && (Boolean.TRUE.equals(isTravelDisclosureActive) || Boolean.TRUE.equals(isConsultingDisclosureActive)))) {
				disclosureHistoryResponse.setDisclosureHistoryDtos(conflictOfInterestDao.getDisclosureHistory(dashboardVO));
			}
		}
		
		if (FILTER_TYPE_ALL.equalsIgnoreCase(dashboardVO.getFilterType()) || FILTER_TYPE_CMP.equalsIgnoreCase(dashboardVO.getFilterType())) {
			CoiCmpRepDashboardDto request = new CoiCmpRepDashboardDto();
			request.setCmpPersonId(dashboardVO.getDocumentOwner());
			request.setIsDownload(true);
			disclosureHistoryResponse.setCmpHistoryDashboardResponse(cmpDashboardDao.getCmpHistoryDashboard(request));
		}
		return new ResponseEntity<>(disclosureHistoryResponse, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> modifyRisk(CoiEntityDto entityDto) {
//		if (conflictOfInterestDao.isEntityRiskAdded(entityDto)) {
//			return  new ResponseEntity<>("Risk already added", HttpStatus.METHOD_NOT_ALLOWED);
//		}
//		Entity entity = conflictOfInterestDao.getEntityDetails(entityDto.getEntityId());
//		EntityRiskCategory riskCategory = conflictOfInterestDao.getEntityRiskDetails(entityDto.getRiskCategoryCode());
//		Entity entityCopy = new Entity();
//		BeanUtils.copyProperties(entity, entityCopy);
//		entityCopy.setNewRiskCategory(riskCategory);
//		entityDto.setUpdateTimestamp(conflictOfInterestDao.updateEntityRiskCategory(entityDto));
//		entityCopy.setUpdatedUserFullName(personDao.getUserFullNameByUserName(AuthenticatedUser.getLoginUserName()));
//		actionLogService.saveEntityActionLog(Constants.COI_ENTITY_MODIFY_RISK_ACTION_LOG_CODE, entityCopy, entityDto.getRevisionReason());
//		return new ResponseEntity<>(entityDto, HttpStatus.OK);
		return null;
	}

//	@Override
//	public List<CoiTravelHistoryDto> loadTravelDisclosureHistory(String personId, Integer entityNumber) {
//		List<CoiTravelHistoryDto> travelHistories = new ArrayList<>();
//		List<CoiTravelDisclosure> historyList = conflictOfInterestDao.loadTravelDisclosureHistory(personId, entityNumber);
//		historyList.forEach(history -> {
//			CoiTravelHistoryDto travelHistoryDto = new CoiTravelHistoryDto();
//			travelHistoryDto.setTravelDisclosureId(history.getTravelDisclosureId());
//			List<CoiTravelDisclosureTraveler> entries = conflictOfInterestDao.getEntriesFromTravellerTable(history.getTravelDisclosureId());
//			Map<String, String> travellerTypeCodeList = getTravellerTypeWithDescription(entries);
//			travelHistoryDto.setTravelEntityName(history.getEntity().getEntityName());
//			travelHistoryDto.setTravellerTypeCodeList(travellerTypeCodeList);
//			travelHistoryDto.setEntityType(history.getEntity().getEntityStatusType().getDescription());
//			travelHistoryDto.setDestinationCountry(history.getDestinationCountry());
//			travelHistoryDto.setTravelTitle(history.getTravelTitle());
//			travelHistoryDto.setPurposeOfTheTrip(history.getPurposeOfTheTrip());
//			travelHistoryDto.setDestinationCity(history.getDestinationCity());
//			travelHistoryDto.setDestinationState(history.getTravelstate());
//			travelHistoryDto.setTravelAmount(history.getTravelAmount());
//			travelHistoryDto.setTravelStartDate(history.getTravelStartDate());
//			travelHistoryDto.setTravelEndDate(history.getTravelEndDate());
//			travelHistories.add(travelHistoryDto);
//		});
//		return travelHistories;
//	}

	@Override
    public ResponseEntity<Object> withdrawDisclosure(Integer disclosureId, String description) {
        CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(disclosureId);
		fcoiDisclosureService.checkDispositionStatusIsVoid(disclosure.getDispositionStatusCode());
		if (!SUBMITTED_FOR_REVIEW.equalsIgnoreCase(disclosure.getReviewStatusCode())
				&& !Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS.equalsIgnoreCase(disclosure.getReviewStatusCode())) {
            return new ResponseEntity<>("Disclosure already withdrawn", HttpStatus.METHOD_NOT_ALLOWED);
        }
		COICommonDto dto = COICommonDto.builder()
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.approveComment(description)
				.coiDisclosureId(disclosureId)
				.coiDisclosureNumber(disclosure.getDisclosureNumber().toString())
				.actionType("C")
				.build();
		workflowCOIExtService.coiWorkflowApproval(null, dto, Constants.COI_MODULE_CODE.toString());
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, disclosure.getCertifiedAt().toString());
		additionalDetails.put(StaticPlaceholders.WITHDRAWAL_REASON, description);
        disclosure.setCertificationText(null);
        disclosure.setCertifiedAt(null);
        disclosure.setCertifiedBy(null);
        disclosure.setExpirationDate(null);
        disclosure.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        disclosure.setReviewStatusCode(REVIEW_STATUS_WITHDRAWN);
		disclosure.setSyncNeeded(true);
        disclosure = fcoiDisclosureDao.saveOrUpdateCoiDisclosure(disclosure);
        WithdrawDisclosureDto withdrawDisclosureDto = WithdrawDisclosureDto.builder()
                .certifiedAt(null)
                .expirationDate(null)
                .updateTimestamp(commonDao.getCurrentTimestamp())
                .reviewStatusCode(disclosure.getReviewStatusCode())
                .reviewStatusDescription(conflictOfInterestDao.getReviewStatusByCode(REVIEW_STATUS_WITHDRAWN).getDescription())
                .build();
		try {
			DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_WITHDRAWN)
					.disclosureId(disclosure.getDisclosureId()).disclosureNumber(disclosure.getDisclosureNumber())
					.fcoiTypeCode(disclosure.getFcoiTypeCode()).revisionComment(description)
	                .reporter(AuthenticatedUser.getLoginUserFullName())
	                .fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription())
					.build();
			actionLogService.saveDisclosureActionLog(actionLogDto);
			Map<String, String> actionTypes = new HashMap<>();
			actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_WITHDRAW);
			actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_WITHDRAW);
			additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
			processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), MODULE_SUB_ITEM_KEY, additionalDetails, null, null);
			inboxActions(disclosure, ACTION_TYPE_WITHDRAW);
		} catch (Exception e) {
			logger.error("Exception on withdrawDisclosure : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosureId, disclosure.getFcoiTypeCode());
        return new ResponseEntity<>(withdrawDisclosureDto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> returnDisclosure(Integer disclosureId, String description) {
        CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(disclosureId);
		if (disclosure.getReviewStatusCode().equalsIgnoreCase(REVIEW_STATUS_RETURNED)) {
			return new ResponseEntity<>("Disclosure already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, disclosure.getCertifiedAt().toString());
        disclosure.setCertificationText(null);
        disclosure.setCertifiedAt(null);
        disclosure.setCertifiedBy(null);
        disclosure.setExpirationDate(null);
        disclosure.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        disclosure.setReviewStatusCode(REVIEW_STATUS_RETURNED);
		disclosure.setSyncNeeded(true);
		fcoiDisclosureDao.updateRequestForWithdrawal(disclosureId, false, null);
        disclosure = fcoiDisclosureDao.saveOrUpdateCoiDisclosure(disclosure);
		try {
			DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_RETURNED)
					.disclosureId(disclosure.getDisclosureId()).disclosureNumber(disclosure.getDisclosureNumber())
					.fcoiTypeCode(disclosure.getFcoiTypeCode()).revisionComment(description)
					.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription())
					.administratorName(AuthenticatedUser.getLoginUserFullName())
					.build();
			actionLogService.saveDisclosureActionLog(actionLogDto);
			Map<String, String> actionTypes = new HashMap<>();
			actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_RETURN);
			actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_RETURN);
			Person adminDetails = personDao.getPersonDetailById(AuthenticatedUser.getLoginPersonId());
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, adminDetails.getFirstName());
			additionalDetails.put(StaticPlaceholders.RETURN_REASON, description);
			additionalDetails.put(StaticPlaceholders.DISCLOSURE_STATUS,disclosure.getConflictStatusCode() != null? disclosure.getCoiConflictStatusType().getDescription() : null);
			additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
			inboxActions(disclosure, ACTION_TYPE_RETURN);
			processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), null, additionalDetails, null, null);
			inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
					disclosureId.toString(), Constants.INBOX_FCOI_DISCLOSURE_REQUEST_WITHDRAWAL);
		} catch (Exception e) {
			logger.error("returnDisclosure : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosureId, disclosure.getFcoiTypeCode());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private void inboxActions(CoiDisclosure disclosure, String actionType) {
    	inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
				Constants.INBOX_FCOI_DISCLOSURE_WITHDRAWAL);
		if (ACTION_TYPE_RETURN.equals(actionType)) {
			prepareInboxObject(disclosure.getDisclosureId(), disclosure.getPersonId(), disclosure.getFcoiTypeCode(),
					disclosure.getCoiProjectType());
			if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(disclosure.getFcoiTypeCode())
					|| Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(disclosure.getFcoiTypeCode())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_ADMIN_ASSIGN_FCOI_DISCLOSURE);
				inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, disclosure.getDisclosureId().toString(), AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_REVISION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
			} else {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_ADMIN_ASSIGN_PROJECT_DISCLOSURE);
			}
		} else {
			if (Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_SUBMIT_PROJECT_DISCLOSURE);
			} else {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_SUBMIT_FCOI_DISCLOSURE);
			}
		}
		inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
				Constants.INBOX_CREATE_DISCLOSURE);
	}

	private void prepareInboxObject(Integer disclosureId, String personId, String fcoiTypeCode,
			CoiProjectType coiProjectType) {
		StringBuilder userMessage = new StringBuilder();
		if (Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
			List<CoiDisclProjects> coiDisclProject = fcoiDisclosureDao.getCoiDisclProjects(disclosureId);
			List<DisclosureDetailDto> disclosureDetailDto = conflictOfInterestDao.getProjectsBasedOnParams(
					coiDisclProject.get(0).getModuleCode(), AuthenticatedUser.getLoginPersonId(), null,
					coiDisclProject.get(0).getModuleItemKey());
			userMessage.append("Project disclosure for ").append(coiProjectType.getDescription()).append(" : ")
					.append(disclosureDetailDto.get(0).getModuleItemKey()).append(" - ")
					.append(disclosureDetailDto.get(0).getTitle()).append(" returned by ")
					.append(personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId())).append(" on ")
					.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		} else {
			userMessage.append("COI disclosure returned by ")
					.append(personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId())).append(" on ")
					.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		}
		Inbox inbox = new Inbox();
		inbox.setModuleCode(CoreConstants.COI_MODULE_CODE);
		inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
		inbox.setToPersonId(personId);
		inbox.setModuleItemKey(disclosureId.toString());
		inbox.setUserMessage(userMessage.toString());
		inbox.setMessageTypeCode(Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)
				? Constants.INBOX_RETURN_PROJECT_DISCLOSURE
				: Constants.INBOX_RETURN_FCOI_DISCLOSURE);
		inbox.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY);
		inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
		inboxService.addToInbox(inbox);
	}

	private DisclComment getTravelConflictComment(Integer travelDisclosureId) {
		List<DisclComment> resultData = reviewCommentDao.fetchReviewComments(ReviewCommentsDto.builder()
				.componentTypeCode(Constants.COI_TRAVEL_DISCL_CONFLICT_RELATION_COMPONENT_TYPE)
				.moduleCode(Constants.TRAVEL_MODULE_CODE)
				.moduleItemKey(travelDisclosureId).build());
		return resultData != null && !resultData.isEmpty() ? resultData.get(0) : null;
	}

	@Override
	public ResponseEntity<Object> getCoiSectionsTypeCode(ConflictOfInterestVO vo) {
		CoiSectionTypeDto coiSectionTypeDto = CoiSectionTypeDto.builder()
				.coiSectionsTypeList(getSectionTypeList())
				.personEntities(getPersonEntityList(vo))
				.projectList(getProjectDetailList(vo.getPersonId(), vo.getDisclosureId()))
				.questionnaireDataBus(getQuestionnaireList(vo.getDisclosureId()))
				.build();
		return new ResponseEntity<>(coiSectionTypeDto,HttpStatus.OK);
	}

	private QuestionnaireDataBus getQuestionnaireList(Integer disclosureId) {
		QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
		questionnaireDataBus.setModuleItemCode(Integer.parseInt("8"));
		questionnaireDataBus.setModuleItemKey(disclosureId.toString());
		questionnaireDataBus.setModuleSubItemKey("0");
		questionnaireDataBus.setModuleSubItemCode(0);
		questionnaireDataBus.setActionPersonId(AuthenticatedUser.getLoginPersonId());
		questionnaireDataBus.setQuestionnaireMode("ANSWERED");
		questionnaireDataBus = questionnaireService.getApplicableQuestionnaire(questionnaireDataBus);
		return questionnaireDataBus;
	}

	private List<PersonEntity> getPersonEntityList(ConflictOfInterestVO vo) {
		return conflictOfInterestDao.getSFIOfDisclosure(vo);
	}

	private List<DisclosureProjectDto> getProjectDetailList(String personId, Integer disclosureId) {
//		List<DisclosureDetailDto> awardDetails = conflictOfInterestDao.getProjectsBasedOnParams(Constants.AWARD_MODULE_CODE,
//				personId, disclosureId, null, null);
//		List<DisclosureDetailDto> proposalDetails = conflictOfInterestDao.getProjectsBasedOnParams(Constants.DEV_PROPOSAL_MODULE_CODE, personId,
//				disclosureId, null, null);
//		List<DisclosureDetailDto> projectList = Stream.concat(proposalDetails.stream(), awardDetails.stream())
//				.collect(Collectors.toList());

		List<DisclosureProjectDto> projectList = fcoiDisclosureService.getDisclProjectsByDispStatus(disclosureId);

		projectList.stream().forEach(project -> {
			List<CoiDisclEntProjDetailsDto> disclosureDetails = new ArrayList<>();
			fcoiDisclosureDao.getProjectRelationshipByParam(project.getModuleCode(), Integer.valueOf(project.getProjectId()),personId,
					disclosureId).forEach(disclosureDetail -> {
				CoiDisclEntProjDetailsDto coiDisclEntProjDetails = new CoiDisclEntProjDetailsDto();
				BeanUtils.copyProperties(disclosureDetail, coiDisclEntProjDetails, "coiDisclosure", "coiEntity", "personEntity");
				if (disclosureDetail.getCoiEntity() != null) {
					CoiEntityDto coiEntityDto = new CoiEntityDto();
					BeanUtils.copyProperties(disclosureDetail.getCoiEntity(), coiEntityDto, "entityStatus", "entityType", "coiProjConflictStatusType");
					coiDisclEntProjDetails.setCoiEntity(coiEntityDto);
				}
				disclosureDetails.add(coiDisclEntProjDetails);
			});
			project.setCoiDisclEntProjDetails(disclosureDetails);
		});
		return projectList;
	}

	private List<CoiSectionsType> getSectionTypeList() {
		return conflictOfInterestDao.getCoiSectionsTypeCode();
	}

	@Override
	public String deleteReviewCommentTag(Integer coiReviewCommentTagId) {
		conflictOfInterestDao.deleteReviewTagByCommentTagId(coiReviewCommentTagId);
		return commonDao.convertObjectToJSON(DELETE_MSG);
	}

	@Override
	public ResponseEntity<Object> loadDisclAttachTypes() {
		return new ResponseEntity<>(conflictOfInterestDao.loadDisclAttachTypes(), HttpStatus.OK);
	}

	@Override
	public List<Inbox> fetchAllActiolListEntriesForBanners(NotificationBannerDto notifyBannerDto) {
		return conflictOfInterestDao.fetchAllActiolListEntriesForBanners(notifyBannerDto);
	}

	@Override
	public ResponseEntity<Object> fetchAllNotesForPerson(String personId) {
		List<String> rightNames = new ArrayList<>();
		rightNames.add(VIEW_DISCLOSURE_NOTES);
		rightNames.add(MANAGE_DISCLOSURE_NOTES);
		if (checkPersonHasPermission(personId, String.join(",", rightNames))) {
			List<NotesDto> notesDto = conflictOfInterestDao.fetchAllNotesForPerson(personId).stream().map(note -> {
				return NotesDto.builder().noteId(note.getNoteId()).title(note.getTitle()).personId(note.getPersonId())
						.content(note.getContent()).updatedBy(note.getUpdatedBy()).updatedByFullName(personDao.getPersonFullNameByPersonId(note.getUpdatedBy()))
						.updateTimestamp(note.getUpdateTimestamp()).build();
			}).collect(Collectors.toList());
			return new ResponseEntity<>(notesDto, HttpStatus.OK);
		}
		return new ResponseEntity<>("Not Authorized to view notes", HttpStatus.FORBIDDEN);
	}

	private boolean checkPersonHasPermission(String personId, String rightNames) {
		if (personId.equals(AuthenticatedUser.getLoginPersonId())
				|| personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), rightNames, null)) {
			return true;
		}
		return false;
	}

	@Override
	public ResponseEntity<Object> savePersonNote(NotesDto notesDto) {
		if (checkPersonHasPermission(notesDto.getPersonId(), MANAGE_DISCLOSURE_NOTES)) {
			Notes note = conflictOfInterestDao.savePersonNote(
					Notes.builder().personId(notesDto.getPersonId()).content(notesDto.getContent())
							.title(notesDto.getTitle()).updatedBy(AuthenticatedUser.getLoginPersonId())
							.updateTimestamp(commonDao.getCurrentTimestamp()).build());
			return new ResponseEntity<>(Map.of("noteId", note.getNoteId(), "updatedBy",
					AuthenticatedUser.getLoginPersonId(), "updatedByFullName", AuthenticatedUser.getLoginUserFullName(), "updateTimestamp",
					note.getUpdateTimestamp()), HttpStatus.OK);
		}
		return new ResponseEntity<>("Not Authorized to save or update this note", HttpStatus.FORBIDDEN);
	}

	@Override
	public ResponseEntity<Object> updatePersonNote(NotesDto notesDto) {
		if (AuthenticatedUser.getLoginPersonId().equals(notesDto.getPersonId())) {
			Timestamp updateTimestamp = conflictOfInterestDao.updatePersonNote(notesDto);
			return new ResponseEntity<>(Map.of("noteId", notesDto.getNoteId(), "updatedBy",
					AuthenticatedUser.getLoginPersonId(), "updatedByFullName", AuthenticatedUser.getLoginUserFullName(),
					"updateTimestamp", updateTimestamp), HttpStatus.OK);
		}
		return new ResponseEntity<>("Not Authorized to save or update this note", HttpStatus.FORBIDDEN);
	}

	@Override
	public ResponseEntity<Object> saveOrUpdateAttachments(MultipartFile[] files, String formDataJSON) {
		List<Attachments> attachmentsList = new ArrayList<>();
		PersonAttachmentDto dto = new PersonAttachmentDto();
		ObjectMapper mapper = new ObjectMapper();
		try {
			dto = mapper.readValue(formDataJSON, PersonAttachmentDto.class);
			dto.getAttachments().forEach(ele -> {
				int count = 0;
				PersonAttachmentDto request = PersonAttachmentDto.builder()
						.personId(AuthenticatedUser.getLoginPersonId())
						.attaTypeCode(ele.getAttaTypeCode())
						.fileName(ele.getFileName())
						.mimeType(ele.getMimeType())
						.description(ele.getDescription())
						.createdBy(AuthenticatedUser.getLoginPersonId())
						.createTimestamp(commonDao.getCurrentTimestamp())
						.updatedBy(AuthenticatedUser.getLoginPersonId())
						.updateTimestamp(commonDao.getCurrentTimestamp())
						.build();
				DisclAttaType disclosureAttachmentType = conflictOfInterestDao.getDisclosureAttachmentForTypeCode(ele.getAttaTypeCode());
				Attachments attachment = addAttachments(files[count], request, AuthenticatedUser.getLoginPersonId());
				attachment.setDisclAttaTypeDetails(disclosureAttachmentType);
				attachmentsList.add(attachment);
				count++;
			});
		} catch (JsonProcessingException e) {
			throw new ApplicationException("error in addTagPerson", e, Constants.JAVA_ERROR);
		}
		return new ResponseEntity<>(attachmentsList, HttpStatus.OK);
	}

	private Attachments addAttachments(MultipartFile file, PersonAttachmentDto request, String personId) {
		try {
			Attachments attachment = null;
			if (file != null) {
				request.setFile(file);
				attachment = coiFileAttachmentService.saveAttachment(request, personId);
			}
			return attachment;
		} catch (Exception e) {
			throw new ApplicationException("error in saveOrUpdateAttachments", e, Constants.JAVA_ERROR);
		}
	}

	@Override
	public ResponseEntity<String> deleteNote(Integer noteId, String personId) {
		if (AuthenticatedUser.getLoginPersonId().equals(personId)) {
			conflictOfInterestDao.deleteNote(noteId);
			return new ResponseEntity<>("Note deleted successfully", HttpStatus.OK);
		}
		return new ResponseEntity<>("Not Authorized to delete this note", HttpStatus.FORBIDDEN);
	}

	@Override
	public List<PersonAttachmentDto> loadAllAttachmentsForPerson(String personId) {
		List<Attachments> attachments = conflictOfInterestDao.loadAllAttachmentsForPerson(personId);
		List<PersonAttachmentDto> attachmentsDto = new ArrayList<>();
	    attachments.forEach(attachment -> {
	        PersonAttachmentDto dto = PersonAttachmentDto.builder()
	            .attachmentId(attachment.getAttachmentId())
	            .personId(attachment.getPersonId())
	            .attaTypeCode(attachment.getAttaTypeCode())
	            .fileName(attachment.getFileName())
	            .mimeType(attachment.getMimeType())
	            .description(attachment.getDescription())
	            .createdBy(attachment.getCreatedBy())
	            .createTimestamp(attachment.getCreateTimestamp())
	            .updatedBy(attachment.getUpdatedBy())
	            .updateTimestamp(attachment.getUpdateTimestamp())
	            .attachmentNumber(attachment.getAttachmentNumber())
	            .versionNumber(attachment.getVersionNumber())
	            .updateUserFullame(personDao.getPersonFullNameByPersonId(attachment.getPersonId()))
	            .attachmentType(attachment.getDisclAttaTypeDetails().getDescription())
	            .build();
	        attachmentsDto.add(dto);
	    });
	    return attachmentsDto;
	}

	@Override
	public ResponseEntity<Object> getEntityWithRelationShipInfo(CommonRequestDto requestDto) {
		requestDto.setId(AuthenticatedUser.getLoginPersonId());
		return new ResponseEntity<>(conflictOfInterestDao.getEntityWithRelationShipInfo(requestDto), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getSFIRelationshipDetails() {
		return new ResponseEntity<>(conflictOfInterestDao.getPersonEntities(null, AuthenticatedUser.getLoginPersonId(), true), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> completeDisclosureReviews(List<CompleteReivewRequestDto> requestDto) {
		List<Integer> notAllowedDisclosureIds = requestDto.stream().filter(dto -> {
			ResponseEntity<Object> result = completeDisclosureReviews(dto.getDisclosureId(), dto.getDisclosureNumber(),
					dto.getDescription());
			return result.getStatusCode() == HttpStatus.METHOD_NOT_ALLOWED;
		}).map(CompleteReivewRequestDto::getDisclosureId).collect(Collectors.toList());
		Object responseBody = notAllowedDisclosureIds.isEmpty() ? "Approved successfully" : notAllowedDisclosureIds;
		return ResponseEntity.ok().body(commonDao.convertObjectToJSON(responseBody));
	}

	private ResponseEntity<Object> completeDisclosureReviews(Integer opaDisclosureId, Integer opaDisclosureNumber, String description) {
		return completeReview(opaDisclosureId, opaDisclosureNumber, description, true);
	}

	private ResponseEntity<Object> completeReview(Integer disclosureId, Integer disclosureNumber, String description, boolean isBatch) {
		if (conflictOfInterestDao.isDisclosureInStatuses(disclosureId, APPROVED, REVIEW_STATUS_COMPLETE, Constants.COI_ACTIVE_STATUS)) {
			return  new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (fcoiDisclosureDao.isDisclRequestedWithdrawal(disclosureId)) {
			return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (conflictOfInterestDao.numberOfReviewNotOfStatus(disclosureId, Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED).equals(0)) {
			CoiDisclosure coiDisclosure = new CoiDisclosure();
			coiDisclosure.setDisclosureId(disclosureId);
			coiDisclosure.setDispositionStatusCode(APPROVED);
			coiDisclosure.setReviewStatusCode(REVIEW_STATUS_COMPLETE);
			coiDisclosure.setVersionStatus(Constants.COI_ACTIVE_STATUS);
			conflictOfInterestDao.completeDisclosureReview(coiDisclosure);
			CoiDisclosure disclosure = fcoiDisclosureDao.loadDisclosure(disclosureId);
			disclosure.setAdminPersonName(AuthenticatedUser.getLoginUserFullName());
			disclosure.setAdminGroupName(disclosure.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(disclosure.getAdminGroupId()).getAdminGroupName() : null);
			disclosure.setPersonAttachmentsCount(conflictOfInterestDao.personAttachmentsCount(AuthenticatedUser.getLoginPersonId()));
			disclosure.setDisclosureAttachmentsCount(conflictOfInterestDao.disclosureAttachmentsCount(disclosureId));
			disclosure.setPersonNotesCount(conflictOfInterestDao.personNotesCount(AuthenticatedUser.getLoginPersonId()));
			disclosure.setPersonEntitiesCount(conflictOfInterestDao.getSFIOfDisclosureCount(ConflictOfInterestVO.builder().personId(AuthenticatedUser.getLoginPersonId()).build()));
			if (disclosure.getFcoiTypeCode().equals("1") || disclosure.getFcoiTypeCode().equals("3")) {
				conflictOfInterestDao.archiveDisclosureOldVersions(disclosureId, disclosureNumber);
			}
			fcoiDisclosureDao.generateProjectSnapshot(disclosureId, disclosure.getPersonId());
			try {
				DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
						.actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_REVIEW_COMPLETED).disclosureId(disclosure.getDisclosureId())
						.disclosureNumber(disclosure.getDisclosureNumber()).fcoiTypeCode(disclosure.getFcoiTypeCode())
						.administratorName(AuthenticatedUser.getLoginUserFullName())
						.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription())
						.revisionComment(description)
						.build();
				actionLogService.saveDisclosureActionLog(actionLogDto);
				Map<String, String> actionTypes = new HashMap<>();
				actionTypes.put(FCOI_DISCLOSURE, ActionTypes.FCOI_COMPLETE);
				actionTypes.put(PROJECT_DISCLOSURE, ActionTypes.PROJECT_COMPLETE);
				Map<String, String> additionalDetails = new HashMap<>();
				inboxActions(disclosure);
				processCoiMessageToQ(getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), null, additionalDetails, null, null);
			} catch (Exception e) {
				logger.error("completeDisclosureReview : {}", e.getMessage());
				exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
			}
			if(COI_PROJECT_TYPE_AWARD.equals(disclosure.getCoiProjectTypeCode())) {
				updateFcoiExpirationDate(disclosure.getPersonId(), disclosure.getExpirationDate());
			}
			updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosure.getDisclosureId(),
					disclosure.getFcoiTypeCode());
			sendAllRvwCompNotification(disclosure);
			return isBatch ? new ResponseEntity<>("Approved successfully", HttpStatus.OK) : new ResponseEntity<>(disclosure, HttpStatus.OK);
		}
		return new ResponseEntity<>("REVIEW_STATUS_NOT_COMPLETE", HttpStatus.OK);
	}
	
	private void sendAllRvwCompNotification(CoiDisclosure disclosure) {
		Map<String, String> additionalDetails = new HashMap<>();
		List<DisclosureProjectDto> disclProjects = fcoiDisclosureDao
				.getAllSubmissionOrReviewDoneProjects(disclosure.getDisclosureId(), DISCLOSURE_REVIEW_COMPLETED);
		for (DisclosureProjectDto project : disclProjects) {
			if (project != null) {
				additionalDetails.put(StaticPlaceholders.PROJECT_NUMBER, project.getProjectNumber());
				additionalDetails.put(StaticPlaceholders.PROJECT_TITLE, project.getTitle());
				additionalDetails.put(StaticPlaceholders.DEPARTMENT_NUMBER, project.getLeadUnitNumber());
				additionalDetails.put(StaticPlaceholders.DEPARTMENT_NAME, project.getLeadUnitName());
				additionalDetails.put(StaticPlaceholders.PRINCIPAL_INVESTIGATOR, project.getPiName());
				additionalDetails.put(StaticPlaceholders.PROJECT_TYPE, project.getProjectType());
				additionalDetails.put(StaticPlaceholders.PROJECT_SUBMISSION_STATUS,
						project.getProjectSubmissionStatus());
				additionalDetails.put(StaticPlaceholders.PROJECT_OVERALL_REVIEW_STATUS,
						project.getProjectReviewStatus());
				List<UnitAdministrator> unitAdmin = fcoiDisclosureDao.getUnitAdministrators(OSP_UNIT_ADMIN_TYPE_CODE,
						project.getLeadUnitNumber());
				Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
				if (unitAdmin != null) {
					unitAdmin.forEach(admin -> commonService.setNotificationRecipients(admin.getPersonId(),
							CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients));
				}
				additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
						commonDao.convertObjectToJSON(dynamicEmailrecipients));
				processCoiMessageToQ(ActionTypes.PROJ_ALL_KP_DISCL_RVW_DONE, disclosure.getDisclosureId(), null,
						additionalDetails, null, null);
			}
		}
	}

	private void updateFcoiExpirationDate(String personId, Timestamp newExpirationDate) {
		CoiDisclosure disclosure = fcoiDisclosureDao.getLatestDisclosure(personId,
				Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), null);
		if (disclosure != null) {
			try {
				LocalDate newAbsoluteExpirationDate = newExpirationDate.toLocalDateTime().toLocalDate();
				LocalDate existingAbsoluteExpirationDate = disclosure.getExpirationDate().toLocalDateTime().toLocalDate();
				if (newAbsoluteExpirationDate.isAfter(existingAbsoluteExpirationDate)) {
					DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
							.actionTypeCode(Constants.COI_DIS_ACTION_LOG_EXPIRY_EXTENDED)
							.disclosureId(disclosure.getDisclosureId())
							.disclosureNumber(disclosure.getDisclosureNumber())
							.fcoiTypeCode(disclosure.getFcoiTypeCode()).oldDate(disclosure.getExpirationDate())
							.newDate(newExpirationDate)
							.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
					actionLogService.saveDisclosureActionLog(actionLogDto);
					fcoiDisclosureDao.updateDisclosureExpirationDate(disclosure.getDisclosureId(), newExpirationDate);
				}
			} catch (Exception e) {
				logger.error("updateFcoiExpirationDate : {}", e.getMessage());
				exceptionService.saveErrorDetails(e.getMessage(), e, CoreConstants.JAVA_ERROR);
			}
		}
	}

	private void inboxActions(CoiDisclosure disclosure) {
		if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(disclosure.getFcoiTypeCode())
				|| Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(disclosure.getFcoiTypeCode())) {
			inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
					Constants.INBOX_ADMIN_ASSIGN_FCOI_DISCLOSURE);
			inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
					Constants.INBOX_SUBMIT_FCOI_DISCLOSURE);
		} else {
			inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
					Constants.INBOX_ADMIN_ASSIGN_PROJECT_DISCLOSURE);
			inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
					Constants.INBOX_SUBMIT_PROJECT_DISCLOSURE);
		}
	}

//	@Override
//	public ResponseEntity<Object> checkDisclosureRiskStatus(CoiDisclosureDto disclosureDto) {
//		if (Boolean.TRUE.equals(conflictOfInterestDao.isDisclosureRiskStatusModified(disclosureDto.getRiskCategoryCode(), disclosureDto.getDisclosureId()))) {
//			return  new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
//		}
//		return new ResponseEntity<>(HttpStatus.OK);
//	}

	@Override
	public ResponseEntity<Object> checkEntityRiskStatus(CoiEntityDto entityDto) {
		if (Boolean.TRUE.equals(conflictOfInterestDao.isEntityRiskStatusModified(entityDto.getRiskCategoryCode(), entityDto.getEntityId()))) {
			return  new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
		}
		return new ResponseEntity<>(HttpStatus.OK);
	}

    //Defining action type based on disclosure type code
	@Override
    public String getDisclosureActionType(String fcoiType, Map<String, String> actionTypes) {
        String actionType;
        if (fcoiType.equals(Constants.DISCLOSURE_TYPE_CODE_FCOI) ||
                fcoiType.equals(Constants.DISCLOSURE_TYPE_CODE_REVISION)) {
            actionType = actionTypes.get(FCOI_DISCLOSURE);
        } else {
            actionType = actionTypes.get(PROJECT_DISCLOSURE);;
        }
        return actionType;
    }

    //Setting up the basic details for publishing message to queue
	@Override
    public String processCoiMessageToQ(String actionType, Integer moduleItemKey, Integer moduleSubItemKey, Map<String,
			String> additionDetails, Integer moduleCode,Integer subModuleCode) {
        MessageQVO messageQVO = new MessageQVO();
        messageQVO.setActionType(actionType);
        messageQVO.setModuleCode(moduleCode != null ? moduleCode : Constants.COI_MODULE_CODE);
        messageQVO.setSubModuleCode(subModuleCode != null ? subModuleCode : Constants.COI_SUBMODULE_CODE);
		messageQVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		messageQVO.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
        messageQVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
        messageQVO.setOrginalModuleItemKey(moduleItemKey);
        messageQVO.setSubModuleItemKey(moduleSubItemKey);
        messageQVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
        messageQVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));
        messageQVO.setAdditionalDetails(additionDetails);
        return messageQServiceRouter.getMessagingQueueServiceBean().publishMessageToQueue(messageQVO);
    }

	@Override
    public void processCoiTriggerMessageToQ(MessageQVO messageQVO) {
        messageQVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
        messageQVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));
        messageQServiceRouter.getMessagingQueueServiceBean().publishMessageToQueue(messageQVO);
    }
	
	@Override
	public ResponseEntity<Object> projectPersonNotify(NotificationDto notificationDto) {
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(notificationDto.getRecipients()));
		additionalDetails.put(NOTIFICATION_SUBJECT, notificationDto.getSubject());
		additionalDetails.put(NOTIFICATION_BODY, notificationDto.getMessage());
		notificationDto.setActionType(ActionTypes.PROJECT_NOTIFY);
		notificationDto.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
		String messageId = processCoiMessageToQ(ActionTypes.PROJECT_NOTIFY, notificationDto.getDisclosureId(), notificationDto.getProjectId(), additionalDetails, null, null);
		notificationDto.setMessageId(messageId);
		notificationDto.setModuleCode(Constants.COI_MODULE_CODE);
		notificationDto.setSubModuleCode(Constants.COI_SUBMODULE_CODE);
        notificationDto.setModuleItemKey(notificationDto.getDisclosureId());
        notificationDto.setSubModuleItemKey(notificationDto.getProjectId());
		coiNotificationLogService.logCoiNotificationLog(notificationDto);
		return new ResponseEntity<>("Notification send successfully", HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getEmailPreview(EmailNotificationDto emailNotificationDto) {
		return new ResponseEntity<>(notificationServiceClients.previewEmail(emailNotificationDto), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Map<String, Boolean>> getDisclosureCreationDetails() {
		Boolean isFcoiRequired = conflictOfInterestDao.isFcoiRequired(AuthenticatedUser.getLoginPersonId());
		Boolean isOpaRequired = opaService.canCreateOpaDisclosure(AuthenticatedUser.getLoginPersonId());
		return ResponseEntity.ok(Map.of("isFcoiRequired", isFcoiRequired, "isOpaRequired", isOpaRequired));
	}
	
	@Override
	public List<DisclosureDto> checkAndMarkDisclosuresAsExpired() {
		return conflictOfInterestDao.checkAndMarkDisclosuresAsExpired();
	}
	
	public void notifyUsers(List<DisclosureDto> expiredDisclosures, boolean isRenewalReminder) {
		if (expiredDisclosures == null || expiredDisclosures.isEmpty()) {
			return;
		}
		ExecutorService executorService = Executors.newFixedThreadPool(THREAD_COUNT);
		try {
			expiredDisclosures.forEach(expiredDisclosure -> executorService.submit(() -> {
				try {
					if (Constants.COI_ACTIVE_STATUS.equals(expiredDisclosure.getVersionStatus())) {
						sendMail(expiredDisclosure, isRenewalReminder);
					} else {
						if (FCOI_DISCLOSURE_TYPE.equals(expiredDisclosure.getDisclosureType())
								&& Constants.NO.equals(expiredDisclosure.getIsLegacyDisclosure())) {
							DisclosureDto disclosureDto = conflictOfInterestDao.getActiveDisclDetailsByDisclNum(expiredDisclosure.getDisclosureNumber());		
							expiredDisclosure.setExpirationDate(disclosureDto.getExpirationDate() != null ? disclosureDto.getExpirationDate() : null);
							expiredDisclosure.setReporterName(disclosureDto.getReporterName() != null ? disclosureDto.getReporterName() : null);
							expiredDisclosure.setDepartmentNumber(disclosureDto.getDepartmentNumber() != null ? disclosureDto.getDepartmentNumber() : null);
							expiredDisclosure.setDepartmentName(disclosureDto.getDepartmentName() != null ? disclosureDto.getDepartmentName() : null);
							expiredDisclosure.setDispositionStatus(disclosureDto.getDispositionStatus() != null ? disclosureDto.getDispositionStatus() : null);
							expiredDisclosure.setCertificationDate(disclosureDto.getCertificationDate() != null ? disclosureDto.getCertificationDate() : null);
						} else {
							Object[] activeOPADetails = opaDao.getActiveOpaDisclExpiryAndCertDate(expiredDisclosure.getDisclosureNumber());
							expiredDisclosure.setExpirationDate(activeOPADetails[0] != null ? (Timestamp) activeOPADetails[0] : null);
							expiredDisclosure.setCertificationDate(activeOPADetails[1] != null ? (Timestamp) activeOPADetails[1] : null);
							expiredDisclosure.setDispositionStatus(activeOPADetails[2] != null ? (String) activeOPADetails[2] : null);
							expiredDisclosure.setReporterName(activeOPADetails[3] != null ? (String) activeOPADetails[3] : null);
							expiredDisclosure.setDepartmentNumber(activeOPADetails[4] != null ? (String) activeOPADetails[4] : null);
							expiredDisclosure.setDepartmentName(activeOPADetails[5] != null ? (String) activeOPADetails[5] : null);
						}
						sendMail(expiredDisclosure, isRenewalReminder);
					}
				} catch (Exception e) {
					log.error("Failed to send notification for disclosure {}: {}", expiredDisclosure.getDisclosureId(),
							e.getMessage(), e);
				}
			}));
		} finally {
			executorService.shutdown();
			try {
				executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
			} catch (InterruptedException e) {
				log.error("Notification processing was interrupted", e);
				Thread.currentThread().interrupt();
			}
		}
	}

	@SuppressWarnings("unused")
	private void sendMail1(DisclosureDto expiredDisclosure, boolean isRenewalReminder) {
	    Map<String, String> placeHolders = new HashMap<>();
	    MessageQVO messageVO = new MessageQVO();
	    String disclosureType = expiredDisclosure.getDisclosureType();
	    if (PROJECT_DISCLOSURE_TYPE.equalsIgnoreCase(disclosureType)) {
	        placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCLOSURE_EXPIRED);
	        messageVO.setTriggerType(TriggerTypes.NOTIFY_PROJECT_DISCLOSURE_EXPIRED);
	        messageVO.setModuleCode(Constants.COI_MODULE_CODE);
	    } else if (FCOI_DISCLOSURE_TYPE.equalsIgnoreCase(disclosureType)) {
			if (isRenewalReminder) {
				if (expiredDisclosure.getIsLegacyDisclosure() !=  null && Constants.YES.equalsIgnoreCase(expiredDisclosure.getIsLegacyDisclosure())) {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_FCOI_LEGACY_DISCL_RENEWAl_REMAINDER);
					placeHolders.put(DAYS_LEFT_TO_EXPIRE, expiredDisclosure.getDaysToDueDate().toString());
				} else {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_RENEWAl_REMAINDER);
					placeHolders.put(DAYS_LEFT_TO_EXPIRE, expiredDisclosure.getDaysToDueDate().toString());
				}
			} else {
				if (expiredDisclosure.getIsLegacyDisclosure() !=  null && Constants.YES.equalsIgnoreCase(expiredDisclosure.getIsLegacyDisclosure())) {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_FCOI_LEGACY_DISCLOSURE_EXPIRED);
				} else {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_FCOI_DISCLOSURE_EXPIRED);
				}
		        messageVO.setTriggerType(TriggerTypes.NOTIFY_FCOI_DISCLOSURE_EXPIRED);
		        messageVO.setModuleCode(Constants.COI_MODULE_CODE);
			}
	    } else if (OPA_DISCLOSURE_TYPE.equalsIgnoreCase(disclosureType)) {
			if (isRenewalReminder) {
				placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_OPA_DISCL_RENEWAl_REMAINDER);
				if (expiredDisclosure.getDaysToDueDate() != null) {
					placeHolders.put(DAYS_LEFT_TO_EXPIRE, expiredDisclosure.getDaysToDueDate().toString());
				}
			} else {
		        placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_OPA_DISCLOSURE_EXPIRED);	        
		        messageVO.setTriggerType(TriggerTypes.NOTIFY_OPA_DISCLOSURE_EXPIRED);
		        messageVO.setModuleCode(Constants.OPA_MODULE_CODE);
			}
	    }    
	    messageVO.setOrginalModuleItemKey(expiredDisclosure.getDisclosureId());
	    messageVO.setSubModuleCode(0);
	    messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
	    messageVO.setAdditionalDetails(placeHolders);
	    messageVO.setPublishedUserName(Constants.UPDATED_BY_SYSTEM);
	    messageVO.setPublishedTimestamp(new Timestamp(System.currentTimeMillis()));
	    messageVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
	    messageVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));
	    try {
	        rmqMessagingQueueService.publishMessageToQueue(messageVO);
	        log.info("Expiration notification successfully sent.");
	    } catch (Exception ex) {
	        log.error("Error sending expiration notification: ", ex); 
	    }
	}

	private void sendMail(DisclosureDto expiredDisclosure, boolean isRenewalReminder) {
		Map<String, String> placeHolders = new HashMap<>();
		MessageQVO messageVO = new MessageQVO();

		String disclosureType = expiredDisclosure.getDisclosureType();
		String legacyFlag = expiredDisclosure.getIsLegacyDisclosure();
		boolean isLegacy = Constants.YES.equalsIgnoreCase(legacyFlag);
		Integer daysLeft = expiredDisclosure.getDaysToDueDate();

		log.info("Preparing to send {} notification for disclosureId={}, type={}, isLegacy={}, daysLeft={}",
				isRenewalReminder ? "renewal reminder" : "expiration", expiredDisclosure.getDisclosureId(),
				disclosureType, isLegacy, daysLeft);

		switch (disclosureType) {
			case PROJECT_DISCLOSURE_TYPE:
				placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCLOSURE_EXPIRED);
				messageVO.setTriggerType(TriggerTypes.NOTIFY_PROJECT_DISCLOSURE_EXPIRED);
				messageVO.setModuleCode(Constants.COI_MODULE_CODE);
				log.info("Set Project Disclosure expiration notification details.");
				break;
	
			case FCOI_DISCLOSURE_TYPE:
				if (isRenewalReminder) {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID,
							isLegacy ? Constants.NOTIFICATION_TYPE_ID_FCOI_LEGACY_DISCL_RENEWAl_REMAINDER
									: Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_RENEWAl_REMAINDER);
					if (daysLeft != null) {
						placeHolders.put(DAYS_LEFT_TO_EXPIRE, daysLeft.toString());
					}
					log.info("Set FCOI renewal reminder notification: legacy={}, daysLeft={}", isLegacy, daysLeft);
				} else {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID,
							isLegacy ? Constants.NOTIFICATION_TYPE_ID_FCOI_LEGACY_DISCLOSURE_EXPIRED
									: Constants.NOTIFICATION_TYPE_ID_FCOI_DISCLOSURE_EXPIRED);					
					log.info("Set FCOI expiration notification: legacy={}", isLegacy);
				}
				messageVO.setTriggerType(TriggerTypes.NOTIFY_FCOI_DISCLOSURE_EXPIRED);
				messageVO.setModuleCode(Constants.COI_MODULE_CODE);
				break;
	
			case OPA_DISCLOSURE_TYPE:
				if (isRenewalReminder) {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_OPA_DISCL_RENEWAl_REMAINDER);
					if (daysLeft != null) {
						placeHolders.put(DAYS_LEFT_TO_EXPIRE, daysLeft.toString());
					}
					log.info("Set OPA renewal reminder notification: daysLeft={}", daysLeft);
				} else {
					placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.NOTIFICATION_TYPE_ID_OPA_DISCLOSURE_EXPIRED);					
					log.info("Set OPA expiration notification.");
				}
				messageVO.setTriggerType(TriggerTypes.NOTIFY_OPA_DISCLOSURE_EXPIRED);
				messageVO.setModuleCode(Constants.OPA_MODULE_CODE);
				break;
	
			default:
				log.warn("Unknown disclosure type: {} for disclosureId={}", disclosureType, expiredDisclosure.getDisclosureId());
				return;
		}

		placeHolders.put(StaticPlaceholders.EXPIRATION_DATE, expiredDisclosure.getExpirationDate().toString());
		placeHolders.put(StaticPlaceholders.CERTIFICATION_DATE, expiredDisclosure.getCertificationDate() != null ? expiredDisclosure.getCertificationDate().toString() : null);
		placeHolders.put(StaticPlaceholders.REPORTER_NAME, expiredDisclosure.getReporterName());
		placeHolders.put(StaticPlaceholders.DEPARTMENT_NUMBER, expiredDisclosure.getDepartmentNumber());
		placeHolders.put(StaticPlaceholders.DEPARTMENT_NAME, expiredDisclosure.getDepartmentName());
		placeHolders.put(StaticPlaceholders.DISPOSITION_STATUS, expiredDisclosure.getDispositionStatus() );
		if (isLegacy) {
			messageVO.setOrginalModuleItemKey(expiredDisclosure.getDisclosureNumber());
		} else {
			messageVO.setOrginalModuleItemKey(expiredDisclosure.getDisclosureId());
		}
		messageVO.setSubModuleCode(0);
		messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
		messageVO.setAdditionalDetails(placeHolders);
		messageVO.setPublishedUserName(Constants.UPDATED_BY_SYSTEM);
		messageVO.setPublishedTimestamp(new Timestamp(System.currentTimeMillis()));
		messageVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
		messageVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));

		log.info("Publishing message to queue={} with notificationTypeId={}", messageVO.getSourceQueueName(), placeHolders.get(Constants.NOTIFICATION_TYPE_ID));

		try {
			rmqMessagingQueueService.publishMessageToQueue(messageVO);
			log.info("Successfully sent {} notification for disclosureId={}", isRenewalReminder ? "renewal reminder" : "expiration", expiredDisclosure.getDisclosureId());
		} catch (Exception ex) {
			log.error("Failed to send {} notification for disclosureId={}: {}", isRenewalReminder ? "renewal reminder" : "expiration", expiredDisclosure.getDisclosureId(), ex.getMessage(), ex);
		}
	}

	@Override
	public void updateOverallDisclosureStatus(String projectTypeCode, Integer disclosureId, String fcoiTypeCode) {
		try {
			if (disclosureId == null || fcoiTypeCode == null) {
				log.info("Invalid input for updateOverallDisclosureStatus, fcoiTypeCode: {}, disclosure id: {}",
						fcoiTypeCode, disclosureId);
				return;
			}
			switch (fcoiTypeCode) {
			case Constants.DISCLOSURE_TYPE_CODE_FCOI:
			case Constants.DISCLOSURE_TYPE_CODE_REVISION:
				conflictOfInterestDao.updateOverallDisclosureStatus(OVERALL_AWARD_DISCL_STATUS_UPDATE_PROC,
						disclosureId);
				conflictOfInterestDao.updateOverallDisclosureStatus(OVERALL_PROPOSAL_DISCL_STATUS_UPDATE_PROC,
						disclosureId);
				break;
			case Constants.FCOI_TYPE_CODE_PROJECT:
				if (COI_PROJECT_TYPE_AWARD.equals(projectTypeCode)) {
					conflictOfInterestDao.updateOverallDisclosureStatus(OVERALL_AWARD_DISCL_STATUS_UPDATE_PROC,
							disclosureId);
				} else if (COI_PROJECT_TYPE_PROPOSAL.equals(projectTypeCode)) {
					conflictOfInterestDao.updateOverallDisclosureStatus(OVERALL_PROPOSAL_DISCL_STATUS_UPDATE_PROC,
							disclosureId);
				}
				break;
			default:
				log.info("Invalid input for updateOverallDisclosureStatus, fcoiTypeCode: {}, disclosure id: {}",
						fcoiTypeCode, disclosureId);
				break;
			}
		} catch (Exception ex) {
			logger.error("Async updateOverallDisclosureStatus failed: {}", ex.getMessage());
			exceptionService.saveErrorDetails(ex.getMessage(), ex, CoreConstants.JAVA_ERROR);
		}
	}
	
	private DeclDashboardRequest getDeclDashboardRequest() {
		DeclDashboardRequest declDashboardRequest = new DeclDashboardRequest();
		Map<String, Object> declarationDashboardData = new HashMap<>();
		declarationDashboardData.put("TYPE", "A");
		declarationDashboardData.put("PERSON", AuthenticatedUser.getLoginPersonId());
		declarationDashboardData.put("UNLIMITED", true);
		declarationDashboardData.put("COUNT", true);
		declDashboardRequest.setDeclarationDashboardData(declarationDashboardData);
		return declDashboardRequest;
	}

	@Override
	public List<DisclosureDto> getExpiringFcoiAndOpaDisclosures() {
		return conflictOfInterestDao.getExpiringFcoiAndOpaDisclosures();
	}
	
	@Override
	public void addExpiringDisclosuresToInbox(List<DisclosureDto> expiringDisclosures, boolean isRenewalReminder) {
		if (expiringDisclosures == null || expiringDisclosures.isEmpty()) {
			return;
		}
		SimpleDateFormat dateFormat = new SimpleDateFormat(CoreConstants.DEFAULT_DATE_FORMAT);
		String formattedDate = dateFormat.format(new Date());
		for (DisclosureDto disclosure : expiringDisclosures) {
			if (FCOI_DISCLOSURE_TYPE.equalsIgnoreCase(disclosure.getDisclosureType())
					|| OPA_DISCLOSURE_TYPE.equalsIgnoreCase(disclosure.getDisclosureType())) {
				try {
				Integer moduleCode = null;
				String messageTypeCode = null;
				String userMessage = null;
				if (FCOI_DISCLOSURE_TYPE.equalsIgnoreCase(disclosure.getDisclosureType())) {
					inboxDao.markReadMessage(Constants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
							disclosure.getPersonId(), Constants.INBOX_REVISE_FCOI_DISCLOSURE,
							CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
					moduleCode = Constants.COI_MODULE_CODE;
					messageTypeCode = Constants.INBOX_REVISE_FCOI_DISCLOSURE;
					if (isRenewalReminder) {
						String messagePrefix = (disclosure.getDaysToDueDate() != null)
								? "COI disclosure will expire in " + disclosure.getDaysToDueDate() + " days on "
								: "COI disclosure Expired on ";
						userMessage = messagePrefix + formattedDate;
					} else
						userMessage = String.format("COI disclosure expired on %s. Kindly revise and resubmit it.", formattedDate);
				} else if (OPA_DISCLOSURE_TYPE.equalsIgnoreCase(disclosure.getDisclosureType())) {
					inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, disclosure.getDisclosureId().toString(),
							disclosure.getPersonId(), Constants.INBOX_REVISE_OPA_DISCLOSURE,
							CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
					moduleCode = Constants.OPA_MODULE_CODE;
					messageTypeCode = Constants.INBOX_REVISE_OPA_DISCLOSURE;
					if (isRenewalReminder) {
						String messagePrefix = (disclosure.getDaysToDueDate() != null)
								? "OPA disclosure will expire in " + disclosure.getDaysToDueDate() + " days on "
								: "OPA disclosure Expired on ";
						userMessage = messagePrefix + formattedDate;
					} else
						userMessage = String.format("OPA disclosure expired on %s. Kindly revise and resubmit it.", formattedDate);
				}
				disclosure.setModuleCode(moduleCode);
				disclosure.setMessageTypeCode(messageTypeCode);
				disclosure.setUserMessage(userMessage);

				createAndAddToInbox(disclosure);
			} catch (Exception e) {
				logger.error("Error processing Expiring disclosure {}: {}", disclosure.getDisclosureId(),
						e.getMessage(), e);
			}
		}
		}
	}

	private void createAndAddToInbox(DisclosureDto disclosure) {
		Inbox inbox = new Inbox();
		inbox.setModuleCode(disclosure.getModuleCode());
		inbox.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
		inbox.setToPersonId(disclosure.getPersonId());

		if (disclosure.getIsLegacyDisclosure() != null && Constants.TRUE.equalsIgnoreCase(disclosure.getIsLegacyDisclosure())) {
			inbox.setModuleItemKey(disclosure.getDisclosureNumber().toString());
		} else {
			inbox.setModuleItemKey(disclosure.getDisclosureId().toString());
		}

		inbox.setUserMessage(disclosure.getUserMessage());
		inbox.setMessageTypeCode(disclosure.getMessageTypeCode());
		inbox.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY);
		inbox.setSubjectType(Constants.SUBJECT_TYPE_COI);
		inbox.setUpdateUser("System");
		inboxService.addToInbox(inbox);
	}

    @Override
    public ResponseEntity<Object> sendNotification(NotificationDto notificationDto) {
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(notificationDto.getRecipients()));
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_SUBJECT, notificationDto.getSubject());
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_BODY, notificationDto.getMessage());
        notificationDto.setActionType(notificationDto.getActionType());
        notificationDto.setPublishedUserId(AuthenticatedUser.getLoginPersonId());
        String messageId = processCoiMessageToQ(notificationDto.getActionType(), notificationDto.getModuleItemKey(), notificationDto.getSubModuleItemKey(),
                additionalDetails, notificationDto.getModuleCode(), notificationDto.getSubModuleCode());
        notificationDto.setMessageId(messageId);
        notificationDto.getRecipients().forEach(recipient -> {
            notificationDto.setPublishedUserId(recipient.getRecipientPersonId());
            coiNotificationLogService.logCoiNotificationLog(notificationDto);
        });
        return new ResponseEntity<>("Notification send successfully", HttpStatus.OK);
    }

	private CoiCmpRepDashboardDto getCmpDashboardRequest() {
		CoiCmpRepDashboardDto request = new CoiCmpRepDashboardDto();
	    request.setIsDownload(false);
		return request;
	}
}
