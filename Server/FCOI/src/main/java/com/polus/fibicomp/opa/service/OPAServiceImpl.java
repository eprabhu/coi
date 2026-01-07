package com.polus.fibicomp.opa.service;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.polus.core.messageq.vo.MessageQVO;
import com.polus.fibicomp.workflowBusinessRuleExt.service.WorkflowCommonService;
import com.polus.fibicomp.workflowBusinessRuleExt.service.WorkflowOPAExtService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.businessrule.service.BusinessRuleService;
import com.polus.core.businessrule.vo.EvaluateValidationRuleVO;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.inbox.vo.InboxVO;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.clients.FormBuilderClient;
import com.polus.fibicomp.coi.clients.model.FormRequest;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.inbox.InboxService;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.dto.OPAAssignAdminDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPASubmitDto;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.pojo.OPAFormBuilderDetails;

@Transactional
@Service(value = "opaService")
public class OPAServiceImpl implements OPAService {

	@Autowired
	private OPADao opaDao;

	@Autowired
	private ActionLogService actionLogService;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private FormBuilderClient formBuilderClient;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private ConflictOfInterestDao conflictOfInterestDao;

	@Autowired
	private CustomExceptionService exceptionService;

	@Autowired
	private InboxService inboxService;

	@Autowired
	private InboxDao inboxDao;

	@Autowired
	private BusinessRuleService businessRuleService;

	@Autowired
	private WorkflowDao workflowDao;

	@Autowired
	private BusinessRuleDao businessRuleDao;

	@Autowired
	private ConflictOfInterestService coiService;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private CommonService commonService;

	@Autowired
	private WorkflowOPAExtService workflowOPAExtService;

	@Autowired
	private WorkflowCommonService workflowCommonService;
	
	private static final String FINAL_DISPOSITION_STATUS = "Approved";
	private static final Integer FIRST_APPROVAL_STOP_NUMBER = 1;
	private static final Integer MODULE_SUB_ITEM_KEY = 0;

	@Override
	public Boolean canCreateOpaDisclosure(String personId) {
		return opaDao.canCreateOpaDisclosure(personId);
	}

	protected static Logger logger = LogManager.getLogger(OPAServiceImpl.class.getName());
	private static final Integer DEFAULT_MODULE_ITEM_KEY = 0;
	
	@Override
	public ResponseEntity<Object> createOpaDisclosure(String personId) {
		if (opaDao.existsPendingOPADisclosure(personId)) {
			return new ResponseEntity<>("An OPA Disclosure with pending status already exists for this person.", HttpStatus.METHOD_NOT_ALLOWED);
		}
		OPACommonDto opaDisclosure = opaDao.createOpaDisclosure(personId);
		OPACommonDto opaCommonDto = OPACommonDto.builder()
				.opaDisclosureId(opaDisclosure.getOpaDisclosureId())
				.opaDisclosureNumber(opaDisclosure.getOpaDisclosureNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.build();
		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_CREATED, opaCommonDto);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, Constants.DEFAULT_MODULE_ITEM_KEY, Constants.INBOX_OPA_DISCLOSURE_CREATION);
		return new ResponseEntity<>(opaDisclosure, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> submitOPADisclosure(OPASubmitDto opaSubmitDto) {
		List<String> opaDisclosureStatuses = new ArrayList<>(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_SUBMIT,
			    Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS, Constants.OPA_DISCLOSURE_STATUS_REVIEW_ASSIGNED,
			    Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED));
		if(opaDao.isOPAWithStatuses(opaDisclosureStatuses, Constants.OPA_DISPOSITION_STATUS_PENDING, opaSubmitDto.getOpaDisclosureId())) {
			return new ResponseEntity<>("Already Submitted", HttpStatus.METHOD_NOT_ALLOWED);
		}
		String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
		String actionType = null;
		opaDisclosureStatuses.clear();
		opaDisclosureStatuses.add(Constants.OPA_DISCLOSURE_STATUS_RETURN);
		if (opaDao.isOPAWithStatuses(opaDisclosureStatuses, Constants.OPA_DISPOSITION_STATUS_PENDING, opaSubmitDto.getOpaDisclosureId())) {
			if (Boolean.TRUE.equals(conflictOfInterestDao.isOpaReviewerAssigned(opaSubmitDto.getOpaDisclosureId()))) {
				if (Boolean.TRUE.equals(conflictOfInterestDao.isOpaReviewerReviewCompleted(opaSubmitDto.getOpaDisclosureId()))) {
					opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED);
				} else {
					opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_REVIEW_ASSIGNED);
				}
			} else {
				opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS);
			}
			actionType = ActionTypes.OPA_RETURNED_RESUBMISSION;
		} else {
			opaDisclosureStatuses.clear();
			opaDisclosureStatuses.add(Constants.OPA_DISCLOSURE_STATUS_WITHDRAW);
			if (opaDao.isOPAWithStatuses(opaDisclosureStatuses, Constants.OPA_DISPOSITION_STATUS_PENDING,
					opaSubmitDto.getOpaDisclosureId())) {
				actionType = ActionTypes.OPA_WITHDRAWN_RESUBMISSION;
			} else {
				actionType = ActionTypes.OPA_SUBMIT;
			}
			opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_SUBMIT);				
		}
		OPACommonDto  opaCommonDto = OPACommonDto.builder()
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.opaDisclosureId(opaSubmitDto.getOpaDisclosureId())
				.opaDisclosureNumber(opaSubmitDto.getOpaDisclosureNumber())
				.build();
		Boolean hasRouteLog = false;
		if (opaApprovalFlowType != null
				&& !List.of(Constants.ADMIN_REVIEW, Constants.NO_REVIEW).contains(opaApprovalFlowType)) {
			opaCommonDto = buildOPAWorkflow(opaCommonDto);
			if (opaCommonDto.getWorkflow() != null && opaCommonDto.getWorkflow().getWorkflowDetails() != null
					&& !opaCommonDto.getWorkflow().getWorkflowDetails().isEmpty()) {
				hasRouteLog = true;
				opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS);
				opaSubmitDto.setOpaDispositionStatus(null);
				actionType = null;
			}
		}
		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_SUBMITTED, opaCommonDto);
		OPADisclosure previousOPADisclosure = opaDao.getPreviousOPADisclosureVersion(
				opaSubmitDto.getOpaDisclosureNumber(), opaSubmitDto.getVersionNumber());
		if (previousOPADisclosure != null) {
			inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, previousOPADisclosure.getOpaDisclosureId().toString(),
					AuthenticatedUser.getLoginPersonId(), Constants.INBOX_REVISE_OPA_DISCLOSURE,
					CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
		}
		inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, opaSubmitDto.getOpaDisclosureId().toString(),
				AuthenticatedUser.getLoginPersonId(), Constants.INBOX_REVISE_OPA_DISCLOSURE,
				CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
		opaSubmitDto.setHomeUnit(opaDao.getOpaDisclHomeUnit(AuthenticatedUser.getLoginPersonId()));	
		opaDao.submitOPADisclosure(opaSubmitDto);
		if (List.of(Constants.ROUTING_REVIEW, Constants.NO_REVIEW).contains(opaApprovalFlowType) && !hasRouteLog) {
			completeOPADisclosure(opaSubmitDto.getOpaDisclosureId(), opaSubmitDto.getOpaDisclosureNumber(), null,
					hasRouteLog);
			opaSubmitDto.setOpaDisclosureStatus(Constants.OPA_DISCLOSURE_STATUS_COMPLETED);
		}
		inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, DEFAULT_MODULE_ITEM_KEY.toString(), AuthenticatedUser.getLoginPersonId(),
				Constants.INBOX_OPA_DISCLOSURE_CREATION, CoreConstants.SUBMODULE_ITEM_KEY,
				CoreConstants.SUBMODULE_CODE);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE,
				opaSubmitDto.getOpaDisclosureId().toString(), Constants.INBOX_OPA_DISCLOSURE_RETURNED);
		if (Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_SUBMIT, Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS,
				Constants.OPA_DISCLOSURE_STATUS_REVIEW_ASSIGNED, Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED)
				.contains(opaSubmitDto.getOpaDisclosureStatus())) {
			if (opaSubmitDto.getOpaDisclosureStatus().equals(Constants.OPA_DISCLOSURE_STATUS_SUBMIT)) {
				insertOPASubmitInbox(opaSubmitDto.getOpaDisclosureId().toString(), null);
			}
			if (actionType != null) {
				Map<String, String> additionalDetails = new HashMap<>();
				additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
						commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
				coiService.processCoiMessageToQ(actionType, opaSubmitDto.getOpaDisclosureId(), null, additionalDetails,
						Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
			}
		}
		try {
			FormRequest request = FormRequest.builder().moduleItemKey(String.valueOf(opaSubmitDto.getOpaDisclosureId()))
					.documentOwnerPersonId(AuthenticatedUser.getLoginPersonId())
					.loggedInPersonId(AuthenticatedUser.getLoginPersonId()).build();
			formBuilderClient.updateOpaDisclPersonEntityRel(request);
			logger.info("Successfully called updateOpaDisclPersonEntityRel for Disclosure ID : "
					+ opaSubmitDto.getOpaDisclosureId());
		} catch (Exception e) {
			throw new RuntimeException("Failed to call updateOpaDisclPersonEntityRel : " + e.getMessage());
		}
		return getOPADisclosure(opaSubmitDto.getOpaDisclosureId());
	}

	@Override
	public void insertOPASubmitInbox(String opaDisclosureId, String personName) {
		StringBuilder actionLogMessage = new StringBuilder("OPA disclosure of ");
		String displayName = (personName != null && !personName.isEmpty()) ? personName
				: AuthenticatedUser.getLoginUserFullName();
		actionLogMessage.append(displayName).append(" submitted on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		personDao.getAdministratorsByModuleCode(Constants.OPA_MODULE_CODE).forEach(administratorPerId -> {
			addToInbox(opaDisclosureId, administratorPerId, Constants.INBOX_OPA_DISCLOSURE_SUBMIT,
					actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
		});
	}

	private OPACommonDto buildOPAWorkflow(OPACommonDto opaCommonDto) {
		Integer workflowStatus = null;
		EvaluateValidationRuleVO evaluateValidationRuleVO = new EvaluateValidationRuleVO();
		evaluateValidationRuleVO.setModuleCode(Constants.OPA_MODULE_CODE);
		evaluateValidationRuleVO.setSubModuleCode(Constants.COI_SUBMODULE_CODE);
		evaluateValidationRuleVO.setModuleItemKey(opaCommonDto.getOpaDisclosureId().toString());
		evaluateValidationRuleVO.setLogginPersonId(AuthenticatedUser.getLoginPersonId());
		evaluateValidationRuleVO.setUpdateUser(AuthenticatedUser.getLoginUserName());
		evaluateValidationRuleVO.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY);
		workflowStatus = businessRuleService.buildWorkFlow(evaluateValidationRuleVO);
		if (workflowStatus == 1) {
			opaCommonDto
					.setWorkflow(workflowDao.fetchActiveWorkflowByParams(opaCommonDto.getOpaDisclosureId().toString(),
							Constants.OPA_MODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE));
			Map<String, String> additionalDetails = new HashMap<>();
			additionalDetails.put(StaticPlaceholders.notificationTypeId,
					Constants.NOTIFICATION_TYPE_ID_ROUTELOG_OPA_APPROVE);
			Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
			if (opaCommonDto != null && opaCommonDto.getWorkflow() != null
					&& opaCommonDto.getWorkflow().getWorkflowDetails() != null
					&& !opaCommonDto.getWorkflow().getWorkflowDetails().isEmpty()) {
				opaCommonDto.getWorkflow().getWorkflowDetails().stream()
						.filter(workflowDetail -> workflowDetail != null)
						.filter(workflowDetail -> "W".equals(workflowDetail.getApprovalStatusCode()))
						.forEach(matchingWorkflowDetail -> {
							commonService.setNotificationRecipients(matchingWorkflowDetail.getApproverPersonId(),
									CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
							logger.info("Added approver: {}", matchingWorkflowDetail.getApproverPersonName());
						});
				additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
						commonDao.convertObjectToJSON(dynamicEmailrecipients));
				String stopName = workflowService.getPlaceHolderDataForRouting(opaCommonDto.getApproverStopNumber(),
						opaCommonDto.getWorkflow().getWorkflowDetails().get(0).getMapId(),
						opaCommonDto.getWorkflow().getWorkflowDetails().get(0).getWorkflowDetailId());
				additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
				workflowCommonService.sendNotification(opaCommonDto.getOpaDisclosureId(), additionalDetails,
						TriggerTypes.OPA_ROUTELOG_APPROVE, Constants.OPA_MODULE_CODE);
			}
		}
		String isFinalApprover = businessRuleDao.workflowfinalApproval(evaluateValidationRuleVO.getModuleItemKey(), evaluateValidationRuleVO.getLogginPersonId(), evaluateValidationRuleVO.getModuleCode(), CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE);
		Integer canApproveRouting = businessRuleDao.canApproveRouting(evaluateValidationRuleVO.getModuleItemKey(), evaluateValidationRuleVO.getLogginPersonId(), evaluateValidationRuleVO.getModuleCode(), CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE);
		opaCommonDto.setCanApproveRouting(canApproveRouting.toString());
		opaCommonDto.setIsFinalApprover(isFinalApprover);
		return opaCommonDto;
	}


	@Override
	public ResponseEntity<Object> withdrawOPADisclosure(OPACommonDto opaCommonDto) {
		List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_SUBMIT, Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS);
		if (!opaDao.isOPAWithStatuses(opaDisclosureStatus, null, opaCommonDto.getOpaDisclosureId())) {
			return new ResponseEntity<>("Already withdrawn", HttpStatus.METHOD_NOT_ALLOWED);
		}
		OPADisclosure OPADisclosure = opaDao.getOPADisclosure(opaCommonDto.getOpaDisclosureId());
		OPACommonDto  dto = OPACommonDto.builder()
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.approveComment(opaCommonDto.getComment())
				.opaDisclosureId(opaCommonDto.getOpaDisclosureId())
				.opaDisclosureNumber(opaCommonDto.getOpaDisclosureNumber())
				.actionType("C")
				.build();
		workflowOPAExtService.opaWorkflowApproval(null, dto, Constants.OPA_MODULE_CODE.toString());
		dto.setComment(opaCommonDto.getComment());
		opaDao.returnOrWithdrawOPADisclosure(Constants.OPA_DISCLOSURE_STATUS_WITHDRAW, opaCommonDto.getOpaDisclosureId());
		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_WITHDRAWN, dto);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE,
				opaCommonDto.getOpaDisclosureId().toString(), Constants.INBOX_OPA_DISCLOSURE_SUBMIT);
		opaDao.updateSebbatical(OPADisclosure.getPersonId(), OPADisclosure.getOpaDisclosureId());
		Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.WITHDRAWAL_REASON, dto.getComment());
        additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE, new SimpleDateFormat(Constants.DATE_FORMAT).format(OPADisclosure.getSubmissionTimestamp()));
		coiService.processCoiMessageToQ(ActionTypes.OPA_WITHDRAW, opaCommonDto.getOpaDisclosureId(),
				MODULE_SUB_ITEM_KEY, additionalDetails, Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		return getOPADisclosure(opaCommonDto.getOpaDisclosureId());
	}

	@Override
	public ResponseEntity<Object> returnOPADisclosure(OPACommonDto opaCommonDto) {
		List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_RETURN);
		if (opaDao.isOPAWithStatuses(opaDisclosureStatus, null, opaCommonDto.getOpaDisclosureId())) {
			return new ResponseEntity<>("Already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		OPADisclosure OPADisclosure=opaDao.getOPADisclosure(opaCommonDto.getOpaDisclosureId());
		opaDao.returnOrWithdrawOPADisclosure(Constants.OPA_DISCLOSURE_STATUS_RETURN, opaCommonDto.getOpaDisclosureId());
		OPACommonDto  dto = OPACommonDto.builder()
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.comment(opaCommonDto.getComment())
				.opaDisclosureId(opaCommonDto.getOpaDisclosureId())
				.opaDisclosureNumber(opaCommonDto.getOpaDisclosureNumber())
				.build();
		opaDao.updateSebbatical(OPADisclosure.getPersonId(), OPADisclosure.getOpaDisclosureId());
		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_RETURNED, dto);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, opaCommonDto.getOpaDisclosureId().toString(),
				Constants.INBOX_OPA_WAITING_ADMIN_REVIEW);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, opaCommonDto.getOpaDisclosureId().toString(),
				Constants.INBOX_OPA_DISCLOSURE_SUBMIT);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, opaCommonDto.getOpaDisclosureId().toString(),
				Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW);
		if (!conflictOfInterestDao.isDisclosureActionlistSent(Arrays.asList(Constants.INBOX_OPA_DISCLOSURE_RETURNED),
				Constants.OPA_MODULE_CODE, opaCommonDto.getOpaDisclosureId().toString(), OPADisclosure.getPersonId())) {
			StringBuilder actionLogMessage = new StringBuilder("OPA disclosure returned by ");
			actionLogMessage.append(AuthenticatedUser.getLoginUserFullName()).append(" on ")
					.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			addToInbox(opaCommonDto.getOpaDisclosureId().toString(), OPADisclosure.getPersonId(),
					Constants.INBOX_OPA_DISCLOSURE_RETURNED, actionLogMessage.toString(),
					AuthenticatedUser.getLoginUserName());
		}
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.RETURN_REASON, dto.getComment());
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
				new SimpleDateFormat(Constants.DATE_FORMAT).format(OPADisclosure.getSubmissionTimestamp()));
		additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
		coiService.processCoiMessageToQ(ActionTypes.OPA_RETURN, opaCommonDto.getOpaDisclosureId(), null,
				additionalDetails, Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		return getOPADisclosure(opaCommonDto.getOpaDisclosureId());
	}

	@Override
	public ResponseEntity<Object> assignAdminOPADisclosure(OPAAssignAdminDto assignAdminDto) {
		if ((assignAdminDto.getActionType().equals("R") && opaDao.isSameAdminPersonOrGroupAdded(assignAdminDto.getAdminGroupId(), assignAdminDto.getAdminPersonId(), assignAdminDto.getOpaDisclosureId()))
				|| (assignAdminDto.getActionType().equals("A") && opaDao.isAdminPersonOrGroupAdded(assignAdminDto.getOpaDisclosureId()))) {
			return new ResponseEntity<>("Admin already assigned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		if (assignAdminDto.getActionType().equals("A")) {
			List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_SUBMIT);
			if (!opaDao.isOPAWithStatuses(opaDisclosureStatus, null, assignAdminDto.getOpaDisclosureId())) {
				return new ResponseEntity<>("Assign admin action cannot be performed", HttpStatus.METHOD_NOT_ALLOWED);
			}
		}
		if (assignAdminDto.getActionType().equals("R")) {
			List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_RETURN, Constants.OPA_DISCLOSURE_STATUS_COMPLETED);
			if (opaDao.isOPAWithStatuses(opaDisclosureStatus, null, assignAdminDto.getOpaDisclosureId())) {
				return new ResponseEntity<>("Reassign admin action cannot be performed", HttpStatus.METHOD_NOT_ALLOWED);
			}
		}
		Boolean isAdminAssigned = null;
		try {
			isAdminAssigned = saveAssignAdminActionLog(assignAdminDto.getAdminPersonId(), assignAdminDto.getOpaDisclosureId(), assignAdminDto.getOpaDisclosureNumber());
		} catch (Exception e) {
			logger.error("assignDisclosureAdmin : {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e, CoreConstants.JAVA_ERROR);
		}
		assignAdminDto.setOpaDisclosureStatus(Boolean.TRUE.equals(opaDao.isAdminAssigned(assignAdminDto.getOpaDisclosureId())) 
						? null
						: Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS);
		Map<String, String> additionalDetails = new HashMap<>();
		Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
		String actionType = null;
		OPADisclosure OPADisclosure = opaDao.getOPADisclosure(assignAdminDto.getOpaDisclosureId());
		if (Boolean.TRUE.equals(isAdminAssigned)) {
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY, AuthenticatedUser.getLoginUserFullName());
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO,
					personDao.getPersonFullNameByPersonId(assignAdminDto.getAdminPersonId()));
			commonService.setNotificationRecipients(OPADisclosure.getAdminPersonId(),
					CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailrecipients));
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME,
					personDao.getPersonFullNameByPersonId(OPADisclosure.getAdminPersonId()));
			actionType = ActionTypes.OPA_ADMIN_REMOVE;
		} else {
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY, AuthenticatedUser.getLoginUserFullName());
			additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO,
					personDao.getPersonFullNameByPersonId(assignAdminDto.getAdminPersonId()));
			actionType = ActionTypes.OPA_ASSIGN_ADMIN;
		}
		opaDao.assignAdminOPADisclosure(assignAdminDto);
		coiService.processCoiMessageToQ(actionType, assignAdminDto.getOpaDisclosureId(), null, additionalDetails,
				Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		// Sends notification to the newly assigned admin after reassignment
		if (actionType == ActionTypes.OPA_ADMIN_REMOVE) {
			additionalDetails.remove(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS);
			dynamicEmailrecipients.clear();
			commonService.setNotificationRecipients(assignAdminDto.getAdminPersonId(),
					CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailrecipients));
			coiService.processCoiMessageToQ(ActionTypes.OPA_REASSIGN_ADMIN, assignAdminDto.getOpaDisclosureId(), null,
					additionalDetails, Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		}
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, assignAdminDto.getOpaDisclosureId().toString(),
				Constants.INBOX_OPA_DISCLOSURE_SUBMIT);

		return getOPADisclosure(assignAdminDto.getOpaDisclosureId());
	}

	private Boolean saveAssignAdminActionLog(String adminPersonId, Integer opaDisclosureId, String opaDisclosureNumber) {
		Boolean isAdminAssigned = opaDao.isAdminAssigned(opaDisclosureId);
		OPADisclosure OPADisclosure = opaDao.getOPADisclosure(opaDisclosureId);
		if (Boolean.TRUE.equals(isAdminAssigned)) {
			OPACommonDto opaCommonDto = OPACommonDto.builder()
					.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
					.adminPersonName(personDao.getPersonFullNameByPersonId(opaDao.getAssignedAdmin(opaDisclosureId)))
					.reassignedAdminPersonName(personDao.getPersonFullNameByPersonId(adminPersonId))
					.opaDisclosureId(opaDisclosureId).opaDisclosureNumber(opaDisclosureNumber).build();
			actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_ADMIN_REASSIGNED, opaCommonDto);
		} else {
			OPACommonDto opaCommonDto = OPACommonDto.builder()
					.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).opaDisclosureId(opaDisclosureId)
					.opaDisclosureNumber(opaDisclosureNumber).adminPersonName(personDao.getPersonFullNameByPersonId(adminPersonId))
					.build();
			actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_ADMIN_ASSIGNED, opaCommonDto);
		}
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, opaDisclosureId.toString(),
				Constants.INBOX_OPA_WAITING_ADMIN_REVIEW);
		StringBuilder actionLogMessage = new StringBuilder("OPA disclosure of ");
		actionLogMessage.append(personDao.getPersonFullNameByPersonId(OPADisclosure.getPersonId())).append(" Submitted on ")
				.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
		addToInbox(opaDisclosureId.toString(), adminPersonId, Constants.INBOX_OPA_WAITING_ADMIN_REVIEW,
				actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
		return isAdminAssigned;
	}

	@Override
	public ResponseEntity<Object> completeOPADisclosure(Integer opaDisclosureId, String opaDisclosureNumber, String desciption,Boolean hasRouteLog ) {
		List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_COMPLETED);
		if(opaDao.isOPAWithStatuses(opaDisclosureStatus, Constants.OPA_DISPOSITION_STATUS_COMPLETED, opaDisclosureId)) {
			return new ResponseEntity<>("Already approved", HttpStatus.METHOD_NOT_ALLOWED);
		}
		String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
		opaDao.completeOPADisclosure(opaDisclosureId);
		OPADisclosure opaDisclosure = opaDao.getOPADisclosure(opaDisclosureId);
		OPADisclosure previousOPADisclosure = opaDao.getPreviousOPADisclosureVersion(opaDisclosureNumber, opaDisclosure.getVersionNumber());
		if (previousOPADisclosure != null) {
			opaDao.archiveOPADisclosureOldVersions(previousOPADisclosure.getOpaDisclosureId(), previousOPADisclosure.getOpaDisclosureNumber());
		}			
		OPACommonDto  opaCommonDto = OPACommonDto.builder()
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName())
				.opaDisclosureId(opaDisclosureId)
				.opaDisclosureNumber(opaDisclosureNumber)
				.comment(desciption)
				.build();
		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_APPROVED, opaCommonDto);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE,
				opaDisclosureId.toString(), Constants.INBOX_OPA_WAITING_ADMIN_REVIEW);
		inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE,
				opaDisclosureId.toString(), Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW);
		Map<String, String> additionalDetails = new HashMap<>();
		boolean skipSendingNotification = (opaApprovalFlowType.equals(Constants.NO_REVIEW))
				|| (opaApprovalFlowType.equals(Constants.ROUTING_REVIEW) && hasRouteLog != null && !hasRouteLog);
		if (!skipSendingNotification) {
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
			additionalDetails.put(StaticPlaceholders.DISPOSITION_STATUS, FINAL_DISPOSITION_STATUS);
			additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
					new SimpleDateFormat(Constants.DATE_FORMAT).format(opaDisclosure.getSubmissionTimestamp()));
			coiService.processCoiMessageToQ(ActionTypes.OPA_ADMIN_REVIEWER_COMPLETE, opaDisclosureId, null,
					additionalDetails, Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
		}		
		return getOPADisclosure(opaDisclosureId);
	}

	@Override
	public ResponseEntity<Object> getOPADisclosure(Integer opaDisclosureId) {
		OPADisclosure disclosure = opaDao.getOPADisclosure(opaDisclosureId);
		OPADisclosure opaDisclosure = OPADisclosure.builder().build();
		BeanUtils.copyProperties(disclosure, opaDisclosure, "person");
		opaDisclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(opaDisclosure.getUpdatedBy()));
		opaDisclosure.setAdminGroupName(opaDisclosure.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(opaDisclosure.getAdminGroupId()).getAdminGroupName() : null);
		opaDisclosure.setAdminPersonName(opaDisclosure.getAdminPersonId() != null ? personDao.getPersonFullNameByPersonId(opaDisclosure.getAdminPersonId()) : null);
		Person person = disclosure.getPerson();
		opaDisclosure.setPersonEmail(person.getEmailAddress());
		opaDisclosure.setPersonPrimaryTitle(person.getPrimaryTitle());
		opaDisclosure.setPersonName(person.getFullName());
		opaDisclosure.setIsFaculty(person.getIsFaculty());
		opaDisclosure.setHomeUnitName(commonDao.getUnitName(opaDisclosure.getHomeUnit()));
		opaDisclosure.setUnitDisplayName(commonDao.getUnitName(person.getHomeUnit()));
		List<OPAFormBuilderDetails> opaFormBuilderDetail = opaDao.getOpaFormBuilderDetailsByOpaDisclosureId(opaDisclosureId);
		opaDisclosure.setOpaFormBuilderDetails(opaFormBuilderDetail);
		opaDisclosure.setPersonAttachmentsCount(conflictOfInterestDao.personAttachmentsCount(opaDisclosure.getPersonId()));
		opaDisclosure.setPersonNotesCount(conflictOfInterestDao.personNotesCount(opaDisclosure.getPersonId()));
		opaDisclosure.setPersonEntitiesCount(conflictOfInterestDao.getSFIOfDisclosureCount(ConflictOfInterestVO.builder().personId(opaDisclosure.getPersonId()).build()));
		if(!AuthenticatedUser.getLoginPersonId().equals(disclosure.getPersonId())) {
			opaDisclosure.setIsHomeUnitSubmission(conflictOfInterestDao.getIsHomeUnitSubmission(opaDisclosureId, Constants.OPA_MODULE_CODE));
        }

		/**
		 * Intentionally commented. Logic to check for new form when the document is in edit mode

		List<String> editModeOPADisclosureStatusCodes = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_PENDING, Constants.OPA_DISCLOSURE_STATUS_RETURN, Constants.OPA_DISCLOSURE_STATUS_WITHDRAW);
		if (editModeOPADisclosureStatusCodes.contains(opaDisclosure.getReviewStatusCode())) {
			ApplicableFormRequest requestObject = ApplicableFormRequest.builder()
					.moduleItemCode(Constants.OPA_MODULE_ITEM_CODE)
					.moduleSubItemCode(Constants.OPA_MODULE_SUB_ITEM_CODE)
					.documentOwnerPersonId(AuthenticatedUser.getLoginPersonId())
					.build();
			ResponseEntity<ApplicableFormResponse> response = formBuilderClient.getApplicableForms(requestObject);
			ApplicableFormResponse formResponse = response.getBody();
			List<Integer> formBuilderIds = formResponse != null ?formResponse.getApplicableFormsBuilderIds(): new ArrayList<>();
			List<OPAFormBuilderDetails> opaFormBuilderDetails = opaDao.getOpaFormBuilderDetailsByOpaDisclosureId(opaDisclosureId);
			formBuilderIds.stream()
	        .filter(formBuilderId -> opaFormBuilderDetails.stream()
	                .map(OPAFormBuilderDetails::getFormBuilderId)
	                .noneMatch(id -> id.equals(formBuilderId)))
	        .forEach(formBuilderId -> {
	            OPAFormBuilderDetails opaFormBuilderDetailEntity = OPAFormBuilderDetails.builder()
	                    .opaDisclosureId(opaDisclosure.getOpaDisclosureId())
	                    .opaDisclosureNumber(opaDisclosure.getOpaDisclosureNumber())
	                    .personId(AuthenticatedUser.getLoginPersonId())
	                    .formBuilderId(formBuilderId)
	                    .isPrimaryForm(Boolean.FALSE)
	                    .updateTimestamp(commonDao.getCurrentTimestamp())
	                    .updateUser(AuthenticatedUser.getLoginUserName())
	                    .build();
	            opaDao.saveOrUpdateOpaFormBuilderDetails(opaFormBuilderDetailEntity);
	            opaFormBuilderDetail.add(opaFormBuilderDetailEntity);
	        });
		}

		*/
		List<String> inEditMode = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_PENDING, Constants.OPA_DISCLOSURE_STATUS_RETURN, Constants.OPA_DISCLOSURE_STATUS_WITHDRAW);
		if (inEditMode.contains(opaDisclosure.getReviewStatusCode()))
			inboxDao.markAsReadBasedOnParams(Constants.OPA_MODULE_CODE, opaDisclosure.getOpaDisclosureId().toString(), Constants.INBOX_REVISE_OPA_DISCLOSURE);
		return new ResponseEntity<>(opaDisclosure, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getOPADashboard(OPADashboardRequestDto requestDto) {
		return new ResponseEntity<>(opaDao.getOPADashboard(requestDto), HttpStatus.OK);
	}
	
	@Override
	public ResponseEntity<Object> getOPADashboardTabCount(OPADashboardRequestDto requestDto) {
		return new ResponseEntity<>(opaDao.getOPADashboardTabCount(requestDto), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getOpaPersonType() {
		return new ResponseEntity<>(opaDao.getOpaPersonType(), HttpStatus.OK);
	}

	@Override
	public Map<String, String> evaluateOPAQuestionnaire(Integer personEntityId) {
		return opaDao.evaluateRelationship(personEntityId);
	}

	@Override
	public void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage, String updateUser) {
		Inbox inbox = new Inbox();
		inbox.setModuleCode(Constants.OPA_MODULE_CODE);
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
	public ResponseEntity<Object> reviseOpaDisclosure(OPACommonDto dto) {
		if (opaDao.existsPendingOPADisclosure(dto.getPersonId())) {
			return new ResponseEntity<>("An OPA Disclosure with pending status already exists for this person.", HttpStatus.METHOD_NOT_ALLOWED);
		}
		OPACommonDto newOPADisclosure = opaDao.reviseOpaDisclosure(dto);

		logger.info("Revised Disclosure created with new ID: {}", newOPADisclosure.getOpaDisclosureId());

		OPACommonDto opaCommonDto = OPACommonDto.builder().opaDisclosureId(newOPADisclosure.getOpaDisclosureId())
				.opaDisclosureNumber(newOPADisclosure.getOpaDisclosureNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build();

		actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_REVISED, opaCommonDto);
		return new ResponseEntity<>(newOPADisclosure, HttpStatus.OK);
	}


	@Override
	public void updateSebbatical(String personId, Integer opaDisclosureId) {
		opaDao.updateSebbatical(personId, opaDisclosureId);
	}
	
	@Override
	public List<COIValidateDto> validateOPA(String disclosureId) {
		return opaDao.validateOPA(disclosureId);
	}

	@Override
	public void sendMonthlyExpiringSummary() throws SQLException {
		Map<String, String> placeholders = opaDao.getExpiringDisclosureSumryData();
		MessageQVO messageQVO = new MessageQVO();
		messageQVO.setModuleCode(Integer.valueOf(placeholders.get("MODULE_CODE")));
		messageQVO.setSubModuleCode(Integer.valueOf(placeholders.get("SUB_MODULE_CODE")));
		messageQVO.setTriggerType(CoreConstants.TRIGGER_TYPE_COI_REMINDER_NOTIFY);
		messageQVO.setEventType(CoreConstants.MQ_EVENT_TYPE_TRIGGER);
		messageQVO.setOrginalModuleItemKey(Integer.valueOf(placeholders.get("MODULE_ITEM_KEY")));
		messageQVO.setSubModuleItemKey(0);
		messageQVO.setAdditionalDetails(placeholders);
		messageQVO.getAdditionalDetails().put("notificationTypeId", placeholders.get("NOTIFICATION_TYPE_ID"));
		messageQVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		messageQVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
		coiService.processCoiTriggerMessageToQ(messageQVO);
	}
}
