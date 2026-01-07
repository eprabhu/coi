package com.polus.fibicomp.coi.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.FileType;
import com.polus.core.pojo.LetterTemplateType;
import com.polus.core.pojo.Organization;
import com.polus.core.pojo.Rolodex;
import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.roles.pojo.AdminGroup;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.util.Truth;
import com.polus.core.vo.CommonVO;
import com.polus.fibicomp.coi.controller.PersonEntityCtrl;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.coi.dto.EngagementsDetailsDTO;
import com.polus.fibicomp.coi.dto.EvaluateFormRequestDto;
import com.polus.fibicomp.coi.dto.LookupRequestDto;
import com.polus.fibicomp.coi.dto.LookupResponseDto;
import com.polus.fibicomp.coi.dto.ParameterDto;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.coi.vo.ConflictOfInterestVO;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationTypeDao;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;
import com.polus.fibicomp.compliance.declaration.service.CoiDeclarationService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.travelDisclosure.services.TravelDisclService;;

@Service
@Transactional
public class GeneralServiceImpl implements GeneralService{

    @Autowired
    private GeneralDao generalDao;

    @Autowired
    private PersonDao personDao;

    @Autowired
    private CommonDao commonDao;

	@Autowired
	private ConflictOfInterestDao conflictOfInterestDao;

	@Autowired
	private PersonRoleRightDao personRoleRightDao;

	@Autowired
	private PersonEntityCtrl personEntityCtrl;

	@Autowired
	private PersonEntityService personEntityService;

	@Autowired
	private TravelDisclService travelDisclService;

	@Autowired
	private OPADao opaDao;

	@Autowired
	private CoiDeclarationTypeDao declarationTypeDao;

    @Autowired
    private CoiDeclarationService coiDeclarationService;

	private final static String ENTITY_MIGRATION_PHASE = "ENTITY_MIGRATION_PHASE";
	private final static String IS_UNIFIED_QUESTIONNAIRE_ENABLED = "IS_UNIFIED_QUESTIONNAIRE_ENABLED";
	private final static String ENGAGEMENT_FLOW_TYPE = "ENGAGEMENT_FLOW_TYPE";
	private static final String SHOW_ENTITY_COMPLIANCE_RISK = "SHOW_ENTITY_COMPLIANCE_RISK";
	private static final String ENABLE_DISCLOSURE_UNIT_EDIT = "ENABLE_DISCLOSURE_UNIT_EDIT";
	private static final String ENABLE_ENTITY_DUNS_MATCH = "ENABLE_ENTITY_DUNS_MATCH";
	private static final String ENABLE_COI_NOTES_TAB = "ENABLE_COI_NOTES_TAB";
	private static final String ENABLE_COI_ATTACHMENTS_TAB = "ENABLE_COI_ATTACHMENTS_TAB";
	private static final String ENABLE_COI_ACTION_LIST_SORTING="ENABLE_COI_ACTION_LIST_SORTING";
	private static final String TRAVEL_DISCLOSURE_FLOW_TYPE = "TRAVEL_DISCLOSURE_FLOW_TYPE";
	private static final String ALLOW_FCOI_WITHOUT_PROJECT = "ALLOW_FCOI_WITHOUT_PROJECT";
	private static final String ENABLE_KEYPERSON_DISCLOSURE_COMMENTS = "ENABLE_KEYPERSON_DISCLOSURE_COMMENTS";
	private static final String ENABLE_LEGACY_ENG_MIG = "ENABLE_LEGACY_ENG_MIG";
	private static final String ENABLE_SIGNIFICANT_FIN_INTEREST_EVALUATION = "ENABLE_SIGNIFICANT_FIN_INTEREST_EVALUATION";
	private static final String ALLOW_ENGAGEMENT_DELETION = "ALLOW_ENGAGEMENT_DELETION";
	private static final String OPA_APPROVAL_FLOW_TYPE = "OPA_APPROVAL_FLOW_TYPE";
	private static final String FCOI_APPROVAL_FLOW_TYPE = "FCOI_APPROVAL_FLOW_TYPE";
	private static final String IS_START_DATE_OF_INVOLVEMENT_MANDATORY = "IS_START_DATE_OF_INVOLVEMENT_MANDATORY";
	private static final String ENABLE_ROUTELOG_USER_ADD_OPA_REVIEWER = "ENABLE_ROUTELOG_USER_ADD_OPA_REVIEWER";

    @Override
	public ResponseEntity<Object> fetchAdminGroupsAndPersons(Integer moduleCode) {
		List<String> personIds = personDao.getAdministratorsByModuleCode(moduleCode);
		Set<Person> persons = new HashSet<>();
		personIds.forEach(personId -> persons.add(personDao.getPersonDetailById(personId)));
		List<AdminGroup> adminGroups = commonDao.fetchAdminGroupsBasedOnModuleCode(moduleCode);
		Map<String, Object> objectMap = new HashMap<>();
		objectMap.put("persons", persons);
		objectMap.put("adminGroups", adminGroups);
		return new ResponseEntity<>(objectMap, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> fetchAllCoiOpaRights() {
		Map<String, Object> objectMap = new HashMap<>();
        List<String> rights = new ArrayList<>();
        rights.addAll(generalDao.fetchAllCoiOpaRights(AuthenticatedUser.getLoginPersonId()));
        objectMap.put("rights", rights);
        objectMap.put("IS_REVIEW_MEMBER", generalDao.isPersonInReviewer(AuthenticatedUser.getLoginPersonId()));
		objectMap.put("IS_OPA_REVIEW_MEMBER", generalDao.isPersonInOPAReviewer(AuthenticatedUser.getLoginPersonId()));
		objectMap.put("IS_CMP_REVIEW_MEMBER", generalDao.isPersonInCmpReviewer(AuthenticatedUser.getLoginPersonId()));
		objectMap.put("CAN_CREATE_OPA", opaDao.canCreateOpaDisclosure(AuthenticatedUser.getLoginPersonId()));
        return new ResponseEntity<>(objectMap, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> fetchRequiredParams() {
		CompletableFuture<Map<String, String>> paramMapFuture = CompletableFuture.supplyAsync(() ->
        commonDao.getParameterValuesAsMap(Arrays.asList(
            ENTITY_MIGRATION_PHASE,
            IS_UNIFIED_QUESTIONNAIRE_ENABLED,
            ENGAGEMENT_FLOW_TYPE,
            SHOW_ENTITY_COMPLIANCE_RISK,
            ENABLE_DISCLOSURE_UNIT_EDIT,
            ENABLE_ENTITY_DUNS_MATCH,
            ENABLE_COI_NOTES_TAB,
            ENABLE_COI_ATTACHMENTS_TAB,
            ENABLE_COI_ACTION_LIST_SORTING,
            TRAVEL_DISCLOSURE_FLOW_TYPE,
            ALLOW_FCOI_WITHOUT_PROJECT,
            Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE,
            ENABLE_KEYPERSON_DISCLOSURE_COMMENTS,
            ENABLE_LEGACY_ENG_MIG,
            ENABLE_SIGNIFICANT_FIN_INTEREST_EVALUATION,
            ALLOW_ENGAGEMENT_DELETION,
            OPA_APPROVAL_FLOW_TYPE,
            IS_START_DATE_OF_INVOLVEMENT_MANDATORY,
            FCOI_APPROVAL_FLOW_TYPE,
            ENABLE_ROUTELOG_USER_ADD_OPA_REVIEWER
        ))
    );
    CompletableFuture<List<FileType>> fileTypes = CompletableFuture.supplyAsync(conflictOfInterestDao::getAllFileTypes);
    CompletableFuture<List<CoiProjectType>> projectTypes = CompletableFuture.supplyAsync(conflictOfInterestDao::getCoiProjectTypes);
    CompletableFuture<List<CoiDisclosureType>> disclosureTypes = CompletableFuture.supplyAsync(conflictOfInterestDao::getCoiDisclosureTypes);
    CompletableFuture<List<CoiDeclarationType>> declarationTypes = CompletableFuture.supplyAsync(declarationTypeDao::findActiveTypes);
    CompletableFuture.allOf(paramMapFuture, fileTypes, projectTypes, disclosureTypes, declarationTypes).join();
    Map<String, String> paramMap = paramMapFuture.join();
    return ResponseEntity.ok(ParameterDto.builder()
        .showEntityMigrationPhase(Truth.strToBooleanIgnoreCase(paramMap.get(ENTITY_MIGRATION_PHASE), false))
        .fileTypes(fileTypes.join())
        .coiProjectTypes(projectTypes.join())
        .coiDisclosureTypes(disclosureTypes.join())
        .isUnifiedQuestionnaireEnabled(Truth.strToBooleanIgnoreCase(paramMap.get(IS_UNIFIED_QUESTIONNAIRE_ENABLED), false))
        .engagementFlowType(paramMap.getOrDefault(ENGAGEMENT_FLOW_TYPE, null))
        .showEntityComplianceRisk(Truth.strToBooleanIgnoreCase(paramMap.get(SHOW_ENTITY_COMPLIANCE_RISK), false))
        .enableEditForDisclosureUnit(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_DISCLOSURE_UNIT_EDIT), false))
        .isEnableEntityDunsMatch(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_ENTITY_DUNS_MATCH), false))
        .coiNotesTabEnabled(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_COI_NOTES_TAB), false))
        .coiAttachmentsTabEnabled(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_COI_ATTACHMENTS_TAB), false))
        .coiActionListSortingEnabled(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_COI_ACTION_LIST_SORTING), false))
        .travelDisclosureFlowType(paramMap.getOrDefault(TRAVEL_DISCLOSURE_FLOW_TYPE, null))
        .allowFcoiWithoutProjects(Truth.strToBooleanIgnoreCase(paramMap.get(ALLOW_FCOI_WITHOUT_PROJECT), false))
        .engagementTypeForCoiDisclosure(paramMap.getOrDefault(Constants.ENGAGEMENT_TYPE_FOR_COI_DISCLOSURE, null))
        .enableKeyPersonDisclosureComments(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_KEYPERSON_DISCLOSURE_COMMENTS), false))
        .isEnableLegacyEngMig(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_LEGACY_ENG_MIG), false))
        .isDisclosureRequired(isDisclosureRequired())
        .isSfiEvaluationEnabled(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_SIGNIFICANT_FIN_INTEREST_EVALUATION), false))
        .canDeleteEngagement(Truth.strToBooleanIgnoreCase(paramMap.get(ALLOW_ENGAGEMENT_DELETION), false))
        .declarationTypes(declarationTypes.join())
        .opaApprovalFlowType(paramMap.getOrDefault(OPA_APPROVAL_FLOW_TYPE, null))
        .isStartDateOfInvolvementMandatory(Truth.strToBooleanIgnoreCase(paramMap.get(IS_START_DATE_OF_INVOLVEMENT_MANDATORY), false))
        .fcoiApprovalFlowType(paramMap.getOrDefault(FCOI_APPROVAL_FLOW_TYPE, null))
        .enableRouteLogUserAddOpaReviewer(Truth.strToBooleanIgnoreCase(paramMap.get(ENABLE_ROUTELOG_USER_ADD_OPA_REVIEWER), false))
        .declarationEligibilityMap(Map.of(Constants.DECLARATION_TYPE_MFTRP.toString(),
            coiDeclarationService.canCreateDeclaration(AuthenticatedUser.getLoginPersonId(), Constants.DECLARATION_TYPE_MFTRP)))
        .build());
	}

	@Override
	public Boolean isDisclosureRequired() {
		Boolean isDisclosureRequired = conflictOfInterestDao.isDisclosureRequired();
		if (!isDisclosureRequired){
			return conflictOfInterestDao.isUserPresentInProjects(AuthenticatedUser.getLoginPersonId());
		}
		return isDisclosureRequired;
	}

	@Override
	public boolean checkPersonHasPermission(String personId, String rightNames) {
    	if (personId.equals(AuthenticatedUser.getLoginPersonId())
				|| personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), rightNames, null)) {
			return true;
		}
		return false;
	}

	@Override
	public Map<String, Boolean> evaluateFormResponse(EvaluateFormRequestDto dto) {
		Boolean isTravelDisclosureRequired = generalDao.evaluateFormResponse(dto);
		if (isTravelDisclosureRequired) {
			if (!travelDisclService.isTravelDisclosureCreated(Integer.parseInt(dto.getModuleItemKey()),
					AuthenticatedUser.getLoginPersonId())) {
				PersonEntityRelationship personEntityRelationship = new PersonEntityRelationship();
				personEntityRelationship.setPersonEntityId(Integer.parseInt(dto.getModuleItemKey()));
				personEntityRelationship.setDisclTypeCodes(Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_TRAVEL));
				personEntityRelationship
						.setValidPersonEntityRelTypeCodes(Arrays.asList(Constants.TRAVEL_SELF_RELATIONSHIP));
				personEntityCtrl.saveCoiFinancialEntityDetails(personEntityRelationship);
				PersonEntity personEntity = conflictOfInterestDao
						.getPersonEntityDetailsById(Integer.parseInt(dto.getModuleItemKey()));
				CoiDisclosureType coiDisclosureType = conflictOfInterestDao.fetchDisclosureTypeByCode(Constants.DISCLOSURE_TYPE_CODE_TRAVEL);
				if (coiDisclosureType.getIsActive()) {
					personEntityService.notifyUserAndAddToInbox(personEntity,
							personEntity.getCoiEntity().getEntityName(), Constants.TRAVEL_SELF_RELATIONSHIP_DESC,
							AuthenticatedUser.getLoginUserFullName());
				}
			} else {
				isTravelDisclosureRequired = false;
			}
		} else {
			ResponseEntity<Object> response = personEntityService.getPersonEntityRelationship(
					ConflictOfInterestVO.builder().personEntityId(Integer.parseInt(dto.getModuleItemKey())).build());
			if (response.getStatusCode() == HttpStatus.OK) {
				List<PersonEntityRelationship> relationships = (List<PersonEntityRelationship>) response.getBody();
				relationships.stream()
						.filter(rel -> Constants.TRAVEL_SELF_RELATIONSHIP.equals(rel.getValidPersonEntityRelTypeCode()))
						.map(PersonEntityRelationship::getPersonEntityRelId).findFirst().ifPresent(id -> {
							Integer moduleItemKey = Integer.parseInt(dto.getModuleItemKey());
							if (!travelDisclService.isTravelDisclosureCreated(moduleItemKey,
									AuthenticatedUser.getLoginPersonId())) {
								personEntityService.fetchPerEntDisclTypeSelection(moduleItemKey).stream()
										.filter(item -> Constants.DISCLOSURE_TYPE_CODE_TRAVEL
												.equals(item.getDisclosureTypeCode()))
										.findFirst().ifPresent(perEntDisclType -> {
											EngagementsDetailsDTO engDetailsDTO = new EngagementsDetailsDTO();
											engDetailsDTO.setPerEntDisclTypeSelectedId(perEntDisclType.getId());
											engDetailsDTO.setPersonEntityId(moduleItemKey);
											personEntityService.deletePerEntRelationshipByDisclType(engDetailsDTO);
											personEntityService.deletePersonEntityRelationship(id, moduleItemKey);
										});
							}
						});
			}
		}
		return Map.of("isTravelDisclosureRequired", isTravelDisclosureRequired);
	}

	@Override
	public List<LookupResponseDto> getLookupValues(LookupRequestDto requestDto) {
		try {
			return generalDao.getLookupValues(requestDto);
		} catch (Exception e) {
			throw new RuntimeException("Error fetching lookup values", e);
		}
	}

	@Override
	public boolean checkPersonHasPermission(String rightNames) {
		if (personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), rightNames, null)) {
			return true;
		}
		return false;
	}

	@Override
	public ResponseEntity<Object> getAllLetterTemplateTypes(Integer moduleCode) {
		List<LetterTemplateType> letterTemplateTypes = new ArrayList<>();
		commonDao.getAllLetterTemplateTypes(moduleCode).forEach(object -> {
			Object[] obj = (Object[]) object;
			LetterTemplateType letterTemplateType = new LetterTemplateType();
			letterTemplateType.setLetterTemplateTypeCode((String) obj[0]);
			letterTemplateType.setFileName((String) obj[1]);
			letterTemplateType.setContentType((String) obj[2]);
			letterTemplateType.setPrintFileType((String) obj[3]);
			letterTemplateType.setModuleCode((Integer) obj[4]);
			letterTemplateTypes.add(letterTemplateType);
		});
		return new ResponseEntity<>(letterTemplateTypes, HttpStatus.OK);
	}

	@Override
	public Map<String, Boolean> getDeptLevelAvailableRights(String unitNumber, List<String> rights) {
		String personId = AuthenticatedUser.getLoginPersonId();
		List<CompletableFuture<Map.Entry<String, Boolean>>> futures = rights.stream()
				.map(right -> CompletableFuture.supplyAsync(() -> {
					boolean hasRight = personRoleRightDao.isPersonHasPermission(personId, right, unitNumber);
					return Map.entry(right, hasRight);
				})).toList();
		CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
		return futures.stream().map(CompletableFuture::join)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
	}

	@Override
	public boolean isDeptLevelRightsAvailable(String unitNumber, List<String> rights) {
		return personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), String.join(",", rights),
				unitNumber);
	}
	
	@Override
	public List<Person> findContractAdministrators(String searchString) {
	    return generalDao.getContractAdministrators(searchString);
	}
	
	@Override
	public int getPendingActionItemsCount(String PersonId) {
	    return generalDao.getPendingActionItemCountForPerson(PersonId);
	}

	@Override
	public ResponseEntity<Object> getAllLetterTemplateTypes(Integer moduleCode, Integer subModuleCode) {
		List<LetterTemplateType> letterTemplateTypes = new ArrayList<>();
		generalDao.getAllLetterTemplateTypes(moduleCode, subModuleCode).forEach(letterTemplate -> {
			LetterTemplateType letterTemplateType = new LetterTemplateType();
			letterTemplateType.setLetterTemplateTypeCode(letterTemplate.getLetterTemplateTypeCode());
			letterTemplateType.setFileName(letterTemplate.getFileName());
			letterTemplateType.setContentType(letterTemplate.getContentType());
			letterTemplateType.setPrintFileType(letterTemplate.getPrintFileType());
			letterTemplateType.setModuleCode(letterTemplate.getModuleCode());
			letterTemplateType.setSubModuleCode(letterTemplate.getSubModuleCode());
			letterTemplateTypes.add(letterTemplateType);
		});
		return new ResponseEntity<>(letterTemplateTypes, HttpStatus.OK);
	}

	@Override
	public List<Organization> findOrganizationList(CommonVO vo) {
		List<Organization> organizations = commonDao.fetchOrganizationList(vo);
		List<Integer> rolodexId = organizations.stream().map(organization -> organization.getContactAddressId()).collect(Collectors.toList());
		if(!rolodexId.isEmpty()){
			List<Rolodex> rolodex = commonDao.getRolodexDetailByRolodexId(rolodexId);
			Map<Integer, String> collect = rolodex.stream().filter(item -> item.getFullName() != null).collect(Collectors.toMap(Rolodex :: getRolodexId, Rolodex :: getFullName));
			organizations.stream()
					.filter(item -> collect.containsKey(item.getContactAddressId()))
					.forEach(item -> item.setContactPersonName(collect.get(item.getContactAddressId())));
		}
		return organizations;
	}
}
