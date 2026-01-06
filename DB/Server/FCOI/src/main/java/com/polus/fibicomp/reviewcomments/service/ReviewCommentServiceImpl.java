package com.polus.fibicomp.reviewcomments.service;

import static java.util.stream.Collectors.groupingBy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.core.questionnaire.service.QuestionnaireService;
import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dao.CoiManagementPlanDao;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionComp;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionRel;
import com.polus.fibicomp.coi.clients.FormBuilderClient;
import com.polus.fibicomp.coi.clients.model.BlankFormRequest;
import com.polus.fibicomp.coi.clients.model.BlankFormResponse;
import com.polus.fibicomp.coi.clients.model.FormBuilderSectionsComponentDTO;
import com.polus.fibicomp.coi.clients.model.FormBuilderSectionsDTO;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dao.GeneralDao;
import com.polus.fibicomp.coi.dto.COIFileRequestDto;
import com.polus.fibicomp.coi.dto.DisclosureDetailDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.dto.ProjectCommentResponseDto;
import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.service.COIFileAttachmentService;
import com.polus.fibicomp.coi.service.GeneralService;
import com.polus.fibicomp.coi.service.ProjectService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclPersonEntityRel;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjectEntityRel;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.reviewcomments.dao.ReviewCommentDao;
import com.polus.fibicomp.reviewcomments.dto.ModuleSectionDetailsDto;
import com.polus.fibicomp.reviewcomments.dto.OPADisclPersonEntityRelDto;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsCountDto;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsResponseDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import com.polus.fibicomp.reviewcomments.pojos.DisclComponentType;
import com.polus.fibicomp.travelDisclosure.dao.TravelDisclDao;

@Service("reviewCommentService")
@Transactional
public class ReviewCommentServiceImpl implements ReviewCommentService {

	@Autowired
	private ReviewCommentDao reviewCommentDao;

	@Autowired
	private COIFileAttachmentService coiFileAttachmentService;

	@Autowired
	private ConflictOfInterestDao conflictOfInterestDao;

	@Autowired
	private OPADao opaDao;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private QuestionnaireService questionnaireService;

	@Autowired
	private FormBuilderClient formBuilderClient;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private TravelDisclDao travelDisclDao;

	@Autowired
	private FcoiDisclosureDao fcoiDisclosureDao;

	@Autowired
	private PersonRoleRightDao personRoleRightDao;

	@Autowired
	private GeneralService generalService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private GeneralDao generalDao;

	@Autowired
	private CoiManagementPlanDao cmpDao;

	private static final String VIEW_COI_COMMENTS = "VIEW_COI_COMMENTS";
	private static final String MAINTAIN_COI_COMMENTS = "MAINTAIN_COI_COMMENTS";
	private static final String VIEW_COI_PRIVATE_COMMENTS = "VIEW_COI_PRIVATE_COMMENTS";
	private static final String MAINTAIN_COI_PRIVATE_COMMENTS = "MAINTAIN_COI_PRIVATE_COMMENTS";
	private static final String MAINTAIN_TRAVEL_PRIVATE_COMMENTS = "MAINTAIN_TRAVEL_PRIVATE_COMMENTS";
	private static final String VIEW_TRAVEL_PRIVATE_COMMENTS = "VIEW_TRAVEL_PRIVATE_COMMENTS";
	private static final String VIEW_TRAVEL_COMMENTS = "VIEW_TRAVEL_COMMENTS";
	private static final String MAINTAIN_TRAVEL_COMMENTS = "MAINTAIN_TRAVEL_COMMENTS";
	private static final String MAINTAIN_OPA_PRIVATE_COMMENTS = "MAINTAIN_OPA_PRIVATE_COMMENTS";
	private static final String VIEW_OPA_PRIVATE_COMMENTS = "VIEW_OPA_PRIVATE_COMMENTS";
	private static final String VIEW_OPA_COMMENTS = "VIEW_OPA_COMMENTS";
	private static final String MAINTAIN_OPA_COMMENTS = "MAINTAIN_OPA_COMMENTS";
	private static final String VIEW_CMP_COMMENTS = "VIEW_CMP_COMMENTS";
	private static final String MAINTAIN_CMP_COMMENTS = "MAINTAIN_CMP_COMMENTS";
	private static final String VIEW_CMP_PRIVATE_COMMENTS = "VIEW_CMP_PRIVATE_COMMENTS";
	private static final String MAINTAIN_CMP_PRIVATE_COMMENTS = "MAINTAIN_CMP_PRIVATE_COMMENTS";
	private static final String SECTION_NAME_CA_COMMENTS = "CA Comments";
	private static final String COMPONENT_TYPE_QUESTIONNAIRE = "4";
	private static final String COMPONENT_TYPE_ENGAGEMENTS = "5";
	private static final String COMPONENT_TYPE_PROJECT_RELATIONSHIPS = "6";
	private static final String COMPONENT_TYPE_REVIEW_COMMENTS = "8";
	private static final String COMPONENT_TYPE_CA_COMMENTS = "12";
	private static final String PRIVATE_RIGHT_NAMES = "PRIVATE";
	private static final String COMPONENT_TYPE_PROJECT = "14";
	private static final String COMPONENT_TYPE_OPA_FORM_COMMENT = "10";

	@Override
	public ResponseEntity<Object> saveOrUpdateReviewComment(MultipartFile[] files, DisclComment disclComment) {
		try {
			Map<Integer, List<String>> moduleRightsMap = Map.of(Constants.COI_MODULE_CODE,
					Arrays.asList(VIEW_COI_COMMENTS, MAINTAIN_COI_COMMENTS, VIEW_COI_PRIVATE_COMMENTS,
							MAINTAIN_COI_PRIVATE_COMMENTS),
					Constants.TRAVEL_MODULE_CODE,
					Arrays.asList(VIEW_TRAVEL_COMMENTS, MAINTAIN_TRAVEL_COMMENTS, VIEW_TRAVEL_PRIVATE_COMMENTS,
							MAINTAIN_TRAVEL_PRIVATE_COMMENTS),
					Constants.OPA_MODULE_CODE,
					Arrays.asList(VIEW_OPA_COMMENTS, MAINTAIN_OPA_COMMENTS, VIEW_OPA_PRIVATE_COMMENTS,
							MAINTAIN_OPA_PRIVATE_COMMENTS),
					Constants.COI_MANAGEMENT_PLAN_MODULE_CODE, Arrays.asList(VIEW_CMP_COMMENTS, MAINTAIN_CMP_COMMENTS,
							VIEW_CMP_PRIVATE_COMMENTS, MAINTAIN_CMP_PRIVATE_COMMENTS));

			List<String> rightNames = moduleRightsMap.getOrDefault(disclComment.getModuleCode(),
					Collections.emptyList());

			boolean hasPermission = !rightNames.isEmpty() && generalService
					.checkPersonHasPermission(disclComment.getDocumentOwnerPersonId(), String.join(",", rightNames));

			boolean isPersonInReviewer = generalDao.isPersonReviewerForModule(AuthenticatedUser.getLoginPersonId(),
					disclComment.getModuleCode());

			if (!isPersonInReviewer && !hasPermission) {
				throw new ApplicationException("Not Authorized to add or update comments", Constants.JAVA_ERROR,
						HttpStatus.FORBIDDEN);
			}

			List<String> privateRightNames = rightNames.stream().filter(right -> right.contains(PRIVATE_RIGHT_NAMES))
					.collect(Collectors.toList());
			if (disclComment.getParentCommentId() != null && disclComment.getIsPrivate().equals(true)) {
				DisclComment comment = reviewCommentDao
						.fetchReviewCommentByCommentId(disclComment.getParentCommentId());
				if ((!comment.getCommentPersonId().equals(AuthenticatedUser.getLoginPersonId()))
						&& (!(personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(),
								String.join(",", privateRightNames), null)))
						&& !isPersonInReviewer) {
					throw new ApplicationException("Not Authorized to add or update comments", Constants.JAVA_ERROR,
							HttpStatus.FORBIDDEN);
				}
			}
			disclComment.setUpdateUser(AuthenticatedUser.getLoginUserName());
			disclComment.setCommentPersonId(AuthenticatedUser.getLoginPersonId());
			if (disclComment.getCommentTags() != null) {
				disclComment.getCommentTags()
						.forEach(tag -> tag.setUpdateUser(AuthenticatedUser.getLoginUserFullName()));
			}
			reviewCommentDao.saveObject(disclComment);
			disclComment.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
			if (files != null) {
				COIFileRequestDto request = COIFileRequestDto.builder()
						.componentReferenceId(Integer.valueOf(disclComment.getModuleItemKey()))
						.componentReferenceNumber(disclComment.getModuleItemNumber()).attaStatusCode(null)
						.attaTypeCode(null).commentId(disclComment.getCommentId())
						.componentTypeCode(disclComment.getComponentTypeCode()).file(null).documentOwnerPersonId(null)
						.description(null).build();
				addReviewAttachment(files, request);
				List<CoiReviewAttachment> attachments = reviewCommentDao
						.loadReviewAttachmentByCommentId(disclComment.getCommentId());
				disclComment.setReviewAttachments(attachments);
			}
			if (disclComment.getModuleCode() == Constants.OPA_MODULE_CODE) {
				opaDao.updateOPADisclosureUpDetails(Integer.valueOf(disclComment.getModuleItemKey()),
						commonDao.getCurrentTimestamp());
			} else if (disclComment.getModuleCode() == Constants.COI_MODULE_CODE) {
				fcoiDisclosureDao.updateDisclosureUpdateDetails(Integer.valueOf(disclComment.getModuleItemKey()));
			} else if (disclComment.getModuleCode() == Constants.TRAVEL_MODULE_CODE) {
				travelDisclDao.updateDisclosureUpdateDetails(Integer.valueOf(disclComment.getModuleItemKey()));
			}
			return new ResponseEntity<>(disclComment, HttpStatus.OK);
		} catch (ApplicationException e) {
			throw new ApplicationException("Not Authorized to add or update comments", Constants.JAVA_ERROR,
					HttpStatus.FORBIDDEN);
		} catch (Exception e) {
			throw new ApplicationException("Unable to save/update data", e, Constants.JAVA_ERROR);
		}
	}

	public void addReviewAttachment(MultipartFile[] files, COIFileRequestDto request) {
		for (int i = 0; i < files.length; i++) {
			request.setFile(files[i]);
			coiFileAttachmentService.saveFileAttachment(request);
		}
	}

	/**
	 * This method is used get comments based on certain giving condition and
	 * process the comments to single layer parent child hierarchy
	 *
	 * @param reviewCommentsDto
	 * @return
	 */
	@Override
//    @org.springframework.transaction.annotation.Transactional(propagation = Propagation.NOT_SUPPORTED)
	public ResponseEntity<Object> fetchReviewComments(ReviewCommentsDto reviewCommentsDto) {
		List<ProjectCommentResponseDto> projectComments = new ArrayList<>();
		Map<Integer, List<String>> moduleRightsMap = Map.of(Constants.COI_MODULE_CODE, Arrays.asList(VIEW_COI_COMMENTS,
				MAINTAIN_COI_COMMENTS, VIEW_COI_PRIVATE_COMMENTS, MAINTAIN_COI_PRIVATE_COMMENTS),
				Constants.TRAVEL_MODULE_CODE,
				Arrays.asList(VIEW_TRAVEL_COMMENTS, MAINTAIN_TRAVEL_COMMENTS, VIEW_TRAVEL_PRIVATE_COMMENTS,
						MAINTAIN_TRAVEL_PRIVATE_COMMENTS),
				Constants.OPA_MODULE_CODE,
				Arrays.asList(VIEW_OPA_COMMENTS, MAINTAIN_OPA_COMMENTS, VIEW_OPA_PRIVATE_COMMENTS,
						MAINTAIN_OPA_PRIVATE_COMMENTS),
				Constants.COI_MANAGEMENT_PLAN_MODULE_CODE, Arrays.asList(VIEW_CMP_COMMENTS, MAINTAIN_CMP_COMMENTS,
						VIEW_CMP_PRIVATE_COMMENTS, MAINTAIN_CMP_PRIVATE_COMMENTS));

		List<String> rightNames = moduleRightsMap.getOrDefault(reviewCommentsDto.getModuleCode(),
				Collections.emptyList());

		boolean hasPermission = !rightNames.isEmpty() && generalService
				.checkPersonHasPermission(reviewCommentsDto.getDocumentOwnerPersonId(), String.join(",", rightNames));

		boolean isPersonInReviewer = generalDao.isPersonReviewerForModule(AuthenticatedUser.getLoginPersonId(),
				reviewCommentsDto.getModuleCode());

		if (!isPersonInReviewer && !hasPermission) {
			throw new ApplicationException("Not Authorized to view comments", Constants.JAVA_ERROR,
					HttpStatus.FORBIDDEN);
		}

		reviewCommentsDto.setIsPrivate(false);
		List<String> privateRightNames = rightNames.stream().filter(right -> right.contains(PRIVATE_RIGHT_NAMES))
				.collect(Collectors.toList());
		if (!personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(),
				String.join(",", privateRightNames), null) && !isPersonInReviewer) {
			reviewCommentsDto.setRequirePersonPrivateComments(true);
			reviewCommentsDto.setCommentPersonId(AuthenticatedUser.getLoginPersonId());
		} else {
			reviewCommentsDto.setIsPrivate(null);
		}
		List<DisclComment> reviewComments = reviewCommentDao.fetchReviewComments(reviewCommentsDto);
		Map<Integer, List<DisclComment>> childComments = reviewComments.stream()
				.filter(disclComment -> disclComment.getParentCommentId() != null)
				.collect(groupingBy(DisclComment::getParentCommentId));
		reviewComments.removeIf(disclComment -> disclComment.getParentCommentId() != null);
		reviewComments = reviewComments.stream().map(disclComment -> {
			disclComment.setChildComments(childComments.get(disclComment.getCommentId()));
			return disclComment;
		}).collect(Collectors.toList());
		HashMap<String, String> userNames = new HashMap<>();
		HashMap<String, String> proposalTitles = new HashMap<>();
		HashMap<String, String> awardTitles = new HashMap<>();
		HashMap<String, String> personEntityNames = new HashMap<>();
		BlankFormResponse formResponse = null;
		Map<Integer, FormBuilderSectionsDTO> builderSectionsDTOMap = new HashMap<>();
		updateCommentObjects(reviewComments, userNames, proposalTitles, awardTitles, personEntityNames,
				reviewCommentsDto.getIsSectionDetailsNeeded(), formResponse, builderSectionsDTOMap);
		if (Constants.COI_MODULE_CODE.equals(reviewCommentsDto.getModuleCode()) && !rightNames.isEmpty()
				&& generalService.checkPersonHasPermission(String.join(",", rightNames))) {
			projectComments = reviewCommentsDto.getProjects() != null ? reviewCommentsDto.getProjects().stream()
					.filter(projectMap -> projectMap.get("projectNumber") != null
							&& projectMap.get("projectModuleCode") != null)
					.map(projectMap -> {
						String projectNumber = (String) projectMap.get("projectNumber");
						Integer projectModuleCode = (Integer) projectMap.get("projectModuleCode");
						List<ProjectCommentDto> comments = (List<ProjectCommentDto>) projectService.fetchComment(
								ProjectCommentDto.builder().commentTypeCode(Constants.PROJECT_COMMENT_TYPE_GENERAL)
										.moduleCode(projectModuleCode).moduleItemKey(projectNumber).build());
						String projectTitle = projectService.fetchProjectTitle(projectModuleCode, projectNumber);
						return new ProjectCommentResponseDto(projectNumber, projectTitle,
								comments != null ? comments : Collections.emptyList());
					}).collect(Collectors.toList()) : Collections.emptyList();
		}
		return new ResponseEntity<>(
				ReviewCommentsResponseDto.builder().comments(reviewComments).projectComments(projectComments).build(),
				HttpStatus.OK);
	}

	void updateCommentObjects(List<DisclComment> reviewComments, HashMap<String, String> userNames,
			HashMap<String, String> proposalTitles, HashMap<String, String> awardTitles,
			HashMap<String, String> personEntityNames, Boolean isSectionDetailsNeeded, BlankFormResponse formResponse,
			Map<Integer, FormBuilderSectionsDTO> builderSectionsDTOMap) {
		reviewComments.forEach(commentObj -> {
			if (!userNames.containsKey(commentObj.getUpdateUser())) {
				userNames.put(commentObj.getUpdateUser(),
						personDao.getUserFullNameByUserName(commentObj.getUpdateUser()));
			}
			commentObj.setUpdateUserFullName(userNames.get(commentObj.getUpdateUser()));
			if (Boolean.TRUE.equals(commentObj.getIsResolved())) {
				commentObj.setResolvedUserFullName(personDao.getPersonFullNameByPersonId(commentObj.getResolvedBy()));
			}
			List<CoiReviewAttachment> attachments = reviewCommentDao
					.loadReviewAttachmentByCommentId(commentObj.getCommentId());
			if (attachments != null || !attachments.isEmpty()) {
				commentObj.setReviewAttachments(attachments);
			}
			if (commentObj.getChildComments() != null) {
				if (Boolean.TRUE.equals(commentObj.getIsResolved())) {
					resolveChildCommentsRecursively(commentObj.getChildComments());
				}
				updateCommentObjects(commentObj.getChildComments(), userNames, proposalTitles, awardTitles,
						personEntityNames, isSectionDetailsNeeded, formResponse, builderSectionsDTOMap);
			}
			if (commentObj.getCommentTags() != null) {
				commentObj.getCommentTags().forEach(tagObj -> tagObj
						.setTagPersonFullName(personDao.getPersonFullNameByPersonId(tagObj.getTagPersonId())));
			}
			if (isSectionDetailsNeeded != null && isSectionDetailsNeeded) {
				if (commentObj.getModuleCode() == Constants.COI_MODULE_CODE
						|| commentObj.getModuleCode() == Constants.OPA_MODULE_CODE) {
					getModuleSectionDetails(commentObj, proposalTitles, awardTitles, personEntityNames);
				} else if (Constants.COI_MANAGEMENT_PLAN_MODULE_CODE == commentObj.getModuleCode()) {
					getCmpModuleSectionDetails(commentObj);
				}
//            	The below code is not required for the current implementation of OPA, as it is used to retrieve comment form details and review comment information of an OPA.
//            	else if (commentObj.getModuleCode() == Constants.OPA_MODULE_CODE) {
//                    getCommentsFormDetails(commentObj, formResponse, builderSectionsDTOMap);
//                    if (commentObj.getComponentTypeCode().equals("11") && commentObj.getSubModuleItemKey() != null) {
//                    	OPAReview opaReview = opaReviewDao.getOPAReview(Integer.parseInt(commentObj.getSubModuleItemKey()));
//                        ModuleSectionDetailsDto sectionDetails = new ModuleSectionDetailsDto();
//                        Map<String, String> otherDetails = new HashMap<>();
//                        otherDetails.put("location", opaReview.getReviewLocationType().getDescription());
//                        otherDetails.put("reviewerStatus", opaReview.getReviewStatusType().getDescription());
//                        if (opaReview.getAssigneePersonId() != null) {
//                            otherDetails.put("assigneeName", personDao.getPersonFullNameByPersonId(opaReview.getAssigneePersonId()));
//                        }
//                        sectionDetails.setOtherDetails(otherDetails);
//                        commentObj.setModuleSectionDetails(sectionDetails);
//                    }
//                }
			}
			// If the comment is associated with a Form Component, replace the component
			// type description with the corresponding section name.
			if (commentObj.getFormBuilderSectionId() != null && commentObj.getFormBuilderComponentId() != null) {
				String sectionName = formBuilderClient.getFormBuilderSectionName(commentObj.getFormBuilderSectionId());
				if (commentObj.getComponentType() != null && sectionName != null && !sectionName.isEmpty()) {
					DisclComponentType disclComponentType = new DisclComponentType();
					disclComponentType.setComponentTypeCode(commentObj.getComponentType().getComponentTypeCode());
					disclComponentType.setDescription(sectionName);
					disclComponentType.setUpdateTimestamp(commentObj.getComponentType().getUpdateTimestamp());
					disclComponentType.setUpdateUser(commentObj.getComponentType().getUpdateUser());
					disclComponentType.setIsActive(commentObj.getComponentType().getIsActive());
					commentObj.setComponentType(disclComponentType);
				}
			}
		});
	}

	private void getCmpModuleSectionDetails(DisclComment commentObj) {
		if (commentObj == null || commentObj.getParentCommentId() != null) {
			return;
		}
		String componentType = commentObj.getComponentTypeCode();
		String subModuleKey = commentObj.getSubModuleItemKey();
		if (subModuleKey == null) {
			return;
		}
		if (Constants.CMP_COMPONENT_TYPE_SECTION.equals(componentType)) {
			CoiManagementPlanSectionRel sectionRel = cmpDao.getSectionByCmpSectionRelId(Integer.parseInt(subModuleKey));
			if (sectionRel == null) {
				return;
			}
			commentObj.setModuleSectionDetails(
					ModuleSectionDetailsDto.builder().sectionId(String.valueOf(sectionRel.getCmpSectionRelId()))
							.sectionName(sectionRel.getSectionName()).build());
			return;
		}
		if (Constants.CMP_COMPONENT_TYPE_SECTION_COMPONENT.equals(componentType)) {
			CoiManagementPlanSectionComp sectionComp = cmpDao.getSectionCompBySecCompId(Integer.parseInt(subModuleKey));
			if (sectionComp == null) {
				return;
			}
			CoiManagementPlanSectionRel sectionRel = sectionComp.getCoiMgmtPlanSectionRel();
			if (sectionRel == null) {
				return;
			}
			commentObj.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
					.sectionId(String.valueOf(sectionRel.getCmpSectionRelId())).sectionName(sectionRel.getSectionName())
					.subsectionId(String.valueOf(sectionComp.getSecCompId()))
					.subsectionName(sectionComp.getDescription()).build());
		}
	}

	private void resolveChildCommentsRecursively(List<DisclComment> childComments) {
		if (childComments == null)
			return;

		for (DisclComment child : childComments) {
			child.setIsParentCommentResolved(Boolean.TRUE);
			resolveChildCommentsRecursively(child.getChildComments());
		}
	}

	private void getModuleSectionDetails(DisclComment reviewComments, HashMap<String, String> proposalTitles,
			HashMap<String, String> awardTitles, HashMap<String, String> personEntityNames) {
		if ((reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_ENGAGEMENTS)
				|| reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_OPA_FORM_COMMENT))
				&& reviewComments.getParentCommentId() == null && reviewComments.getSubModuleItemNumber() != null) {
			PersonEntity personEntity = null;
			if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_ENGAGEMENTS)) {
				CoiDisclPersonEntityRel coiDisclPersonEntityRel = conflictOfInterestDao
						.getLinkedFcoiOrProjDisclPersonEntityByNumber(
								Integer.valueOf(reviewComments.getSubModuleItemNumber()),
								reviewComments.getModuleItemKey());
				personEntity = conflictOfInterestDao
						.getPersonEntityDetailsById(coiDisclPersonEntityRel.getPersonEntityId());
			} else if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_OPA_FORM_COMMENT)) {
				try {
					ResponseEntity<Object> response = formBuilderClient.getLinkedOpaDisclPersonEntity(
							Integer.valueOf(reviewComments.getSubModuleItemNumber()),
							reviewComments.getModuleItemKey());
					ObjectMapper mapper = new ObjectMapper();
					OPADisclPersonEntityRelDto opaDisclPersonEntityRelDto = mapper.convertValue(response.getBody(),
							OPADisclPersonEntityRelDto.class);
					personEntity = conflictOfInterestDao
							.getPersonEntityDetailsById(opaDisclPersonEntityRelDto.getPersonEntityId());
				} catch (Exception e) {
					throw new RuntimeException("Failed to call getLinkedOpaDisclPersonEntity : " + e.getMessage());
				}
			} else {
				personEntity = conflictOfInterestDao
						.getPersonEntityDetailsById(Integer.valueOf(reviewComments.getSubModuleItemKey()));
			}
			if (personEntity != null) {
				reviewComments.setModuleSectionDetails(
						ModuleSectionDetailsDto.builder().sectionName(personEntity.getCoiEntity().getEntityName())
								.sectionId(String.valueOf(personEntity.getPersonEntityId())).build());
			}
		}
		if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_QUESTIONNAIRE)
				&& reviewComments.getParentCommentId() == null && reviewComments.getSubModuleItemKey() != null) {
			QuestionnaireDataBus questionnaireDataBus = new QuestionnaireDataBus();
			questionnaireDataBus.setQuestionnaireId(Integer.valueOf(reviewComments.getSubModuleItemKey()));
			QuestionnaireDataBus questData = questionnaireService.getQuestionnaireDetails(questionnaireDataBus);
			reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
					.sectionName(String.valueOf(questData.getHeader().get("QUESTIONNAIRE_NAME"))).build());
		}
		if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_PROJECT)
				&& reviewComments.getParentCommentId() == null && reviewComments.getSubModuleItemKey() != null
				&& reviewComments.getSubModuleItemNumber() != null) {
			if (reviewComments.getSubModuleItemNumber().equals(Constants.DEV_PROPOSAL_MODULE_CODE.toString())) {
				getProposalDetail(reviewComments, proposalTitles);
			} else if (reviewComments.getSubModuleItemNumber().equals(Constants.AWARD_MODULE_CODE.toString())) {
				getAwardDetail(reviewComments, awardTitles);
			}
		}
		if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_PROJECT_RELATIONSHIPS)
				&& reviewComments.getParentCommentId() == null && reviewComments.getSubModuleItemKey() != null
				&& reviewComments.getSubModuleItemNumber() == null) {
			CoiDisclProjectEntityRel relationDetail = fcoiDisclosureDao
					.getCoiDisclProjectEntityRelById(Integer.valueOf(reviewComments.getSubModuleItemKey()));
			if (relationDetail != null
					&& relationDetail.getCoiDisclProject().getModuleCode() == Constants.DEV_PROPOSAL_MODULE_CODE) {
				getProposalDetail(reviewComments, proposalTitles, relationDetail);
			} else if (relationDetail != null
					&& relationDetail.getCoiDisclProject().getModuleCode() == Constants.AWARD_MODULE_CODE) {
				getAwardDetail(reviewComments, awardTitles, relationDetail);
			}
			if (relationDetail != null && relationDetail.getPersonEntityId() != null) {
				getPersonEntityDetail(reviewComments, personEntityNames, relationDetail);
			}
		}

		if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_REVIEW_COMMENTS)
				&& reviewComments.getSubModuleItemKey() != null) {
			CoiReview coiReview = conflictOfInterestDao
					.loadCoiReview(Integer.parseInt(reviewComments.getSubModuleItemKey()));
			ModuleSectionDetailsDto sectionDetails = new ModuleSectionDetailsDto();
			Map<String, String> otherDetails = new HashMap<>();
			otherDetails.put("location", coiReview.getReviewLocationType().getDescription());
			otherDetails.put("reviewerStatus", coiReview.getReviewerStatusType().getDescription());
			if (coiReview.getAssigneePersonId() != null) {
				otherDetails.put("assigneeName",
						personDao.getPersonFullNameByPersonId(coiReview.getAssigneePersonId()));
			}
			sectionDetails.setOtherDetails(otherDetails);
			reviewComments.setModuleSectionDetails(sectionDetails);
		}
		if (reviewComments.getComponentTypeCode().equals(COMPONENT_TYPE_CA_COMMENTS)
				&& reviewComments.getParentCommentId() == null) {
			reviewComments.setModuleSectionDetails(
					ModuleSectionDetailsDto.builder().sectionName(SECTION_NAME_CA_COMMENTS).build());
		}
	}

	private void getPersonEntityDetail(DisclComment reviewComments, HashMap<String, String> personEntityNames,
			CoiDisclProjectEntityRel relationDetail) {
		if (!personEntityNames.containsKey(relationDetail.getPersonEntityId())) {
			PersonEntity personEntity = conflictOfInterestDao
					.getPersonEntityDetailsById(Integer.valueOf(relationDetail.getPersonEntityId()));
			personEntityNames.put(String.valueOf(relationDetail.getPersonEntityId()),
					personEntity.getCoiEntity().getEntityName());
		}
		if (reviewComments.getModuleSectionDetails() == null) {
			reviewComments.setModuleSectionDetails(new ModuleSectionDetailsDto());
		}
		reviewComments.getModuleSectionDetails()
				.setSubsectionName(personEntityNames.get(String.valueOf(relationDetail.getPersonEntityId())));
		reviewComments.getModuleSectionDetails().setSectionId(String.valueOf(relationDetail.getPersonEntityId()));
	}

	private void getAwardDetail(DisclComment reviewComments, HashMap<String, String> awardTitles,
			CoiDisclProjectEntityRel relationDetail) {
		if (!awardTitles.containsKey(relationDetail.getCoiDisclProject().getModuleItemKey())) {
			List<DisclosureDetailDto> awardDetails = conflictOfInterestDao.getProjectsBasedOnParams(
					Constants.AWARD_MODULE_CODE, null, null, relationDetail.getCoiDisclProject().getModuleItemKey());

			awardTitles.put(relationDetail.getCoiDisclProject().getModuleItemKey(), awardDetails.get(0).getTitle());
		}
		reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
				.sectionName(awardTitles.get(relationDetail.getCoiDisclProject().getModuleItemKey()))
				.sectionId(relationDetail.getCoiDisclProject().getModuleItemKey()).build());
	}

	private void getProposalDetail(DisclComment reviewComments, HashMap<String, String> proposalTitles,
			CoiDisclProjectEntityRel relationDetail) {
		if (!proposalTitles.containsKey(relationDetail.getCoiDisclProject().getModuleItemKey())) {
			List<DisclosureDetailDto> proposalDetails = conflictOfInterestDao.getProjectsBasedOnParams(
					Constants.DEV_PROPOSAL_MODULE_CODE, null, null,
					relationDetail.getCoiDisclProject().getModuleItemKey());
			proposalTitles.put(relationDetail.getCoiDisclProject().getModuleItemKey(),
					proposalDetails.get(0).getTitle());
		}
		reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
				.sectionName(proposalTitles.get(relationDetail.getCoiDisclProject().getModuleItemKey()))
				.sectionId(relationDetail.getCoiDisclProject().getModuleItemKey()).build());
	}

	private void getAwardDetail(DisclComment reviewComments, HashMap<String, String> awardTitles) {
		if (!awardTitles.containsKey(reviewComments.getSubModuleItemKey())) {
			List<DisclosureDetailDto> awardDetails = conflictOfInterestDao.getProjectsBasedOnParams(
					Constants.AWARD_MODULE_CODE, null, null, reviewComments.getSubModuleItemKey());
			awardTitles.put(String.valueOf(reviewComments.getSubModuleItemKey()), awardDetails.get(0).getTitle());
		}
		reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
				.sectionName(awardTitles.get(String.valueOf(reviewComments.getSubModuleItemKey())))
				.sectionId(String.valueOf(reviewComments.getSubModuleItemKey())).build());
	}

	private void getProposalDetail(DisclComment reviewComments, HashMap<String, String> proposalTitles) {
		if (!proposalTitles.containsKey(reviewComments.getSubModuleItemKey())) {
			List<DisclosureDetailDto> proposalDetails = conflictOfInterestDao.getProjectsBasedOnParams(
					Constants.DEV_PROPOSAL_MODULE_CODE, null, null, reviewComments.getSubModuleItemKey());
			proposalTitles.put(String.valueOf(reviewComments.getSubModuleItemKey()), proposalDetails.get(0).getTitle());
		}
		reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
				.sectionName(proposalTitles.get(String.valueOf(reviewComments.getSubModuleItemKey())))
				.sectionId(String.valueOf(reviewComments.getSubModuleItemKey())).build());
	}

	void getCommentsFormDetails(DisclComment reviewComments, BlankFormResponse formResponse,
			Map<Integer, FormBuilderSectionsDTO> builderSectionsDTOMap) {
		try {
			if (formResponse == null && reviewComments.getFormBuilderId() != null) {
				formResponse = formBuilderClient
						.getBlankForm(BlankFormRequest.builder()
								.moduleItemCode(String.valueOf(Constants.OPA_MODULE_CODE))
								.moduleItemKey(String.valueOf(reviewComments.getFormBuilderId())).moduleSubItemCode("0")
								.moduleSubItemKey("0").formBuilderId(reviewComments.getFormBuilderId()).build())
						.getBody();
			}
			if (reviewComments.getFormBuilderId() != null && reviewComments.getFormBuilderSectionId() == null) {
				reviewComments.setModuleSectionDetails(
						ModuleSectionDetailsDto.builder().sectionName(formResponse.getForm().getFormName()).build());
			} else if (reviewComments.getFormBuilderSectionId() != null
					&& reviewComments.getFormBuilderComponentId() == null) {
				if (!builderSectionsDTOMap.containsKey(reviewComments.getFormBuilderSectionId())) {
					FormBuilderSectionsDTO sectionDto = formResponse.getForm().getFormSections().stream()
							.filter(section -> section.getSectionId().equals(reviewComments.getFormBuilderSectionId()))
							.collect(Collectors.toList()).get(0);
					builderSectionsDTOMap.put(sectionDto.getSectionId(), sectionDto);
				}
				reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
						.sectionName(
								builderSectionsDTOMap.get(reviewComments.getFormBuilderSectionId()).getSectionName())
						.build());
			} else if (reviewComments.getFormBuilderComponentId() != null) {
				if (!builderSectionsDTOMap.containsKey(reviewComments.getFormBuilderSectionId())) {
					FormBuilderSectionsDTO sectionDto = formResponse.getForm().getFormSections().stream()
							.filter(section -> section.getSectionId().equals(reviewComments.getFormBuilderSectionId()))
							.collect(Collectors.toList()).get(0);
					builderSectionsDTOMap.put(sectionDto.getSectionId(), sectionDto);
				}
				FormBuilderSectionsComponentDTO component = builderSectionsDTOMap
						.get(reviewComments.getFormBuilderSectionId()).getSectionComponent().stream()
						.filter(formBuilderSectionsComponentDTO -> formBuilderSectionsComponentDTO.getComponentId()
								.equals(reviewComments.getFormBuilderComponentId()))
						.collect(Collectors.toList()).get(0);
				reviewComments.setModuleSectionDetails(ModuleSectionDetailsDto.builder()
						.subsectionName(component.getComponentHeader())
						.sectionName(
								builderSectionsDTOMap.get(reviewComments.getFormBuilderSectionId()).getSectionName())
						.build());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public ResponseEntity<Object> deleteReviewComment(Integer reviewCommentId, Integer moduleCode) {
		DisclComment disclComment = reviewCommentDao.fetchReviewCommentByCommentId(reviewCommentId);
		if (moduleCode == Constants.COI_MODULE_CODE
				&& !(disclComment.getCommentPersonId().equals(AuthenticatedUser.getLoginPersonId()))) {
			throw new ApplicationException("Not authorized to delete this comment", Constants.JAVA_ERROR,
					HttpStatus.FORBIDDEN);
		}
		if (disclComment == null) {
			return new ResponseEntity<>("No data found", HttpStatus.NO_CONTENT);
		}
		List<Integer> childCommentIds = reviewCommentDao.getAllChildCommentId(reviewCommentId);
		childCommentIds = childCommentIds != null ? childCommentIds : new ArrayList<>();
		childCommentIds.add(reviewCommentId);
		childCommentIds.forEach(
				commentId -> reviewCommentDao.loadReviewAttachmentByCommentId(commentId).forEach(attachment -> {
					COIFileRequestDto request = COIFileRequestDto.builder().attachmentId(attachment.getAttachmentId())
							.fileDataId(attachment.getFileDataId()).build();
					coiFileAttachmentService.deleteReviewAttachment(request);
				}));
		reviewCommentDao.deleteReviewComment(reviewCommentId);
		if (disclComment.getModuleCode() == Constants.OPA_MODULE_CODE) {
			opaDao.updateOPADisclosureUpDetails(Integer.valueOf(disclComment.getModuleItemKey()),
					disclComment.getUpdateTimestamp());
		} else if (disclComment.getModuleCode() == Constants.COI_MODULE_CODE) {
			fcoiDisclosureDao.updateDisclosureUpdateDetails(Integer.valueOf(disclComment.getModuleItemKey()));
		}
		Map<String, Object> response = new HashMap<>();
		response.put("status", true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> deleteReviewAttachment(Integer attachmentId) {
		Integer commentId = coiFileAttachmentService.deleteReviewAttachmentById(attachmentId);
		DisclComment disclComment = reviewCommentDao.fetchReviewCommentByCommentId(commentId);
		if (disclComment.getModuleCode() == Constants.OPA_MODULE_CODE) {
			opaDao.updateOPADisclosureUpDetails(Integer.valueOf(disclComment.getModuleItemKey()),
					disclComment.getUpdateTimestamp());
		} else if (disclComment.getModuleCode() == Constants.COI_MODULE_CODE) {
			fcoiDisclosureDao.updateDisclosureUpdateDetails(Integer.valueOf(disclComment.getModuleItemKey()));
		}
		Map<String, Object> response = new HashMap<>();
		response.put("status", true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<byte[]> downloadReviewAttachment(Integer attachmentId) {
		return coiFileAttachmentService.downloadReviewAttachment(attachmentId);
	}

	@Override
	public ResponseEntity<Map<String, Object>> getReviewCommentsCount(ReviewCommentsDto reviewCommentsDto) {
		try {
			Map<String, Object> countDetails = new HashMap<>();
			Map<Integer, List<String>> moduleRightsMap = Map.of(Constants.COI_MODULE_CODE,
					Arrays.asList(VIEW_COI_COMMENTS, MAINTAIN_COI_COMMENTS, VIEW_COI_PRIVATE_COMMENTS,
							MAINTAIN_COI_PRIVATE_COMMENTS),
					Constants.TRAVEL_MODULE_CODE,
					Arrays.asList(VIEW_TRAVEL_COMMENTS, MAINTAIN_TRAVEL_COMMENTS, VIEW_TRAVEL_PRIVATE_COMMENTS,
							MAINTAIN_TRAVEL_PRIVATE_COMMENTS),
					Constants.OPA_MODULE_CODE,
					Arrays.asList(VIEW_OPA_COMMENTS, MAINTAIN_OPA_COMMENTS, VIEW_OPA_PRIVATE_COMMENTS,
							MAINTAIN_OPA_PRIVATE_COMMENTS),
					Constants.COI_MANAGEMENT_PLAN_MODULE_CODE, Arrays.asList(VIEW_CMP_COMMENTS, MAINTAIN_CMP_COMMENTS,
							VIEW_CMP_PRIVATE_COMMENTS, MAINTAIN_CMP_PRIVATE_COMMENTS));

			List<String> rightNames = moduleRightsMap.getOrDefault(reviewCommentsDto.getModuleCode(),
					Collections.emptyList());

			boolean hasPermission = !rightNames.isEmpty() && generalService.checkPersonHasPermission(
					reviewCommentsDto.getDocumentOwnerPersonId(), String.join(",", rightNames));

			boolean isPersonInReviewer = generalDao.isPersonReviewerForModule(AuthenticatedUser.getLoginPersonId(),
					reviewCommentsDto.getModuleCode());

			if (!isPersonInReviewer && !hasPermission) {
				countDetails.put("reviewCommentsCount", null);
				countDetails.put("totalCount", 0);
				return new ResponseEntity<>(countDetails, HttpStatus.OK);
			}

			reviewCommentsDto.setIsPrivate(false);
			List<String> privateRightNames = rightNames.stream().filter(right -> right.contains(PRIVATE_RIGHT_NAMES))
					.collect(Collectors.toList());
			if (!personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(),
					String.join(",", privateRightNames), null) && !isPersonInReviewer) {
				reviewCommentsDto.setRequirePersonPrivateComments(true);
				reviewCommentsDto.setCommentPersonId(AuthenticatedUser.getLoginPersonId());
			} else {
				reviewCommentsDto.setIsPrivate(null);
			}
			List<ReviewCommentsCountDto> counts = reviewCommentDao.fetchReviewCommentsCount(reviewCommentsDto);
			Long totalCount = counts.stream().mapToLong(ReviewCommentsCountDto::getCount).sum();
			if (Constants.COI_MODULE_CODE.equals(reviewCommentsDto.getModuleCode()) && !rightNames.isEmpty()
					&& generalService.checkPersonHasPermission(String.join(",", rightNames))) {
				List<Map<String, Object>> projectCommentCount = reviewCommentsDto.getProjects() != null
						? reviewCommentsDto.getProjects().stream()
								.filter(projectMap -> projectMap.get("projectNumber") != null
										&& projectMap.get("projectModuleCode") != null)
								.map(projectMap -> {
									String projectNumber = (String) projectMap.get("projectNumber");
									Integer projectModuleCode = (Integer) projectMap.get("projectModuleCode");
									Integer commentCount = projectService
											.fetchCommentCount(
													ProjectCommentDto.builder()
															.commentTypeCode(Constants.PROJECT_COMMENT_TYPE_GENERAL)
															.moduleCode(projectModuleCode).moduleItemKey(projectNumber)
															.replyCommentsCountRequired(
																	reviewCommentsDto.getReplyCommentsCountRequired())
															.build());
									Map<String, Object> resultMap = new HashMap<>();
									resultMap.put("projectNumber", projectNumber);
									resultMap.put("projectModuleCode", projectModuleCode);
									resultMap.put("commentCount", commentCount != null ? commentCount : 0);
									return resultMap;
								}).collect(Collectors.toList())
						: Collections.emptyList();
				long totalProjectCommentCount = projectCommentCount.stream()
						.mapToLong(map -> ((Number) map.getOrDefault("commentCount", 0)).longValue()).sum();
				totalCount += totalProjectCommentCount;
				countDetails.put("projectCommentCount", projectCommentCount);
			}
			counts.forEach(dto -> {
				if (COMPONENT_TYPE_OPA_FORM_COMMENT.equals(dto.getComponentTypeCode())
						|| COMPONENT_TYPE_ENGAGEMENTS.equals(dto.getComponentTypeCode())) {
					dto.setSubModuleItemKey(null);
				}
			});
			countDetails.put("reviewCommentsCount", counts);
			countDetails.put("totalCount", totalCount);
			return new ResponseEntity<>(countDetails, HttpStatus.OK);
		} catch (Exception e) {
			throw new ApplicationException("Unable to fetch count", e, Constants.JAVA_ERROR);
		}
	}

	@Override
	public void resolveDisclCommentById(Integer commentId) {
		boolean updated = reviewCommentDao.updateDisclCommentAsResolved(commentId, commonDao.getCurrentTimestamp());

		if (!updated) {
			throw new EntityNotFoundException("Comment not found with ID: " + commentId);
		}
	}

}
