package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.workflow.comparator.WorkflowComparator;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.pojo.Workflow;
import com.polus.core.workflow.pojo.WorkflowAttachment;
import com.polus.core.workflow.pojo.WorkflowDetail;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;
import com.polus.fibicomp.workflowBusinessRuleExt.dao.WorkflowExtDao;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Log4j2
public class WorkflowCommonService {

    private final BusinessRuleDao businessRuleDao;
    private final CommonDao commonDao;
    private final WorkflowService workflowService;
    private final WorkflowDao workflowDao;
    private final CommonService commonService;
    private final OPADao opaDao;
    private final GeneralDao generalDao;
    private final WorkflowExtDao workflowExtDao;
    private final FcoiDisclosureDao fcoiDisclosureDao;
    private final ConflictOfInterestService coiService;

    public boolean restrictMultipleTabAction(String actionType, Integer moduleCode, Integer moduleItemKey,
                                             String workFlowPersonId, Integer approverStopNumber, Integer mapId) {
        try {
            long approvalPersonCount = workflowDao.getApproverPersonCount(moduleCode, moduleItemKey, workFlowPersonId,
                    approverStopNumber, mapId);
            if (approvalPersonCount == 0) {
                return true;
            }
        } catch (Exception e) {
            log.error("exception in canPerformAction: {} ", e.getMessage());
        }
        return false;
    }

    public WorkflowDto setWorkflowDetails(WorkflowDto workflowDto, Integer moduleItemKey, Integer moduleCode, String subModuleItemKey, Integer subModuleCode) {
        Workflow workflow = workflowDao.fetchActiveWorkflowByParams(moduleItemKey.toString(), moduleCode, subModuleItemKey, subModuleCode);
        if (workflow != null) {
            workflowService.prepareWorkflowDetails(workflow);
            workflowDto.setWorkflow(workflow);
            List<Workflow> workFlows = workflowDao.fetchWorkflowsByParams(moduleItemKey.toString(), moduleCode, subModuleItemKey, subModuleCode);
            if (workFlows != null && !workFlows.isEmpty()) {
                workflowService.prepareWorkflowDetailsList(workFlows);
                Collections.sort(workFlows, new WorkflowComparator());
                workflowDto.setWorkflowList(workFlows);
            }
            workflowDto.setWorkFlowStatusName(getWorkFlowStatusName(moduleCode, moduleItemKey, workflow.getCurrentStopName()));
            setFinalApprovalPendingStatus(workflow, workflowDto);
        }
        return workflowDto;
    }

    public void uploadAttachment(MultipartFile[] files, String updatedUser, Integer workflowDetailId) {
        List<WorkflowAttachment> workflowAttachments = new ArrayList<>();
        WorkflowDetail workflowDetail = workflowDao.fetchWorkflowDetailById(workflowDetailId);
        try {
            for (int i = 0; i < files.length; i++) {
                WorkflowAttachment attachment = new WorkflowAttachment();
                File file = new File(files[i].getOriginalFilename());
                attachment.setAttachment(files[i].getBytes());
                attachment.setFileName(file.getName());
                attachment.setMimeType(files[i].getContentType());
                attachment.setUpdateTimeStamp(commonDao.getCurrentTimestamp());
                attachment.setUpdateUser(updatedUser);
                attachment.setWorkflowDetail(workflowDetail);
                workflowAttachments.add(attachment);
            }
            workflowDetail.getWorkflowAttachments().addAll(workflowAttachments);
            workflowDao.saveWorkflowDetail(workflowDetail);
        } catch (Exception e) {
            log.error("exception in uploadAttachment: {} ", e.getMessage());
            throw new ApplicationException("Error in uploadAttachment", e, CoreConstants.JAVA_ERROR);
        }
    }

    public List<WorkflowDetail> waitingWorkflowDetails(List<WorkflowDetail> workFlowDetails, Integer mapNumber, Integer approverStopNumber, Integer workflowDetailId) {
        if (approverStopNumber == null && mapNumber == null && workflowDetailId != null && !workflowDetailId.equals(0)) {
            Optional<WorkflowDetail> workflowDetail = workFlowDetails.stream().filter(detail -> detail.getWorkflowDetailId().equals(workflowDetailId)).findFirst();
            if (workflowDetail.isPresent()) {
                mapNumber = workflowDetail.get().getMapNumber();
                approverStopNumber = workflowDetail.get().getApprovalStopNumber();
            }
        }
        if (approverStopNumber != null && mapNumber != null) {
            AtomicInteger map = new AtomicInteger(mapNumber);
            AtomicInteger stop = new AtomicInteger(approverStopNumber);
            return workFlowDetails.stream().filter(workflowDetail -> workflowDetail.getApprovalStatusCode().equals(CoreConstants.WORKFLOW_STATUS_CODE_WAITING)
                    && ((workflowDetail.getMapNumber() > map.intValue())
                    || ((workflowDetail.getMapNumber().equals(map.intValue()))
                    && (workflowDetail.getApprovalStopNumber() > stop.intValue()))) && !workflowDetail.getWorkflowMap().getMapType().equals("E")).collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<WorkflowDetail> bypassedWorkflowDetails(List<WorkflowDetail> workFlowDetails, Integer mapNumber, Integer approverStopNumber, Integer workflowDetailId) {
        Integer approverNumber = null;
        if (workflowDetailId != null && !workflowDetailId.equals(0)) {
            Optional<WorkflowDetail> workflowDetail = workFlowDetails.stream().filter(detail -> detail.getWorkflowDetailId().equals(workflowDetailId)).findFirst();
            if (workflowDetail.isPresent()) {
                mapNumber = workflowDetail.get().getMapNumber();
                approverStopNumber = workflowDetail.get().getApprovalStopNumber();
                approverNumber = workflowDetail.get().getApproverNumber();
            }
        }
        if (approverStopNumber != null && mapNumber != null && approverNumber != null) {
            AtomicInteger map = new AtomicInteger(mapNumber);
            AtomicInteger stop = new AtomicInteger(approverStopNumber);
            AtomicInteger approver = new AtomicInteger(approverNumber);
            return workFlowDetails.stream().filter(workflowDetail -> workflowDetail.getApprovalStatusCode().equals(CoreConstants.WORKFLOW_STATUS_CODE_BYPASSED)
                    && workflowDetail.getMapNumber().equals(map.intValue())
                    && (workflowDetail.getApprovalStopNumber().equals(stop.intValue()))
                    && (workflowDetail.getApproverNumber().equals(approver.intValue()))).collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    public MessageQVO sendNotification(Integer moduleItemKey, Map<String, String> additionalDetails, String triggerType, Integer moduleCode) {
        MessageQVO messageVO = new MessageQVO();
        messageVO.setTriggerType(triggerType);
        messageVO.setModuleCode(moduleCode);
        messageVO.setSubModuleCode(CoreConstants.SUBMODULE_CODE);
        messageVO.setOrginalModuleItemKey(moduleItemKey);
        messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
        messageVO.setAdditionalDetails(additionalDetails);
        messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
        coiService.processCoiTriggerMessageToQ(messageVO);
        return messageVO;
    }

    private String getWorkFlowStatusName(Integer moduleCode, Integer moduleItemKey, String currentStopName) {
        if (moduleCode.equals(Constants.OPA_MODULE_CODE)) {
            OPAReviewStatusType opaReviewStatus = opaDao.getDisclosureReviewStatue(moduleItemKey);
            if (opaReviewStatus.getReviewStatusCode().equals(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS)) {
                return opaReviewStatus.getDescription() + " : " + currentStopName;
            } else {
                return opaReviewStatus.getDescription();
            }
        } else if (moduleCode.equals(Constants.COI_MODULE_CODE)) {
            CoiReviewStatusType reviewStatusType = fcoiDisclosureDao.getDisclosureReviewStatue(moduleItemKey);
            if (reviewStatusType.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS)) {
                return reviewStatusType.getDescription() + " : " + currentStopName;
            } else {
                return reviewStatusType.getDescription();
            }
        }
        return "";
    }

    private void setFinalApprovalPendingStatus(Workflow workflow, WorkflowDto workflowDto) {
        if (workflow.getWorkflowDetails() != null) {
            if (workflow.getWorkflowDetails().stream().anyMatch(
                    d -> CoreConstants.WORKFLOW_STATUS_CODE_TO_BE_SUBMITTED.equals(d.getApprovalStatusCode()))) {
                return;
            }
            workflowDto.setFinalApprovalPending(workflow.getWorkflowDetails().stream()
                    .filter(d -> CoreConstants.WORKFLOW_STATUS_CODE_WAITING.equals(d.getApprovalStatusCode()))
                    .filter(d -> Boolean.TRUE.equals(d.getPrimaryApproverFlag())).count() == 1);
        }
    }
}
