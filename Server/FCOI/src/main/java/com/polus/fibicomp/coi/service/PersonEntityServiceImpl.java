package com.polus.fibicomp.coi.service;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.customdataelement.service.CustomDataElementService;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.service.QuestionnaireService;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.clients.FormBuilderClient;
import com.polus.fibicomp.coi.clients.model.ApplicableFormRequest;
import com.polus.fibicomp.coi.clients.model.ApplicableFormResponse;
import com.polus.fibicomp.coi.clients.model.FormEvaluateValidationResponse;
import com.polus.fibicomp.coi.clients.model.FormRequest;
import com.polus.fibicomp.coi.clients.model.FormValidationRequest;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.EngagementsDetailsDTO;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.PerEntDisclTypeSelection;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;
import com.polus.fibicomp.globalentity.service.GlobalEntityService;
import com.polus.fibicomp.matrix.service.MatrixService;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.service.OPAService;
import com.polus.fibicomp.travelDisclosure.services.TravelDisclService;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class PersonEntityServiceImpl implements PersonEntityService {

	@Autowired
    @Qualifier(value = "conflictOfInterestDao")
    private ConflictOfInterestDao conflictOfInterestDao;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private PersonDao personDao;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private QuestionnaireService questionnaireService;

    @Autowired
    private CustomDataElementService customDataElementService;

    @Autowired
    private ActionLogDao actionLogDao;

    @Autowired
    private FcoiDisclosureDao fcoiDisclosureDao;

    @Autowired
    private FcoiDisclosureService fcoiDisclosureService;

    @Autowired
    private InboxDao inboxDao;

    @Autowired
    private ConflictOfInterestService coiService;

    @Autowired
	private MatrixService matrixService;

    @Autowired
	private TravelDisclService travelDisclService;

    @Autowired
	private OPAService opaService;

    @Autowired
    private FormBuilderClient formBuilderClient;

    @Autowired
    private GlobalEntityService globalEntityService;

    @Autowired
    private GeneralService generalService;
    
    @Autowired
    private OPADao opaDao;

    private static final String IS_FORM_COMPLETED = "isFormCompleted";
    private static final String RELATIONSHIP_TYPE_SELF = "1";
    private static final String DISCLOSURE_TYPE_FINANCIAL = "1";
    private static final String DISCLOSURE_TYPE_COMMITMENT = "2";
    private static final String DISCLOSURE_TYPE_TRAVEL = "3";
    private static final String DISCLOSURE_REVIEW_STATUS_COMPLETED = "4";
    private static final Integer DEFAULT_MODULE_ITEM_KEY = 0;
    private static final Integer DATA_CAPTURING_TYPE_MATRIX = 1;
    private static final Integer DATA_CAPTURING_TYPE_QUESTIONNAIRE = 2;
    private static final Map<Integer, String> relTypeCodeToDisclTypeCode = new HashMap<>();
    static {
        // Financial 
    	relTypeCodeToDisclTypeCode.put(1, "1"); // Self
    	relTypeCodeToDisclTypeCode.put(2, "1"); // Spouse
    	relTypeCodeToDisclTypeCode.put(3, "1"); // Dependent
        // Travel
    	relTypeCodeToDisclTypeCode.put(4, "3"); // Self
        // Commitment
    	relTypeCodeToDisclTypeCode.put(5, "2"); // Self
    	relTypeCodeToDisclTypeCode.put(6, "2"); // Spouse
        // Consulting
    	relTypeCodeToDisclTypeCode.put(7, "4"); // Self
    }

    @Override
    public ResponseEntity<Object> createPersonEntity(PersonEntity personEntity) {
        String loginUserName = AuthenticatedUser.getLoginUserName();
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        List<PersonEntity> persEntityObj = conflictOfInterestDao.fetchPersonEntityByEntityNum(personEntity.getEntityNumber(), loginPersonId);
        if (persEntityObj != null && !persEntityObj.isEmpty()) {
            return new ResponseEntity<>(persEntityObj.get(0), HttpStatus.METHOD_NOT_ALLOWED);
        }
        personEntity.setVersionNumber(Constants.COI_INITIAL_VERSION_NUMBER);
        personEntity.setPersonEntityNumber(conflictOfInterestDao.getMaxPersonEntityNumber() + 1);
        personEntity.setVersionStatus(personEntity.getVersionStatus() != null ? personEntity.getVersionStatus() : Constants.COI_ACTIVE_STATUS); //By default SFI will be in ACTIVE status
        personEntity.setPersonId(AuthenticatedUser.getLoginPersonId());
        personEntity.setUpdatedBy(loginPersonId);
        personEntity.setCreateUser(loginUserName);
        personEntity.setEntityNumber(personEntity.getEntityNumber());
        conflictOfInterestDao.saveOrUpdatePersonEntity(personEntity);
        saveRelationshipDetails(personEntity, loginPersonId, loginUserName, Boolean.FALSE);
        String entityName = conflictOfInterestDao.getEntityDetails(personEntity.getEntityId()).getEntityName();
        conflictOfInterestDao.updatePersonEntityCompleteFag(personEntity.getPersonEntityId(), Boolean.FALSE);
        personEntity.setIsFormCompleted(Boolean.FALSE);
        fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(personEntity.getPersonEntityId(), true);
        PersonEntityDto personEntityDto = new PersonEntityDto();
        personEntityDto.setPersonEntityId(personEntity.getPersonEntityId());
        personEntityDto.setPersonEntityNumber(personEntity.getPersonEntityNumber());
        personEntityDto.setEntityName(entityName);
        personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_CREATED);
        actionLogService.savePersonEntityActionLog(personEntityDto);
		if (commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
				.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUB_DIVISION)) {
			notifyUserAndAddtoInbox(personEntity, entityName, loginPersonId, loginUserName);
		}
        return new ResponseEntity<>(personEntity, HttpStatus.OK);
    }

    @Override
    public void saveRelationshipDetails(PersonEntity personEntity, String loginPersonId, String loginUserName, Boolean isSystemCreated) {
    	if (commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP) || 
    	    commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUMMARY)) {
			if (personEntity.getPerEntDisclTypeSelection() == null || personEntity.getPerEntDisclTypeSelection().isEmpty()) {
				log.warn("No default relationship!!!");
				return;
			}
			for (String disclTypeCode : personEntity.getPerEntDisclTypeSelection()) {
				PerEntDisclTypeSelection perEntDisclTypeSelection = new PerEntDisclTypeSelection();
				perEntDisclTypeSelection.setPersonEntityId(personEntity.getPersonEntityId());
				perEntDisclTypeSelection.setDisclosureTypeCode(disclTypeCode);
				Integer dataCapturingTypeCode = conflictOfInterestDao.fetchDisclosureTypeByCode(disclTypeCode).getDataCapturingTypeCode();
				perEntDisclTypeSelection.setDataCapturingTypeCode(dataCapturingTypeCode);
				perEntDisclTypeSelection.setUpdatedBy(loginPersonId);
				perEntDisclTypeSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
				conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntDisclTypeSelection);
				if (!DATA_CAPTURING_TYPE_MATRIX.equals(dataCapturingTypeCode)) {
					PersonEntityRelationship personEntityRelation = new PersonEntityRelationship();
					personEntityRelation.setPersonEntityId(personEntity.getPersonEntityId());
					conflictOfInterestDao.getRelationshipDetails(disclTypeCode).stream()
							.filter(relType -> relType.getRelationshipTypeCode().equals(RELATIONSHIP_TYPE_SELF))
							.map(ValidPersonEntityRelType::getValidPersonEntityRelTypeCode).findFirst()
							.ifPresent(personEntityRelation::setValidPersonEntityRelTypeCode);
					personEntityRelation.setUpdateUser(loginUserName);
					personEntityRelation.setIsSystemCreated(isSystemCreated);
					conflictOfInterestDao.saveOrUpdatePersonEntityRelationship(personEntityRelation);
				}
			}
		} else {
			Set<String> processedDisclosureTypes = new HashSet<>();
			for (Integer relTypeCode : personEntity.getValidPersonEntityRelTypeCodes()) {
				String disclTypeCode = relTypeCodeToDisclTypeCode.get(relTypeCode);
				if (disclTypeCode != null && !processedDisclosureTypes.contains(disclTypeCode)) {
					PerEntDisclTypeSelection perEntDisclTypeSelection = new PerEntDisclTypeSelection();
					perEntDisclTypeSelection.setPersonEntityId(personEntity.getPersonEntityId());
					perEntDisclTypeSelection.setDisclosureTypeCode(disclTypeCode);
					Integer dataCapturingTypeCode = conflictOfInterestDao.fetchDisclosureTypeByCode(disclTypeCode).getDataCapturingTypeCode();
					perEntDisclTypeSelection.setDataCapturingTypeCode(dataCapturingTypeCode);
					perEntDisclTypeSelection.setUpdatedBy(loginPersonId);
					perEntDisclTypeSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
					conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntDisclTypeSelection);
					processedDisclosureTypes.add(disclTypeCode);
				}
				PersonEntityRelationship personEntityRelation = new PersonEntityRelationship();
				personEntityRelation.setPersonEntityId(personEntity.getPersonEntityId());
				personEntityRelation.setValidPersonEntityRelTypeCode(relTypeCode);
				personEntityRelation.setUpdateUser(loginUserName);
				personEntityRelation.setIsSystemCreated(isSystemCreated);
				conflictOfInterestDao.saveOrUpdatePersonEntityRelationship(personEntityRelation);
			}
		}
    }

    @Override
    public void notifyUserAndAddtoInbox(PersonEntity personEntity, String entityName, String loginPersonId, String loginUserName) {
		List<String> withdrawalRequiredStatuses = Arrays.asList(Constants.DISCLOSURE_REVIEW_SUBMITTED,
				Constants.DISCLOSURE_REVIEW_IN_PROGRESS, Constants.DISCLOSURE_REVIEW_ASSIGNED,
				Constants.DISCLOSURE_ASSIGNED_REVIEW_COMPLETED, Constants.COI_DISCLOSURE_STATUS_ROUTING_INPROGRESS);
		List<String> pendingStatuses = Arrays.asList(Constants.COI_DISCLOSURE_STATUS_INPROGRESS,
				Constants.COI_DISCLOSURE_STATUS_RETURN, Constants.COI_DISCLOSURE_STATUS_WITHDRAW);
		List<PerEntDisclTypeSelection> perEntDisclTypeSelection = fetchPerEntDisclTypeSelection(personEntity.getPersonEntityId());
    	String engagementTypeNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
		if (Constants.COI_ACTIVE_STATUS.equals(personEntity.getVersionStatus())
				&& ((perEntDisclTypeSelection != null && perEntDisclTypeSelection.stream()
						.anyMatch(code -> code.getDisclosureTypeCode().equals(Constants.FINANCIAL_RELATION_TYPE)))
						|| (personEntity.getValidPersonEntityRelTypeCodes() != null
								&& (personEntity.getValidPersonEntityRelTypeCodes().stream()
										.anyMatch(code -> code.equals(Constants.FINANCIAL_SELF_RELATION_TYPE)
												|| code.equals(Constants.FINANCIAL_SPOUSE_RELATION_TYPE)
												|| code.equals(Constants.FINANCIAL_DEPENDENT_RELATION_TYPE))))
						|| (Constants.ALL_ENGAGEMENT.equals(engagementTypeNeeded)
								&& generalService.isDisclosureRequired()))) {
			CoiDisclosure disclosure = fcoiDisclosureDao.getLatestDisclosure(loginPersonId, Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), null);
			StringBuilder message = new StringBuilder();
			String messageTypeCode = null;
			if (disclosure == null) {
				message.append("COI disclosure creation is required for the created engagement: ");
				messageTypeCode = Constants.INBOX_FCOI_DISCLOSURE_CREATION;
			} else if (disclosure.getReviewStatusCode().equals(DISCLOSURE_REVIEW_STATUS_COMPLETED) || pendingStatuses.contains(disclosure.getReviewStatusCode())) {
				message.append("COI disclosure revision is required for the created engagement: ");
				messageTypeCode = Constants.INBOX_FCOI_DISCLOSURE_REVISION;
			} else if (withdrawalRequiredStatuses.contains(disclosure.getReviewStatusCode())) {
				message.append("COI disclosure revision is required for the created engagement: ");
				messageTypeCode = Constants.INBOX_FCOI_DISCLOSURE_WITHDRAWAL;
			} else {
				message.append("COI disclosure is required for the created engagement: ");
				messageTypeCode = Constants.INBOX_FCOI_DISCLOSURE_REQUIRED;
			}
    		message.append(entityName);
			if (Constants.ALL_FINANCIAL_ENGAGEMENT.equals(engagementTypeNeeded)) {
				message.append(", which has been added with a financial relationship");
			} else if (Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypeNeeded)) {
				message.append(", which has been added with a Significant Financial Interest (SFI) relationship");
			}
    		fcoiDisclosureService.addToInbox(
					disclosure != null && disclosure.getDisclosureId() != null
							? disclosure.getDisclosureId().toString()
							: DEFAULT_MODULE_ITEM_KEY.toString(),
					loginPersonId, messageTypeCode, message.toString(),
					loginUserName);
			if (disclosure != null && (Constants.COI_DISCLOSURE_STATUS_SUBMITTED.equals(disclosure.getReviewStatusCode()) || 
        			Constants.COI_REVIEWER_REVIEW_STATUS_START.equals(disclosure.getReviewStatusCode()) ||
        			Constants.COI_DISCLOSURE_REVIEWER_STATUS_ASSIGNED.equals(disclosure.getReviewStatusCode()) ||
        			Constants.COI_DISCLOSURE_REVIEWER_STATUS_COMPLETED.equals(disclosure.getReviewStatusCode()) ||
        			Constants.COI_ACTIVE_STATUS.equals(disclosure.getVersionStatus()))) {
                Map<String, String> additionalDetails = new HashMap<>();
                additionalDetails.put(StaticPlaceholders.ENGAGEMENT_NAME, entityName);
                coiService.processCoiMessageToQ(ActionTypes.FCOI_REVISE_ON_ENG_CREATE, disclosure.getDisclosureId(), null, additionalDetails, null, null);
        	}
        }
	}

    @Override
    public PersonEntityDto saveOrUpdatePersonEntityRelationship(PersonEntityRelationship personEntityRelationship) {
        Boolean isSystemCreated = personEntityRelationship.getIsSystemCreated();
        PersonEntityDto personEntityDto = new PersonEntityDto();
    	String engagementFlowType = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE);
        personEntityDto.setEngagementFlow(engagementFlowType);
		if (engagementFlowType.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP)
				|| engagementFlowType.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUMMARY)) {
			if (conflictOfInterestDao.isDisclTypeSelected(personEntityRelationship.getDisclTypeCodes(),
					personEntityRelationship.getPersonEntityId())) {
				if (!conflictOfInterestDao.isSystemCreatedRelationPresent(personEntityRelationship.getDisclTypeCodes().get(0), personEntityRelationship.getPersonEntityId())) {
			        personEntityDto.setMessage("Relationship already added.");
			        return personEntityDto;
			    }
			}
		} else if (conflictOfInterestDao.isRelationshipAdded(
				personEntityRelationship.getValidPersonEntityRelTypeCodes(),
				personEntityRelationship.getPersonEntityId())) {
			personEntityDto.setMessage("Relationship already added.");
			return personEntityDto;
		}
		PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(personEntityRelationship.getPersonEntityId());
        Integer personEntityId = personEntity.getPersonEntityId();
        Integer versionId = conflictOfInterestDao.getPersonEntityIdOfNonArchiveVersion(personEntity.getPersonEntityNumber());
        if (!versionId.equals(personEntityId)) {
            personEntityId = versionId;
        }
        if ((isSystemCreated == null || !isSystemCreated)
                && conflictOfInterestDao.checkPersonEntityAdded(personEntityId)) {
            personEntityId = copyPersonEntity(personEntity, personEntity.getVersionStatus()).getPersonEntityId();
        }
        fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(personEntity.getPersonEntityId(), true);
        List<PersonEntityRelationship> personEntityRelationshipList = new ArrayList<>();
        List<PerEntDisclTypeSelection> perEntDisclTypeSelections = new ArrayList<>();
        List<String> relationshipNames = new ArrayList<>();
        if (engagementFlowType.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP)
				|| engagementFlowType.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUMMARY)) {
			for (String disclTypeCode : personEntityRelationship.getDisclTypeCodes()) {
				Boolean isSystemCreatedRelationPresent = conflictOfInterestDao.isSystemCreatedRelationPresent(disclTypeCode, personEntity.getPersonEntityId());
				Integer dataCapturingTypeCode = null;
                CoiDisclosureType coiDisclosureType = conflictOfInterestDao.fetchDisclosureTypeByCode(disclTypeCode);
				if (isSystemCreatedRelationPresent) {
					Optional<PerEntDisclTypeSelection> selection = conflictOfInterestDao
							.fetchPerEntDisclTypeSelection(personEntity.getPersonEntityId()).stream()
							.filter(p -> DISCLOSURE_TYPE_FINANCIAL.equals(p.getDisclosureTypeCode())).findFirst();
					if (selection.isPresent()) {
						PerEntDisclTypeSelection perEntSelection = selection.get();
						dataCapturingTypeCode = coiDisclosureType.getDataCapturingTypeCode();
						perEntSelection.setDataCapturingTypeCode(dataCapturingTypeCode);
						perEntSelection.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
						perEntSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
						conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntSelection);
						relationshipNames.add(coiDisclosureType.getDescription());
						perEntDisclTypeSelections.add(perEntSelection);
					}
				} else {
					PerEntDisclTypeSelection perEntDisclTypeSelection = new PerEntDisclTypeSelection();
					perEntDisclTypeSelection.setPersonEntityId(personEntity.getPersonEntityId());
					perEntDisclTypeSelection.setDisclosureTypeCode(disclTypeCode);
					if (isSystemCreated == null || !isSystemCreated) {
						dataCapturingTypeCode = coiDisclosureType.getDataCapturingTypeCode();
						perEntDisclTypeSelection.setDataCapturingTypeCode(dataCapturingTypeCode);
					}
					perEntDisclTypeSelection.setCoiDisclosureType(coiDisclosureType);
					relationshipNames.add(coiDisclosureType.getDescription());
					perEntDisclTypeSelection.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
					perEntDisclTypeSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
					conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntDisclTypeSelection);
					perEntDisclTypeSelections.add(perEntDisclTypeSelection);
					if (!DATA_CAPTURING_TYPE_MATRIX.equals(dataCapturingTypeCode)) {
						PersonEntityRelationship personEntityRelation = new PersonEntityRelationship();
						personEntityRelation.setPersonEntityId(personEntity.getPersonEntityId());
						conflictOfInterestDao.getRelationshipDetails(disclTypeCode).stream()
								.filter(relType -> relType.getRelationshipTypeCode().equals(RELATIONSHIP_TYPE_SELF))
								.map(ValidPersonEntityRelType::getValidPersonEntityRelTypeCode).findFirst()
								.ifPresent(personEntityRelation::setValidPersonEntityRelTypeCode);
						personEntityRelation.setUpdateUser(AuthenticatedUser.getLoginUserName());
						personEntityRelation.setIsSystemCreated(personEntityRelationship.getIsSystemCreated());
						conflictOfInterestDao.saveOrUpdatePersonEntityRelationship(personEntityRelation);
						personEntityRelationshipList.add(personEntityRelationship);
					}
				}
			}
			personEntityDto.setPersonEntityRelationships(personEntityRelationshipList);
			personEntityDto.setPerEntDisclTypeSelection(perEntDisclTypeSelections);
		} else {
			List<ValidPersonEntityRelType> validRelTypes = conflictOfInterestDao.getValidPersonEntityRelTypeByTypeCodes(
					personEntityRelationship.getValidPersonEntityRelTypeCodes());
			Set<String> processedDisclosureTypes = new HashSet<>();
			for (ValidPersonEntityRelType relType : validRelTypes) {
				PersonEntityRelationship personEntityRelation = new PersonEntityRelationship();
				personEntityRelation.setPersonEntityId(personEntityId);
				personEntityRelation.setValidPersonEntityRelTypeCode(relType.getValidPersonEntityRelTypeCode());
				personEntityRelation.setValidPersonEntityRelType(relType);
				personEntityRelation.setUpdateUser(AuthenticatedUser.getLoginUserName());
                personEntityRelation.setIsSystemCreated(personEntityRelationship.getIsSystemCreated());
				conflictOfInterestDao.saveOrUpdatePersonEntityRelationship(personEntityRelation);
				String disclTypeCode = relTypeCodeToDisclTypeCode.get(relType.getValidPersonEntityRelTypeCode());
				if (disclTypeCode != null && !processedDisclosureTypes.contains(disclTypeCode)) {
					PerEntDisclTypeSelection perEntDisclTypeSelection = new PerEntDisclTypeSelection();
					perEntDisclTypeSelection.setPersonEntityId(personEntity.getPersonEntityId());
					perEntDisclTypeSelection.setDisclosureTypeCode(disclTypeCode);
					Integer dataCapturingTypeCode = conflictOfInterestDao.fetchDisclosureTypeByCode(disclTypeCode).getDataCapturingTypeCode();
					perEntDisclTypeSelection.setDataCapturingTypeCode(dataCapturingTypeCode);
					perEntDisclTypeSelection.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
					perEntDisclTypeSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
					conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntDisclTypeSelection);
					processedDisclosureTypes.add(disclTypeCode);
				}
				relationshipNames.add(relType.getDescription());
				personEntityRelationshipList.add(personEntityRelation);
			}
		}
        if (isSystemCreated == null || !isSystemCreated) {
            personEntityDto.setPersonEntityId(personEntityId);
            personEntityDto.setPersonEntityNumber(personEntity.getPersonEntityNumber());
            personEntityDto.setEntityName(personEntity.getCoiEntity().getEntityName());
            personEntityDto.setRelationshipName(String.join(", ", relationshipNames));
            personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_REL_ADDED);
            actionLogService.savePersonEntityActionLog(personEntityDto);
            personEntityDto.setPersonEntityRelationships(personEntityRelationshipList);
            personEntityDto.setUpdateTimestamp(conflictOfInterestDao.updatePersonEntityUpdateDetails(personEntityId));
        }
        return personEntityDto;
    }

    private boolean checkFormCompleted(Integer validPersonEntityRelTypeCode, Integer personEntityId, boolean isFormCompleted) {
        QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
        questionnaireDataBus.setModuleItemCode(Constants.COI_MODULE_CODE);
        questionnaireDataBus.setModuleSubItemCode(Constants.COI_SFI_SUBMODULE_CODE);
        questionnaireDataBus.setModuleSubItemKey(String.valueOf(validPersonEntityRelTypeCode));
        if (personEntityId != null)
            questionnaireDataBus.setModuleItemKey(String.valueOf(personEntityId));
        questionnaireDataBus.setQuestionnaireMode(Constants.ACTIVE_ANSWERED_UNANSWERED);
        QuestionnaireDataBus questData = questionnaireService.getApplicableQuestionnaire(questionnaireDataBus);
        if (questData.getApplicableQuestionnaire() != null && !questData.getApplicableQuestionnaire().isEmpty()) {
            isFormCompleted = questData.getApplicableQuestionnaire().stream()
                    .allMatch(map -> map.containsKey("QUESTIONNAIRE_COMPLETED_FLAG") && map.get("QUESTIONNAIRE_COMPLETED_FLAG") != null &&
                            map.get("QUESTIONNAIRE_COMPLETED_FLAG").equals("Y"));

        }
        return isFormCompleted;
    }

    private PersonEntity copyPersonEntity(PersonEntity personEntityObj, String versionStatus) {
    	PersonEntity personEntity = new PersonEntity();
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        String loginUsername = AuthenticatedUser.getLoginUserName();
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        BeanUtils.copyProperties(personEntityObj, personEntity);
        personEntity.setPersonEntityId(null);
        personEntity.setVersionNumber(conflictOfInterestDao.getMaxPersonEntityVersionNumber(personEntityObj.getPersonEntityNumber()) + 1);
        personEntity.setVersionStatus(versionStatus);
        personEntity.setUpdatedBy(loginPersonId);
        personEntity.setCreateUser(loginUsername);
        personEntity.setCreateTimestamp(currentTimestamp);
        personEntity.setUpdateTimestamp(currentTimestamp);
        personEntity.setEntityId(conflictOfInterestDao.getMaxEntityId(personEntityObj.getEntityNumber()));
        conflictOfInterestDao.saveOrUpdatePersonEntity(personEntity);
        conflictOfInterestDao.getCoiFinancialEntityDetails(personEntityObj.getPersonEntityId()).forEach(personEntityRelationship -> {
            PersonEntityRelationship relationship = new PersonEntityRelationship();
            BeanUtils.copyProperties(personEntityRelationship, relationship);
            relationship.setPersonEntityRelId(null);
            relationship.setPersonEntityId(personEntity.getPersonEntityId());
            relationship.setUpdateUser(loginUsername);
            relationship.setUpdateTimestamp(currentTimestamp);
            conflictOfInterestDao.saveOrUpdatePersonEntityRelationship(relationship);
			copyPersonEntityQuestionnaireData(personEntityObj, personEntity, personEntityRelationship.getValidPersonEntityRelTypeCode());
		});
		copyPersonEntityDisclTypeSelection(personEntityObj, personEntity);
		copyMatrixAnswers(personEntityObj.getPersonEntityId(), personEntity.getPersonEntityId());
		copyPersonEntityCustomData(personEntityObj, personEntity);
        copyPersonEntityFormResponse(personEntityObj.getPersonEntityId(), personEntity.getPersonEntityId());
        conflictOfInterestDao.updatePersonEntityVersionStatus(personEntityObj.getPersonEntityId(), Constants.COI_ARCHIVE_STATUS);
        return personEntity;
    }

	private void copyPersonEntityFormResponse(Integer oldPersonEntityId, Integer newPersonEntityId) {
		ApplicableFormRequest applicableFormRequest = ApplicableFormRequest.builder()
				.documentOwnerPersonId(AuthenticatedUser.getLoginPersonId())
				.moduleItemCode(String.valueOf(Constants.COI_MODULE_CODE))
				.moduleSubItemCode(String.valueOf(Constants.COI_SFI_SUBMODULE_CODE))
				.moduleItemKey(String.valueOf(oldPersonEntityId)).build();
		ResponseEntity<List<ApplicableFormResponse>> applicableFormResponses = formBuilderClient.getApplicableForms(applicableFormRequest);
		List<ApplicableFormResponse> applicableForms = Optional.ofNullable(applicableFormResponses)
                .map(ResponseEntity::getBody)
                .orElse(Collections.emptyList());
		// TODO implement logic to handle multiple forms
		Integer formId = applicableForms.isEmpty() ? null : applicableForms.get(0).getAnsweredFormId();
		if (formId != null) {
			FormRequest requestObject = FormRequest.builder().moduleItemCode(String.valueOf(Constants.COI_MODULE_CODE))
					.moduleSubItemCode(String.valueOf(Constants.COI_SFI_SUBMODULE_CODE)).newFormBuilderId(formId)
					.formBuilderId(formId).moduleSubItemKey(CoreConstants.SUBMODULE_ITEM_KEY)
					.moduleItemKey(String.valueOf(oldPersonEntityId))
					.newModuleItemKey(String.valueOf(newPersonEntityId))
					.documentOwnerPersonId(AuthenticatedUser.getLoginPersonId()).build();
			formBuilderClient.copyForm(requestObject);
		}
	}

	private void copyPersonEntityCustomData(PersonEntity personEntityObj, PersonEntity personEntity) {
    	customDataElementService.copyCustomDataBasedOnModule(personEntityObj.getPersonEntityId(), personEntity.getPersonEntityId(), Constants.COI_MODULE_CODE, Constants.COI_SUBMODULE_CODE, CoreConstants.SUBMODULE_ITEM_KEY, Boolean.FALSE, Boolean.FALSE, null);
    }

	private void copyMatrixAnswers(Integer orgPersonEntityId, Integer copyPersonEntityId) {
    	matrixService.copyMatrixAnswers(orgPersonEntityId, copyPersonEntityId);
	}

	private void copyPersonEntityDisclTypeSelection(PersonEntity personEntityObj, PersonEntity personEntity) {
    	Timestamp timestamp = commonDao.getCurrentTimestamp();
    	String userId = AuthenticatedUser.getLoginPersonId();
    	List<PerEntDisclTypeSelection> selections = conflictOfInterestDao.fetchPerEntDisclTypeSelection(personEntityObj.getPersonEntityId());
		selections.forEach(selection -> {
			conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(
					PerEntDisclTypeSelection.builder().personEntityId(personEntity.getPersonEntityId())
							.disclosureTypeCode(selection.getDisclosureTypeCode())
							.dataCapturingTypeCode(selection.getDataCapturingTypeCode()).updateTimestamp(timestamp)
							.updatedBy(userId).build());
		});
	}

    private void copyPersonEntityQuestionnaireData(PersonEntity personEntityOld, PersonEntity personEntity, Integer validPersonEntityRelTypeCode) {
        List<Integer> submoduleCodes = new ArrayList<>();
        QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
        questionnaireDataBus.setActionPersonId(AuthenticatedUser.getLoginPersonId());
        questionnaireDataBus.setActionUserId(AuthenticatedUser.getLoginUserName());
        questionnaireDataBus.setModuleItemCode(Constants.COI_MODULE_CODE);
        questionnaireDataBus.setModuleItemKey(personEntityOld.getPersonEntityId().toString());
        submoduleCodes.add(Constants.COI_SFI_SUBMODULE_CODE);
        questionnaireDataBus.getModuleSubItemCodes().addAll(submoduleCodes);
        questionnaireDataBus.setModuleSubItemKey("0");
        questionnaireDataBus.setCopyModuleItemKey(personEntity.getPersonEntityId().toString());
        questionnaireDataBus.setModuleSubItemKey(validPersonEntityRelTypeCode != null ? validPersonEntityRelTypeCode.toString() : null);
        questionnaireService.copyQuestionnaireForVersion(questionnaireDataBus, false);
    }

    @Override
    public ConflictOfInterestVO getPersonEntityDetails(Integer personEntityId) {
        ConflictOfInterestVO vo = new ConflictOfInterestVO();
        PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(personEntityId);
        PersonEntity personEntityObj = new PersonEntity();
        BeanUtils.copyProperties(personEntity, personEntityObj, "coiEntity", "person");
        personEntityObj.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(personEntityObj.getUpdatedBy()));
        vo.setPersonEntity(personEntityObj);
        List<PersonEntityRelationship> personEntityRelationships = conflictOfInterestDao.getPersonEntityRelationshipByPersonEntityId(personEntityId);
        List<PerEntDisclTypeSelection> perEntDisclTypeSelections = conflictOfInterestDao.fetchPerEntDisclTypeSelection(personEntityId);
		vo.setPerEntDisclTypeSelections(perEntDisclTypeSelections);
		String engagementTypesNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
		if (Constants.ALL_FINANCIAL_ENGAGEMENT.equals(engagementTypesNeeded)) {
			personEntityRelationships.forEach(personEntityRelationship -> {
				conflictOfInterestDao.getValidPersonEntityRelTypeByTypeCode(
						personEntityRelationship.getValidPersonEntityRelTypeCode());
				if (personEntity.getCreateUser() != null
						&& personEntity.getCreateUser().equals(AuthenticatedUser.getLoginUserName())
						&& perEntDisclTypeSelections.stream().anyMatch(
								selection -> DISCLOSURE_TYPE_FINANCIAL.equals(selection.getDisclosureTypeCode()))) {
					vo.setCanShowEngLinkToFcoiInfo(
							fcoiDisclosureDao.checkIfEngagementLinkedToFcoi(AuthenticatedUser.getLoginPersonId(),
									Arrays.asList(Constants.FINANCIAL_SELF_RELATION_TYPE,
											Constants.FINANCIAL_DEPENDENT_RELATION_TYPE,
											Constants.FINANCIAL_SPOUSE_RELATION_TYPE),
									personEntityId, null));
				}
			});
		} else {
			vo.setCanShowEngLinkToFcoiInfo(fcoiDisclosureDao.checkIfEngagementLinkedToFcoi(AuthenticatedUser.getLoginPersonId(), null, personEntityId, engagementTypesNeeded));
		}
		vo.setPersonEntityRelationships(personEntityRelationships);
		vo.setPerEntFormBuilderDetails(conflictOfInterestDao.findPerEntFormBuilderDetailsByPerEntId(personEntityId));
		return vo;
    }

    @Override
    public ResponseEntity<Object> getPersonEntityDashboard(CoiDashboardVO vo) {
        return new ResponseEntity<>(conflictOfInterestDao.getPersonEntityDashboard(vo), HttpStatus.OK);
    }

    @Override
    public PersonEntityDto updatePersonEntity(PersonEntityDto personEntityDto) {
//        Integer versionId = conflictOfInterestDao.getPersonEntityIdOfNonArchiveVersion(personEntityDto.getPersonEntityNumber());
//        if (versionId != personEntityDto.getPersonEntityId()) {
//            personEntityDto.setPersonEntityId(versionId);
//        }
//        if (conflictOfInterestDao.checkPersonEntityAdded(personEntityDto.getPersonEntityId())) {
//            PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(personEntityDto.getPersonEntityId());
//            personEntityDto.setPersonEntityId(copyPersonEntity(personEntity, personEntity.getVersionStatus()).getPersonEntityId());
//        }
    	personEntityDto.setUpdateTimestamp(conflictOfInterestDao.updatePersonEntity(personEntityDto));
    	personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_MODIFIED);
        actionLogService.savePersonEntityActionLog(personEntityDto);
        return personEntityDto;
    }

    @Override
    public ResponseEntity<Object> deletePersonEntityRelationship(Integer personEntityRelId, Integer personEntityId) {
        PersonEntityRelationship relationship = conflictOfInterestDao.getRelationshipDetailsById(personEntityRelId);
        if (relationship == null) {
            return new ResponseEntity<>("Already deleted", HttpStatus.METHOD_NOT_ALLOWED);
        }
        deletePerEntQuestAnsRelationship(personEntityRelId, personEntityId, relationship.getValidPersonEntityRelTypeCode());
        Timestamp updateTimestamp = conflictOfInterestDao.updatePersonEntityUpdateDetails(personEntityId);
        PersonEntityDto personEntityDto = new PersonEntityDto();
        personEntityDto.setPersonEntityId(personEntityId);
        personEntityDto.setPersonEntityNumber(relationship.getPersonEntity().getPersonEntityNumber());
        personEntityDto.setRelationshipName(relationship.getValidPersonEntityRelType().getDescription());
        personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_REL_REMOVED);
        personEntityDto.setUpdateTimestamp(updateTimestamp);
        actionLogService.savePersonEntityActionLog(personEntityDto);
        fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(personEntityId, true);
        return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
    }

    private void deletePerEntQuestAnsRelationship(Integer personEntityRelId, Integer personEntityId, Integer relationshipTypeCode) {
        QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
        questionnaireDataBus.setModuleItemCode(Constants.COI_MODULE_CODE);
        questionnaireDataBus.setModuleSubItemCode(Constants.COI_SFI_SUBMODULE_CODE);
        questionnaireDataBus.setModuleItemKey(personEntityId.toString());
        questionnaireDataBus.setModuleSubItemKey(relationshipTypeCode.toString());
        questionnaireService.deleteAllQuestionAnswers(questionnaireDataBus);
        conflictOfInterestDao.deletePerEntDisclTypeSelection(relationshipTypeCode, personEntityId);
        conflictOfInterestDao.deletePersonEntityRelationship(personEntityRelId);
    }

    @Override
    public ResponseEntity<Object> activateOrInactivatePersonEntity(PersonEntityDto personEntityDto) {
        if (conflictOfInterestDao.isPersonEntityActiveOrNot(null, personEntityDto.getPersonEntityNumber(), personEntityDto.getVersionStatus())) {
            if (personEntityDto.getVersionStatus().equals(Constants.COI_ACTIVE_STATUS))
                return new ResponseEntity<>("SFI already activated", HttpStatus.METHOD_NOT_ALLOWED);
            else
                return new ResponseEntity<>("SFI already inactivated", HttpStatus.METHOD_NOT_ALLOWED);
        }
        PersonEntity personEntityObj = conflictOfInterestDao.getPersonEntityDetailsById(personEntityDto.getPersonEntityId());
		if (conflictOfInterestDao.checkPersonEntityAdded(personEntityObj.getPersonEntityId())) {
			PersonEntity personEntity = copyPersonEntity(personEntityObj, personEntityDto.getVersionStatus());
			personEntityDto.setPersonEntityId(personEntity.getPersonEntityId());
		}
        fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(personEntityObj.getPersonEntityId(), true);
        personEntityDto.setIsFormCompleted(personEntityObj.getIsFormCompleted());
        personEntityDto.setUpdateTimestamp(conflictOfInterestDao.updatePersonEntityVersionStatus(personEntityDto.getPersonEntityId(), personEntityDto.getVersionStatus()));
        personEntityDto.setEntityName(personEntityObj.getCoiEntity().getEntityName());
        personEntityDto.setPersonEntityNumber(personEntityObj.getPersonEntityNumber());
        personEntityDto.setActionTypeCode(personEntityDto.getVersionStatus().equals(Constants.COI_ACTIVE_STATUS) ?
                Constants.COI_PERSON_ENTITY_ACTION_LOG_ACTIVATED : Constants.COI_PERSON_ENTITY_ACTION_LOG_INACTIVATED);
        actionLogService.savePersonEntityActionLog(personEntityDto);
        inboxActions(personEntityObj);
		if (personEntityObj.getIsFormCompleted()
				&& Constants.COI_ACTIVE_STATUS.equalsIgnoreCase(personEntityDto.getVersionStatus())
				&& personEntityObj.getIsSignificantFinInterest()) {
			try {
				fcoiDisclosureService.markPendingDisclosuresAsVoid(Constants.AWARD_MODULE_CODE.toString(),
						Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_ENG);
			} catch (SQLException e) {
				log.error("Error in markPendingDisclosuresAsVoid", e.getMessage());
			    Map<String, String> error = new HashMap<>();
	            error.put("error", "Void operation failed");
	            error.put("reason", e.getMessage());
				return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
        return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<PersonEntityDto> deletePersonEntity(Integer personEntityId) {
        PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(personEntityId);
        if (personEntity == null) {
            return new ResponseEntity<>(null, HttpStatus.METHOD_NOT_ALLOWED);
        }
        conflictOfInterestDao.getRelationshipDetails(personEntityId).forEach(relationship ->
                deletePerEntQuestAnsRelationship(relationship.getPersonEntityRelId(), personEntityId, relationship.getValidPersonEntityRelTypeCode())
        );
        if (commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP) || 
    	    commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUMMARY)) {
        	matrixService.deleteMatrixAnswers(personEntityId);
        	conflictOfInterestDao.updatePersonEntityCompensationDetails(personEntityId);
        	conflictOfInterestDao.deletePerEntDisclTypeSelectionByPersonEntityId(personEntityId);
        }
        actionLogDao.deletePersonEntityActionLog(personEntityId);
        conflictOfInterestDao.deletePersonEntity(personEntityId);
        return new ResponseEntity<>(PersonEntityDto.builder().personEntityId(personEntityId).entityId(personEntity.getEntityId()).build(), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getPersonEntityRelationship(ConflictOfInterestVO vo) {
        List<PersonEntityRelationship> personEntityRelationships = new ArrayList<>();
        conflictOfInterestDao.getRelationshipDetails(vo).forEach(personEntityRelationship -> {
            PersonEntityRelationship copyRelationship = new PersonEntityRelationship();
            BeanUtils.copyProperties(personEntityRelationship, copyRelationship, "personEntity");
            personEntityRelationships.add(copyRelationship);
        });
        return new ResponseEntity<>(personEntityRelationships, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getSFILatestVersion(Integer personEntityNumber) {
        return new ResponseEntity<>(conflictOfInterestDao.getSFILatestVersion(personEntityNumber), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getAllPersonEntityVersions(Integer personEntityNumber) {
        return new ResponseEntity<>(conflictOfInterestDao.fetchAllPersonEntityVersions(personEntityNumber), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Map<String, Object>> updatePersonEntityCompleteFlag(Integer personEntityId) {
		boolean isFormCompleted = true;
		// check form complete
		ApplicableFormRequest applicableFormRequest = ApplicableFormRequest.builder()
				.documentOwnerPersonId(AuthenticatedUser.getLoginPersonId())
				.moduleItemCode(String.valueOf(Constants.COI_MODULE_CODE))
				.moduleSubItemCode(String.valueOf(Constants.COI_SFI_SUBMODULE_CODE))
				.moduleItemKey(String.valueOf(personEntityId)).build();
		ResponseEntity<List<ApplicableFormResponse>> applicableFormResponses = formBuilderClient.getApplicableForms(applicableFormRequest);
		List<ApplicableFormResponse> applicableForms = Optional.ofNullable(applicableFormResponses)
                .map(ResponseEntity::getBody)
                .orElse(Collections.emptyList());
		// TODO implement logic to handle multiple forms
		Integer formId = null;
		if (!applicableForms.isEmpty()) {
			ApplicableFormResponse form = applicableForms.get(0);
			formId = Constants.NO.equals(form.getRevisionRequired())
					? Objects.requireNonNullElse(form.getAnsweredFormId(), form.getActiveFormId())
					: form.getActiveFormId();
		}
		if (formId != null) {
			FormValidationRequest formValidationRequest = FormValidationRequest.builder()
					.formBuilderIds(Arrays.asList(formId))
					.moduleItemCode(String.valueOf(Constants.COI_MODULE_CODE))
					.moduleSubItemCode(String.valueOf(Constants.COI_SFI_SUBMODULE_CODE))
					.moduleSubItemKey(Constants.DEFAULT_MODULE_ITEM_KEY)
					.moduleItemKey(String.valueOf(personEntityId)).build();
			ResponseEntity<List<FormEvaluateValidationResponse>> validationResponses = formBuilderClient.validateForm(formValidationRequest);
			List<FormEvaluateValidationResponse> validations = Optional.ofNullable(validationResponses)
	                .map(ResponseEntity::getBody)
	                .orElse(Collections.emptyList());
			if(!validations.isEmpty()) {
				isFormCompleted = false;
			}
		}
		List<PersonEntityRelationship> personEntityRelationships = conflictOfInterestDao
				.getPersonEntityRelationshipByPersonEntityId(personEntityId);
		if (commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
				.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUB_DIVISION)) {
			if (personEntityRelationships == null || personEntityRelationships.isEmpty()) {
				isFormCompleted = false;
			}
			if (isFormCompleted) {
				for (PersonEntityRelationship personEntityRelationship : personEntityRelationships) {
					if (personEntityRelationship.getIsSystemCreated() == null
							|| !personEntityRelationship.getIsSystemCreated()) {
						List<PerEntDisclTypeSelection> perEntDisclTypeSelection = conflictOfInterestDao
								.fetchPerEntDisclTypeSelection(personEntityId);
						if (perEntDisclTypeSelection.stream().anyMatch(
								selection -> DATA_CAPTURING_TYPE_MATRIX.equals(selection.getDataCapturingTypeCode()))) {
							isFormCompleted = conflictOfInterestDao.checkMatrixCompleted(personEntityId)
								    && conflictOfInterestDao.checkCompensationAmountPresent(personEntityId);
						}
						if (isFormCompleted) {
							if (perEntDisclTypeSelection.stream()
									.anyMatch(selection -> DATA_CAPTURING_TYPE_QUESTIONNAIRE
											.equals(selection.getDataCapturingTypeCode()))) {
								isFormCompleted = checkFormCompleted(
										personEntityRelationship.getValidPersonEntityRelTypeCode(), personEntityId,
										isFormCompleted);
							}
						} else {
							break;
						}
						if (!isFormCompleted) {
							break;
						}
					}
				}
			}
		} else {
			if (isFormCompleted) {
				List<PerEntDisclTypeSelection> perEntDisclTypeSelection = conflictOfInterestDao
						.fetchPerEntDisclTypeSelection(personEntityId);
                List<PersonEntityRelationship> systemFinancialRelationships = conflictOfInterestDao.getSystemCreatedRelationship(personEntityId, DISCLOSURE_TYPE_FINANCIAL);
				if (((systemFinancialRelationships == null || systemFinancialRelationships.isEmpty())
						|| conflictOfInterestDao.getPersonEntityIsCompensated(personEntityId))
						&& perEntDisclTypeSelection.stream().anyMatch(
								selection -> selection.getDisclosureTypeCode().equals(DISCLOSURE_TYPE_FINANCIAL))) {
					isFormCompleted = conflictOfInterestDao.checkMatrixCompleted(personEntityId)
						    && conflictOfInterestDao.checkCompensationAmountPresent(personEntityId);
				}
				if (isFormCompleted) {
					for (PersonEntityRelationship personEntityRelationship : personEntityRelationships) {
						if (isFormCompleted && (personEntityRelationship.getIsSystemCreated() == null
								|| !personEntityRelationship.getIsSystemCreated())) {
							isFormCompleted = checkFormCompleted(
									personEntityRelationship.getValidPersonEntityRelTypeCode(), personEntityId,
									isFormCompleted);
						} else {
							break;
						}
					}
				}
			}
		}
		conflictOfInterestDao.updatePersonEntityCompleteFag(personEntityId, isFormCompleted);
		Map<String, Object> response = new HashMap<>();
		if (isFormCompleted) {
			PersonEntity personEntityObj = conflictOfInterestDao.getPersonEntityDetailsById(personEntityId);
			List<PersonEntityActionLog> personEntityActionLogs = actionLogDao.fetchPersonEntityActionLog(
					PersonEntityDto.builder().versionNumber(personEntityObj.getVersionNumber())
							.personEntityNumber(personEntityObj.getPersonEntityNumber()).build());
			if (personEntityActionLogs.isEmpty() || personEntityActionLogs == null
					|| !Constants.COI_PERSON_ENTITY_ACTION_LOG_FORM_COMPLETED
							.equals(personEntityActionLogs.get(0).getActionTypeCode())) {
				PersonEntityDto personEntityDto = new PersonEntityDto();
				personEntityDto.setPersonEntityId(personEntityId);
				personEntityDto.setPersonEntityNumber(personEntityObj.getPersonEntityNumber());
				personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_FORM_COMPLETED);
				actionLogService.savePersonEntityActionLog(personEntityDto);
			}
			if (personEntityObj.getIsSignificantFinInterest()) {
				try {
					fcoiDisclosureService.markPendingDisclosuresAsVoid(Constants.AWARD_MODULE_CODE.toString(), Constants.COI_DIS_ACTION_LOG_DISCL_MARKED_VOID_BY_ENG);
				} catch (SQLException e) {
					log.error("Error in markPendingDisclosuresAsVoid", e.getMessage());
					response.put("error", "Void operation failed");
					response.put("reason", e.getMessage());
					return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
		}
		response.put("isFormCompleted", isFormCompleted);
		if (isFormCompleted) {
			addToInbox(personEntityId);
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	private void addToInbox(Integer personEntityId) {
		Boolean isFcoiRequired = conflictOfInterestDao.isFcoiRequired(AuthenticatedUser.getLoginPersonId());
		Boolean isOpaRequired = opaService.canCreateOpaDisclosure(AuthenticatedUser.getLoginPersonId());
		if (isFcoiRequired || isOpaRequired) {
			List<PersonEntityRelationship> personEntityRelationships = conflictOfInterestDao.getRelationshipDetails(personEntityId);
			PersonEntity personEntity = getPersonEntityDetails(personEntityId).getPersonEntity();
			String engagementName = conflictOfInterestDao.getEntityDetails(personEntity.getEntityId()).getEntityName();
			String reporterName = personDao.getPersonFullNameByPersonId(personEntity.getPersonId());
			String validPersonEntityRelTypeDescriptions = personEntityRelationships.stream().map(rel -> {
				if (rel.getValidPersonEntityRelType() != null) {
					return rel.getValidPersonEntityRelType().getDescription();
				} else {
					return conflictOfInterestDao
							.getValidPersonEntityRelTypeByTypeCode(rel.getValidPersonEntityRelTypeCode())
							.getDescription();
				}
			}).collect(Collectors.joining(", "));
			personEntityRelationships.stream().forEach(rel -> {
				Integer validPersonEntityRelTypeCode = rel.getValidPersonEntityRelTypeCode();
				String validPersonEntityRelTypeDesc = rel.getValidPersonEntityRelType() != null ? rel.getValidPersonEntityRelType().getDescription() 
						: conflictOfInterestDao.getValidPersonEntityRelTypeByTypeCode(rel.getValidPersonEntityRelTypeCode()).getDescription();
				Set<Integer> financialValidPersonEntityRelTypeCodes = Set.of(1, 2, 3);
				Set<Integer> commitmentValidPersonEntityRelTypeCodes = Set.of(5);
				Set<Integer> travelValidPersonEntityRelTypeCodes = Set.of(4);
				List<CoiDisclosureType> coiDislcosureTypes = conflictOfInterestDao.fetchAllCoiDisclosureTypes();
				Map<String, Boolean> dislcosureTypeActiveCheck = coiDislcosureTypes.stream()
						.filter(type -> Arrays
								.asList(DISCLOSURE_TYPE_FINANCIAL, DISCLOSURE_TYPE_COMMITMENT, DISCLOSURE_TYPE_TRAVEL)
								.contains(type.getDisclosureTypeCode()))
						.collect(Collectors.toMap(CoiDisclosureType::getDisclosureTypeCode,
								CoiDisclosureType::getIsActive, (existing, replacement) -> existing));
				String engagementTypeNeeded = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE);
				if ((isFcoiRequired && financialValidPersonEntityRelTypeCodes.contains(validPersonEntityRelTypeCode)
						&& dislcosureTypeActiveCheck.get(DISCLOSURE_TYPE_FINANCIAL))
						|| (Constants.ALL_ENGAGEMENT.equals(engagementTypeNeeded)
								&& generalService.isDisclosureRequired())) {
					List<String> financialMessageTypeCodes = Arrays.asList(Constants.INBOX_FCOI_DISCLOSURE_CREATION,
							Constants.INBOX_FCOI_DISCLOSURE_REVISION, Constants.INBOX_FCOI_DISCLOSURE_WITHDRAWAL,
							Constants.INBOX_FCOI_DISCLOSURE_REQUIRED);
					if (!isDisclosureActionlistSent(financialMessageTypeCodes, CoreConstants.COI_MODULE_CODE, null)) {
						if (Constants.ALL_ENGAGEMENT.equals(engagementTypeNeeded)) {
							validPersonEntityRelTypeDesc = validPersonEntityRelTypeDescriptions;
						}
						if (Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypeNeeded)
								&& !personEntity.getIsSignificantFinInterest()) {
							return;
						}
						notifyUserAndAddtoInbox(personEntity,
								conflictOfInterestDao.getEntityDetails(personEntity.getEntityId()).getEntityName(),
								AuthenticatedUser.getLoginPersonId(), AuthenticatedUser.getLoginUserName());
						sendDisclosureCreateNotification(personEntity, engagementName, validPersonEntityRelTypeDesc,
								reporterName, "Initial/Revision");
					}
				} else if (isOpaRequired
						&& commitmentValidPersonEntityRelTypeCodes.contains(validPersonEntityRelTypeCode) && dislcosureTypeActiveCheck.get(DISCLOSURE_TYPE_COMMITMENT)) {
					List<String> commitmentMessageTypeCodes = Arrays.asList(Constants.INBOX_OPA_DISCLOSURE_CREATION, Constants.INBOX_REVISE_OPA_DISCLOSURE);
					if (!isDisclosureActionlistSent(commitmentMessageTypeCodes, Constants.OPA_MODULE_CODE, null)) {
						List<String> opaPendingStatuses = Arrays.asList(
								Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS,
								Constants.OPA_DISCLOSURE_STATUS_RETURN, Constants.OPA_DISCLOSURE_STATUS_WITHDRAW);
						OPADisclosure opaDisclosure = opaDao.getLatestOpaDisclosure(personEntity.getPersonId());
						StringBuilder message = new StringBuilder();
						String messageTypeCode = null;
						if (opaDisclosure == null) {
							message.append("OPA disclosure creation is required for the created engagement: ");
							messageTypeCode = Constants.INBOX_OPA_DISCLOSURE_CREATION;
						} else {
							message.append("OPA disclosure revision is required for the created engagement: ");
							messageTypeCode = Constants.INBOX_REVISE_OPA_DISCLOSURE;
						}
						message.append(conflictOfInterestDao.getEntityDetails(personEntity.getEntityId()).getEntityName())
							   .append(", which has been added with an OPA relationship");
						opaService.addToInbox(
								opaDisclosure != null && opaDisclosure.getOpaDisclosureId() != null
										? opaDisclosure.getOpaDisclosureId().toString()
										: DEFAULT_MODULE_ITEM_KEY.toString(),
								AuthenticatedUser.getLoginPersonId(), messageTypeCode, message.toString(),
								AuthenticatedUser.getLoginUserName());
						sendDisclosureCreateNotification(personEntity, engagementName, validPersonEntityRelTypeDesc, reporterName, "OPA");
					}
				} else if (travelValidPersonEntityRelTypeCodes.contains(validPersonEntityRelTypeCode) && dislcosureTypeActiveCheck.get(DISCLOSURE_TYPE_TRAVEL)) {
					notifyUserAndAddToInbox(personEntity, engagementName, validPersonEntityRelTypeDesc, reporterName);
				}
			});
		}
	}

	@Override
	public void notifyUserAndAddToInbox(PersonEntity personEntity, String engagementName, String validPersonEntityRelTypeDesc, String reporterName) {
		List<String> travelMessageTypeCodes = Arrays.asList(Constants.INBOX_TRAVEL_DISCLOSURE_CREATION);
		if (!isDisclosureActionlistSent(travelMessageTypeCodes, Constants.TRAVEL_MODULE_CODE,
				personEntity.getPersonEntityId())) {
			StringBuilder message = new StringBuilder();
			message.append("Travel disclosure creation is required for the created engagement: ");
			message.append(
					conflictOfInterestDao.getEntityDetails(personEntity.getEntityId()).getEntityName())
					.append(", which has been added with a travel relationship");
			travelDisclService.addToInbox(personEntity.getPersonEntityId().toString(), AuthenticatedUser.getLoginPersonId(),
					Constants.INBOX_TRAVEL_DISCLOSURE_CREATION, message.toString(),
					AuthenticatedUser.getLoginUserName());
			sendDisclosureCreateNotification(personEntity, engagementName, validPersonEntityRelTypeDesc, reporterName, "Travel");
		}
	}

	public void sendDisclosureCreateNotification(PersonEntity personEntity, String engagementName, String validPersonEntityRelTypeDesc, String reporterName, String disclosureType) {
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put("NOTIFICATION_RECIPIENTS", AuthenticatedUser.getLoginPersonId());
		additionalDetails.put("ENG_NAME", engagementName);
		additionalDetails.put("REPORTER_NAME", reporterName);
		additionalDetails.put("ENG_REL_TYPE", validPersonEntityRelTypeDesc);
		additionalDetails.put("DISCLOSURE_TYPE", disclosureType);
		additionalDetails.put("PERSON_ENTITY_ID", personEntity.getPersonEntityId().toString());
		additionalDetails.put("PERSON_ENTITY_NUMBER", personEntity.getPersonEntityNumber().toString());
		coiService.processCoiMessageToQ(ActionTypes.NOTIFY_PER_ENG_DIS_CREATION_REQ, personEntity.getPersonEntityId(), null, additionalDetails, Constants.COI_MODULE_CODE, Constants.COI_SFI_SUBMODULE_CODE);
	}

	private boolean isDisclosureActionlistSent(List<String> messageTypeCodes, Integer coiModuleCode, Integer moduleItemKey) {
		return conflictOfInterestDao.isDisclosureActionlistSent(messageTypeCodes, coiModuleCode,
				moduleItemKey != null ? String.valueOf(moduleItemKey) : null, null);
	}

	@Override
    public ResponseEntity<Object> getSFIOfDisclosure(ConflictOfInterestVO vo) {
        if (vo.getDisclosureId() != null && vo.getDispositionStatusCode() != null) {
            if (!vo.getDispositionStatusCode().equals(Constants.COI_DISCL_DISPOSITION_STATUS_VOID) &&
                    fcoiDisclosureDao.isDisclDispositionInStatus(Constants.COI_DISCL_DISPOSITION_STATUS_VOID, vo.getDisclosureId())) {
                throw new ApplicationException("Disclosure is in void status!", CoreConstants.JAVA_ERROR, HttpStatus.METHOD_NOT_ALLOWED);
            }
        }
    	Map<String, Object> responseData = new HashMap<>();
		List<PersonEntity> personEntities  = conflictOfInterestDao.getSFIOfDisclosure(vo);
		personEntities.forEach(personEntity -> personEntity.setValidPersonEntityRelTypes(conflictOfInterestDao.getValidPersonEntityRelTypes(personEntity.getPersonEntityId())));
		if (commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP) || 
    	    commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE)
    	        .equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUMMARY)) {
			personEntities.forEach(personEntity -> personEntity.setPerEntDisclTypeSelections(
					(conflictOfInterestDao.fetchPerEntDisclTypeSelection(personEntity.getPersonEntityId()))));
		}
		if(vo.getFilterType().equalsIgnoreCase("Financial")) {
			responseData.put("isProjectPresent", conflictOfInterestDao.isProjectPresent(vo));
			personEntities.forEach(personEntity -> personEntity.setSfiCompleted(fcoiDisclosureDao.isSFICompletedForDisclosure(personEntity.getPersonEntityId(), vo.getDisclosureId())));
			personEntities.forEach(personEntity -> personEntity.setDisclosureStatusCount(conflictOfInterestDao.disclosureStatusCountBySFI(personEntity.getPersonEntityId(), vo.getDisclosureId())));
		}
		responseData.put("personEntities", personEntities);
		responseData.put("count", conflictOfInterestDao.getSFIOfDisclosureCount(vo));
		return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getSFIDetails(Integer coiFinancialEntityId) {
        ConflictOfInterestVO vo = new ConflictOfInterestVO();
        vo.setPersonEntityRelationships(conflictOfInterestDao.getCoiFinancialEntityDetails(coiFinancialEntityId));
        vo.setPersonEntity(conflictOfInterestDao.getSFIDetails(coiFinancialEntityId));
        return new ResponseEntity<>(vo, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> modifyPersonEntity(PersonEntityDto personEntityDto) {
        Integer personEntityId = personEntityDto.getPersonEntityId();
        PersonEntity personEntityObj = conflictOfInterestDao.getPersonEntityDetailsById(personEntityId);
        if (personEntityObj != null && personEntityObj.getVersionStatus().equals(Constants.COI_INACTIVE_STATUS)) {
        	personEntityDto.setPersonEntityId(personEntityId);
            return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
        }
        Integer latestPerEntVersionId = conflictOfInterestDao.getPersonEntityIdOfNonArchiveVersion(personEntityObj.getPersonEntityNumber());
        if (!latestPerEntVersionId.equals(personEntityId)) {
        	personEntityDto.setPersonEntityId(latestPerEntVersionId);
            return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
        }
        if (conflictOfInterestDao.checkPersonEntityAdded(personEntityId)) {
            PersonEntity copiedPerEntVersion = copyPersonEntity(personEntityObj, personEntityObj.getVersionStatus());
            personEntityDto.setPersonEntityId(copiedPerEntVersion.getPersonEntityId());
        } else {
            personEntityObj.setEntityId(conflictOfInterestDao.getMaxEntityId(personEntityObj.getEntityNumber()));
        }
        fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(personEntityObj.getPersonEntityId(), true);
        personEntityDto.setPersonEntityNumber(personEntityObj.getPersonEntityNumber());
        personEntityDto.setEntityName(personEntityObj.getCoiEntity().getEntityName());
        personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_MODIFIED);
        actionLogService.savePersonEntityActionLog(personEntityDto);
        inboxActions(personEntityObj);
        return new ResponseEntity<>(personEntityDto, HttpStatus.OK);
    }

	private void inboxActions(PersonEntity personEntityObj) {
		inboxDao.markReadMessage(CoreConstants.MODULE_CODE_GLOBAL_ENTITY, personEntityObj.getPersonEntityId().toString(),
				null, Constants.INBOX_INACTIVATE_ENTITY, personEntityObj.getPersonEntityNumber().toString(),
				Constants.COI_SFI_SUBMODULE_CODE);
		inboxDao.markReadMessage(CoreConstants.MODULE_CODE_GLOBAL_ENTITY, personEntityObj.getPersonEntityId().toString(),
				null, Constants.INBOX_MODIFY_ENTITY, personEntityObj.getPersonEntityNumber().toString(),
				Constants.COI_SFI_SUBMODULE_CODE);
	}

	@Override
	public List<PerEntDisclTypeSelection> fetchPerEntDisclTypeSelection(Integer personEntityId) {
		return conflictOfInterestDao.fetchPerEntDisclTypeSelection(personEntityId);
	}

	@Override
	public PersonEntityDto deletePerEntRelationshipByDisclType(EngagementsDetailsDTO engagementsDetail) {
        PerEntDisclTypeSelection selection;
        PersonEntityDto personEntityDto = new PersonEntityDto();
        String engagementFlowType = commonDao.getParameterValueAsString(Constants.ENGAGEMENT_FLOW_TYPE);
        personEntityDto.setEngagementFlow(engagementFlowType);
        if (engagementsDetail.getIsSystemCreated() != null && engagementsDetail.getIsSystemCreated()) {
            List<PersonEntityRelationship> systemRelationships = conflictOfInterestDao.getSystemCreatedRelationship(engagementsDetail.getPersonEntityId(), engagementsDetail.getPersonEntityRelationship().getDisclTypeCodes().get(0));
            if (engagementFlowType.equals(Constants.ENGAGEMENT_FLOW_TYPE_REL_SUB_DIVISION)) {
                systemRelationships.forEach(systemRelationship ->
                    conflictOfInterestDao.deletePersonEntityRelationship(systemRelationship.getPersonEntityRelId())
                );
                return personEntityDto;
            }
            if (systemRelationships != null && !systemRelationships.isEmpty()) {
                List<PerEntDisclTypeSelection> selections = conflictOfInterestDao.fetchPerEntDisclTypeSelection(engagementsDetail.getPersonEntityId(), engagementsDetail.getPersonEntityRelationship().getDisclTypeCodes().get(0));
                selection = selections != null && !selections.isEmpty() ? selections.get(0) : null;
            } else  {
                selection = null;
            }
        } else {
             selection = conflictOfInterestDao.fetchPerEntDisclTypeSelectionById(engagementsDetail.getPerEntDisclTypeSelectedId());
        }
		if (selection == null) {
			personEntityDto.setMessage("Already deleted.");
			return personEntityDto;
        }
        if (engagementsDetail.getIsSystemCreated() == null || !engagementsDetail.getIsSystemCreated()) {
            if (selection.getDisclosureTypeCode().equals(Constants.DISCLOSURE_TYPE_CODE_FCOI)) {
                inboxDao.markReadMessage(Constants.COI_MODULE_CODE, DEFAULT_MODULE_ITEM_KEY.toString(),
                        AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_CREATION,
                        CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
            } else if (selection.getDisclosureTypeCode().equals(Constants.DISCLOSURE_TYPE_CODE_OPA)) {
                inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, DEFAULT_MODULE_ITEM_KEY.toString(),
                        AuthenticatedUser.getLoginPersonId(), Constants.INBOX_FCOI_DISCLOSURE_CREATION,
                        CoreConstants.SUBMODULE_ITEM_KEY, CoreConstants.SUBMODULE_CODE);
            } else if (selection.getDisclosureTypeCode().equals(Constants.DISCLOSURE_TYPE_CODE_TRAVEL)) {
            	inboxDao.markReadMessage(Constants.TRAVEL_MODULE_CODE, engagementsDetail.getPersonEntityId().toString(), AuthenticatedUser.getLoginPersonId(),
        				Constants.INBOX_TRAVEL_DISCLOSURE_CREATION, CoreConstants.SUBMODULE_ITEM_KEY,
        				CoreConstants.SUBMODULE_CODE);
            }
        }
		List<PersonEntityRelationship> perEntRelationships = conflictOfInterestDao
				.getRelationshipDetails(engagementsDetail.getPersonEntityId());
		boolean isSystemRelationship = perEntRelationships.stream()
				.filter(relationship -> selection.getDisclosureTypeCode()
						.equals(relationship.getValidPersonEntityRelType().getDisclosureTypeCode()))
				.anyMatch(relationship -> {
					if (Boolean.TRUE.equals(relationship.getIsSystemCreated())) {
						return true;
					}
					return false;
				});
		if ((engagementsDetail.getIsSystemCreated() == null || !engagementsDetail.getIsSystemCreated())
				&& isSystemRelationship) {
			Optional<PerEntDisclTypeSelection> perEntSelection = conflictOfInterestDao
					.fetchPerEntDisclTypeSelection(engagementsDetail.getPersonEntityId()).stream()
					.filter(p -> DISCLOSURE_TYPE_FINANCIAL.equals(p.getDisclosureTypeCode())).findFirst();
			if (perEntSelection.isPresent()) {
				PerEntDisclTypeSelection perEntDisclSelection = perEntSelection.get();
				perEntDisclSelection.setDataCapturingTypeCode(null);
				perEntDisclSelection.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
				perEntDisclSelection.setUpdateTimestamp(commonDao.getCurrentTimestamp());
				conflictOfInterestDao.saveOrUpdatePerEntDisclTypeSelection(perEntDisclSelection);
				matrixService.deleteMatrixAnswers(engagementsDetail.getPersonEntityId());
	        	conflictOfInterestDao.updatePersonEntityCompensationDetails(engagementsDetail.getPersonEntityId());
			}
		} else {
			if (engagementsDetail.getIsModifyingCommitmentRel() != null && engagementsDetail.getIsModifyingCommitmentRel()) {
				deleteEngRelationAndQue(engagementsDetail, perEntRelationships, selection);
//				matrixService.deleteMatrixAnswers(engagementsDetail.getPersonEntityId());
			} else {
				boolean isFinancialDisclosure = DISCLOSURE_TYPE_FINANCIAL.equals(selection.getDisclosureTypeCode());
				boolean isCompensated = conflictOfInterestDao.getPersonEntityIsCompensated(engagementsDetail.getPersonEntityId());
				if (!isFinancialDisclosure || (isFinancialDisclosure && !isCompensated) || (isFinancialDisclosure && isCompensated && !isSystemRelationship)) {
					deleteEngRelationAndQue(engagementsDetail, perEntRelationships, selection);
					if (isFinancialDisclosure) {
						matrixService.deleteMatrixAnswers(engagementsDetail.getPersonEntityId());
						conflictOfInterestDao.updatePersonEntityCompensationDetails(engagementsDetail.getPersonEntityId());
					}
				}
			}
		}
		if (engagementsDetail.getIsSystemCreated() == null || !engagementsDetail.getIsSystemCreated()) {
			Timestamp updateTimestamp = conflictOfInterestDao
					.updatePersonEntityUpdateDetails(engagementsDetail.getPersonEntityId());
			if (Boolean.TRUE.equals(engagementsDetail.getIsMandatoryFieldsComplete())
					|| engagementsDetail.getIsMandatoryFieldsComplete() == null) {
			}
			if (!isSystemRelationship) {
				personEntityDto.setPersonEntityId(engagementsDetail.getPersonEntityId());
				personEntityDto.setPersonEntityNumber(selection.getPersonEntity().getPersonEntityNumber());
				personEntityDto.setRelationshipName(selection.getCoiDisclosureType().getDescription());
				personEntityDto.setActionTypeCode(Constants.COI_PERSON_ENTITY_ACTION_LOG_REL_REMOVED);
				personEntityDto.setUpdateTimestamp(updateTimestamp);
				actionLogService.savePersonEntityActionLog(personEntityDto);
			}
		}
		fcoiDisclosureDao.updateDisclosureSyncNeededByPerEntId(engagementsDetail.getPersonEntityId(), true);
		return personEntityDto;
	}

	private void deleteEngRelationAndQue(EngagementsDetailsDTO engagementsDetail, List<PersonEntityRelationship> perEntRelationships, PerEntDisclTypeSelection selection) {
		perEntRelationships.stream()
				.filter(relationship -> selection.getDisclosureTypeCode()
						.equals(relationship.getValidPersonEntityRelType().getDisclosureTypeCode()))
				.forEach(relationship -> {
					deletePerEntQuestAnsRelationship(relationship.getPersonEntityRelId(),
							engagementsDetail.getPersonEntityId(), relationship.getValidPersonEntityRelTypeCode());
					conflictOfInterestDao.deletePersonEntityRelationship(relationship.getPersonEntityRelId());
				});
		conflictOfInterestDao.deletePerEntRelationshipById(selection.getId());
	}

	@Override
    public ResponseEntity<Object> updateEngFinRelation(EngagementsDetailsDTO engDetailsDTO) {
        try {
            PersonEntityDto personEntityDto;
            String message = null;
            Integer personEntityId = null;

            if (Boolean.TRUE.equals(engDetailsDTO.getIsEngagementCompensated())) {
                log.info("Processing compensated engagement for PersonEntityId: {}", engDetailsDTO.getPersonEntityId());

                PersonEntityRelationship relationship = engDetailsDTO.getPersonEntityRelationship();
                personEntityId = relationship.getPersonEntityId();
                personEntityDto = saveOrUpdatePersonEntityRelationship(relationship);
                engDetailsDTO.setPersonEntityDto(personEntityDto);

                message = personEntityDto.getMessage();
                log.info("Received message from saveOrUpdatePersonEntityRelationship: {}", message);

                if (message == null || message.isEmpty()) {
                    PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(relationship.getPersonEntityId());
                    log.info("Processing entity sync for EntityId: {}", personEntity.getEntityId());
                    globalEntityService.processEntityMessageToGraphSyncQ(personEntity.getEntityId());
                }
            } else {
                log.info("Processing non-compensated engagement. PerEntDisclTypeSelectedId: {}, PersonEntityId: {}",
                        engDetailsDTO.getPerEntDisclTypeSelectedId(), engDetailsDTO.getPersonEntityId());
                personEntityId = engDetailsDTO.getPersonEntityId();
                personEntityDto = deletePerEntRelationshipByDisclType(engDetailsDTO);
                engDetailsDTO.setPersonEntityDto(personEntityDto);

                message = personEntityDto.getMessage();
                log.info("Received message from deletePerEntRelationshipByDisclType: {}", message);
            }
            Boolean isCompensated = conflictOfInterestDao.getPersonEntityIsCompensated(personEntityId);
            if (canUpdatePersonEntity(engDetailsDTO, message, personEntityDto, isCompensated)) {
                engDetailsDTO.setUpdatePersonEntityDto(updatePersonEntity(engDetailsDTO.getUpdatePersonEntityDto()));
                return ResponseEntity.ok(engDetailsDTO);
            } else if (message != null) {
                log.warn("No valid message received, returning METHOD_NOT_ALLOWED");
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(message);
            } else {
                return ResponseEntity.ok(engDetailsDTO);
            }

        } catch (Exception ex) {
            log.error("Error occurred while updating engagement-financial relationship: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error. Please try again later.");
        }
    }

    private boolean canUpdatePersonEntity(EngagementsDetailsDTO engDetailsDTO, String message, PersonEntityDto personEntityDto, Boolean isCompensated) {
        boolean isSystemCreated = Boolean.TRUE.equals(engDetailsDTO.getIsSystemCreated());
        boolean messageIsNull = message == null;
        boolean isEngagementFlowRelComp = Constants.ENGAGEMENT_FLOW_TYPE_REL_COMP.equals(personEntityDto.getEngagementFlow());
        boolean isCompensatedChanged = isCompensated == null || !isCompensated.equals(personEntityDto.getIsCompensated());
        boolean isSystemCreatedRelation = fetchPerEntDisclTypeSelection(engDetailsDTO.getPersonEntityId()).stream()
        		.filter(dto -> DISCLOSURE_TYPE_FINANCIAL.equals(dto.getDisclosureTypeCode()))
        	    .anyMatch(dto -> dto.getDataCapturingTypeCode() != null);
        boolean condition1 = messageIsNull && !isSystemCreated;
        boolean condition2 = messageIsNull && isSystemCreated &&
                             isEngagementFlowRelComp && isCompensated &&
                             !isSystemCreatedRelation;
        boolean condition3 = !messageIsNull && isCompensatedChanged && !isSystemCreated;
        return condition1 || condition2 || condition3;
    }


    @Override
	public void updatePersonEntityUpdateDetails(Integer personEntityId) {
		conflictOfInterestDao.updatePersonEntityUpdateDetails(personEntityId);
	}

	@Override
	public void updatePersonEntityCompensationAmount(Integer personEntityId, BigDecimal compensationAmount) {
		conflictOfInterestDao.updatePersonEntityCompensationAmount(personEntityId, compensationAmount);
	}

	@Override
	public BigDecimal fetchCompensationAmount(Integer personEntityId) {
		return conflictOfInterestDao.fetchCompensationAmount(personEntityId);
	}

	@Override
	public Map<String, Object> evaluateSfi(Integer personEntityId) {
		return conflictOfInterestDao.evaluateSfi(personEntityId);
	}

	@Override
	public ResponseEntity<Object> updateEngRelation(EngagementsDetailsDTO engDetailsDTO) {
		if (engDetailsDTO.getIsModifyingCommitmentRel() != null && engDetailsDTO.getIsModifyingCommitmentRel()) {
			return updateEngCommitmentChanges(engDetailsDTO);
		} else {
			return updateEngFinRelation(engDetailsDTO);
		}
	}

	private ResponseEntity<Object> updateEngCommitmentChanges(EngagementsDetailsDTO engDetailsDTO) {
		try {
			PersonEntityDto personEntityDto;
			String message = null;
			if (Boolean.TRUE.equals(engDetailsDTO.getIsCommitment())) {
				log.info("Processing commitment engagement for PersonEntityId: {}", engDetailsDTO.getPersonEntityId());
				PersonEntityRelationship relationship = engDetailsDTO.getPersonEntityRelationship();
				personEntityDto = saveOrUpdatePersonEntityRelationship(relationship);
				engDetailsDTO.setPersonEntityDto(personEntityDto);
				message = personEntityDto.getMessage();
				log.info("updateEngCommitmentRelation : Received message from saveOrUpdatePersonEntityRelationship: {}", message);
				if (message == null || message.isEmpty()) {
					PersonEntity personEntity = conflictOfInterestDao.getPersonEntityDetailsById(relationship.getPersonEntityId());
					log.info("Processing entity sync for EntityId: {}", personEntity.getEntityId());
					globalEntityService.processEntityMessageToGraphSyncQ(personEntity.getEntityId());
				}
			} else {
				log.info("Processing non-commitment engagement. PerEntDisclTypeSelectedId: {}, PersonEntityId: {}",
						engDetailsDTO.getPerEntDisclTypeSelectedId(), engDetailsDTO.getPersonEntityId());
				engDetailsDTO.setIsModifyingCommitmentRel(Boolean.TRUE);
				personEntityDto = deletePerEntRelationshipByDisclType(engDetailsDTO);
				engDetailsDTO.setPersonEntityDto(personEntityDto);
				message = personEntityDto.getMessage();
				log.info("Received message from deletePerEntRelationshipByDisclType: {}", message);
			}
			if (message != null) {
				log.warn("No valid message received on updateEngCommitmentChanges, returning METHOD_NOT_ALLOWED");
				return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(message);
			} else {
				engDetailsDTO.setUpdatePersonEntityDto(updatePersonEntity(engDetailsDTO.getUpdatePersonEntityDto()));
				return ResponseEntity.ok(engDetailsDTO);
			}
		} catch (Exception ex) {
			log.error("Error occurred while updating engagement-commitment relationship: {}", ex.getMessage(), ex);
			throw ex;
		}
	}

	@Override
	public void markAsIncomplete(Integer personEntityId) {
		conflictOfInterestDao.markAsIncomplete(personEntityId);
	}

}
