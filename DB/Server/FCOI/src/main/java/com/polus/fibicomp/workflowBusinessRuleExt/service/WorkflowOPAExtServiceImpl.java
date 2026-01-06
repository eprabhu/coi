package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.pojo.WorkflowDetail;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.dao.OPAReviewDao;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPAReviewDto;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.service.OPAService;
import com.polus.fibicomp.workflowBusinessRuleExt.constants.WorkflowConstants;
import com.polus.fibicomp.workflowBusinessRuleExt.dao.WorkflowExtDao;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
@AllArgsConstructor
@Log4j2
public class WorkflowOPAExtServiceImpl implements WorkflowOPAExtService {

    private final BusinessRuleDao businessRuleDao;
    private final CommonDao commonDao;
    private final WorkflowService workflowService;
    private final WorkflowDao workflowDao;
    private final CommonService commonService;
    private final OPAService opaService;
    private final OPADao opaDao;
    private final GeneralDao generalDao;
    private final WorkflowExtDao workflowExtDao;
    private final ConflictOfInterestService coiService;
    private final ActionLogService actionLogService;
    private final ActionLogDao actionLogDao;
    private final PersonDao personDao;
    private final OPAReviewDao reviewDao;
    private final WorkflowCommonService workflowCommonService;


    @Override
    public ResponseEntity<String> opaWorkflowApproval(MultipartFile[] files, OPACommonDto opaDto, String moduleCode) {

        try {
            String updatedUser = AuthenticatedUser.getLoginUserName();
            String moduleItemKey = opaDto.getOpaDisclosureId().toString();
            Integer opaDisclosureId = opaDto.getOpaDisclosureId();
            String logginPersonId = AuthenticatedUser.getLoginPersonId();
            Integer subModuleCode = Constants.COI_SUBMODULE_CODE;
            String actionType = opaDto.getActionType();
            String workFlowPersonId = opaDto.getWorkFlowPersonId();
            opaDto.setComment(opaDto.getApproveComment());
            Integer approverStopNumber = opaDto.getApproverStopNumber();
            Integer mapId = opaDto.getMapId();
            if ((!actionType.equals(CoreConstants.WORKFLOW_STATUS_CODE_CANCEL)) &&
                    workflowCommonService.restrictMultipleTabAction(actionType, Integer.parseInt(moduleCode), opaDisclosureId, workFlowPersonId, approverStopNumber, mapId)) {
                return new ResponseEntity<>("action cannot be performed as the opa status is changed.",
                        HttpStatus.METHOD_NOT_ALLOWED);
            } else if (!opaDao.isOPAWithStatuses(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS), null, opaDisclosureId)) {
                return new ResponseEntity<>(
                        "Approve/Return action cannot be performed as the Proposal/stop status is changed.",
                        HttpStatus.METHOD_NOT_ALLOWED);
            }

            log.info("Performing OPA RouteLog Approval or Rejection action OPA id: {} | actionType : {} ", moduleItemKey, actionType);
            String isFinalApprover = businessRuleDao.workflowfinalApproval(moduleItemKey, workFlowPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
            opaDto = processOPARouteLogAction(files, moduleCode, moduleItemKey, workFlowPersonId, subModuleCode, actionType, opaDto, logginPersonId, updatedUser,isFinalApprover);
            opaDto.setCanApproveRouting(businessRuleDao.canApproveRouting(moduleItemKey, logginPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode).toString());
            opaDto.setIsFinalApprover(businessRuleDao.workflowfinalApproval(moduleItemKey, logginPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode));
            workflowCommonService.setWorkflowDetails(opaDto, opaDto.getOpaDisclosureId(), Constants.OPA_MODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
            if (!isFinalApprover.equals("1") || actionType.equals("R")) {
                sendApproveOrDisApproveNotificationForOPA(opaDto, actionType);
            } else if (opaDto.getIsFinalApprover().equals("1") && ("B".equals(actionType))) {
                sendOPABypassNotification(opaDto);
            }
            return new ResponseEntity<>(commonDao.convertObjectToJSON(opaDto), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Exception on opaWorkflowApproval : {}", e.getLocalizedMessage());
            throw new RuntimeException(e);
        }
    }

    private OPACommonDto processOPARouteLogAction(MultipartFile[] files, String moduleCode, String moduleItemKey,
                                                  String workFlowPersonId, Integer subModuleCode, String actionType, OPACommonDto opaDto,
                                                  String logginPersonId, String updatedUser, String isFinalApprover) {
        log.info("Is final approval {}", isFinalApprover);
        Integer canApproveRouting = 0;
        if (actionType.equals(WorkflowConstants.ACTION_TYPE_BYPASS) || actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
            canApproveRouting = 1;
        } else {
            canApproveRouting = businessRuleDao.canApproveRouting(moduleItemKey, workFlowPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
        }
        log.info("Can Approve routeLog: {}", canApproveRouting);

        if (opaDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_APPROVE) || opaDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_BYPASS)) {
            opaDto.setMessage(WorkflowConstants.APPROVAL_SUCCESS);
        } else if (opaDao.isOPAWithStatuses(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS), null, opaDto.getOpaDisclosureId())
                && opaDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_RETURN)) {
            opaDto.setReviewStatusCode(Constants.OPA_DISCLOSURE_STATUS_RETURN);
            opaDto.setMessage(WorkflowConstants.APPROVAL_REJECTED);
        } else if (actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
            opaDto.setMessage(WorkflowConstants.APPROVAL_WITHDRAWAL);
            opaDto.setReviewStatusCode(Constants.OPA_DISCLOSURE_STATUS_WITHDRAW);
        } else {
            opaDto.setMessage(WorkflowConstants.APPROVAL_FAILED);
            return opaDto;
        }
        String workflowDetailId = businessRuleDao.workflowApprove(moduleItemKey, moduleCode, logginPersonId, updatedUser,
                actionType, opaDto.getApproveComment(), subModuleCode, CoreConstants.SUBMODULE_ITEM_KEY, opaDto.getMapId(),
                opaDto.getMapNumber(), opaDto.getApproverStopNumber(), opaDto.getApproverNumber());
        if (files != null && workflowDetailId != null) {
            workflowCommonService.uploadAttachment(files, updatedUser, Integer.parseInt(workflowDetailId));
        }
        if (workflowDetailId != null) {
            opaDto.setWorkflowDetailId(Integer.parseInt(workflowDetailId));
            if (opaDto.getReviewStatusCode() != null && opaDto.getReviewStatusCode().equals(Constants.OPA_DISCLOSURE_STATUS_WITHDRAW)) {
                //TODO
//                opaService.withdrawOPADisclosure(opaDto);
            } else if (opaDto.getReviewStatusCode() != null && opaDto.getReviewStatusCode().equals(Constants.OPA_DISCLOSURE_STATUS_RETURN)) {
                //TODO
                opaService.returnOPADisclosure(opaDto);
            }
			Timestamp timestamp = commonDao.getCurrentTimestamp();
			opaDto.setUpdateTimestamp(timestamp);
			opaDto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
            if (isFinalApprover.equals("1")) {
                Boolean isSubmitAfterReturned = false;
                String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
                if (actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
                    opaDto.setMessage(WorkflowConstants.FINAL_APPROVAL_REJECTED);
                } else if (opaDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_APPROVE) || opaDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_BYPASS)) {
                    opaDto.setMessage(WorkflowConstants.FINAL_APPROVAL_SUCCESS);
                    List<String> actionTypeCodes = Arrays.asList(Constants.OPA_ACTION_LOG_TYPE_WITHDRAWN, Constants.OPA_ACTION_LOG_TYPE_RETURNED);
                    List<OPAActionLog> opaActionLogs = actionLogDao
                            .fetchOpaDisclosureActionLogsBasedOnId(opaDto.getOpaDisclosureId(), actionTypeCodes, true);
                    if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW)
                            && (opaActionLogs == null || opaActionLogs.isEmpty())) {
                        coiService.processCoiMessageToQ(ActionTypes.OPA_SUBMIT, opaDto.getOpaDisclosureId(), null,
                                Map.of(), Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
                    } else {
                        if (!opaActionLogs.isEmpty()) {
                            String firstActionType = opaActionLogs.get(0).getActionTypeCode();
                            if (Constants.OPA_ACTION_LOG_TYPE_WITHDRAWN.equals(firstActionType)) {
                                coiService.processCoiMessageToQ(ActionTypes.OPA_WITHDRAWN_RESUBMISSION,
                                        opaDto.getOpaDisclosureId(), null, Map.of(), Constants.OPA_MODULE_CODE,
                                        Constants.COI_SUBMODULE_CODE);
                            } else if (Constants.OPA_ACTION_LOG_TYPE_RETURNED.equals(firstActionType)) {
                                isSubmitAfterReturned = true;
                                coiService.processCoiMessageToQ(ActionTypes.OPA_RETURNED_RESUBMISSION,
                                        opaDto.getOpaDisclosureId(), null, Map.of(), Constants.OPA_MODULE_CODE,
                                        Constants.COI_SUBMODULE_CODE);
                            }
                        }
                    }
                    if (opaDao.isAdminPersonOrGroupAdded(opaDto.getOpaDisclosureId())) {
                        opaDao.updateOPADisclosureStatuses(opaDto.getOpaDisclosureId(), timestamp, Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS, null);
                    } else {
                        if (opaApprovalFlowType != null && opaApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
                            opaDto.setReviewStatusType(opaDao.getOPADisclosureStatusType(Constants.OPA_DISCLOSURE_STATUS_COMPLETED));
                            opaDto.setDispositionStatusType(
                                    opaDao.getOPADisclDispositionStatusType(Constants.OPA_DISPOSITION_STATUS_COMPLETED));
                        } else
                            opaDao.updateOPADisclosureStatuses(opaDto.getOpaDisclosureId(), timestamp, Constants.OPA_DISCLOSURE_STATUS_SUBMIT, null);
                    }
                    if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW))
                        opaDto.setReviewStatusType(opaDao.getDisclosureReviewStatue(opaDto.getOpaDisclosureId()));
                    opaDto.setComment(null);
                    actionLogService.saveOPAActionLog(Constants.OPA_ACTION_LOG_TYPE_ROUTELOG_COMPLETED, opaDto);
                    if (opaApprovalFlowType != null && opaApprovalFlowType.equals(Constants.ROUTING_REVIEW))
                        opaService.completeOPADisclosure(opaDto.getOpaDisclosureId(),
                                opaDto.getOpaDisclosureNumber(), null, true);
                    OPADisclosure OPADisclosure = opaDao.getOPADisclosure(opaDto.getOpaDisclosureId());
                    if (isSubmitAfterReturned && OPADisclosure.getAdminPersonId() != null
                            && !OPADisclosure.getAdminPersonId().isEmpty()) {
                        StringBuilder actionLogMessage = new StringBuilder("OPA disclosure of ");
                        actionLogMessage.append(personDao.getPersonFullNameByPersonId(OPADisclosure.getPersonId())).append(" Submitted on ")
                                .append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
                        opaService.addToInbox(opaDto.getOpaDisclosureId().toString(), OPADisclosure.getAdminPersonId(),
                                Constants.INBOX_OPA_WAITING_ADMIN_REVIEW, actionLogMessage.toString(),
                                AuthenticatedUser.getLoginUserName());
                        reviewDao.fetchAllOPAReviewByDisId(opaDto.getOpaDisclosureId()).forEach(review -> {
                            OPAReviewDto reviewDto = new OPAReviewDto();
                            BeanUtils.copyProperties(review, reviewDto);
                            if (reviewDto.getReviewStatusTypeCode() != Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED) {
                                opaService.addToInbox(opaDto.getOpaDisclosureId().toString(),
                                        review.getAssigneePersonId(), Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW,
                                        actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
                            }
                        });
                    } else if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
                        opaService.insertOPASubmitInbox(opaDto.getOpaDisclosureId().toString(),
                                personDao.getPersonFullNameByPersonId(OPADisclosure.getPersonId()));
                    }
                }
            }
			else
				opaDao.updateOPADisclosureUpDetails(opaDto.getOpaDisclosureId(), timestamp);
        }        
        return opaDto;
    }

    private void sendApproveOrDisApproveNotificationForOPA(OPACommonDto vo, String approvalStatus) {
        Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
        if (vo.getWorkflowDetailId() != null && !vo.getWorkflowDetailId().equals(0)) {
            if (WorkflowConstants.ACTION_TYPE_APPROVE.equals(approvalStatus) || WorkflowConstants.ACTION_TYPE_BYPASS.equals(approvalStatus) && vo.getWorkflow() != null) {
                List<WorkflowDetail> workFlowDetails = workflowCommonService.waitingWorkflowDetails(vo.getWorkflow().getWorkflowDetails(), vo.getMapNumber(), vo.getApproverStopNumber(), vo.getWorkflowDetailId());
                for (WorkflowDetail workflowDetail : workFlowDetails) {
                    commonService.setNotificationRecipients(workflowDetail.getApproverPersonId(), CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
                    vo.setApproverStopNumber(workflowDetail.getApprovalStopNumber());
                    vo.setMapId(workflowDetail.getMapId());
                }
                if (workFlowDetails != null && !workFlowDetails.isEmpty()) {
                    Map<String, String> additionalDetails = new HashMap<>();
                    additionalDetails.put(StaticPlaceholders.notificationTypeId,
                            Constants.NOTIFICATION_TYPE_ID_ROUTELOG_OPA_APPROVE);
                    additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
                            commonDao.convertObjectToJSON(dynamicEmailrecipients));
                    String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(),
                            vo.getMapId(), vo.getWorkflowDetailId());
                    additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
                    additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT,
                            vo.getApproveComment() != null ? vo.getApproveComment() : "No Comments");
                    workflowCommonService.sendNotification(vo.getOpaDisclosureId(), additionalDetails, TriggerTypes.OPA_ROUTELOG_APPROVE,
                            Constants.OPA_MODULE_CODE);
                }
                if (WorkflowConstants.ACTION_TYPE_BYPASS.equals(approvalStatus)) {
                    sendOPABypassNotification(vo);
                }
            } else if (WorkflowConstants.ACTION_TYPE_RETURN.equals(approvalStatus)) {
//                proposalService.sendProposalNotification(vo, Constants.NOTIFICATION_PROPOSAL_REJECTED, dynamicEmailrecipients);
            }
        }
    }

    private void sendOPABypassNotification(OPACommonDto vo) {
        Set<NotificationRecipient> dynamicEmailRecipients = new HashSet<>();
        if (vo.getWorkflowDetailId() != null && !vo.getWorkflowDetailId().equals(0) && vo.getWorkflow() != null) {
            List<WorkflowDetail> workFlowDetails = workflowCommonService.bypassedWorkflowDetails(vo.getWorkflow().getWorkflowDetails(), vo.getMapNumber(), vo.getApproverStopNumber(), vo.getWorkflowDetailId());
            for (WorkflowDetail workflowDetail : workFlowDetails) {
                commonService.setNotificationRecipients(workflowDetail.getApproverPersonId(), CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailRecipients);
                vo.setApproverStopNumber(workflowDetail.getApprovalStopNumber());
                vo.setMapId(workflowDetail.getMapId());
            }
            if (workFlowDetails != null && !workFlowDetails.isEmpty()) {
                Map<String, String> additionalDetails = new HashMap<>();
                additionalDetails.put(StaticPlaceholders.notificationTypeId, Constants.NOTIFICATION_TYPE_ID_ROUTELOG_OPA_BYPASSED);
                additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(dynamicEmailRecipients));
                String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(), vo.getMapId(), vo.getWorkflowDetailId());
                additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
                additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT, vo.getApproveComment() != null ? vo.getApproveComment() : "No Comments");
                additionalDetails.put(StaticPlaceholders.WORKFLOW_ACTION_USER_NAME, AuthenticatedUser.getLoginUserFullName());
                workflowCommonService.sendNotification(vo.getOpaDisclosureId(), additionalDetails, TriggerTypes.OPA_ROUTELOG_BYPASSED, Constants.OPA_MODULE_CODE);
            }
        }
    }

    @Override
    public void sendAlternateApproverNotificationForOPA(WorkflowDto vo, Integer workflowDetailId) {
        Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
        WorkflowDetail workflowDetail = workflowDao.fetchWorkflowDetailById(workflowDetailId);
        commonService.setNotificationRecipients(workflowDetail.getApproverPersonId(),
                CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.notificationTypeId,
                Constants.NOTIFICATION_TYPE_ID_ROUTELOG_OPA_APPROVE);
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
                commonDao.convertObjectToJSON(dynamicEmailrecipients));
        String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(),
                vo.getWorkflow().getWorkflowDetails().get(0).getMapId(),
                vo.getWorkflow().getWorkflowDetails().get(0).getWorkflowDetailId());
        additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
        additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT, vo.getNote() != null ? vo.getNote() : "No Comments");
        workflowCommonService.sendNotification(vo.getModuleItemKey(), additionalDetails, TriggerTypes.OPA_ROUTELOG_APPROVE,
                Constants.OPA_MODULE_CODE);
    }

}
