package com.polus.fibicomp.fcoiDisclosure.service;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.businessrule.service.BusinessRuleService;
import com.polus.core.businessrule.vo.EvaluateValidationRuleVO;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.UnitAdministrator;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.service.QuestionnaireService;
import com.polus.core.roles.dao.AuthorizationServiceDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.workflow.dao.WorkflowDao;
import com.polus.core.workflow.service.WorkflowService;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.AwardPersonDTO;
import com.polus.fibicomp.coi.dto.CoiConflictStatusTypeDto;
import com.polus.fibicomp.coi.dto.CoiDisclEntProjDetailsDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureCommonDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureDetailDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.PersonEntityRelationshipDto;
import com.polus.fibicomp.coi.dto.ProjectRelationshipResponseDto;
import com.polus.fibicomp.coi.exception.DisclosureValidationException;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;
import com.polus.fibicomp.coi.service.ProjectService;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.constants.TriggerTypes;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.MakeVoidDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProposalIntegrationNotifiyDto;
import com.polus.fibicomp.fcoiDisclosure.dto.SFIJsonDetailsDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiConflictStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjectEntityRel;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjects;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureFcoiType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiRiskCategory;
import com.polus.fibicomp.inbox.InboxService;
import com.polus.fibicomp.workflowBusinessRuleExt.service.WorkflowCommonService;

@Transactional
@Service
public class FcoiDisclosureServiceImpl implements FcoiDisclosureService {

    protected static Logger logger = LogManager.getLogger(FcoiDisclosureServiceImpl.class.getName());

    private static final String DISPOSITION_STATUS_PENDING = "1";
    private static final String REVIEW_STATUS_PENDING = "1";
    private static final String PROJECT_DISCLOSURE_TYPE_CODE = "2";
    private static final String DISCLOSURE_REVIEW_IN_PROGRESS = "3";
    private static final String SUBMITTED_FOR_REVIEW = "2";
    private static final String REVIEW_STATUS_RETURNED = "5";
    private static final String REVIEW_STATUS_WITHDRAWN = "6";
    private static final String RISK_CATEGORY_LOW = "3";
    private static final String RISK_CATEGORY_LOW_DESCRIPTION = "Low";
    private static final String DISPOSITION_STATUS_TYPE_CODE = "1";
    private static final String REVIEW_IN_PROGRESS = "Review in progress";
    private static final String MANAGE_FCOI_DISCLOSURE = "MANAGE_FCOI_DISCLOSURE";
    private static final String MANAGE_PROJECT_DISCLOSURE = "MANAGE_PROJECT_DISCLOSURE";
    private static final String ADMIN_REASSIGN = "R";
    private static final String ADMIN_ASSIGN = "A";
    private static final String WITHDRAWAL_MESSAGE_ACTION = " Recall Requested by ";
    private static final String WITHDRAWAL_DENY_MESSAGE_ACTION = " Recall Request Denied by ";
    private static final String INTIAL_DISCLOSURE = "Initial Disclosure";
    private static final String REVISION_DISCLOSURE = "Revision Disclosure";
    private static final String OSP_UNIT_ADMIN_TYPE_CODE = "2";
    private static final Integer FIRST_APPROVAL_STOP_NUMBER = 1;
    private static final String MAINTAIN_COI_COMMENTS = "MAINTAIN_COI_COMMENTS";
    private static final String MAINTAIN_COI_PRIVATE_COMMENTS = "MAINTAIN_COI_PRIVATE_COMMENTS";
    private static final String VIEW_COI_COMMENTS = "VIEW_COI_COMMENTS";
    private static final String VIEW_COI_PRIVATE_COMMENTS = "VIEW_COI_PRIVATE_COMMENTS";
    private static final String MAINTAIN_COI_RESOLVE_COMMENTS = "MAINTAIN_COI_RESOLVE_COMMENTS";

    @Autowired
    private FcoiDisclosureDao disclosureDao;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private ConflictOfInterestDao coiDao;

    @Autowired
    private PersonDao personDao;

    @Autowired
	private InboxDao inboxDao;

    @Autowired
    private QuestionnaireService questionnaireService;

    @Autowired
    private ConflictOfInterestService coiService;

    @Autowired
    private FCOIDisclProjectService projectService;

    @Autowired
    private CustomExceptionService exceptionService;

    @Autowired
	private InboxService inboxService;

    @Autowired
	private ProjectService projectDashboardService;
    
	@Autowired
	private CommonService commonService;

	@Autowired
	private BusinessRuleService businessRuleService;

	@Autowired
	private WorkflowDao workflowDao;

	@Autowired
	private BusinessRuleDao businessRuleDao;

	@Autowired
	private WorkflowService workflowService;

    @Autowired
    private WorkflowCommonService workflowCommonService;

    @Autowired
	private AuthorizationServiceDao authorizationServiceDao;

    @Override
    public ResponseEntity<Object> createDisclosure(CoiDisclosureDto vo) throws JsonProcessingException {
    	if (Constants.FCOI_TYPE_CODE_PROJECT.equals(vo.getFcoiTypeCode()) && Constants.AWARD_MODULE_CODE.equals(vo.getModuleCode())) {
        	Boolean isAwardDisclosureApproved = disclosureDao.checkIfProjectDisclosureApproved(vo.getPersonId(), vo.getModuleCode(), vo.getModuleItemKey());
        		if (Boolean.TRUE.equals(isAwardDisclosureApproved)) {
        			return new ResponseEntity<>("An existing award disclosure has already been approved for this award. Please create the initial disclosure or revise the existing initial disclosure as required", HttpStatus.NOT_ACCEPTABLE);
        		}
    	}
    	Map<String, Object> validatedObject = disclosureDao.validateProjectDisclosure(vo.getPersonId(), vo.getModuleCode(), vo.getModuleItemKey());
        Integer disclosureId = !validatedObject.isEmpty() ?
                validatedObject.get("projectDisclosure") != null ?
                        (Integer) validatedObject.get("projectDisclosure") :
                        validatedObject.get("fcoiDisclosure") != null ?
                                (Integer) validatedObject.get("fcoiDisclosure") :
                                null :
                null;
        if (disclosureId != null && disclosureId != 0) {
            CoiDisclosure disclosure = disclosureDao.loadDisclosure(disclosureId);
            CoiDisclosureDto coiDisclosureDto = new CoiDisclosureDto();
            BeanUtils.copyProperties(disclosure, coiDisclosureDto);
            coiDisclosureDto.setHomeUnitName(disclosure.getUnit() != null ? disclosure.getUnit().getUnitName() : null);
            coiDisclosureDto.setReviewStatus(disclosure.getCoiReviewStatusType() != null ? disclosure.getCoiReviewStatusType().getDescription() : null);
            coiDisclosureDto.setDispositionStatus(disclosure.getCoiDispositionStatusType() != null ? disclosure.getCoiDispositionStatusType().getDescription() : null);
            coiDisclosureDto.setConflictStatus(disclosure.getCoiConflictStatusType() != null ? disclosure.getCoiConflictStatusType().getDescription() : null);
            coiDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(disclosure.getCreatedBy()));
            coiDisclosureDto.setDisclosurePersonFullName(disclosure.getPerson().getFullName());
            return new ResponseEntity<>(coiDisclosureDto, HttpStatus.METHOD_NOT_ALLOWED);
        } else if (vo.getFcoiTypeCode().equals("3") && disclosureDao.isMasterDisclosurePresent(vo.getPersonId())) {
            return new ResponseEntity<>("Could not create master disclosure ", HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiDisclosure coiDisclosure = CoiDisclosure.builder()
                .fcoiTypeCode(vo.getFcoiTypeCode())
                .coiProjectTypeCode(vo.getCoiProjectTypeCode())
                .createdBy(vo.getPersonId())
                .personId(vo.getPersonId())
                .syncNeeded(true)
                .disclosureNumber(disclosureDao.generateMaxDisclosureNumber())
                .versionNumber(1).versionStatus(Constants.COI_PENDING_STATUS)
                .homeUnit(vo.getHomeUnit())
                .dispositionStatusCode(DISPOSITION_STATUS_PENDING)
                .reviewStatusCode(REVIEW_STATUS_PENDING)
                .updatedBy(vo.getPersonId())
                .build();
        disclosureDao.saveOrUpdateCoiDisclosure(coiDisclosure);
        CoiDisclosureFcoiType coiDisclosureFcoiType = disclosureDao.getCoiDisclosureFcoiTypeByCode(vo.getFcoiTypeCode());
        List<CoiDisclProjects> disclosureProjects = new ArrayList<>();
        String loginPersonId = vo.getPersonId();
        if (vo.getFcoiTypeCode().equals(Constants.FCOI_TYPE_CODE_PROJECT)) {
            CoiDisclProjects coiDisclProject = CoiDisclProjects.builder().
                    disclosureId(coiDisclosure.getDisclosureId())
                    .disclosureNumber(coiDisclosure.getDisclosureNumber())
                    .moduleCode(vo.getModuleCode())
                    .moduleItemKey(vo.getModuleItemKey())
                    .updateTimestamp(commonDao.getCurrentTimestamp())
                    .updatedBy(coiDisclosure.getPersonId())
                    .build();
            disclosureDao.saveOrUpdateCoiDisclProjects(coiDisclProject);
            disclosureProjects.add(coiDisclProject);
        } else {
            disclosureProjects = disclosureDao.syncFcoiDisclosureProjects(coiDisclosure.getDisclosureId(),
                    coiDisclosure.getDisclosureNumber(), loginPersonId);
        }
        String engagementTypesNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
        List<SFIJsonDetailsDto> sfiDetails = disclosureDao.getPersonEntitiesByPersonId(loginPersonId, engagementTypesNeeded);
        boolean allowFCOIWithoutProjects = commonDao.getParameterValueAsBoolean("ALLOW_FCOI_WITHOUT_PROJECT");
        if (disclosureProjects.isEmpty() && !allowFCOIWithoutProjects) {
            throw new DisclosureValidationException("You don’t have any projects to disclose");
        }
        String sfiJsonString = convertListToJson(sfiDetails);
        if (!disclosureProjects.isEmpty()) {
            ExecutorService executorService = Executors.newWorkStealingPool(4);
            disclosureProjects.forEach(disclosureProject ->
                    executorService.submit(() -> {
                        logger.info("syncFcoiDisclProjectsAndEntities is executing for project id {} on thread {}", disclosureProject.getCoiDisclProjectId(), Thread.currentThread().getName());
                        disclosureDao.syncFcoiDisclProjectsAndEntities(coiDisclosure.getDisclosureId(),
                                coiDisclosure.getDisclosureNumber(), disclosureProject.getCoiDisclProjectId(),
                                disclosureProject.getModuleCode(), disclosureProject.getModuleItemKey(),
                                sfiJsonString, loginPersonId);
                    }));
        }
        disclosureDao.syncFcoiDisclAndPersonEntities(coiDisclosure.getDisclosureId(), sfiJsonString);
        markInboxMessageAsRead(vo, coiDisclosure, disclosureProjects);
        vo.setDisclosureId(coiDisclosure.getDisclosureId());
        try {
            DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_CREATED)
                    .disclosureId(coiDisclosure.getDisclosureId()).disclosureNumber(coiDisclosure.getDisclosureNumber())
                    .fcoiTypeCode(coiDisclosure.getFcoiTypeCode()).revisionComment(coiDisclosure.getRevisionComment())
                    .reporter(personDao.getPersonFullNameByPersonId(loginPersonId))
                    .fcoiTypeDescription(coiDisclosureFcoiType.getDescription())
                    .build();
            actionLogService.saveDisclosureActionLog(actionLogDto);
        } catch (Exception e) {
            logger.error("createDisclosure : {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
		coiService.updateOverallDisclosureStatus(coiDisclosure.getCoiProjectTypeCode(), coiDisclosure.getDisclosureId(),
				coiDisclosureFcoiType.getFcoiTypeCode());
		return new ResponseEntity<>(vo, HttpStatus.OK);
    }

	private void markInboxMessageAsRead(CoiDisclosureDto vo, CoiDisclosure coiDisclosure, List<CoiDisclProjects> disclosureProjects) {
		markInboxAwardDisclCreateMsgAsRead(vo.getModuleItemKey(), vo.getModuleCode(), vo.getFcoiTypeCode(), coiDisclosure.getPersonId(), disclosureProjects, null);
		inboxDao.markReadMessage(Constants.COI_MODULE_CODE, Constants.DEFAULT_MODULE_ITEM_KEY, AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_CREATION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
        inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, Constants.DEFAULT_MODULE_ITEM_KEY, AuthenticatedUser.getLoginPersonId(), Constants.INBOX_TRAVEL_DISCL_REIMBURSED_COST_LIMIT_EXCEEDED, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
    }

	public String convertListToJson(List<SFIJsonDetailsDto> dtoList) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(dtoList);
    }

    @Override
    public ResponseEntity<Object> loadDisclosure(Integer disclosureId) {
        CoiDisclosureDto coiDisclosureDto = new CoiDisclosureDto();
        ConflictOfInterestVO vo = new ConflictOfInterestVO();
        CoiDisclosure coiDisclosure = disclosureDao.loadDisclosure(disclosureId);
        BeanUtils.copyProperties(coiDisclosure, coiDisclosureDto, "countryOfCitizenshipDetails", "countryDetails", "currency");
		boolean inEditMode = Set.of(Constants.COI_DISCLOSURE_REVIEW_STATUS_PENDING,
				Constants.COI_DISCLOSURE_STATUS_WITHDRAW, Constants.COI_DISCLOSURE_STATUS_RETURN)
				.contains(coiDisclosure.getReviewStatusCode());
        if (Objects.equals(coiDisclosure.getFcoiTypeCode(), PROJECT_DISCLOSURE_TYPE_CODE)) {
            List<DisclosureProjectDto> disclProjects = getDisclProjectsByDispStatus(disclosureId);
            vo.setProjectDetail(disclProjects.get(0));
        } else {
            if (inEditMode) {
                inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, Constants.DEFAULT_MODULE_ITEM_KEY, AuthenticatedUser.getLoginPersonId(),
                        Constants.INBOX_TRAVEL_DISCL_REIMBURSED_COST_LIMIT_EXCEEDED, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
                inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, coiDisclosure.getDisclosureId().toString(), AuthenticatedUser.getLoginPersonId(),
                        Constants.INBOX_FCOI_DISCLOSURE_REVISION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
                inboxDao.markReadMessage(Constants.COI_MODULE_CODE, coiDisclosure.getDisclosureId().toString(), AuthenticatedUser.getLoginPersonId(),
                        Constants.INBOX_FCOI_DISCLOSURE_REVISION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
            }
        }
        coiDisclosureDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(coiDisclosure.getUpdatedBy()));
        coiDisclosureDto.setAdminGroupName(coiDisclosure.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(coiDisclosure.getAdminGroupId()).getAdminGroupName() : null);
        coiDisclosureDto.setAdminPersonName(personDao.getPersonFullNameByPersonId(coiDisclosure.getAdminPersonId()));
        coiDisclosureDto.setCoiSectionsTypes(disclosureDao.fetchCoiSections());
        coiDisclosureDto.setPersonEntitiesCount(coiDao.getSFIOfDisclosureCount(ConflictOfInterestVO.builder().personId(coiDisclosure.getPersonId()).build()));
        coiDisclosureDto.setPersonAttachmentsCount(coiDao.personAttachmentsCount(coiDisclosure.getPersonId()));
        coiDisclosureDto.setPersonNotesCount(coiDao.personNotesCount(coiDisclosure.getPersonId()));
        coiDisclosureDto.setDisclosureAttachmentsCount(coiDao.disclosureAttachmentsCount(disclosureId));
        if (coiDisclosure.getSyncNeeded()) {
            disclosureDao.syncFCOIDisclosure(coiDisclosure.getDisclosureId(), coiDisclosure.getDisclosureNumber());
        }
        if(!AuthenticatedUser.getLoginPersonId().equals(coiDisclosure.getPersonId())) {
            coiDisclosureDto.setIsHomeUnitSubmission(coiDao.getIsHomeUnitSubmission(coiDisclosure.getDisclosureId(), Constants.COI_MODULE_CODE));
        }
        vo.setCoiDisclosure(coiDisclosureDto);
        return new ResponseEntity<>(vo, HttpStatus.OK);
    }

	@Override
    public List<DisclosureProjectDto> getDisclProjectsByDispStatus(Integer disclosureId) {
        CompletableFuture<List<CoiDisclEntProjDetailsDto>> disclosureDetailsFuture =
                CompletableFuture.supplyAsync(() -> disclosureDao.getDisclEntProjDetails(disclosureId));
        CompletableFuture<List<DisclosureProjectDto>> projectsFuture;
//      TODO: Define snapshot logic
//        if (disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_APPROVED, disclosureId)) {
//            projectsFuture = CompletableFuture.supplyAsync(() -> projectService.getDisclProjectDetailsFromSnapshot(disclosureId));
//        } else {
            projectsFuture = CompletableFuture.supplyAsync(() -> disclosureDao.getDisclosureProjects(disclosureId));
//        }
        CompletableFuture<Void> allOf = CompletableFuture.allOf( disclosureDetailsFuture, projectsFuture);
        List<DisclosureProjectDto> disclProjects;
        try {
            allOf.get();
            List<CoiConflictStatusType> disclConflictStatusTypes = disclosureDao.getCoiConflictStatusTypes();
            List<CoiDisclEntProjDetailsDto> disclProjEntRelations = disclosureDetailsFuture.get();
            disclProjects = projectsFuture.get();
            Map<Integer, List<CoiDisclEntProjDetailsDto>> disclEntityRelations = disclProjEntRelations.stream()
                    .collect(Collectors.groupingBy(CoiDisclEntProjDetailsDto::getCoiDisclProjectId));
            disclProjects.parallelStream().forEach(disclosureProject -> {
                List<CoiDisclEntProjDetailsDto> disclEntProjDetails = disclEntityRelations.get(disclosureProject.getCoiDisclProjectId());
                Map<String, Object> returnedObj = getRelationConflictCount(disclEntProjDetails, disclConflictStatusTypes);
                if(returnedObj.get("conflictStatus") != null) {
                    String conflictStatus = (String) returnedObj.get("conflictStatus");
                    disclosureProject.setConflictStatus(conflictStatus.isEmpty() ? null : conflictStatus);
                    disclosureProject.setConflictStatusCode(conflictStatus.isEmpty() ? null : returnedObj.get("conflictStatusCode").toString());
                }
            });
        } catch (Exception e) {
            throw new ApplicationException("Unable to fetch data", e, CoreConstants.JAVA_ERROR);
        }
        return disclProjects;
    }

    @Override
    public ResponseEntity<Object> certifyDisclosure(CoiDisclosureDto coiDisclosureDto) {
        CoiDisclosure coiDisclosureObj = disclosureDao.loadDisclosure(coiDisclosureDto.getDisclosureId());
        if (DISCLOSURE_REVIEW_IN_PROGRESS.equals(coiDisclosureObj.getReviewStatusCode()) 
        		|| SUBMITTED_FOR_REVIEW.equals(coiDisclosureObj.getReviewStatusCode()) 
        		|| Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED.equals(coiDisclosureObj.getReviewStatusCode()) 
        		|| Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED.equals(coiDisclosureObj.getReviewStatusCode())
        		|| Constants.COI_DISCLOSURE_REVIEW_STATUS_COMPLETED.equals(coiDisclosureObj.getReviewStatusCode())) {
            return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
        }
        checkDispositionStatusIsVoid(coiDisclosureObj.getDispositionStatusCode());
        setDisclosureReviewStatusCode(coiDisclosureDto, coiDisclosureObj);
        coiDisclosureDto.setDispositionStatusCode(DISPOSITION_STATUS_PENDING);
        Timestamp expirationTimestamp = Timestamp.valueOf(LocalDateTime.now().plusYears(1).minusDays(1));
        coiDisclosureDto.setExpirationDate(expirationTimestamp);

        String fcoiApprovalFlowType = commonDao.getParameterValueAsString(Constants.FCOI_APPROVAL_FLOW_TYPE);
        CoiDisclosureCommonDto  coiCommonDto = CoiDisclosureCommonDto.builder()
                .disclosureId(coiDisclosureDto.getDisclosureId())
                .build();
        Boolean hasRouteLog = false;
        if (fcoiApprovalFlowType != null && !List.of(Constants.ADMIN_REVIEW, Constants.NO_REVIEW).contains(fcoiApprovalFlowType)) {
            coiCommonDto = buildFCOIWorkflow(coiCommonDto, coiDisclosureObj.getFcoiTypeCode());
            if (coiCommonDto.getWorkflow() != null && coiCommonDto.getWorkflow().getWorkflowDetails() != null
                    && !coiCommonDto.getWorkflow().getWorkflowDetails().isEmpty()) {
                hasRouteLog = true;
                coiDisclosureDto.setReviewStatusCode(Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS);
                coiDisclosureDto.setDispositionStatus(null);
            }
        }

//        if (List.of(Constants.ROUTING_REVIEW, Constants.NO_REVIEW).contains(fcoiApprovalFlowType) && !hasRouteLog) {
//            coiDisclosureDto.setReviewStatusCode(Constants.OPA_DISCLOSURE_STATUS_COMPLETED);
//        }

        Timestamp certificationDate = disclosureDao.certifyDisclosure(coiDisclosureDto);
        List<CoiDisclProjects> coiDisclProject = disclosureDao.getCoiDisclProjects(coiDisclosureDto.getDisclosureId());
		List<String> moduleItemKeys = coiDisclProject.stream()
			    .filter(project -> project.getModuleCode().equals(Constants.AWARD_MODULE_CODE))
			    .map(CoiDisclProjects::getModuleItemKey)
			    .collect(Collectors.toList());
		projectDashboardService.updateAwardKPDisclosureRequirements(AwardPersonDTO.builder().projectNumbers(moduleItemKeys).keyPersonId(AuthenticatedUser.getLoginPersonId()).build());
        CoiConflictStatusTypeDto coiConflictStatusTypeDto = disclosureDao.validateConflicts(coiDisclosureDto.getDisclosureId());
        CoiRiskCategory riskCategory = null;
        if (coiDisclosureObj.getReviewStatusCode().equals(REVIEW_STATUS_PENDING)) {
            riskCategory = disclosureDao.syncDisclosureRisk(coiDisclosureObj.getDisclosureId(), coiDisclosureObj.getDisclosureNumber());
        }
        if (riskCategory == null) {
            coiDisclosureDto.setRiskCategoryCode(RISK_CATEGORY_LOW);
            disclosureDao.updateDisclosureRiskCategory(coiDisclosureDto);
        }
        String reporterFullName = AuthenticatedUser.getLoginUserFullName();

        ExecutorService executorService = Executors.newSingleThreadExecutor();
        executorService.submit(() -> {
            try {
                saveConflictHistory(coiDisclosureDto.getDisclosureId(), reporterFullName);
            } catch (Exception e) {
                e.printStackTrace();
                logger.error("Error in saveConflictHistory: {}", e.getMessage());
                exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
            }
        });
        executorService.shutdown();
        coiDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(coiDisclosureObj.getCreatedBy()));
        coiDisclosureDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId()));
        try {
            inboxActions(coiDisclosureObj.getReviewStatusCode().equals(REVIEW_STATUS_RETURNED), coiDisclosureObj, hasRouteLog);
            if (!hasRouteLog) {
				sentSubmitOrResubmitNotification(coiDisclosureObj,
						coiConflictStatusTypeDto != null ? coiConflictStatusTypeDto.getDescription() : null,
						certificationDate);
            }
            DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
					.actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_SUBMITTED)
					.disclosureId(coiDisclosureObj.getDisclosureId())
					.disclosureNumber(coiDisclosureObj.getDisclosureNumber())
					.riskCategory(riskCategory != null ? riskCategory.getDescription() : RISK_CATEGORY_LOW_DESCRIPTION)
					.fcoiTypeCode(coiDisclosureObj.getFcoiTypeCode()).reporter(AuthenticatedUser.getLoginUserFullName())
					.fcoiTypeDescription(coiDisclosureObj.getCoiDisclosureFcoiType().getDescription())
					.build();
            actionLogService.saveDisclosureActionLog(actionLogDto);
            
        } catch (Exception e) {
            logger.error("certifyDisclosure : {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
		coiService.updateOverallDisclosureStatus(coiDisclosureObj.getCoiProjectTypeCode(),
				coiDisclosureObj.getDisclosureId(), coiDisclosureObj.getFcoiTypeCode());
        if (!hasRouteLog) {
            triggerProjectSubmissionNotification(coiDisclosureDto.getDisclosureId());
        }
		inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, coiDisclosureDto.getDisclosureId().toString(),
				Constants.INBOX_FCOI_DISCLOSURE_REQUIRED);
		try {
			markPendingDisclosuresAsVoid(Constants.AWARD_MODULE_CODE.toString(), Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_REVISION);
		} catch (SQLException e) {
			logger.error("Error in markPendingDisclosuresAsVoid", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Void operation failed");
            error.put("reason", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>(coiDisclosureObj, HttpStatus.OK);
    }

	@Override
	public void sentSubmitOrResubmitNotification(CoiDisclosure coiDisclosureObj, String conflictStatus,
			Timestamp certificationDate) {
		Map<String, String> actionTypes = new HashMap<>();
		if ((coiDisclosureObj.getAdminGroupId() != null || coiDisclosureObj.getAdminPersonId() != null)) {
			actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_RESUBMIT);
			actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_RESUBMIT);
		} else {
			actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_SUBMIT);
			actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_SUBMIT);
		}
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.DISCLOSURE_STATUS, conflictStatus);
		additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
		additionalDetails.put(StaticPlaceholders.CERTIFICATION_DATE,
				commonDao.getDateFormat(certificationDate, CoreConstants.DEFAULT_DATE_FORMAT));
		coiService.processCoiMessageToQ(
				coiService.getDisclosureActionType(coiDisclosureObj.getFcoiTypeCode(), actionTypes),
				coiDisclosureObj.getDisclosureId(), null, additionalDetails, null, null);
	}

    private CoiDisclosureCommonDto buildFCOIWorkflow(CoiDisclosureCommonDto coiCommonDto, String fcoiTypeCode) {
    	Integer workflowStatus = null;
    	EvaluateValidationRuleVO evaluateValidationRuleVO = new EvaluateValidationRuleVO();
    	evaluateValidationRuleVO.setModuleCode(Constants.COI_MODULE_CODE);
    	evaluateValidationRuleVO.setSubModuleCode(Constants.COI_SUBMODULE_CODE);
    	evaluateValidationRuleVO.setModuleItemKey(coiCommonDto.getDisclosureId().toString());
    	evaluateValidationRuleVO.setLogginPersonId(AuthenticatedUser.getLoginPersonId());
    	evaluateValidationRuleVO.setUpdateUser(AuthenticatedUser.getLoginUserName());
    	evaluateValidationRuleVO.setSubModuleItemKey(CoreConstants.SUBMODULE_ITEM_KEY);
    	workflowStatus = businessRuleService.buildWorkFlow(evaluateValidationRuleVO);
    	if (workflowStatus == 1) {
    		coiCommonDto.setWorkflow(workflowDao.fetchActiveWorkflowByParams(coiCommonDto.getDisclosureId().toString(),
    						Constants.COI_MODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE));
    		Map<String, String> additionalDetails = new HashMap<>();
            String notificationTypeId;
            if (fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_FCOI) ||
                    fcoiTypeCode.equals(Constants.DISCLOSURE_TYPE_CODE_REVISION)) {
                notificationTypeId = Constants.NOTIFICATION_TYPE_ID_FCOI_DISCL_ROUTELOG_APPROVE;
            } else {
                notificationTypeId = Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_ROUTELOG_APPROVE;
            }
    		additionalDetails.put(StaticPlaceholders.notificationTypeId, notificationTypeId);
    		Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
    		if (coiCommonDto != null && coiCommonDto.getWorkflow() != null
    				&& coiCommonDto.getWorkflow().getWorkflowDetails() != null
    				&& !coiCommonDto.getWorkflow().getWorkflowDetails().isEmpty()) {
    			coiCommonDto.getWorkflow().getWorkflowDetails().stream()
    					.filter(workflowDetail -> workflowDetail != null)
    					.filter(workflowDetail -> FIRST_APPROVAL_STOP_NUMBER.equals(workflowDetail.getApprovalStopNumber()))
    					.forEach(matchingWorkflowDetail -> {
    						commonService.setNotificationRecipients(matchingWorkflowDetail.getApproverPersonId(),
    								CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
    						logger.info("Added approver: {}", matchingWorkflowDetail.getApproverPersonName());
    					});
    			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
    					commonDao.convertObjectToJSON(dynamicEmailrecipients));
    			String stopName = workflowService.getPlaceHolderDataForRouting(coiCommonDto.getApproverStopNumber(),
    					coiCommonDto.getWorkflow().getWorkflowDetails().get(0).getMapId(),
    					coiCommonDto.getWorkflow().getWorkflowDetails().get(0).getWorkflowDetailId());
    			additionalDetails.put(StaticPlaceholders.APPROVER_STOP_NAME, stopName != null ? stopName : " ");
                workflowCommonService.sendNotification(coiCommonDto.getDisclosureId(), additionalDetails, TriggerTypes.FCOI_ROUTELOG_APPROVE, Constants.COI_MODULE_CODE);
    		}
    	}
    	String isFinalApprover = businessRuleDao.workflowfinalApproval(evaluateValidationRuleVO.getModuleItemKey(), evaluateValidationRuleVO.getLogginPersonId(), evaluateValidationRuleVO.getModuleCode(), CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE);
    	Integer canApproveRouting = businessRuleDao.canApproveRouting(evaluateValidationRuleVO.getModuleItemKey(), evaluateValidationRuleVO.getLogginPersonId(), evaluateValidationRuleVO.getModuleCode(), CoreConstants.SUBMODULE_ITEM_KEY, Constants.COI_SUBMODULE_CODE);
    	coiCommonDto.setCanApproveRouting(canApproveRouting.toString());
    	coiCommonDto.setIsFinalApprover(isFinalApprover);
    	return coiCommonDto;
    }

    @Override
    public void triggerProjectSubmissionNotification(Integer disclosureId) {
		Map<String, String> additionalDetails = new HashMap<>();
		List<DisclosureProjectDto> disclProjects = disclosureDao.getAllSubmissionOrReviewDoneProjects(disclosureId, SUBMITTED_FOR_REVIEW);
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
				List<UnitAdministrator> unitAdmin = disclosureDao.getUnitAdministrators(OSP_UNIT_ADMIN_TYPE_CODE,
						project.getLeadUnitNumber());
				Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
				if (unitAdmin != null) {
					unitAdmin.forEach(admin -> commonService.setNotificationRecipients(admin.getPersonId(),
							CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients));
				}
				additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
						commonDao.convertObjectToJSON(dynamicEmailrecipients));
				coiService.processCoiMessageToQ(ActionTypes.PROJ_ALL_KP_DISCL_SUB_DONE,disclosureId,null,
						additionalDetails, null, null);
			}
		}
	}

    private void inboxActions(boolean isReturned, CoiDisclosure coiDisclosureObj, boolean hasRouteLog) {
    	if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(coiDisclosureObj.getFcoiTypeCode())
				|| Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(coiDisclosureObj.getFcoiTypeCode())) {
			if (isReturned) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
						coiDisclosureObj.getDisclosureId().toString(), Constants.INBOX_RETURN_FCOI_DISCLOSURE);
                if (!hasRouteLog) {
                    prepareInboxObject(coiDisclosureObj.getAdminGroupId(), coiDisclosureObj.getDisclosureId(),
                            coiDisclosureObj.getAdminPersonId(), coiDisclosureObj.getFcoiTypeCode(), null, coiDisclosureObj.getPersonId());
                }
			} else {
				if (Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(coiDisclosureObj.getFcoiTypeCode())) {
					CoiDisclosure dislcosure = disclosureDao.getPreviousDisclosureVersion(
							coiDisclosureObj.getDisclosureNumber(), coiDisclosureObj.getVersionNumber());
					inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
							dislcosure.getDisclosureId().toString(), Constants.INBOX_REVISE_FCOI_DISCLOSURE);
					inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
							coiDisclosureObj.getDisclosureId().toString(), Constants.INBOX_REVISE_FCOI_DISCLOSURE);
					inboxDao.markAsReadBasedOnParams(Constants.COI_MODULE_CODE, dislcosure.getDisclosureId().toString(),
                            Constants.INBOX_FCOI_DISCLOSURE_REQUEST_REVISION_OR_WITHDRAWAL);
				}
                if (!hasRouteLog) {
                    prepareInboxObject(coiDisclosureObj.getDisclosureId(), coiDisclosureObj.getFcoiTypeCode(), null, coiDisclosureObj.getPersonId());
                }
			}
		} else {
			if (isReturned) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
						coiDisclosureObj.getDisclosureId().toString(), Constants.INBOX_RETURN_PROJECT_DISCLOSURE);
                if (!hasRouteLog) {
                    prepareInboxObject(coiDisclosureObj.getAdminGroupId(), coiDisclosureObj.getDisclosureId(),
                            coiDisclosureObj.getAdminPersonId(), coiDisclosureObj.getFcoiTypeCode(), coiDisclosureObj.getCoiProjectType(), coiDisclosureObj.getPersonId());
                }
			} else {
				
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE,
						coiDisclosureObj.getDisclosureId().toString(), Constants.INBOX_PROPOSAL_DISCLOSURE_SUBMISSION);
                if (!hasRouteLog) {
                    prepareInboxObject(coiDisclosureObj.getDisclosureId(), coiDisclosureObj.getFcoiTypeCode(), coiDisclosureObj.getCoiProjectType(), coiDisclosureObj.getPersonId());
                }
            }
		}
	}

    @Override
	public void prepareInboxObject(Integer disclosureId, String fcoiTypeCode, CoiProjectType coiProjectType, String disclosureOwner) {
		StringBuilder userMessage = new StringBuilder();
		Set<String> personIds = new HashSet<>();
		if (Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
			List<CoiDisclProjects> coiDisclProject = disclosureDao.getCoiDisclProjects(disclosureId);
			List<DisclosureDetailDto> disclosureDetailDto = coiDao.getProjectsBasedOnParams(
					coiDisclProject.get(0).getModuleCode(), AuthenticatedUser.getLoginPersonId(), null,
					coiDisclProject.get(0).getModuleItemKey());
			userMessage.append("Project disclosure for ").append(coiProjectType.getDescription()).append(" : ")
					.append(disclosureDetailDto.get(0).getModuleItemKey()).append(" - ")
					.append(disclosureDetailDto.get(0).getTitle()).append(" of ")
					.append(personDao.getPersonFullNameByPersonId(disclosureOwner))
					.append(" submitted on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			personIds.addAll(personDao.getAdminPersonIdsByRightName(MANAGE_PROJECT_DISCLOSURE));
		} else {
			userMessage.append("COI disclosure of ")
					.append(personDao.getPersonFullNameByPersonId(disclosureOwner))
					.append(" submitted on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			personIds.addAll(personDao.getAdminPersonIdsByRightName(MANAGE_FCOI_DISCLOSURE));
		}
		personIds.forEach(personId -> {
			addToInbox(disclosureId.toString(), personId,
					Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode) ? Constants.INBOX_SUBMIT_PROJECT_DISCLOSURE
							: Constants.INBOX_SUBMIT_FCOI_DISCLOSURE,
					userMessage.toString(), AuthenticatedUser.getLoginUserName());
		});
	}

    private void setDisclosureReviewStatusCode(CoiDisclosureDto coiDisclosure, CoiDisclosure coiDisclosureObj) {
        String reviewStatusCode = coiDisclosureObj.getReviewStatusCode();
        if (reviewStatusCode.equals(REVIEW_STATUS_RETURNED)) {
            if (Boolean.TRUE.equals(disclosureDao.isReviewerAssigned(coiDisclosureObj.getDisclosureId()))) {
                if (Boolean.TRUE.equals(disclosureDao.isReviewerReviewCompleted(coiDisclosureObj.getDisclosureId()))) {
                    coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED);
                } else {
                    coiDisclosure.setReviewStatusCode(Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED);
                }
            } else if ((coiDisclosureObj.getAdminGroupId() != null || coiDisclosureObj.getAdminPersonId() != null)) {
                coiDisclosure.setReviewStatusCode(DISCLOSURE_REVIEW_IN_PROGRESS);
            }
        } else {
            coiDisclosure.setReviewStatusCode(SUBMITTED_FOR_REVIEW);
        }
    }

    private void saveConflictHistory(Integer disclosureId, String reporterFullName) {
        List<CoiDisclProjectEntityRel> projEntityRelationships = disclosureDao.getProjEntityRelationshipsByDisclId(disclosureId);
        ConflictOfInterestVO vo = new ConflictOfInterestVO();
        vo.setDisclosureId(disclosureId);
        vo.setReporterFullName(reporterFullName);
        projEntityRelationships.forEach(projEntityRel -> {
            CoiDisclProjectEntityRel coiDisclProjectEntityRel = new CoiDisclProjectEntityRel();
            BeanUtils.copyProperties(projEntityRel, coiDisclProjectEntityRel, "coiDisclProject", "personEntity", "coiEntity");
            vo.setCoiDisclEntProjDetail(coiDisclProjectEntityRel);
            saveOrUpdateCoiConflictHistory(vo, Constants.COI_DISCLOSURE_ACTION_LOG_ADD_CONFLICT_STATUS);
        });
    }

    private DisclosureActionLogDto saveOrUpdateCoiConflictHistory(ConflictOfInterestVO vo, String actionTypeCode) {
        CoiConflictHistory coiConflictHistory = new CoiConflictHistory();
        CoiDisclProjectEntityRel coiDisclEntProjDetails = vo.getCoiDisclEntProjDetail();
        String existingConflictStatus = disclosureDao.getLatestConflHisStatusCodeByProEntRelId(coiDisclEntProjDetails.getCoiDisclProjectEntityRelId());
        if (!coiDisclEntProjDetails.getProjectConflictStatusCode().equals(existingConflictStatus)) {
            coiConflictHistory.setConflictStatusCode(coiDisclEntProjDetails.getProjectConflictStatusCode());
            coiConflictHistory.setComment(coiDisclEntProjDetails.getProjectEngagementDetails());
            coiConflictHistory.setDisclosureId(vo.getDisclosureId());
            coiConflictHistory.setCoiDisclProjectEntityRelId(coiDisclEntProjDetails.getCoiDisclProjectEntityRelId());
            coiConflictHistory.setUpdatedBy(coiDisclEntProjDetails.getUpdatedBy());
            coiConflictHistory.setUpdateTimestamp(coiDisclEntProjDetails.getUpdateTimestamp());
            DisclosureActionLogDto actionLogDto = new DisclosureActionLogDto();
            actionLogDto.setActionTypeCode(actionTypeCode);
            actionLogDto.setNewConflictStatus(coiDisclEntProjDetails.getCoiProjConflictStatusType().getDescription());
            if (Constants.COI_DISCLOSURE_ACTION_LOG_ADD_CONFLICT_STATUS.equalsIgnoreCase(actionTypeCode)) {
                actionLogDto.setReporter(personDao.getPersonFullNameByPersonId(coiDisclEntProjDetails.getUpdatedBy()));
            } else {
                actionLogDto.setConflictStatus(coiDao.getCoiConflictStatusByStatusCode(existingConflictStatus));
                actionLogDto.setAdministratorName(vo.getReporterFullName() == null ? AuthenticatedUser.getLoginUserFullName() : vo.getReporterFullName());
            }
            coiConflictHistory.setMessage(actionLogService.getFormattedMessageByActionType(actionLogDto));
            disclosureDao.saveOrUpdateCoiConflictHistory(coiConflictHistory);
            actionLogDto.setComment(coiDisclEntProjDetails.getProjectEngagementDetails());
            return actionLogDto;
        }
        return null;
    }

    @Override
    public ResponseEntity<Object> modifyDisclosureRisk(CoiDisclosureDto disclosureDto) {
        if (disclosureDao.isDisclosureRiskAdded(disclosureDto)) {
            return new ResponseEntity<>("Risk is already updated", HttpStatus.METHOD_NOT_ALLOWED);
        } else if (disclosureDao.isDisclRequestedWithdrawal(disclosureDto.getDisclosureId())) {
            return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiDisclosure disclosure = disclosureDao.loadDisclosure(disclosureDto.getDisclosureId());
        checkDispositionStatusIsVoid(disclosure.getDispositionStatusCode());
        CoiRiskCategory risk = disclosureDao.getRiskCategoryStatusByCode(disclosureDto.getRiskCategoryCode());
        disclosureDto.setUpdateTimestamp(disclosureDao.updateDisclosureRiskCategory(disclosureDto));
		DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
				.disclosureId(disclosure.getDisclosureId()).disclosureNumber(disclosure.getDisclosureNumber())
				.riskCategory(disclosure.getCoiRiskCategory().getDescription())
				.riskCategoryCode(disclosure.getRiskCategoryCode())
                .newRiskCategory(risk.getDescription())
				.newRiskCategoryCode(risk.getRiskCategoryCode())
				.actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_MODIFY_RISK)
				.administratorName(AuthenticatedUser.getLoginUserFullName()).fcoiTypeCode(disclosure.getFcoiTypeCode())
				.revisionComment(disclosureDto.getRevisionComment())
				.fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
        actionLogService.saveDisclosureActionLog(actionLogDto);
        Map<String, String> actionTypes = new HashMap<>();
        Map<String, String> additionalDetails = new HashMap<>();
        actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_DISCL_RISK_MODIFY);
        actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_DISCL_RISK_MODIFY);
        additionalDetails.put(StaticPlaceholders.PREVIOUS_RISK, disclosure.getCoiRiskCategory().getDescription());
        additionalDetails.put(StaticPlaceholders.NEW_RISK, risk.getDescription());
        additionalDetails.put(StaticPlaceholders.RISK_MODIFIED_REASON, disclosureDto.getRevisionComment());
        additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
        coiService.processCoiMessageToQ(coiService.getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes), disclosure.getDisclosureId(), null, additionalDetails, null, null);

        return new ResponseEntity<>(disclosureDto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> fetchAllDisclosureRisk() {
        return new ResponseEntity<>(disclosureDao.fetchDisclosureRiskCategory(), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> fetchDisclosureHistory(DisclosureActionLogDto actionLogDto) {
        actionLogDto.setActionTypeCodes(Arrays.asList(Constants.COI_DISCLOSURE_ACTION_LOG_ADD_RISK, Constants.COI_DISCLOSURE_ACTION_LOG_MODIFY_RISK));
        return new ResponseEntity<>(actionLogService.fetchDisclosureActionLog(actionLogDto), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> checkDisclosureRiskStatus(CoiDisclosureDto disclosureDto) {
        if (Boolean.TRUE.equals(disclosureDao.isDisclosureRiskStatusModified(disclosureDto.getRiskCategoryCode(), disclosureDto.getDisclosureId()))) {
            return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
        } else if (disclosureDao.isDisclRequestedWithdrawal(disclosureDto.getDisclosureId())) {
            return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getDisclosureProjects(Integer disclosureId) {
        return new ResponseEntity<>(getDisclProjectsByDispStatus(disclosureId), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getDisclosureLookups() {
        ConflictOfInterestVO vo = new ConflictOfInterestVO();
        vo.setCoiConflictStatusTypes(disclosureDao.getCoiConflictStatusTypes());
        vo.setCoiProjConflictStatusTypes(disclosureDao.getProjConflictStatusTypes());
        return new ResponseEntity<>(vo, HttpStatus.OK);
    }

    @Override
    public List<DisclosureProjectDto> getDisclProjectEntityRelations(ProjectEntityRequestDto vo) {
        if (disclosureDao.isProjectSFISyncNeeded(vo.getDisclosureId())) {
            disclosureDao.syncFCOIDisclosure(vo.getDisclosureId(), vo.getDisclosureNumber());
        }
        if (!vo.getDispositionStatusCode().equals(Constants.COI_DISCL_DISPOSITION_STATUS_VOID) &&
                disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_VOID, vo.getDisclosureId())) {
            throw new ApplicationException("Disclosure is in void status!",CoreConstants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
        }
        CompletableFuture<List<CoiDisclEntProjDetailsDto>> disclosureDetailsFuture =
                CompletableFuture.supplyAsync(() -> disclosureDao.getDisclEntProjDetails(vo.getDisclosureId()));
        CompletableFuture<List<DisclosureProjectDto>> projectsFuture;
//      TODO: Define snapshot logic
//        if (disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_APPROVED, vo.getDisclosureId())) {
//            projectsFuture = CompletableFuture.supplyAsync(() -> projectService.getDisclProjectDetailsFromSnapshot(vo.getDisclosureId()));
//        } else {
            projectsFuture = CompletableFuture.supplyAsync(() -> disclosureDao.getDisclosureProjects(vo.getDisclosureId()));
//        }
        CompletableFuture<List<PersonEntityRelationshipDto>> personEntityRelationshipFuture =
                CompletableFuture.supplyAsync(() -> coiDao.getPersonEntities(vo.getDisclosureId(), vo.getPersonId(), null));
        CompletableFuture<Void> allOf = CompletableFuture.allOf(
                disclosureDetailsFuture, projectsFuture, personEntityRelationshipFuture
        );
        List<DisclosureProjectDto> disclProjects;
        try {
            allOf.get();
            List<CoiConflictStatusType> disclConflictStatusTypes = disclosureDao.getCoiConflictStatusTypes();
            List<CoiDisclEntProjDetailsDto> disclProjEntRelations = disclosureDetailsFuture.get();
            disclProjects = projectsFuture.get();
            List<PersonEntityRelationshipDto> disclPersonEntities = personEntityRelationshipFuture.get();
            for (CoiDisclEntProjDetailsDto projEntityDetail : disclProjEntRelations) {
                Optional<PersonEntityRelationshipDto> matchingProject = disclPersonEntities.stream()
                        .filter(personEntity -> personEntity.getPersonEntityId().equals(projEntityDetail.getPersonEntityId()))
                        .findFirst();
                matchingProject.ifPresent(projEntityDetail::setPersonEntity);
            }
            Map<Integer, List<CoiDisclEntProjDetailsDto>> disclEntityRelations = disclProjEntRelations.stream()
                    .collect(Collectors.groupingBy(CoiDisclEntProjDetailsDto::getCoiDisclProjectId));
            disclProjects.parallelStream().forEach(disclosureProject -> {
                List<CoiDisclEntProjDetailsDto> disclEntProjDetails = disclEntityRelations.get(disclosureProject.getCoiDisclProjectId());
                Map<String, Object> returnedObj = getRelationConflictCount(disclEntProjDetails, disclConflictStatusTypes);

                if(returnedObj.get("conflictStatus") != null) {
                    String conflictStatus = (String) returnedObj.get("conflictStatus");
                    disclosureProject.setConflictStatus(conflictStatus.isEmpty() ? null : conflictStatus);
                    disclosureProject.setConflictStatusCode(conflictStatus.isEmpty() ? null : returnedObj.get("conflictStatusCode").toString());
                }
                if ( returnedObj.get("conflictCount") != null) {
                    Map<Integer, Long> conflictCount = (Map<Integer, Long>) returnedObj.get("conflictCount");
                    if (conflictCount != null && !conflictCount.containsKey(0)) {
                        disclosureProject.setConflictCompleted(true);
                    }
                    conflictCount.remove(0);
                    disclosureProject.setConflictCount(conflictCount);
                }
                disclosureProject.setCoiDisclEntProjDetails(disclEntProjDetails);
            });
            List<String> moduleItemKeys = disclosureDao.getProjectNumbersBasedOnParam(vo.getDisclosureId(), AuthenticatedUser.getLoginPersonId());
            markInboxAwardDisclCreateMsgAsRead(null, null, null, AuthenticatedUser.getLoginPersonId(), null, moduleItemKeys);
            disclProjects.sort(Comparator.comparingInt(this::getConflictPriority));
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApplicationException("Unable to fetch data", e, CoreConstants.JAVA_ERROR);
        }
        return disclProjects;
    }

    private int getConflictPriority(DisclosureProjectDto project) {
		Map<Integer, Long> conflictCount = project.getConflictCount();
		Boolean conflictCompleted = project.getConflictCompleted();
		if (conflictCount == null || conflictCount.isEmpty()) {
			return 1;
		}
		boolean hasConflict = conflictCount.entrySet().stream().anyMatch(e -> e.getKey() != 0 && e.getValue() > 0);
		if (!hasConflict) {
			return 1;
		}
		if (Boolean.TRUE.equals(conflictCompleted)) {
			return 2;
		}
		return 0;
	}
    
    @Override
    public List<PersonEntityRelationshipDto> getDisclosureEntityRelations(ProjectEntityRequestDto vo) {
        if (!vo.getDispositionStatusCode().equals(Constants.COI_DISCL_DISPOSITION_STATUS_VOID) &&
                disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_VOID, vo.getDisclosureId())) {
            throw new ApplicationException("Disclosure is in void status!",CoreConstants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
        }
        CompletableFuture<List<CoiDisclEntProjDetailsDto>> disclosureDetailsFuture =
                CompletableFuture.supplyAsync(() -> disclosureDao.getDisclEntProjDetails(vo.getDisclosureId()));
        CompletableFuture<List<DisclosureProjectDto>> projectsFuture;
//      TODO: Define snapshot logic
//        if (disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_APPROVED, vo.getDisclosureId())){
//            projectsFuture = CompletableFuture.supplyAsync(() -> projectService.getDisclProjectDetailsFromSnapshot(vo.getDisclosureId()));
//        } else {
            projectsFuture = CompletableFuture.supplyAsync(() -> disclosureDao.getDisclosureProjects(vo.getDisclosureId()));
//        }
        CompletableFuture<List<PersonEntityRelationshipDto>> personEntityRelationshipFuture =
                CompletableFuture.supplyAsync(() -> coiDao.getPersonEntities(vo.getDisclosureId(), vo.getPersonId(), null));
        CompletableFuture<Void> allOf = CompletableFuture.allOf(
                disclosureDetailsFuture, projectsFuture, personEntityRelationshipFuture
        );
        List<PersonEntityRelationshipDto> disclPersonEntities;
        try {
            allOf.get();
            List<CoiConflictStatusType> disclConflictStatusTypes = disclosureDao.getCoiConflictStatusTypes();
            List<CoiDisclEntProjDetailsDto> disclProjEntRelations = disclosureDetailsFuture.get();
            List<DisclosureProjectDto> disclProjects = projectsFuture.get();
            disclPersonEntities = personEntityRelationshipFuture.get();
            for (CoiDisclEntProjDetailsDto projEntityDetail : disclProjEntRelations) {
                Optional<DisclosureProjectDto> matchingProject = disclProjects.stream()
                        .filter(project -> project.getCoiDisclProjectId().equals(projEntityDetail.getCoiDisclProjectId()))
                        .findFirst();
                matchingProject.ifPresent(projEntityDetail::setProject);
            }
            Map<Integer, List<CoiDisclEntProjDetailsDto>> disclEntityRelations = disclProjEntRelations.stream()
                    .collect(Collectors.groupingBy(CoiDisclEntProjDetailsDto::getPersonEntityId));
            disclPersonEntities.parallelStream().forEach(personEntityRelationshipDto -> {
                List<CoiDisclEntProjDetailsDto> disclEntProjDetails = disclEntityRelations.get(personEntityRelationshipDto.getPersonEntityId());

                Map<String, Object> returnedObj = getRelationConflictCount(disclEntProjDetails, disclConflictStatusTypes);
                if(returnedObj.get("conflictStatus") != null) {
                    String conflictStatus = (String) returnedObj.get("conflictStatus");
                    personEntityRelationshipDto.setConflictStatus(conflictStatus.isEmpty() ? null : conflictStatus);
                    personEntityRelationshipDto.setConflictStatusCode(conflictStatus.isEmpty() ? null : returnedObj.get("conflictStatusCode").toString());
                }
                if (returnedObj.get("conflictCount") != null) {
                    Map<Integer, Long> conflictCount = (Map<Integer, Long>) returnedObj.get("conflictCount");
                    if (!conflictCount.containsKey(0)) {
                        personEntityRelationshipDto.setConflictCompleted(true);
                    }
                    conflictCount.remove(0);
                    personEntityRelationshipDto.setConflictCount(conflictCount);
                }
                personEntityRelationshipDto.setProjEntRelations(disclEntProjDetails);
            });
        } catch (Exception e) {
            throw new ApplicationException("Unable to fetch data", e, CoreConstants.JAVA_ERROR);
        }
        return disclPersonEntities;
    }

    private static Map<String, Object> getRelationConflictCount(List<CoiDisclEntProjDetailsDto> disclEntProjDetails, List<CoiConflictStatusType> disclConflictStatusTypes) {
        if (disclEntProjDetails == null) {
            return Collections.EMPTY_MAP;
        }
        Map<String, Object> returnObj = new HashMap<>();
        Map<Integer, Long> conflictCount = disclEntProjDetails.stream().collect(Collectors.groupingBy(projectConflictStatus -> {
            if (projectConflictStatus.getProjectConflictStatusCode() != null
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) >= 100
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) < 200) {
                return 1;
            } else if (projectConflictStatus.getProjectConflictStatusCode() != null
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) >= 200
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) < 300) {
                return 2;
            } else if (projectConflictStatus.getProjectConflictStatusCode() != null
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) >= 300
                    && Integer.parseInt(projectConflictStatus.getProjectConflictStatusCode()) < 400) {
                return 3;
            } else return 0;
        }, Collectors.counting()));
        String conflictStatus = null;
        String conflictStatusCode = null;
        if (conflictCount.containsKey(3)) {
            Optional<CoiConflictStatusType> conflictObj = disclConflictStatusTypes.stream().filter(obj -> obj.getConflictStatusCode().equals("3")).findFirst();
            conflictStatusCode = conflictObj.get().getConflictStatusCode();
            conflictStatus = conflictObj.get().getDescription();
        } else if (conflictCount.containsKey(2)) {
            Optional<CoiConflictStatusType> conflictObj = disclConflictStatusTypes.stream().filter(obj -> obj.getConflictStatusCode().equals("2")).findFirst();
            conflictStatusCode = conflictObj.get().getConflictStatusCode();
            conflictStatus = conflictObj.get().getDescription();
        } else if (conflictCount.containsKey(1)) {
            Optional<CoiConflictStatusType> conflictObj = disclConflictStatusTypes.stream().filter(obj -> obj.getConflictStatusCode().equals("1")).findFirst();
            conflictStatusCode = conflictObj.get().getConflictStatusCode();
            conflictStatus = conflictObj.get().getDescription();
        }
        returnObj.put("conflictStatus", conflictStatus);
        returnObj.put("conflictCount", conflictCount);
        returnObj.put("conflictStatusCode", conflictStatusCode);
        return returnObj;
    }

    @Override
    public ResponseEntity<Object> saveDisclosureConflict(ProjectEntityRequestDto vo) {
        checkDispositionStatusIsVoid(vo.getDisclosureId());
        disclosureDao.saveOrUpdateCoiDisclEntProjDetails(vo);
        List<ProjectEntityRequestDto> projectEntityRequestDtos = new ArrayList<>();
        if (vo.getApplyAll()) {
            disclosureDao.fetchDisclProjectEntityRelIds(vo).forEach(obj -> {
                ProjectEntityRequestDto entityRequestDto = new ProjectEntityRequestDto();
                BeanUtils.copyProperties(vo, entityRequestDto);
                entityRequestDto.setCoiDisclProjectEntityRelId((Integer) obj[0]);
                projectEntityRequestDtos.add(entityRequestDto);
            });
        } else {
            projectEntityRequestDtos.add(vo);
        }
        Map<String, Object> responseObj = new HashMap<>();
        responseObj.put("disclConflictStatusType", disclosureDao.validateConflicts(vo.getDisclosureId()));
        responseObj.put("conflictDetails", projectEntityRequestDtos);
        responseObj.put("updateTimestamp", disclosureDao.updateDisclosureUpdateDetails(vo.getDisclosureId()));
        responseObj.put("updateUserFullName", AuthenticatedUser.getLoginUserFullName());
        return new ResponseEntity<>(responseObj, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> reviseDisclosure(ConflictOfInterestVO vo) {
        CoiDisclosure fcoiDisclosure = disclosureDao.isFCOIDisclosureExists(AuthenticatedUser.getLoginPersonId(), Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), Constants.COI_PENDING_STATUS);
        if (fcoiDisclosure != null) {
            CoiDisclosureDto coiDisclosureDto = new CoiDisclosureDto();
            BeanUtils.copyProperties(fcoiDisclosure, coiDisclosureDto);
            coiDisclosureDto.setHomeUnitName(fcoiDisclosure.getUnit() != null ? fcoiDisclosure.getUnit().getUnitName() : null);
            coiDisclosureDto.setReviewStatus(fcoiDisclosure.getCoiReviewStatusType() != null ? fcoiDisclosure.getCoiReviewStatusType().getDescription() : null);
            coiDisclosureDto.setDispositionStatus(fcoiDisclosure.getCoiDispositionStatusType() != null ? fcoiDisclosure.getCoiDispositionStatusType().getDescription() : null);
            coiDisclosureDto.setConflictStatus(fcoiDisclosure.getCoiConflictStatusType() != null ? fcoiDisclosure.getCoiConflictStatusType().getDescription() : null);
            coiDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(fcoiDisclosure.getCreatedBy()));
            coiDisclosureDto.setDisclosurePersonFullName(fcoiDisclosure.getPerson().getFullName());
            return new ResponseEntity<>(coiDisclosureDto, HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiDisclosure disclosure = disclosureDao.loadDisclosure(vo.getDisclosureId());
        if (!disclosure.getReviewStatusCode().equals("4")) {  // review status code 4 -> completed
            throw new ApplicationException("You are attempting to revise a pending version of disclosure. You can only have one revision at a time.", Constants.JAVA_ERROR);
        }
        CoiDisclosure copyDisclosure = new CoiDisclosure();
        copyDisclosure.setRevisionComment(vo.getRevisionComment());
        copyDisclosure.setHomeUnit(disclosure.getHomeUnit());
        copyDisclosure(disclosure, copyDisclosure);
        vo.setDisclosureId(copyDisclosure.getDisclosureId());
        copyDisclosureQuestionnaireData(disclosure, copyDisclosure);
        List<CoiDisclProjects> disclosureProjects = disclosureDao.syncFcoiDisclosureProjects(copyDisclosure.getDisclosureId(),
                copyDisclosure.getDisclosureNumber(), copyDisclosure.getPersonId());
        String engagementTypesNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
        List<SFIJsonDetailsDto> sfiDetails = disclosureDao.getPersonEntitiesByPersonId(copyDisclosure.getPersonId(), engagementTypesNeeded);
        boolean allowFCOIWithoutProjects = commonDao.getParameterValueAsBoolean("ALLOW_FCOI_WITHOUT_PROJECT");
        if (disclosureProjects.isEmpty() && !allowFCOIWithoutProjects) {
            throw new DisclosureValidationException("You don't have any projects to disclose/synced");
        }
		if (!disclosureProjects.isEmpty()) {
			try {
				String sfiJsonString = convertListToJson(sfiDetails);
				disclosureProjects.forEach(disclosureProject -> {
					logger.info("syncFcoiDisclProjectsAndEntities is executing for project id {}",
							disclosureProject.getCoiDisclProjectId());
					disclosureDao.syncFcoiDisclProjectsAndEntities(copyDisclosure.getDisclosureId(),
							copyDisclosure.getDisclosureNumber(), disclosureProject.getCoiDisclProjectId(),
							disclosureProject.getModuleCode(), disclosureProject.getModuleItemKey(), sfiJsonString,
							copyDisclosure.getPersonId());
				});
			} catch (Exception e) {
				logger.info("Unable to sync SFIs : {}", e.getMessage());
				throw new ApplicationException(e.getMessage(), e, CoreConstants.JAVA_ERROR);
			}
		}
        markInboxMsgAsRead(copyDisclosure, disclosureProjects);
        DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder()
				.actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_REVISED)
				.disclosureId(copyDisclosure.getDisclosureId()).disclosureNumber(copyDisclosure.getDisclosureNumber())
				.fcoiTypeCode(copyDisclosure.getFcoiTypeCode()).revisionComment(copyDisclosure.getRevisionComment())
				.reporter(AuthenticatedUser.getLoginUserFullName())
				.build();
        actionLogService.saveDisclosureActionLog(actionLogDto);
		coiService.updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosure.getDisclosureId(),
				disclosure.getFcoiTypeCode());
		return new ResponseEntity<>(vo, HttpStatus.OK);
    }

    private void markInboxMsgAsRead(CoiDisclosure copyDisclosure, List<CoiDisclProjects> disclosureProjects) {
    	markInboxAwardDisclCreateMsgAsRead(null, null, Constants.DISCLOSURE_TYPE_CODE_REVISION, copyDisclosure.getPersonId(), disclosureProjects, null);
        CoiDisclosure disclosure = disclosureDao.getPreviousDisclosureVersion(copyDisclosure.getDisclosureNumber(), copyDisclosure.getVersionNumber());
		inboxDao.markAsReadBasedOnParams(Constants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), Constants.INBOX_FCOI_DISCLOSURE_REQUEST_REVISION_OR_WITHDRAWAL);
		inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), Constants.INBOX_CREATE_DISCLOSURE);
		inboxDao.markReadMessage(Constants.COI_MODULE_CODE, Constants.DEFAULT_MODULE_ITEM_KEY, AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_CREATION,	CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
        inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, disclosure.getDisclosureId().toString(), AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_REVISION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
        inboxDao.markReadMessage(Constants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(), AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_REVISION, CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
    }

	private CoiDisclosure copyDisclosure(CoiDisclosure disclosure, CoiDisclosure copyDisclosure) {
        copyDisclosure.setFcoiTypeCode(Constants.DISCLOSURE_TYPE_CODE_REVISION);
        copyDisclosure.setDispositionStatusCode(DISPOSITION_STATUS_TYPE_CODE);
        copyDisclosure.setReviewStatusCode(REVIEW_STATUS_PENDING);
        copyDisclosure.setVersionStatus(Constants.COI_PENDING_STATUS);
        copyDisclosure.setSyncNeeded(true);
        copyDisclosure.setVersionNumber(disclosure.getVersionNumber() + 1);
        copyDisclosure.setPersonId(AuthenticatedUser.getLoginPersonId());
        copyDisclosure.setDisclosureNumber(disclosure.getDisclosureNumber());
        copyDisclosure.setCreatedBy(AuthenticatedUser.getLoginPersonId());
        copyDisclosure.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        return disclosureDao.saveOrUpdateCoiDisclosure(copyDisclosure);
    }

    private void copyDisclosureQuestionnaireData(CoiDisclosure disclosure, CoiDisclosure copyDisclosure) {
        List<Integer> submoduleCodes = new ArrayList<>();
        QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
        questionnaireDataBus.setActionPersonId(AuthenticatedUser.getLoginPersonId());
        questionnaireDataBus.setActionUserId(AuthenticatedUser.getLoginUserName());
        questionnaireDataBus.setModuleItemCode(Constants.COI_MODULE_CODE);
        questionnaireDataBus.setModuleItemKey(disclosure.getDisclosureId().toString());
        submoduleCodes.add(Constants.COI_SUBMODULE_CODE);
        questionnaireDataBus.getModuleSubItemCodes().addAll(submoduleCodes);
        questionnaireDataBus.setModuleSubItemKey("0");
        questionnaireDataBus.setCopyModuleItemKey(copyDisclosure.getDisclosureId().toString());
        questionnaireService.copyQuestionnaireForVersion(questionnaireDataBus, false);
    }

    @Override
    public boolean evaluateDisclosureQuestionnaire(ConflictOfInterestVO vo) {
        return disclosureDao.evaluateDisclosureQuestionnaire(vo.getModuleCode(), vo.getSubmoduleCode(), vo.getModuleItemId());
    }

    @Override
    public ResponseEntity<Object> updateProjectRelationship(ConflictOfInterestVO vo) {
        checkDispositionStatusIsVoid(vo.getDisclosureId());
        if (disclosureDao.isDisclEntProjConflictAdded(vo.getConflictStatusCode(), vo.getCoiDisclProjectEntityRelId())) {
            return new ResponseEntity<>("Conflict already updated", HttpStatus.METHOD_NOT_ALLOWED);
        } else if (disclosureDao.isDisclRequestedWithdrawal(vo.getDisclosureId())) {
            return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
        }
        ProjectRelationshipResponseDto projectRelationshipResponseDto = new ProjectRelationshipResponseDto();
        disclosureDao.updateCoiDisclEntProjDetails(vo.getConflictStatusCode(), vo.getCoiDisclProjectEntityRelId(), vo.getComment());
        projectRelationshipResponseDto.setUpdateTimestamp(disclosureDao.updateDisclosureUpdateDetails(vo.getDisclosureId()));
        projectRelationshipResponseDto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        vo.setCoiDisclEntProjDetail(disclosureDao.getCoiDisclProjectEntityRelById(vo.getCoiDisclProjectEntityRelId()));
        DisclosureActionLogDto actionLogDto = saveOrUpdateCoiConflictHistory(vo, Constants.COI_DISCLOSURE_ACTION_LOG_MODIFY_CONFLICT_STATUS);
        projectRelationshipResponseDto.setCoiConflictHistoryList(coiService.getCoiConflictHistory(vo.getCoiDisclProjectEntityRelId()));
        projectRelationshipResponseDto.setCoiConflictStatusTypeDto(disclosureDao.validateConflicts(vo.getDisclosureId()));
        if (actionLogDto != null) {
            Map<String, String> actionTypes = new HashMap<>();
            Map<String, String> additionalDetails = new HashMap<>();
            actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_DISCL_CONFLICT_MODIFY);
            actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_DISCL_CONFLICT_MODIFY);
            additionalDetails.put(StaticPlaceholders.PREVIOUS_DISCLOSURE_STATUS, actionLogDto.getConflictStatus());
            additionalDetails.put(StaticPlaceholders.NEW_DISCLOSURE_STATUS, actionLogDto.getNewConflictStatus());
            additionalDetails.put(StaticPlaceholders.DISCLOSURE_STATUS_MODIFY_REASON, vo.getComment());
            additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
            coiService.processCoiMessageToQ(coiService.getDisclosureActionType(disclosureDao.getDisclosureFcoiTypeCode(vo.getDisclosureId()), actionTypes), vo.getDisclosureId(), vo.getCoiDisclProjectEntityRelId(), additionalDetails, null, null);
        }
        return new ResponseEntity<>(projectRelationshipResponseDto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> validateConflicts(Integer disclosureId) {
        checkDispositionStatusIsVoid(disclosureId);
        CoiConflictStatusTypeDto statusCode = disclosureDao.validateConflicts(disclosureId);
        return new ResponseEntity<>(statusCode, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> validateDisclosure(CoiDisclosureDto disclosureDto) {
        Map<String, Object> validatedObject = disclosureDao.validateProjectDisclosure(disclosureDto.getPersonId(),
                disclosureDto.getModuleCode(), disclosureDto.getModuleItemKey());
        CoiDisclosureDto coiDisclosureDto = new CoiDisclosureDto();
        if (validatedObject.get("projectDisclosure") != null) {
            CoiDisclosure disclosure = disclosureDao.loadDisclosure((Integer) validatedObject.get("projectDisclosure"));
            BeanUtils.copyProperties(disclosure, coiDisclosureDto);
            coiDisclosureDto.setHomeUnitName(disclosure.getUnit() != null ? disclosure.getUnit().getUnitName() : null);
            coiDisclosureDto.setReviewStatus(disclosure.getCoiReviewStatusType() != null ? disclosure.getCoiReviewStatusType().getDescription() : null);
            coiDisclosureDto.setDispositionStatus(disclosure.getCoiDispositionStatusType() != null ? disclosure.getCoiDispositionStatusType().getDescription() : null);
            coiDisclosureDto.setConflictStatus(disclosure.getCoiConflictStatusType() != null ? disclosure.getCoiConflictStatusType().getDescription() : null);
            coiDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(disclosure.getCreatedBy()));
            coiDisclosureDto.setDisclosurePersonFullName(personDao.getPersonFullNameByPersonId(disclosure.getPersonId()));
            validatedObject.replace("projectDisclosure", coiDisclosureDto);
        }
        if (validatedObject.get("fcoiDisclosure") != null) {
            CoiDisclosure disclosure = disclosureDao.loadDisclosure((Integer) validatedObject.get("fcoiDisclosure"));
            BeanUtils.copyProperties(disclosure, coiDisclosureDto);
            coiDisclosureDto.setHomeUnitName(disclosure.getUnit() != null ? disclosure.getUnit().getUnitName() : null);
            coiDisclosureDto.setReviewStatus(disclosure.getCoiReviewStatusType() != null ? disclosure.getCoiReviewStatusType().getDescription() : null);
            coiDisclosureDto.setDispositionStatus(disclosure.getCoiDispositionStatusType() != null ? disclosure.getCoiDispositionStatusType().getDescription() : null);
            coiDisclosureDto.setConflictStatus(disclosure.getCoiConflictStatusType() != null ? disclosure.getCoiConflictStatusType().getDescription() : null);
            coiDisclosureDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(disclosure.getCreatedBy()));
            coiDisclosureDto.setDisclosurePersonFullName(personDao.getPersonFullNameByPersonId(disclosure.getPersonId()));
            validatedObject.replace("fcoiDisclosure", coiDisclosureDto);
        }
        return new ResponseEntity<>(validatedObject, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> assignDisclosureAdmin(CoiDisclosureDto dto) {
        checkDispositionStatusIsVoid(dto.getDisclosureId());
        if ((dto.getActionType().equals("R") && (disclosureDao.isSameAdminPersonOrGroupAdded(dto.getAdminGroupId(), dto.getAdminPersonId(), dto.getDisclosureId())))
                || (dto.getActionType().equals("A") && disclosureDao.isAdminPersonOrGroupAdded(dto.getDisclosureId()))) {
            return new ResponseEntity<>("Admin already assigned", HttpStatus.METHOD_NOT_ALLOWED);
        }
        CoiDisclosure disclosure = disclosureDao.loadDisclosure(dto.getDisclosureId());
        if ((dto.getActionType().equals("R"))
                && (disclosure.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_RETURN) || disclosure.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_COMPLETED))) {
            return new ResponseEntity<>("Reassign admin not allowed", HttpStatus.METHOD_NOT_ALLOWED);
        }
        if (dto.getActionType().equals("A") && !disclosure.getReviewStatusCode().equals(Constants.COI_DISCLOSURE_STATUS_SUBMITTED)) {
            return new ResponseEntity<>("Assign admin not allowed", HttpStatus.METHOD_NOT_ALLOWED);
        }
        try {
            saveAssignAdminActionLog(dto.getAdminPersonId(), dto.getDisclosureId(), disclosure);
        } catch (Exception e) {
            logger.error("assignDisclosureAdmin : {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
        dto.setUpdateTimestamp(disclosureDao.assignDisclosureAdmin(dto.getAdminGroupId(), dto.getAdminPersonId(), dto.getDisclosureId()));
        if (disclosure.getReviewStatusCode().equalsIgnoreCase(SUBMITTED_FOR_REVIEW)) {
            coiDao.updateReviewStatus(dto.getDisclosureId(), DISCLOSURE_REVIEW_IN_PROGRESS);
            dto.setReviewStatusCode(DISCLOSURE_REVIEW_IN_PROGRESS);
            dto.setReviewStatus(REVIEW_IN_PROGRESS);
        } else {
            dto.setReviewStatusCode(disclosure.getReviewStatusCode());
            dto.setReviewStatus(disclosure.getCoiReviewStatusType().getDescription());
        }
        Map<String, String> actionTypes = new HashMap<>();
        Map<String, String> additionalDetails = new HashMap<>();
        if (dto.getActionType().equals("A")) {
            actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_ASSIGN_ADMIN);
            actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_ASSIGN_ADMIN);
        } else {
			actionTypes.put(Constants.FCOI_DISCLOSURE, ActionTypes.FCOI_ADMIN_REMOVE);
			actionTypes.put(Constants.PROJECT_DISCLOSURE, ActionTypes.PROJECT_ADMIN_REMOVE);
			additionalDetails.put("NOTIFICATION_RECIPIENTS", disclosure.getAdminPersonId());
			additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME,
					personDao.getPersonFullNameByPersonId(disclosure.getAdminPersonId()));
		}
		additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_BY,
				personDao.getPersonFullNameByPersonId(AuthenticatedUser.getLoginPersonId()));
		additionalDetails.put(StaticPlaceholders.ADMIN_ASSIGNED_TO,
				personDao.getPersonFullNameByPersonId(dto.getAdminPersonId()));
		additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
		inboxActions(disclosure, dto);
		String actionType = null;
		actionType = coiService.getDisclosureActionType(disclosure.getFcoiTypeCode(), actionTypes);
		coiService.processCoiMessageToQ(actionType, disclosure.getDisclosureId(), null, additionalDetails, null, null);
		// Sends notification to the newly assigned admin after reassignment
		if (actionType == ActionTypes.FCOI_ADMIN_REMOVE || actionType == ActionTypes.PROJECT_ADMIN_REMOVE) {
			additionalDetails.remove(StaticPlaceholders.NOTIFICATION_RECIPIENTS);
			Set<NotificationRecipient> dynamicEmailRecipients = new HashSet<>();
			commonService.setNotificationRecipients(dto.getAdminPersonId(),
					CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailRecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailRecipients));
			if (actionType == ActionTypes.FCOI_ADMIN_REMOVE) {
				coiService.processCoiMessageToQ(ActionTypes.FCOI_REASSIGN_ADMIN, dto.getDisclosureId(), null,
						additionalDetails, Constants.COI_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
			} else {
				coiService.processCoiMessageToQ(ActionTypes.PROJECT_REASSIGN_ADMIN, dto.getDisclosureId(), null,
						additionalDetails, Constants.COI_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
			}
		}
        dto.setAdminGroupName(dto.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(dto.getAdminGroupId()).getAdminGroupName() : null);
        dto.setAdminPersonName(personDao.getPersonFullNameByPersonId(dto.getAdminPersonId()));
        dto.setConflictStatus(disclosure.getCoiConflictStatusType() != null ? disclosure.getCoiConflictStatusType().getDescription() : null);
        dto.setConflictStatusCode(disclosure.getConflictStatusCode());
        dto.setDispositionStatusCode(disclosure.getDispositionStatusCode());
        dto.setDispositionStatus(disclosure.getCoiDispositionStatusType().getDescription());
		coiService.updateOverallDisclosureStatus(disclosure.getCoiProjectTypeCode(), disclosure.getDisclosureId(),
				disclosure.getFcoiTypeCode());
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    private void inboxActions(CoiDisclosure disclosure, CoiDisclosureDto dto) {
		if (Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(disclosure.getFcoiTypeCode())
				|| Constants.DISCLOSURE_TYPE_CODE_REVISION.equals(disclosure.getFcoiTypeCode())) {
			if (ADMIN_REASSIGN.equals(dto.getActionType())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_ADMIN_ASSIGN_FCOI_DISCLOSURE);
			}
			if (ADMIN_ASSIGN.equals(dto.getActionType())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, dto.getDisclosureId().toString(),
						Constants.INBOX_SUBMIT_FCOI_DISCLOSURE);
			}
		} else {
			if (ADMIN_REASSIGN.equals(dto.getActionType())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, disclosure.getDisclosureId().toString(),
						Constants.INBOX_ADMIN_ASSIGN_PROJECT_DISCLOSURE);
			}
			if (ADMIN_ASSIGN.equals(dto.getActionType())) {
				inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, dto.getDisclosureId().toString(),
						Constants.INBOX_SUBMIT_PROJECT_DISCLOSURE);
			}
		}
		prepareInboxObject(dto.getAdminGroupId(), dto.getDisclosureId(), dto.getAdminPersonId(),
				disclosure.getFcoiTypeCode(), disclosure.getCoiProjectType(), disclosure.getPersonId());
	}

    @Override
	public void prepareInboxObject(Integer adminGroupId, Integer disclosureId, String adminPersonId, String fcoiTypeCode, CoiProjectType coiProjectType, String disclosureOwner) {
		StringBuilder userMessage = new StringBuilder();
		Set<String> personIds = new HashSet<>();
		if (adminPersonId != null) {
			personIds.add(adminPersonId);
		}
		if (Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
			List<CoiDisclProjects> coiDisclProject = disclosureDao.getCoiDisclProjects(disclosureId);
			List<DisclosureDetailDto> disclosureDetailDto = coiDao.getProjectsBasedOnParams(
					coiDisclProject.get(0).getModuleCode(), AuthenticatedUser.getLoginPersonId(), null,
					coiDisclProject.get(0).getModuleItemKey());
			userMessage.append("Project disclosure for ").append(coiProjectType.getDescription()).append(" : ")
					.append(disclosureDetailDto.get(0).getModuleItemKey()).append(" - ")
					.append(disclosureDetailDto.get(0).getTitle()).append(" of ")
					.append(personDao.getPersonFullNameByPersonId(disclosureOwner))
					.append(" submitted on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			if (adminGroupId != null) {
				personIds.addAll(personDao.getGroupAdminPersonIdsByRightName(MANAGE_PROJECT_DISCLOSURE, adminGroupId));
			}
		} else {
			userMessage.append("COI disclosure of ")
			.append(personDao.getPersonFullNameByPersonId(disclosureOwner))
			.append(" submitted on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
			if (adminGroupId != null) {
				personIds.addAll(personDao.getGroupAdminPersonIdsByRightName(MANAGE_FCOI_DISCLOSURE, adminGroupId));
			}
		}
		personIds.forEach(personId -> {
			addToInbox(disclosureId.toString(), personId,
					Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)
					? Constants.INBOX_ADMIN_ASSIGN_PROJECT_DISCLOSURE
					: Constants.INBOX_ADMIN_ASSIGN_FCOI_DISCLOSURE,
					userMessage.toString(), AuthenticatedUser.getLoginUserName());
		});
	}

    public void saveAssignAdminActionLog(String adminPersonId, Integer disclosureId, CoiDisclosure disclosure) {

        String oldAdminPerson = disclosure.getAdminPersonId() != null ? personDao.getPersonFullNameByPersonId(disclosure.getAdminPersonId()) : null;
        String newAdminPerson = personDao.getPersonFullNameByPersonId(adminPersonId);
        if (oldAdminPerson != null) {
            DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_REASSIGN_ADMIN)
                    .disclosureId(disclosureId)
                    .disclosureNumber(disclosure.getDisclosureNumber())
                    .oldAdmin(oldAdminPerson)
                    .coiAdmin(AuthenticatedUser.getLoginUserFullName())
                    .newAdmin(newAdminPerson)
                    .fcoiTypeCode(disclosure.getFcoiTypeCode())
                    .fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
            actionLogService.saveDisclosureActionLog(actionLogDto);
        } else {
            DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_ASSIGN_ADMIN)
                    .disclosureId(disclosureId)
                    .disclosureNumber(disclosure.getDisclosureNumber())
                    .coiAdmin(AuthenticatedUser.getLoginUserFullName())
                    .newAdmin(newAdminPerson)
                    .fcoiTypeCode(disclosure.getFcoiTypeCode())
                    .fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
            actionLogService.saveDisclosureActionLog(actionLogDto);
        }
    }

    @Override
    public void syncFCOIDisclosure(CoiDisclosureDto coiDisclosureDto) {
        checkDispositionStatusIsVoid(coiDisclosureDto.getDisclosureId());
        disclosureDao.syncFCOIDisclosure(coiDisclosureDto.getDisclosureId(),
                coiDisclosureDto.getDisclosureNumber());
    }

    @Override
	public ResponseEntity<Object> evaluateValidation(CoiDisclosureDto coiDisclosureDto) {
		try {

			checkDispositionStatusIsVoid(coiDisclosureDto.getDisclosureId());

			logger.info("Syncing FCOI Disclosure for disclosureId: {}, disclosureNumber: {}", coiDisclosureDto.getDisclosureId(), coiDisclosureDto.getDisclosureNumber());
			disclosureDao.syncFCOIDisclosure(coiDisclosureDto.getDisclosureId(), coiDisclosureDto.getDisclosureNumber());

			logger.info("Executing evaluateValidation on DAO for disclosureId: {}", coiDisclosureDto.getDisclosureId());
			Object response = disclosureDao.evaluateValidation(coiDisclosureDto);

			logger.info("Successfully evaluated validation for disclosureId: {}", coiDisclosureDto.getDisclosureId());
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (DataAccessException dae) {
			logger.error("Database error while evaluating disclosureId: {} - Error: {}", coiDisclosureDto.getDisclosureId(), dae.getMessage(), dae);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database error occurred");
		} catch (Exception ex) {
			logger.error("Unexpected error while evaluating disclosureId: {} - Error: {}", coiDisclosureDto.getDisclosureId(), ex.getMessage(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
		}
	}

    @Override
    public void updateFcoiDisclSyncNeedStatus(DisclosureProjectDto projectDto) {
        disclosureDao.updateFcoiDisclSyncNeedStatus(projectDto);
    }

    @Override
    public void detachFcoiDisclProject(DisclosureProjectDto projectDto) {
        disclosureDao.detachFcoiDisclProject(projectDto);
    }

    @Override
    public void makeDisclosureVoid(IntegrationRequestDto integrationRequestDto) {
    	List<MakeVoidDto> makeVoidDtoList = disclosureDao.makeDisclosureVoid(integrationRequestDto);
		if (!isBlank(integrationRequestDto.getActionType()) && makeVoidDtoList != null && !makeVoidDtoList.isEmpty()) {
			for (MakeVoidDto dto : makeVoidDtoList) {
				StringBuilder finalHtml = new StringBuilder();
			    finalHtml.append("<p><strong>Project:</strong> ")
			             .append(dto.getCoiProjectType() != null ? dto.getCoiProjectType() : "")
			             .append(": ")
			             .append(dto.getProjectNumber() != null ? dto.getProjectNumber() : "")
			             .append(" - ")
			             .append(dto.getProjectTitle() != null ? dto.getProjectTitle() : "")
			             .append("</p>");
				String htmlContent = finalHtml.toString();
				String projectType = "";
				if (integrationRequestDto.getModuleCode() == Constants.AWARD_MODULE_CODE) {
					projectType = Constants.PROJECT_TYPE_AWARD;
				} else if (integrationRequestDto.getModuleCode() == Constants.DEV_PROPOSAL_MODULE_CODE) {
					projectType = Constants.PROJECT_TYPE_PROPOSAL;
				}
				Set<NotificationRecipient> recipients = new HashSet<>();
		        commonService.setNotificationRecipients(dto.getReporterId(), CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, recipients);
		        // Build additional details map
		        Map<String, String> additionalDetails = new HashMap<>();
		        additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(recipients));
		        additionalDetails.put(StaticPlaceholders.notificationTypeId, Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_MARKED_AS_VOID);
		        additionalDetails.put(StaticPlaceholders.REPORTER_NAME, dto.getReporterName());
		        additionalDetails.put(StaticPlaceholders.PROJECT_TYPE, projectType);
		        additionalDetails.put(StaticPlaceholders.HTML_CONTENT, htmlContent);
		        additionalDetails.put(StaticPlaceholders.VOID_REASON, getReasonToMakeVoid(integrationRequestDto.getActionType()));
		        // Build message object
		        MessageQVO messageVO = new MessageQVO();
		        messageVO.setAdditionalDetails(additionalDetails);
		        messageVO.setTriggerType(TriggerTypes.NOTIFY_PROJECT_DISCLOSURE_MARKED_AS_VOID);
		        messageVO.setModuleCode(Constants.COI_MODULE_CODE);
		        messageVO.setSubModuleCode(Constants.COI_SUBMODULE_CODE);
		        messageVO.setOrginalModuleItemKey(0);
		        messageVO.setSubModuleItemKey(0);
		        messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
		        messageVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
		        messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
		        // Publish to queue
		        coiService.processCoiTriggerMessageToQ(messageVO);
			}
    	}
    }
    
    private String getReasonToMakeVoid(String actionType) {
    	if (Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_REVISION.equals(actionType)) 
    		return "(s) have been marked as void due to the creation of a new FCOI revision.";
    	else if (Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_ENG.equals(actionType)) 
    		return "(s) have been marked as void due to a new FCOI revision required based on engagement with an SFI";
    	else if (Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_QUEST.equals(actionType)) 
    		return "(s) have been marked as void due to the Proposal Certification questionnaire response not meeting the COI disclosure requirements.";
    	else if (Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_PRJCT_CLOSED.equals(actionType)) 
    		return " disclosure(s) has been marked as void due to the associated project being deactivated or closed.";
    	else if(Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_KEY_PRSN_REMVL.equals(actionType)) 
    		return " disclosure(s) has been marked as void due to the key person being removed from the associated project.";
    	else if (Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_KEY_PRSN_ROLE.equals(actionType))  
    		return " disclosure(s) has been marked as void due to a change in the key person’s role.";
    	else
    		return "";
    }

    @Override
    public void checkDispositionStatusIsVoid(String dispositionStatusCode) {
        if (dispositionStatusCode.equals(Constants.COI_DISCL_DISPOSITION_STATUS_VOID)) {
            throwVoidException();
        }
    }

    @Override
    public void checkDispositionStatusIsVoid(Integer disclosureId) {
        if (disclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_VOID, disclosureId)) {
            throwVoidException();
        }
    }

    private void throwVoidException() {
        throw new ApplicationException("Disclosure is in void status!",CoreConstants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @Override
	public void notifyUserCreateDisclosure(IntegrationNotificationRequestDto vo) {
		vo.getPersonIds().stream().forEach(personId -> {
			Boolean checkIfUserCanNotified = disclosureDao.canNotifyUserForCreateAwardDisclosure(personId, vo.getModuleCode(), vo.getSubModuleCode(), vo.getModuleItemKey(), vo.getSubModuleItemKey());
			if (Boolean.TRUE.equals(checkIfUserCanNotified)) {
				Person person = personDao.getPersonDetailById(personId);
				if (person == null) {
					logger.warn("Person not found for personId: {}", personId);
					return;
				}
				IntegrationNotificationRequestDto notifyVO = new IntegrationNotificationRequestDto();
				notifyVO = disclosureDao.getAwardForNotifyDisclosureCreation(vo, personId);
				prepareAndSendUserNotification(vo.getModuleCode(), vo.getSubModuleCode(), notifyVO, personId, person);
			}
		});
	}

    @Override
	public void prepareAndSendUserNotification(Integer moduleCode, Integer subModuleCode, IntegrationNotificationRequestDto notifyVO, String personId, Person person) {
		if (notifyVO.getModuleItemKey() != null) {
			MessageQVO messageVO = new MessageQVO();
			messageVO.setTriggerType(TriggerTypes.NOTIFY_DISCLOSURE_CREATION);
			messageVO.setModuleCode(moduleCode);
			messageVO.setSubModuleCode(subModuleCode);
			messageVO.setOrginalModuleItemKey(notifyVO.getModuleItemId());
			messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
			messageVO.setAdditionalDetails(getPlaceHolders(notifyVO, person.getFullName(), personId));
			messageVO.setPublishedUserName(person.getPrincipalName());
			messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
			if (!coiDao.isDisclosureActionlistSent(Arrays.asList(Constants.INBOX_CREATE_DISCLOSURE), Constants.COI_MODULE_CODE, notifyVO.getModuleItemKey(), personId)) {
				prepareInboxDetails(personId, notifyVO, person.getPrincipalName());
			}
			coiService.processCoiTriggerMessageToQ(messageVO);
		}
	}

	private void prepareInboxDetails(String personId, IntegrationNotificationRequestDto vo, String personName) {
		CoiDisclosure fcoiDisclosure = disclosureDao.isFCOIDisclosureExists(personId, Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), Constants.COI_PENDING_STATUS);
		StringBuilder userMessage = new StringBuilder();
		String message = fcoiDisclosure != null ? "Create Project / Revise disclosure for Project Details : " : "Create Initial / Project disclosure for Project Details : ";
		userMessage.append(message).append("#").append(vo.getModuleItemKey()).append(" : ").append(vo.getTitle());
    	addToInbox(vo.getModuleItemKey(), personId, Constants.INBOX_CREATE_DISCLOSURE, userMessage.toString(), personName);

	}

	private Map<String, String> getPlaceHolders(IntegrationNotificationRequestDto vo, String personName, String personId) {
		Map<String, String> placeHolders = new HashMap<>();
    	placeHolders.put(Constants.NOTIFICATION_RECIPIENTS, personId);
    	placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.DISCLOSURE_CREATION_NOTIFICATION_TYPE_ID);
    	placeHolders.put(StaticPlaceholders.PROJECT_PERSON_NAME, personName != null ? personName : "");
    	placeHolders.put(StaticPlaceholders.PROJECT_TITLE, vo.getTitle() != null ? vo.getTitle() : "");
    	placeHolders.put(StaticPlaceholders.PROJECT_MODULE_ITEM_KEY, vo.getModuleItemKey() != null ? vo.getModuleItemKey() : "");
    	placeHolders.put(StaticPlaceholders.DEPARTMENT_NUMBER, vo.getUnitNumber() != null ? vo.getUnitNumber() : "");
    	placeHolders.put(StaticPlaceholders.DEPARTMENT_NAME, vo.getUnitName() != null ? vo.getUnitName() : "");
    	placeHolders.put(StaticPlaceholders.PROJECT_TYPE, vo.getProjectType() != null ? vo.getProjectType() : "");
    	placeHolders.put(StaticPlaceholders.PROJECT_STATUS, vo.getProjectStatus() != null ? vo.getProjectStatus() : "");
		return placeHolders;
	}

	@Override
	public void addExpiredFcoiDisclosuresToInbox(Integer daysToDueDate) {
		List<Map<Integer, String>> expiredDisclosures = disclosureDao.getExpiredFcoiDisclosures(daysToDueDate);
		Set<String> existingDisclosures = new HashSet<>(disclosureDao.getExpiredInboxFcoiDisclosureIds());

		expiredDisclosures.removeIf(disclosureMap -> disclosureMap.keySet().stream()
				.anyMatch(id -> existingDisclosures.contains(String.valueOf(id))));

		String messagePrefix = (daysToDueDate != null)
				? "COI disclosure will expire in " + daysToDueDate + " days on "
				: "COI disclosure Expired on ";

		String formattedDate = commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT);
		String userMessage = messagePrefix + formattedDate;

		expiredDisclosures.forEach(
				disclosureMap -> disclosureMap.forEach((disclosureId, personId) -> addToInbox(disclosureId.toString(),
						personId, Constants.INBOX_REVISE_FCOI_DISCLOSURE, userMessage, "System")));
	}

	@Override
	public void addToInbox(String moduleItemKey, String personId, String messageTypeCode, String userMessage, String updateUser) {
		Inbox inbox = new Inbox();
		inbox.setModuleCode(CoreConstants.COI_MODULE_CODE);
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

    private void markInboxAwardDisclCreateMsgAsRead(String moduleItemKey, Integer moduleCode, String fcoiTypeCode, String personId, List<CoiDisclProjects> disclosureProjects, List<String> awardNumbers) {
    	List<String> effectiveAwardNumbers = prepareAwardNumbersForMarkAsRead(awardNumbers, moduleCode, moduleItemKey, fcoiTypeCode, disclosureProjects);
    	effectiveAwardNumbers.forEach(awardNumber -> {
            List<String> selectedAwards = disclosureDao.markReadMessageForDisclosureCreation(awardNumber, personId, Constants.INBOX_CREATE_DISCLOSURE, fcoiTypeCode);
            if (Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
            	selectedAwards.add(moduleItemKey);
            }
            selectedAwards.forEach(selectedAwardNumber ->
                inboxDao.markReadMessage(Constants.COI_MODULE_CODE, selectedAwardNumber, personId, Constants.INBOX_CREATE_DISCLOSURE, Constants.COI_SUBMODULE_CODE.toString(), Integer.parseInt(CoreConstants.SUBMODULE_ITEM_KEY))
            );
        });
    }

	private List<String> prepareAwardNumbersForMarkAsRead(List<String> awardNumbers, Integer moduleCode, String moduleItemKey,
			String fcoiTypeCode, List<CoiDisclProjects> disclosureProjects) {
		List<String> effectiveAwardNumbers = (awardNumbers != null) ? new ArrayList<>(awardNumbers) : new ArrayList<>();
    	if (Constants.AWARD_MODULE_CODE.equals(moduleCode) && Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
            effectiveAwardNumbers.add(moduleItemKey);
        } else if (disclosureProjects != null) {
            effectiveAwardNumbers.addAll(
                disclosureProjects.stream()
                    .filter(project -> Constants.AWARD_MODULE_CODE.equals(project.getModuleCode()))
                    .map(CoiDisclProjects::getModuleItemKey)
                    .collect(Collectors.toList())
            );
        }
    	return effectiveAwardNumbers;
	}


    @Override
    public ResponseEntity<Object> requestWithdrawal(ConflictOfInterestVO vo) {
        if (disclosureDao.isDisclRequestedWithdrawal(vo.getDisclosureId())) {
            return new ResponseEntity<>("Disclosure is requested for Recall", HttpStatus.METHOD_NOT_ALLOWED);
        }
        disclosureDao.updateRequestForWithdrawal(vo.getDisclosureId(), Boolean.TRUE, vo.getDescription());
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.WITHDRAWAL_REASON, vo.getDescription());
        additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
        coiService.processCoiMessageToQ(ActionTypes.FCOI_REQUEST_WITHDRAWAL, vo.getDisclosureId(), null, additionalDetails, null, null);
        CoiDisclosure disclosure = disclosureDao.loadDisclosure(vo.getDisclosureId());
        DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DIS_ACTION_LOG_REQUEST_WITHDRAWAL)
                .disclosureId(disclosure.getDisclosureId())
                .disclosureNumber(disclosure.getDisclosureNumber())
                .reporter(AuthenticatedUser.getLoginUserFullName())
                .revisionComment(vo.getDescription())
                .fcoiTypeCode(disclosure.getFcoiTypeCode())
                .fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
        addToInbox(vo.getDisclosureId().toString(), disclosure.getAdminPersonId(),Constants.INBOX_FCOI_DISCLOSURE_REQUEST_WITHDRAWAL, prepareWithdrawalMessage(disclosure, WITHDRAWAL_MESSAGE_ACTION), "System");
        actionLogService.saveDisclosureActionLog(actionLogDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> denyRequestWithdrawal(ConflictOfInterestVO vo) {
        if (!disclosureDao.isDisclRequestedWithdrawal(vo.getDisclosureId())) {
            return new ResponseEntity<>("Disclosure requested for Recall is already denied ", HttpStatus.METHOD_NOT_ALLOWED);
        }
        disclosureDao.updateRequestForWithdrawal(vo.getDisclosureId(), Boolean.FALSE, vo.getDescription());
        inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, vo.getDisclosureId().toString(), Constants.INBOX_FCOI_DISCLOSURE_REQUEST_WITHDRAWAL);
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.DECLINE_REASON, vo.getDescription());
        additionalDetails.put(StaticPlaceholders.UPDATED_USER_FULL_NAME, AuthenticatedUser.getLoginUserFullName());
        coiService.processCoiMessageToQ(ActionTypes.FCOI_REQ_WITHDRAWAL_DENY, vo.getDisclosureId(), null, additionalDetails, null, null);
        CoiDisclosure disclosure = disclosureDao.loadDisclosure(vo.getDisclosureId());
        DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DIS_ACTION_LOG_REQUEST_WITHDRAWAL_DENY)
                .disclosureId(vo.getDisclosureId())
                .disclosureNumber(vo.getDisclosureNumber())
                .administratorName(AuthenticatedUser.getLoginUserFullName())
                .revisionComment(vo.getDescription())
                .fcoiTypeCode(disclosure.getFcoiTypeCode())
                .fcoiTypeDescription(disclosure.getCoiDisclosureFcoiType().getDescription()).build();
        actionLogService.saveDisclosureActionLog(actionLogDto);
//        Commented below code to disable the action list entry when an admin deny recall request
//        coiDao.getCoiReview(vo.getDisclosureId()).forEach(coiReview -> {
//            if (coiReview.getAssigneePersonId() != null) {
//                addToInbox(vo.getDisclosureId().toString(), coiReview.getAssigneePersonId(),Constants.INBOX_FCOI_DISCLOSURE_REQUEST_WITHDRAWAL_DENY, prepareWithdrawalMessage(disclosure, WITHDRAWAL_DENY_MESSAGE_ACTION), "System");
//            }
//        });
//        addToInbox(vo.getDisclosureId().toString(), disclosure.getPersonId(),Constants.INBOX_FCOI_DISCLOSURE_REQUEST_WITHDRAWAL_DENY, prepareWithdrawalMessage(disclosure, WITHDRAWAL_DENY_MESSAGE_ACTION), "System");
        inboxDao.markAsReadBasedOnParams(CoreConstants.COI_MODULE_CODE, vo.getDisclosureId().toString(), Constants.INBOX_FCOI_DISCLOSURE_WITHDRAWAL);
        return new ResponseEntity<>(HttpStatus.OK);
    }

	private String prepareWithdrawalMessage(CoiDisclosure disclosure, String messageActionType) {
		StringBuilder message = new StringBuilder();
        if (Constants.FCOI_TYPE_CODE_PROJECT.equals(disclosure.getFcoiTypeCode())) {
        	List<CoiDisclProjects> coiDisclProject = disclosureDao.getCoiDisclProjects(disclosure.getDisclosureId());
			List<DisclosureDetailDto> disclosureDetailDto = coiDao.getProjectsBasedOnParams(
					coiDisclProject.get(0).getModuleCode(), AuthenticatedUser.getLoginPersonId(), null,
					coiDisclProject.get(0).getModuleItemKey());
			message.append("Project Disclosure for ").append(disclosure.getCoiProjectType().getDescription()).append(" : ")
					.append(disclosureDetailDto.get(0).getModuleItemKey()).append(" - ")
					.append(disclosureDetailDto.get(0).getTitle()).append(messageActionType)
					.append(AuthenticatedUser.getLoginUserFullName())
					.append(" on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
        } else {
        	String fcoiType = Constants.DISCLOSURE_TYPE_CODE_FCOI.equals(disclosure.getFcoiTypeCode()) ? INTIAL_DISCLOSURE : REVISION_DISCLOSURE;
        	message.append(fcoiType).append(messageActionType).append(AuthenticatedUser.getLoginUserFullName())
        	.append(" on ").append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
        }
        return message.toString();
	}

	@Override
	public ResponseEntity<Object> markProjectDisclosureAsVoid(Integer moduleCode) {
	    String loginPersonId = AuthenticatedUser.getLoginPersonId();
	    if (Constants.AWARD_MODULE_CODE.equals(moduleCode)) {
	        List<String> awardNumbers = disclosureDao.getProjectDisclosuresForMarkAsVoid(loginPersonId, moduleCode);
	        awardNumbers.forEach(awardNumber -> {
	            IntegrationRequestDto request = new IntegrationRequestDto();
	            request.setModuleCode(moduleCode);
	            request.setModuleItemKey(awardNumber);
	            request.setPersonId(loginPersonId);
	            request.setRemark("A financial relationship has been marked against your newly created engagement. The current award disclosure will be marked as void and removed from your disclosure list.");
	            disclosureDao.makeDisclosureVoid(request);
	        });
	    } else if (moduleCode == null){
	    	Map<String, List<String>> moduleProjectPairs = disclosureDao.getProjectDisclosuresForMarkAsVoid(loginPersonId);
	    	moduleProjectPairs.forEach((code, itemKeys) -> {
	    	    itemKeys.forEach(itemKey -> {
	    	        IntegrationRequestDto request = new IntegrationRequestDto();
	    	        request.setModuleCode(Integer.parseInt(code));
	    	        request.setModuleItemKey(itemKey);
	    	        request.setPersonId(loginPersonId);
	    	        request.setRemark("A new engagement has been created. The current project disclosure will be marked as void and removed from your disclosure list.");
	    	        disclosureDao.makeDisclosureVoid(request);
	    	    });
	    	});
	    }
	    return new ResponseEntity<>(HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getProjectDisclosures(Integer moduleCode) {
	    String loginPersonId = AuthenticatedUser.getLoginPersonId();
	    Object result;
	    if (Constants.AWARD_MODULE_CODE.equals(moduleCode)) {
	        List<String> projectNumbers = disclosureDao.getProjectDisclosuresForMarkAsVoid(loginPersonId, moduleCode);
	        result = !projectNumbers.isEmpty();
	    } else {
	        Map<String, List<String>> moduleProjectPairs = disclosureDao.getProjectDisclosuresForMarkAsVoid(loginPersonId);
	        result = !moduleProjectPairs.isEmpty();
	    }
	    return new ResponseEntity<>(result, HttpStatus.OK);
	}

	@Override
	public Boolean isDisclosureSynced(Integer disclosureId, String documentOwnerId) {
		return disclosureDao.isDisclosureSynced(disclosureId, documentOwnerId, commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE));
	}

	@Override
	public void deleteUserInboxForDisclosureCreation(IntegrationNotificationRequestDto vo) {
	    Set<String> inactivePersonIds = new HashSet<>();
	    if (vo.getInactivePersonIds() != null) {
	        inactivePersonIds.addAll(vo.getInactivePersonIds());
	    }
	    // List of persons when award becomes closed/inactive
	    if (vo.getPersonIds() != null) { 
	        inactivePersonIds.addAll(vo.getPersonIds());
	    }
	    inactivePersonIds.forEach(personId -> {
	    	inboxDao.updateInboxOpenedFlag(CoreConstants.COI_MODULE_CODE, vo.getModuleItemKey(), personId, CoreConstants.EXPIRED, CoreConstants.SUBMODULE_CODE.toString(), CoreConstants.SUBMODULE_ITEM_KEY.toString());
	    });
	}

	@Override
	public void notifyUserBasedOnAwardHierarchy(IntegrationNotificationRequestDto vo) {
	    vo.getInactivePersonIds().forEach(personId -> {
	        IntegrationNotificationRequestDto notifyVO = disclosureDao.getAwardForNotifyDisclosureCreation(vo, personId);
	        if (notifyVO.getModuleItemKey() != null) {
	        	Boolean canNotify = disclosureDao.canNotifyUserForCreateAwardDisclosure(personId, vo.getModuleCode(), vo.getSubModuleCode(), notifyVO.getModuleItemKey(), vo.getSubModuleItemKey());
	        		if (canNotify) {
	    	            Person person = personDao.getPersonDetailById(personId);
	    	            if (person == null) {
	    	                logger.warn("Person not found for personId: {}", personId);
	    	                return;
	    	            }
	    	            prepareAndSendUserNotification(vo.getModuleCode(), vo.getSubModuleCode(), notifyVO, personId, person);
	    	        }
	        }
	    });
	}

	@Override
	public void notifyUserForDisclSubmission(ProposalIntegrationNotifiyDto vo) {
		StringBuilder userMessage = new StringBuilder();
		Person person = personDao.getPersonDetailById(vo.getPersonId());
		if (person == null) {
			logger.warn("Person not found for personId: {}", vo.getPersonId());
			return;
		}
		userMessage.append("Project disclosure for Development proposal : ").append(vo.getModuleItemKey()).append(" - ")
				.append(vo.getTitle()).append(vo.getTitle()).append(" of ").append(person.getFullName())
				.append(" waiting for your submission created on ")
				.append(commonDao.getDateFormat(new Date(),CoreConstants.DEFAULT_DATE_FORMAT));
		addToInbox(vo.getDisclosureId().toString(), vo.getPersonId(), Constants.INBOX_PROPOSAL_DISCLOSURE_SUBMISSION,
				userMessage.toString(), person.getPrincipalName());
		MessageQVO messageVO = new MessageQVO();
		messageVO.setTriggerType(TriggerTypes.NOTIFY_DISCLOSURE_SUBMISSION);
		messageVO.setModuleCode(vo.getModuleCode());
		messageVO.setSubModuleCode(vo.getSubModuleCode());
		messageVO.setOrginalModuleItemKey(vo.getDisclosureId());
		messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
		messageVO.setAdditionalDetails(getPlaceHolders(vo, person.getFullName(), vo.getPersonId()));
		messageVO.setPublishedUserName(person.getPrincipalName());
		messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
		coiService.processCoiTriggerMessageToQ(messageVO);
	}

	private Map<String, String> getPlaceHolders(ProposalIntegrationNotifiyDto vo, String personName, String personId) {
		Map<String, String> placeHolders = new HashMap<>();
		placeHolders.put(Constants.NOTIFICATION_RECIPIENTS, personId);
		placeHolders.put(Constants.NOTIFICATION_TYPE_ID, Constants.DISCLOSURE_SUBMISSION_NOTIFICATION_TYPE_ID);
		return placeHolders;
	}

	@Override
	public ResponseEntity<Object> checkFinancialEngagementCreated(String loginPersonId) {
		String engagementTypesNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
		Boolean isNewEngagementCreated = disclosureDao.checkIfNewEngagementCreated(loginPersonId, engagementTypesNeeded);
		if (Boolean.TRUE.equals(isNewEngagementCreated)) {
			String message;
		    if (Constants.ALL_ENGAGEMENT.equals(engagementTypesNeeded)) {
		        message = "An engagement has been created. Please create a COI initial disclosure or revise your existing COI disclosure.";
		    } else if (Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypesNeeded)) {
		        message = "An engagement with a Significant Financial Interest (SFI) has been created. Please create an FCOI initial disclosure or revise your existing FCOI disclosure.";
		    } else {
		        message = "An engagement with a financial relationship has been created. Please create a COI initial disclosure or revise your existing COI disclosure.";
		    }
		    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(message);
		}
		return ResponseEntity.ok("No new financial engagement detected.");
	}

	@Override
	public List<DisclosureProjectDto> getExtendedDisclProjectEntityRelations(ProjectEntityRequestDto vo) {
		List<ProjectEntityRequestDto> projectEntityRequestDtos = disclosureDao.getDisclosureExtendingProjectDetails(vo.getDisclosureId(), vo.getPersonId(), vo.getDisclosureNumber());
		return projectEntityRequestDtos.stream()
			    .flatMap(dto -> getDisclProjectEntityRelations(dto).stream())
			    .collect(Collectors.toList());
	}
	
	@Override
	public ResponseEntity<Object> checkDisclCreationEligibility(String personId){
	    boolean allowFCOIWithoutProjects = commonDao.getParameterValueAsBoolean("ALLOW_FCOI_WITHOUT_PROJECT");
	    int activeProjectsCount = 0;
	    activeProjectsCount = disclosureDao.getActiveProjectsCount(personId);
	    if (activeProjectsCount <= 0 && !allowFCOIWithoutProjects) {
	        return new ResponseEntity<>("You don't have any projects to disclose.", HttpStatus.METHOD_NOT_ALLOWED);
	    }
	    return new ResponseEntity<>("You are eligible to create disclosure.", HttpStatus.OK);
	
	}

    @Override
    public void sendMonthlyExpiringSummary() throws SQLException {
        List<Map<String, String>> notificationDetails = disclosureDao.getExpiringDisclosureSumryData();
        for (Map<String, String> placeholders : notificationDetails) {
            MessageQVO messageQVO = new MessageQVO();
            messageQVO.setModuleCode(Integer.valueOf(placeholders.get("MODULE_CODE")));
            messageQVO.setSubModuleCode(Integer.valueOf(placeholders.get("SUB_MODULE_CODE")));
            messageQVO.setTriggerType(CoreConstants.TRIGGER_TYPE_COI_REMINDER_NOTIFY);
            messageQVO.setEventType(CoreConstants.MQ_EVENT_TYPE_TRIGGER);
            messageQVO.setOrginalModuleItemKey(0);
            messageQVO.setSubModuleItemKey(0);
            messageQVO.setAdditionalDetails(placeholders);
            messageQVO.getAdditionalDetails().put("notificationTypeId", placeholders.get("NOTIFICATION_TYPE_ID"));
            messageQVO.setPublishedUserName(AuthenticatedUser.getLoginUserName());
            messageQVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
            coiService.processCoiTriggerMessageToQ(messageQVO);
        }
    }

    @Override
    public ResponseEntity<Object> getProjectDisclosureId(String projectType, String personId, String moduleItemKey) {
        return new ResponseEntity<>(Map.of("disclosureId", disclosureDao.getProjectDisclosureId(projectType, personId, moduleItemKey)), HttpStatus.OK);
    }

    @Override
    public void markPendingDisclosuresAsVoid(String moduleCode, String actionType) throws SQLException {
        String personId = AuthenticatedUser.getLoginPersonId();
        String userName = AuthenticatedUser.getLoginUserName();
        String fullName = AuthenticatedUser.getLoginUserFullName();
        // Call DAO to mark award disclosures as void and get HTML content for the mail body
        List<MakeVoidDto> makeVoidDto = disclosureDao.markPendingDisclosuresAsVoid(personId, actionType, moduleCode);
        if (makeVoidDto == null || makeVoidDto.isEmpty())
        	return; // do nothing
    	StringBuilder finalHtml = new StringBuilder();
        for(MakeVoidDto dto: makeVoidDto) {
		    finalHtml.append("<p><strong>Project:</strong> ")
		             .append(dto.getCoiProjectType() != null ? dto.getCoiProjectType() : "")
		             .append(": ")
		             .append(dto.getProjectNumber() != null ? dto.getProjectNumber() : "")
		             .append(" - ")
		             .append(dto.getProjectTitle() != null ? dto.getProjectTitle() : "")
		             .append("</p>");
        }
		String htmlContent = finalHtml.toString();
        // Build notification recipients
        Set<NotificationRecipient> recipients = new HashSet<>();
        commonService.setNotificationRecipients(personId, CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, recipients);
        // Build additional details map
        Map<String, String> additionalDetails = new HashMap<>();
        additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS, commonDao.convertObjectToJSON(recipients));
        additionalDetails.put(StaticPlaceholders.notificationTypeId, Constants.NOTIFICATION_TYPE_ID_PROJECT_DISCL_MARKED_AS_VOID);
        additionalDetails.put(StaticPlaceholders.REPORTER_NAME, fullName);
        additionalDetails.put(StaticPlaceholders.PROJECT_TYPE, Constants.PROJECT_TYPE_AWARD);
        additionalDetails.put(StaticPlaceholders.HTML_CONTENT, htmlContent);
        additionalDetails.put(StaticPlaceholders.VOID_REASON, getReasonToMakeVoid(actionType));
        // Build message object
        MessageQVO messageVO = new MessageQVO();
        messageVO.setAdditionalDetails(additionalDetails);
        messageVO.setTriggerType(TriggerTypes.NOTIFY_PROJECT_DISCLOSURE_MARKED_AS_VOID);
        messageVO.setModuleCode(Constants.COI_MODULE_CODE);
        messageVO.setSubModuleCode(Constants.COI_SUBMODULE_CODE);
        messageVO.setOrginalModuleItemKey(0);
        messageVO.setSubModuleItemKey(0);
        messageVO.setEventType(Constants.MESSAGE_EVENT_TYPE_TRIGGER);
        messageVO.setPublishedUserName(userName);
        messageVO.setPublishedTimestamp(commonDao.getCurrentTimestamp());
        // Publish to queue
        coiService.processCoiTriggerMessageToQ(messageVO);
    }
    
    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
