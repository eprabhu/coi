package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.pojo.WorkflowDetail;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.pojo.DisclosureActionLog;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.dto.COICommonDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;

import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.workflowBusinessRuleExt.constants.WorkflowConstants;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
public class WorkflowCOIExtServiceImpl implements WorkflowCOIExtService {

    private final BusinessRuleDao businessRuleDao;
    private final CommonDao commonDao;
    private final WorkflowService workflowService;
    private final WorkflowDao workflowDao;
    private final CommonService commonService;
    private final ConflictOfInterestService coiService;
    private final ActionLogService actionLogService;
    private final ActionLogDao actionLogDao;
    private final PersonDao personDao;
    private final FcoiDisclosureDao fcoiDisclosureDao;
    private final ConflictOfInterestDao coiDao;
    private final WorkflowCommonService workflowCommonService;
    private final FcoiDisclosureService fcoiDisclosureService;
    private final InboxDao inboxDao;


    @Override
    public ResponseEntity<String> coiWorkflowApproval(MultipartFile[] files, COICommonDto coiDto, String moduleCode) {

        try {
            String updatedUser = AuthenticatedUser.getLoginUserName();
            String moduleItemKey = coiDto.getCoiDisclosureId().toString();
            Integer coiDisclosureId = coiDto.getCoiDisclosureId();
            String logginPersonId = AuthenticatedUser.getLoginPersonId();
            Integer subModuleCode = Constants.COI_SUBMODULE_CODE;
            String actionType = coiDto.getActionType();
            String workFlowPersonId = coiDto.getWorkFlowPersonId();
            coiDto.setComment(coiDto.getApproveComment());
            Integer approverStopNumber = coiDto.getApproverStopNumber();
            Integer mapId = coiDto.getMapId();
            if ((!actionType.equals(CoreConstants.WORKFLOW_STATUS_CODE_CANCEL)) &&
                    workflowCommonService.restrictMultipleTabAction(actionType, Integer.parseInt(moduleCode), coiDisclosureId, workFlowPersonId, approverStopNumber, mapId)) {
                return new ResponseEntity<>("action cannot be performed as the coi status is changed.",
                        HttpStatus.METHOD_NOT_ALLOWED);
            } else if (!fcoiDisclosureDao.isDisclReviewStatusIn(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS, coiDisclosureId)) {
                return new ResponseEntity<>(
                        "Approve/Return action cannot be performed as the Proposal/stop status is changed.",
                        HttpStatus.METHOD_NOT_ALLOWED);
            }

            log.info("Performing COI RouteLog Approval or Rejection action COI Disclosure id: {} | actionType : {} ", moduleItemKey, actionType);
            String isFinalApprover = businessRuleDao.workflowfinalApproval(moduleItemKey, workFlowPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
            CoiDisclosure coiDisclosure = fcoiDisclosureDao.loadDisclosure(coiDto.getCoiDisclosureId());
            coiDto = processCOIRouteLogAction(files, moduleCode, moduleItemKey, workFlowPersonId, subModuleCode, actionType,
                    coiDto, logginPersonId, updatedUser,isFinalApprover, coiDisclosure);
            coiDto.setCanApproveRouting(businessRuleDao.canApproveRouting(moduleItemKey, logginPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode).toString());
            coiDto.setIsFinalApprover(businessRuleDao.workflowfinalApproval(moduleItemKey, logginPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode));
            workflowCommonService.setWorkflowDetails(coiDto, coiDto.getCoiDisclosureId(), Constants.COI_MODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
            if (!isFinalApprover.equals("1") || actionType.equals("R")) {
                sendApproveOrDisApproveNotificationForCOI(coiDto, actionType, coiDisclosure.getFcoiTypeCode());
            } else if (coiDto.getIsFinalApprover().equals("1") && ("B".equals(actionType))) {
                sendCOIBypassNotification(coiDto, coiDisclosure.getFcoiTypeCode());
            }
            return new ResponseEntity<>(commonDao.convertObjectToJSON(coiDto), HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private COICommonDto processCOIRouteLogAction(MultipartFile[] files, String moduleCode, String moduleItemKey,
                                                  String workFlowPersonId, Integer subModuleCode, String actionType, COICommonDto coiDto,
                                                  String logginPersonId, String updatedUser, String isFinalApprover, CoiDisclosure coiDisclosure) {
        log.info("Is final approval {}", isFinalApprover);
        Integer canApproveRouting = 0;
        if (actionType.equals(WorkflowConstants.ACTION_TYPE_BYPASS) || actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
            canApproveRouting = 1;
        } else {
            canApproveRouting = businessRuleDao.canApproveRouting(moduleItemKey, workFlowPersonId,
                    Integer.parseInt(moduleCode), CoreConstants.SUBMODULE_ITEM_KEY, subModuleCode);
        }
        log.info("Can Approve routeLog: {}", canApproveRouting);

        if (coiDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_APPROVE) || coiDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_BYPASS)) {
            coiDto.setMessage(WorkflowConstants.APPROVAL_SUCCESS);
        } else if (fcoiDisclosureDao.isDisclReviewStatusIn(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS, coiDto.getCoiDisclosureId())
                && coiDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_RETURN)) {
            coiDto.setReviewStatusCode(Constants.COI_DISCLOSURE_STATUS_RETURN);
            coiDto.setMessage(WorkflowConstants.APPROVAL_REJECTED);
        } else if (actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
            coiDto.setMessage(WorkflowConstants.APPROVAL_WITHDRAWAL);
            coiDto.setReviewStatusCode(Constants.COI_DISCLOSURE_STATUS_WITHDRAW);
        } else {
            coiDto.setMessage(WorkflowConstants.APPROVAL_FAILED);
            return coiDto;
        }
        String workflowDetailId = businessRuleDao.workflowApprove(moduleItemKey, moduleCode, logginPersonId, updatedUser,
                actionType, coiDto.getApproveComment(), subModuleCode, CoreConstants.SUBMODULE_ITEM_KEY, coiDto.getMapId(),
                coiDto.getMapNumber(), coiDto.getApproverStopNumber(), coiDto.getApproverNumber());
        if (files != null && workflowDetailId != null) {
            workflowCommonService.uploadAttachment(files, updatedUser, Integer.parseInt(workflowDetailId));
        }
        if (workflowDetailId != null) {
            coiDto.setWorkflowDetailId(Integer.parseInt(workflowDetailId));
            if (coiDto.getReviewStatusCode() != null && coiDto.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_WITHDRAW)) {
                //TODO
//                opaService.withdrawOPADisclosure(coiDto);
            } else if (coiDto.getReviewStatusCode() != null && coiDto.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_RETURN)) {
                coiService.returnDisclosure(coiDto.getCoiDisclosureId(), coiDto.getComment());
            }
            if (isFinalApprover.equals("1")) {
                Boolean isSubmitAfterReturned = false;
                String coiApprovalFlowType = commonDao.getParameterValueAsString(Constants.FCOI_APPROVAL_FLOW_TYPE);
                if (actionType.equals(WorkflowConstants.ACTION_TYPE_CANCEL)) {
                    coiDto.setMessage(WorkflowConstants.FINAL_APPROVAL_REJECTED);
                } else if (coiDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_APPROVE) || coiDto.getActionType().equals(WorkflowConstants.ACTION_TYPE_BYPASS)) {
                    coiDto.setMessage(WorkflowConstants.FINAL_APPROVAL_SUCCESS);
                    Timestamp timestamp = commonDao.getCurrentTimestamp();
                    List<String> actionTypeCodes = Arrays.asList(Constants.COI_DISCLOSURE_ACTION_LOG_WITHDRAWN, Constants.COI_DISCLOSURE_ACTION_LOG_RETURNED);
                    List<DisclosureActionLog> coiActionLogs = actionLogDao
                            .fetchCoiDisclosureActionLogsBasedOnId(coiDto.getCoiDisclosureId(), actionTypeCodes, true);
                    isSubmitAfterReturned = (coiActionLogs != null && !coiActionLogs.isEmpty()) ? coiActionLogs.stream().anyMatch(log -> log.getActionTypeCode().equals(Constants.COI_DISCLOSURE_ACTION_LOG_RETURNED)) : false;
					fcoiDisclosureService.sentSubmitOrResubmitNotification(coiDisclosure,
							coiDisclosure.getCoiConflictStatusType().getDescription(), coiDisclosure.getCertifiedAt());
                    fcoiDisclosureService.triggerProjectSubmissionNotification(coiDisclosure.getDisclosureId());
                    if (fcoiDisclosureDao.isAdminPersonOrGroupAdded(coiDto.getCoiDisclosureId())) {
                        String reviewStatusCode = Constants.COI_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS;
                        if (Boolean.TRUE.equals(fcoiDisclosureDao.isReviewerAssigned(coiDto.getCoiDisclosureId()))) {
                            if (Boolean.TRUE.equals(fcoiDisclosureDao.isReviewerReviewCompleted(coiDto.getCoiDisclosureId()))) {
                                reviewStatusCode = Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED;
                            } else {
                                reviewStatusCode = Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED;
                            }
                        }
                        fcoiDisclosureDao.updateDisclosureStatuses(coiDto.getCoiDisclosureId(), timestamp, reviewStatusCode, null);
                        coiDto.setReviewStatusType(coiDao.getReviewStatusByCode(reviewStatusCode));
                    } else {
//                        if (coiApprovalFlowType != null && coiApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
//                            coiDto.setReviewStatusType(coiDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_STATUS_COMPLETED));
//                            coiDto.setDispositionStatusType(
//                                    coiDao.getDispositionStatusByCode(Constants.COI_DISCL_DISPOSITION_STATUS_APPROVED));
//                        } else {
                            fcoiDisclosureDao.updateDisclosureStatuses(coiDto.getCoiDisclosureId(), timestamp, Constants.COI_DISCLOSURE_STATUS_SUBMITTED, null);
                            coiDto.setReviewStatusType(coiDao.getReviewStatusByCode(Constants.COI_DISCLOSURE_STATUS_SUBMITTED));
//                        }
                    }
                    coiDto.setUpdateTimestamp(timestamp);
                    coiDto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
//                    if (coiApprovalFlowType != null && !coiApprovalFlowType.equals(Constants.ROUTING_REVIEW))
//                        coiDto.setReviewStatusType(coiDisclosure.getCoiReviewStatusType());
                    coiDto.setComment(null);
                    DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
                            .actionTypeCode(Constants.COI_DIS_ACTION_LOG_ROUTELOG_COMPLETED)
                            .disclosureId(coiDto.getCoiDisclosureId())
                            .disclosureNumber(coiDisclosure.getDisclosureNumber())
                            .comment(coiDto.getComment())
                            .build();
                    actionLogService.saveDisclosureActionLog(actionLogDto);
//                    if (coiApprovalFlowType != null && coiApprovalFlowType.equals(Constants.ROUTING_REVIEW))
//                        coiService.completeDisclosureReview(coiDto.getCoiDisclosureId(), coiDisclosure.getDisclosureNumber(), coiDto.getComment());
                    if (isSubmitAfterReturned && coiDisclosure.getAdminPersonId() != null
                            && !coiDisclosure.getAdminPersonId().isEmpty()) {
                        fcoiDisclosureService.prepareInboxObject(coiDisclosure.getAdminGroupId(), coiDisclosure.getDisclosureId(), coiDisclosure.getAdminPersonId(),
                                coiDisclosure.getFcoiTypeCode(), coiDisclosure.getCoiProjectType(), coiDisclosure.getPersonId());
                        //TODO
//                        fcoiDisclosureService.addToInbox(coiDto.getCoiDisclosureId().toString(), coiDisclosure.getAdminPersonId(),
//                                Constants.INBOX_COI_WAITING_ADMIN_REVIEW, actionLogMessage.toString(),
//                                AuthenticatedUser.getLoginUserName());
//                        reviewDao.fetchAllOPAReviewByDisId(coiDto.getCoiDisclosureId()).forEach(review -> {
//                            OPAReviewDto reviewDto = new OPAReviewDto();
//                            BeanUtils.copyProperties(review, reviewDto);
//                            if (reviewDto.getReviewStatusTypeCode() != Constants.COI_REVIEWER_REVIEW_STATUS_COMPLETED) {
//                                opaService.addToInbox(coiDto.getCoiDisclosureId().toString(),
//                                        review.getAssigneePersonId(), Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW,
//                                        actionLogMessage.toString(), AuthenticatedUser.getLoginUserName());
//                            }
//                        });
                    }
//                    else if (coiApprovalFlowType != null && !coiApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
//                        opaService.insertOPASubmitInbox(coiDto.getCoiDisclosureId().toString(),
//                                personDao.getPersonFullNameByPersonId(coiDisclosure.getPersonId()));
                    else {
                        fcoiDisclosureService.prepareInboxObject(coiDisclosure.getDisclosureId(), coiDisclosure.getFcoiTypeCode(),
                                coiDisclosure.getCoiProjectType(), coiDisclosure.getPersonId());
                    }
                }
                inboxDao.markAsReadBasedOnParams(Constants.COI_MODULE_CODE, coiDto.getCoiDisclosureId().toString(),
                        Constants.INBOX_FCOI_DISCLOSURE_ROUTE_LOG_REVIEW_REQUEST);
                inboxDao.markAsReadBasedOnParams(Constants.COI_MODULE_CODE, coiDto.getCoiDisclosureId().toString(),
                        Constants.INBOX_PROJECT_DISCLOSURE_ROUTE_LOG_REVIEW_REQUEST);

            }
        }
        return coiDto;
    }

    private void sendApproveOrDisApproveNotificationForCOI(COICommonDto vo, String approvalStatus, String fcoiTypeCode) {
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
                    String notificationTypeId;
                    if (fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_FCOI) ||
                            fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_REVISION)) {
                        notificationTypeId = Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_ROUTELOG_APPROVE;
                    } else {
                        notificationTypeId = Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_ROUTELOG_APPROVE;
                    }
                    additionalDetails.put(StaticPlaceholders.notificationTypeId, notificationTypeId);
                    additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
                            commonDao.convertObjectToJSON(dynamicEmailrecipients));
                    String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(),
                            vo.getMapId(), vo.getWorkflowDetailId());
                    additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
                    additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT,
                            vo.getApproveComment() != null ? vo.getApproveComment() : "No Comments");

                    workflowCommonService.sendNotification(vo.getCoiDisclosureId(), additionalDetails,
                            TriggerTypes.FCOI_ROUTELOG_APPROVE,
                            Constants.COI_MODULE_CODE);
                }
                if (WorkflowConstants.ACTION_TYPE_BYPASS.equals(approvalStatus)) {
                    sendCOIBypassNotification(vo, fcoiTypeCode);
                }
            } else if (WorkflowConstants.ACTION_TYPE_RETURN.equals(approvalStatus)) {
//                proposalService.sendProposalNotification(vo, Constants.NOTIFICATION_PROPOSAL_REJECTED, dynamicEmailrecipients);
            }
        }
    }

    private void sendCOIBypassNotification(COICommonDto vo, String fcoiTypeCode) {
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
                String notificationTypeId;
                if (fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_FCOI) ||
                        fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_REVISION)) {
                    notificationTypeId = Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_ROUTELOG_BYPASS;
                } else {
                    notificationTypeId = Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_ROUTELOG_BYPASS;
                }
                additionalDetails.put(StaticPlaceholders.notificationTypeId, notificationTypeId);
                additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(dynamicEmailRecipients));
                String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(), vo.getMapId(), vo.getWorkflowDetailId());
                additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
                additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT, vo.getApproveComment() != null ? vo.getApproveComment() : "No Comments");
                additionalDetails.put(StaticPlaceholders.WORKFLOW_ACTION_USER_NAME, AuthenticatedUser.getLoginUserFullName());
                workflowCommonService.sendNotification(vo.getCoiDisclosureId(), additionalDetails, TriggerTypes.FCOI_ROUTELOG_BYPASSED, Constants.OPA_MODULE_CODE);
            }
        }
    }

    @Override
    public void sendAlternateApproverNotificationForCOI(WorkflowDto vo, Integer workflowDetailId) {
        Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
        WorkflowDetail workflowDetail = workflowDao.fetchWorkflowDetailById(workflowDetailId);
        commonService.setNotificationRecipients(workflowDetail.getApproverPersonId(),
                CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
        Map<String, String> additionalDetails = new HashMap<>();
        String notificationTypeId;
        String fcoiTypeCode = fcoiDisclosureDao.getDisclosureFcoiTypeCode(vo.getModuleItemKey());
        if (fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_FCOI) ||
                fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_REVISION)) {
            notificationTypeId = Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_ROUTELOG_APPROVE;
        } else {
            notificationTypeId = Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_ROUTELOG_APPROVE;
        }
        additionalDetails.put(StaticPlaceholders.notificationTypeId, notificationTypeId);
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
                commonDao.convertObjectToJSON(dynamicEmailrecipients));
        String stopName = workflowService.getPlaceHolderDataForRouting(vo.getApproverStopNumber(),
                vo.getWorkflow().getWorkflowDetails().get(0).getMapId(),
                vo.getWorkflow().getWorkflowDetails().get(0).getWorkflowDetailId());
        additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
        additionalDetails.put(StaticPlaceholders.WORKFLOW_COMMENT, vo.getNote() != null ? vo.getNote() : "No Comments");
        workflowCommonService.sendNotification(vo.getModuleItemKey(), additionalDetails, TriggerTypes.FCOI_ROUTELOG_APPROVE,
                Constants.COI_MODULE_CODE);
    }
}
