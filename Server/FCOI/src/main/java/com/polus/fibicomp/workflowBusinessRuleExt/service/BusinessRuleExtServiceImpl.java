package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.workflow.comparator.WorkflowComparator;
import com.polus.core.workflow.comparator.WorkflowDetailComparator;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.pojo.Workflow;
import com.polus.core.workflow.pojo.WorkflowAttachment;
import com.polus.core.workflow.pojo.WorkflowDetail;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.dto.COICommonDto;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.dao.OPAReviewDao;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPAReviewDto;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;
import com.polus.fibicomp.opa.service.OPAService;
import com.polus.fibicomp.workflowBusinessRuleExt.dao.WorkflowExtDao;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.Timestamp;
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
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Transactional
@Service(value = "businessRuleExtService")
@Log4j2
@AllArgsConstructor
public class BusinessRuleExtServiceImpl implements BusinessRuleExtService {

    private final BusinessRuleDao businessRuleDao;
    private final CommonDao commonDao;
    private final WorkflowService workflowService;
    private final WorkflowDao workflowDao;
    private final CommonService commonService;
    private final OPADao opaDao;
    private final GeneralDao generalDao;
    private final WorkflowExtDao workflowExtDao;
    private final WorkflowOPAExtService workflowOPAExtService;
    private final WorkflowCOIExtService workflowCOIExtService;
    private final FcoiDisclosureDao fcoiDisclosureDao;
    private final WorkflowCommonService workflowCommonService;

    @Override
    public ResponseEntity<String> approveOrRejectWorkflow(MultipartFile[] files, String formDataJson, String moduleCode, String subModuleCode) throws JsonProcessingException {
        commonService.checkFileFormat(files, "General");
        ObjectMapper mapper = new ObjectMapper();
        if (moduleCode.equals(String.valueOf(Constants.OPA_MODULE_CODE))) {
            OPACommonDto opaDto = mapper.readValue(formDataJson, OPACommonDto.class);
            return workflowOPAExtService.opaWorkflowApproval(files, opaDto, moduleCode);
        } else if (moduleCode.equals(String.valueOf(Constants.COI_MODULE_CODE))) {
            COICommonDto coiDto = mapper.readValue(formDataJson, COICommonDto.class);
            return workflowCOIExtService.coiWorkflowApproval(files, coiDto, moduleCode);
        }
        return new ResponseEntity<>(commonDao.convertObjectToJSON(""), HttpStatus.OK);
    }

    @Override
    public String fetchWorkFlowDetails(WorkflowDto workflowDto) {
        try {
            Integer moduleItemKey = workflowDto.getModuleItemKey();
            String loginPersonId = AuthenticatedUser.getLoginPersonId();
            Integer moduleCode = workflowDto.getModuleCode();
            Integer subModuleCode = Constants.COI_SUBMODULE_CODE;
            String subModuleItemKey = CoreConstants.SUBMODULE_ITEM_KEY;
            setWorkflowDetails(workflowDto, moduleItemKey, moduleCode, subModuleItemKey, subModuleCode);
            canTakeRoutingAction(workflowDto);
            if (canApproveRouting(moduleCode, moduleItemKey)) {
                workflowDto.setCanApproveRouting("0");
            } else {
                Integer canApproveRouting = businessRuleDao.canApproveRouting(moduleItemKey.toString(), loginPersonId, moduleCode, subModuleItemKey, subModuleCode);
                workflowDto.setCanApproveRouting(canApproveRouting.toString());
            }
            workflowDto.setIsFinalApprover(businessRuleDao.workflowfinalApproval(moduleItemKey.toString(), loginPersonId, moduleCode, subModuleItemKey, subModuleCode));
            workflowDto.setAvailableRights(generalDao.fetchRightsByModule(loginPersonId, moduleCode, getHomeUnit(moduleCode, moduleItemKey), moduleItemKey));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return commonDao.convertObjectToJSON(workflowDto);
    }

    private String getHomeUnit(Integer moduleCode, Integer moduleItemKey) {
        if (moduleCode.equals(Constants.OPA_MODULE_CODE)) {
            return opaDao.getOPAHomeUnit(moduleItemKey);
        } else if (moduleCode.equals(Constants.COI_MODULE_CODE)) {
            return fcoiDisclosureDao.getHomeUnit(moduleItemKey);
        }
        return null;
    }

    private boolean canApproveRouting(Integer moduleCode, Integer moduleItemKey) {
        if (moduleCode.equals(Constants.OPA_MODULE_CODE)) {
            return opaDao.isOPAWithStatuses(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_WITHDRAW), null, moduleItemKey);
        } else if (moduleCode.equals(Constants.COI_MODULE_CODE)) {
            return fcoiDisclosureDao.isDisclReviewStatusIn(Constants.COI_DISCLOSURE_STATUS_WITHDRAW, moduleItemKey);
        }
        return Boolean.TRUE;
    }

    private void canTakeRoutingAction(WorkflowDto workflowDto) {
        Workflow workflow = workflowDto.getWorkflow();
        if (workflow == null) {
            workflow = workflowDao.fetchActiveWorkflowByParams(workflowDto.getModuleItemKey().toString(), workflowDto.getModuleCode(),
                    CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE);
        }
        if (workflow != null) {
            Integer maxApprovalStopNumber = workflowDao.getMaxStopNumber(workflow.getWorkflowId());
            List<WorkflowDetail> finalWorkflowDetails = workflowDao.fetchFinalApprover(workflow.getWorkflowId(),
                    maxApprovalStopNumber);
            if (finalWorkflowDetails != null && !finalWorkflowDetails.isEmpty()) {
                for (WorkflowDetail finalWorkflowDetail : finalWorkflowDetails) {
                    if (finalWorkflowDetail.getApproverPersonId().equals(AuthenticatedUser.getLoginPersonId())
                            || finalWorkflowDetail.getApprovalStopNumber().equals(maxApprovalStopNumber)) {
                        workflowDto.setFinalApprover(true);
                    }
                }
            }
            List<WorkflowDetail> workflowDetails = workflow.getWorkflowDetails();
            if (workflowDetails != null && !workflowDetails.isEmpty()) {
                Collections.sort(workflowDetails, new WorkflowDetailComparator());
                boolean currentPerson = true;
                if (canApproveRouting(workflowDto.getModuleCode(), workflowDto.getModuleItemKey())) {
                    for (WorkflowDetail workflowDetail : workflowDetails) {
                        if (currentPerson == true) {
                            if (workflowDetail.getApproverPersonId().equals(AuthenticatedUser.getLoginPersonId())) {
                                if (workflowDetail.getApprovalStatusCode()
                                        .equals(CoreConstants.WORKFLOW_STATUS_CODE_WAITING)) {
                                    if (workflowDetail.getApprovalStatusCode()
                                            .equals(CoreConstants.WORKFLOW_STATUS_CODE_APPROVED)) {
                                        workflowDto.setIsApproved(true);
                                    } else {
                                        workflowDto.setIsApproved(false);
                                    }
                                    workflowDto.setIsApprover(true);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    @Override
    public ResponseEntity<String> addSequentialStop(WorkflowDto vo) {
        if (vo.getModuleCode().equals(Constants.OPA_MODULE_CODE) && !opaDao.isOPAWithStatuses(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS), null, vo.getModuleItemKey())) {
            return new ResponseEntity<>("Cannot perform this action.", HttpStatus.METHOD_NOT_ALLOWED);
        } else if(vo.getModuleCode().equals(Constants.COI_MODULE_CODE) && !fcoiDisclosureDao.isDisclReviewStatusIn(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS, vo.getModuleItemKey())) {
            return new ResponseEntity<>("Cannot perform this action.", HttpStatus.METHOD_NOT_ALLOWED);
        }
        vo.setApprovalStopNumber(workflowDao.getNextStopNumberBasedOnMap(vo.getMapId(), vo.getWorkFlowId()));
        vo.setStopName(vo.getStopName() + " " + vo.getApprovalStopNumber());
        return addAlternativeApprover(vo);
    }

    @Override
    public ResponseEntity<String> addAlternativeApprover(WorkflowDto vo) {
        if (vo.getModuleCode().equals(Constants.OPA_MODULE_CODE) && !opaDao.isOPAWithStatuses(Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_ROUTING_INPROGRESS), null, vo.getModuleItemKey())) {
            return new ResponseEntity<>("Cannot perform this action.", HttpStatus.METHOD_NOT_ALLOWED);
        } else if(vo.getModuleCode().equals(Constants.COI_MODULE_CODE) && !fcoiDisclosureDao.isDisclReviewStatusIn(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS, vo.getModuleItemKey())) {
            return new ResponseEntity<>("Cannot perform this action.", HttpStatus.METHOD_NOT_ALLOWED);
        }
        Integer moduleCode = vo.getModuleCode();
        Integer moduleItemKey = vo.getModuleItemKey();
        Integer subModuleCode = vo.getSubModuleCode();
        Integer subModuleItemKey = vo.getSubModuleItemKey();
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        Timestamp timestamp = commonDao.getCurrentTimestamp();
        vo.setUpdateUser(AuthenticatedUser.getLoginUserName());
        vo.setApproverFlag("N");
        if (vo.isPrimaryApprover()) {
            vo.setApproverNumber(workflowDao.getMaxApproverNumber(vo.getWorkFlowId(), vo.getMapId(), vo.getMapNumber()));
            vo.setApproverFlag("Y");
        }
        Integer workflowDetailId = workflowExtDao.addAlternativeApprover(vo);
        if (workflowDetailId != null && workflowDetailId.equals(0)) {
            return new ResponseEntity<>(
                    "New approver cannot be added because of routelog status is changed.",
                    HttpStatus.METHOD_NOT_ALLOWED);
        }
        Workflow workflow = workflowDao.fetchActiveWorkflowByParams(moduleItemKey.toString(), moduleCode, subModuleItemKey.toString(), subModuleCode);
        if (workflow != null) {
            workflowService.prepareWorkflowDetails(workflow);
            vo.setWorkflow(workflow);
            List<Workflow> workFlows = workflowDao.fetchWorkflowsByParams(moduleItemKey.toString(), moduleCode, subModuleItemKey.toString(), subModuleCode);
            if (workFlows != null && !workFlows.isEmpty()) {
                workflowService.prepareWorkflowDetailsList(workFlows);
                Collections.sort(workFlows, new WorkflowComparator());
                vo.setWorkflowList(workFlows);
            }
        }
        Integer canApproveRouting = businessRuleDao.canApproveRouting(moduleItemKey.toString(), loginPersonId, moduleCode, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.AWARD_SUBMODULE_CODE);
        vo.setCanApproveRouting(canApproveRouting.toString());
        vo.setIsFinalApprover(businessRuleDao.workflowfinalApproval(moduleItemKey.toString(), loginPersonId, moduleCode, subModuleItemKey.toString(), subModuleCode));
		vo.setUpdateTimestamp(opaDao.updateOPADisclosureUpDetails(moduleItemKey, timestamp));
		vo.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        String approvalStatus = String.valueOf(vo.getWorkflow().getWorkflowDetails().stream()
                .filter(detail -> detail.getWorkflowDetailId().equals(workflowDetailId))
                .map(WorkflowDetail::getApprovalStatusCode)
                .findFirst().orElse(null));
            canTakeRoutingAction(vo);
            commonDao.doflush();
            if (approvalStatus.equals(CoreConstants.WORKFLOW_STATUS_CODE_WAITING) && (workflowDetailId != null && !workflowDetailId.equals(0))) {
                if (moduleCode.equals(Constants.OPA_MODULE_CODE)) {
                    workflowOPAExtService.sendAlternateApproverNotificationForOPA(vo, workflowDetailId);
                } else if(moduleCode.equals(Constants.COI_MODULE_CODE)) {
                    workflowCOIExtService.sendAlternateApproverNotificationForCOI(vo, workflowDetailId);
                }
            }
        setWorkflowDetails(vo, moduleItemKey, moduleCode, String.valueOf(subModuleItemKey), subModuleCode);
        return new ResponseEntity<>(commonDao.convertObjectToJSON(vo), HttpStatus.OK);
    }

    @Override
    public MessageQVO sendNotification(Integer moduleItemKey, Map<String, String> additionalDetails, String triggerType, Integer moduleCode) {
        return workflowCommonService.sendNotification(moduleItemKey, additionalDetails, triggerType, moduleCode);
    }

    @Override
    public WorkflowDto setWorkflowDetails(WorkflowDto workflowDto, Integer moduleItemKey, Integer moduleCode, String subModuleItemKey, Integer subModuleCode) {
        return workflowCommonService.setWorkflowDetails(workflowDto, moduleItemKey, moduleCode, subModuleItemKey, subModuleCode);
    }

}
