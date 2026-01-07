
package com.polus.fibicomp.coi.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;

import com.polus.core.constants.CoreConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.persontraining.pojo.PersonTraining;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.clients.FibiCoiConnectClient;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dao.ProjectDao;
import com.polus.fibicomp.coi.dto.AwardDTO;
import com.polus.fibicomp.coi.dto.AwardPersonDTO;
import com.polus.fibicomp.coi.dto.CoiProjectAwardHistoryDTO;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.dto.ProjectOverviewDto;
import com.polus.fibicomp.coi.dto.ProjectOverviewResponseDto;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLogRecipient;
import com.polus.fibicomp.coi.pojo.CoiProjectAwardHistory;
import com.polus.fibicomp.coi.pojo.CoiProjectComment;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.MyAwardDashboardVO;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.service.FcoiDisclosureService;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class ProjectServiceImpl implements ProjectService {

	private static final String PROJECT_TYPE_PROPOSAL = "Proposal";
	private static final String NEW_DISCLOSURE_REQUIRED_NO = "N";

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private ProjectDao projectDao;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private FibiCoiConnectClient fibiCoiConnectClient;

	@Autowired
	private FcoiDisclosureService fcoiDisclosureService;

	@Autowired
	private ConflictOfInterestService coiService;

	@Autowired
	private FcoiDisclosureDao disclosureDao;

	@Autowired
	private ConflictOfInterestDao conflictOfInterestDao;

	@Override
	public ResponseEntity<Object> saveComment(ProjectCommentDto dto) {
		CoiProjectComment coiProjectComment = CoiProjectComment.builder().comment(dto.getComment())
				.commentBy(AuthenticatedUser.getLoginPersonId()).commentTypeCode(dto.getCommentTypeCode())
				.isPrivate(dto.getIsPrivate() != null ? dto.getIsPrivate() : Boolean.FALSE)
				.moduleCode(dto.getModuleCode()).moduleItemKey(dto.getModuleItemKey())
				.parentCommentId(dto.getParentCommentId()).updatedBy(AuthenticatedUser.getLoginUserName())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		projectDao.saveComment(coiProjectComment);
		return new ResponseEntity<>("Comment saved successfully", HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> updateComment(ProjectCommentDto dto) {
		projectDao.updateComment(dto);
		return new ResponseEntity<>("Comment updated successfully", HttpStatus.OK);
	}

	@Override
	public List<ProjectCommentDto> fetchComment(ProjectCommentDto dto) {
		List<CoiProjectComment> comments = projectDao.fetchComment(dto);

		Map<Integer, CoiProjectComment> commentMap = comments.stream()
				.collect(Collectors.toMap(CoiProjectComment::getCommentId, Function.identity()));

		List<ProjectCommentDto> commentsDto = comments.stream().map(comment -> mapToDto(comment, commentMap))
				.collect(Collectors.toList());

		Map<Integer, List<ProjectCommentDto>> childComments = commentsDto.stream()
				.filter(comment -> comment.getParentCommentId() != null)
				.collect(Collectors.groupingBy(ProjectCommentDto::getParentCommentId));

		commentsDto.removeIf(comment -> comment.getParentCommentId() != null);

		commentsDto = commentsDto.stream().map(comment -> {
			comment.setChildComments(childComments.get(comment.getCommentId()));
			return comment;
		}).collect(Collectors.toList());
		return commentsDto;
	}

	private ProjectCommentDto mapToDto(CoiProjectComment comment, Map<Integer, CoiProjectComment> commentMap) {
		ProjectCommentDto dto = new ProjectCommentDto();
		dto.setCommentId(comment.getCommentId());
		dto.setCommentBy(comment.getCommentBy());
		dto.setParentCommentId(comment.getParentCommentId());
		dto.setComment(comment.getComment());
		dto.setCommentTypeCode(comment.getCommentTypeCode());
		dto.setCommentType(comment.getCommentType());
		dto.setModuleCode(comment.getModuleCode());
		dto.setIsPrivate(comment.getIsPrivate());
		dto.setModuleItemKey(comment.getModuleItemKey());
		dto.setUpdateTimestamp(comment.getUpdateTimestamp());
		dto.setUpdatedBy(comment.getUpdatedBy());
		dto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(comment.getCommentBy()));
		dto.setIsResolved(comment.getIsResolved());
		dto.setResolvedTimestamp(comment.getResolvedTimestamp());
		dto.setResolvedUserFullName(personDao.getPersonFullNameByPersonId(comment.getResolvedBy()));

		if (comment.getParentCommentId() != null) {
			CoiProjectComment parent = commentMap.get(comment.getParentCommentId());
			dto.setIsParentCommentResolved(parent != null && parent.getIsResolved() != null && Boolean.TRUE.equals(parent.getIsResolved()));
		} else {
			dto.setIsParentCommentResolved(null);
		}

		return dto;
	}

	@Override
	public ResponseEntity<Object> deleteComment(Integer commentId) {
		if (projectDao.canDeleteComment(commentId)) {
			projectDao.deleteComment(commentId);
			return new ResponseEntity<>("Comment deleted successfully", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Comment cannot be deleted", HttpStatus.METHOD_NOT_ALLOWED);
		}
	}

	@Override
	public ResponseEntity<Object> fetchDashboard(CoiDashboardVO vo) {
		try {
			Map<String, List<DisclosureProjectDto>> projectDetailsGroupedById = getProjectDetailsGroupedById(vo);
			List<ProjectOverviewDto> projectOverviewDto = mapToProjectOverviewDto(projectDetailsGroupedById);

			if(Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())){
				Integer awardCount = (vo.getIsDownload()) ? projectDao.fetchProjectOverviewCount(vo) : null;
				log.info("awardCount : {}", awardCount);
				return ResponseEntity.ok(ProjectOverviewResponseDto.builder().projectCount(awardCount).projectOverviewDetails(projectOverviewDto).build());
			} else {
				Integer proposalCount = (vo.getIsDownload()) ? projectDao.fetchProjectOverviewCount(vo) : null;
				log.info("proposalCount : {}", proposalCount);
				return ResponseEntity.ok(ProjectOverviewResponseDto.builder().projectCount(proposalCount).projectOverviewDetails(projectOverviewDto).build());
			}

		} catch (DataAccessException e) {
			log.error("Database error occurred while fetching project overview for request: {}", vo, e);
			return new ResponseEntity<>("Database error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			log.error("Unexpected error occurred while fetching dashboard: {}", vo, e);
			return new ResponseEntity<>("Failed to fetch dashboard", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@Override
	public ResponseEntity<Object> fetchDashboardCount(CoiDashboardVO vo) {
		if (Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())) {
			Integer awardCount = (vo.getIsDownload()) ? projectDao.fetchProjectOverviewCount(vo) : null;
			log.info("awardCount : {}", awardCount);
			return ResponseEntity.ok(ProjectOverviewResponseDto.builder().projectCount(awardCount).build());
		} else {
			Integer proposalCount = (vo.getIsDownload()) ? projectDao.fetchProjectOverviewCount(vo) : null;
			log.info("proposalCount : {}", proposalCount);
			return ResponseEntity.ok(ProjectOverviewResponseDto.builder().projectCount(proposalCount).build());
		}
	}

	private Map<String, List<DisclosureProjectDto>> getProjectDetailsGroupedById(CoiDashboardVO vo) {
		return projectDao.fetchProjectOverview(vo).stream().collect(Collectors.groupingBy(DisclosureProjectDto::getProjectId, LinkedHashMap::new, Collectors.toList()));
	}

	private List<ProjectOverviewDto> mapToProjectOverviewDto(Map<String, List<DisclosureProjectDto>> projectDetailsGroupedById) {
		return projectDetailsGroupedById.entrySet().stream().map(entry -> {
			List<DisclosureProjectDto> keyPersonDetails = entry.getValue().parallelStream().map(project -> {
				DisclosureProjectDto.DisclosureProjectDtoBuilder dto = DisclosureProjectDto.builder()
						.keyPersonId(project.getKeyPersonId()).keyPersonName(project.getKeyPersonName())
						.keyPersonRole(project.getKeyPersonRole()).homeUnitName(project.getHomeUnitName())
						.homeUnitNumber(project.getHomeUnitNumber()).certificationFlag(project.getCertificationFlag())
						.disclosureId(project.getDisclosureId()).personReviewStatus(project.getPersonReviewStatus())
						.personSubmissionStatus(project.getPersonSubmissionStatus())
						.personNonEmployeeFlag(project.getPersonNonEmployeeFlag())
//						.trainingStatus(getTrainingStatus(project))
						.trainingStatus(project.getTrainingStatus())
						.personCommentCount(project.getPersonCommentCount())
						.keyPersonRoleCode(project.getKeyPersonRoleCode());
				return dto.build();
			}).collect(Collectors.toList());

			DisclosureProjectDto projectDetails = buildProjectDetails(entry.getValue());

			ProjectOverviewDto projectOverview = new ProjectOverviewDto();
			projectOverview.setKeyPersonDetails(keyPersonDetails);
			projectOverview.setProjectDetails(projectDetails);
			return projectOverview;
		}).collect(Collectors.toList());
	}

	@SuppressWarnings("unused")
	private String getTrainingStatus(DisclosureProjectDto project) {
		String personNonEmployeeFlag = project.getPersonNonEmployeeFlag();
		if ("N".equals(personNonEmployeeFlag)) {
			List<String> sponsorCodes = new ArrayList<>(List.of(project.getSponsorCode()));
			if (project.getPrimeSponsorCode() != null && !project.getPrimeSponsorCode().isEmpty()) {
				sponsorCodes.add(project.getPrimeSponsorCode());
			}

			List<String> requirements = new ArrayList<>();
			requirements = List.of("ALL");

			if (Boolean.TRUE.equals(getTrainingRequired(sponsorCodes, requirements))) {
				List<PersonTraining> personTrainings = projectDao.getPersonTrainingByParams(project.getKeyPersonId(), 54);
				if (personTrainings != null && !personTrainings.isEmpty()) {
					for (PersonTraining personTraining : personTrainings) {
						if (personTraining.getFollowupDate() != null && personTraining.getFollowupDate().after(commonDao.getCurrentTimestamp())) {
							return "Training Completed";
						}
					}
				}
				return "Training Required";
			}
		}
		return "Training Not Required";
	}

	private Boolean getTrainingRequired(List<String> sponsorCodes, List<String> requirements) {
		return projectDao.getCountBySponsorCodeAndRequirement(sponsorCodes, requirements) > 0;
	}

	private DisclosureProjectDto buildProjectDetails(List<DisclosureProjectDto> entryValue) {
		DisclosureProjectDto project = entryValue.get(0);
		return DisclosureProjectDto.builder()
				.projectId(project.getProjectId())
				.projectNumber(project.getProjectNumber())
				.leadUnitName(project.getLeadUnitName())
				.leadUnitNumber(project.getLeadUnitNumber())
				.sponsorCode(project.getSponsorCode())
				.sponsorName(project.getSponsorName())
				.primeSponsorCode(project.getPrimeSponsorCode())
				.primeSponsorName(project.getPrimeSponsorName())
				.title(project.getTitle())
				.projectStartDate(project.getProjectStartDate())
				.projectEndDate(project.getProjectEndDate())
				.projectStatus(project.getProjectStatus())
				.projectSubmissionStatus(project.getProjectSubmissionStatus())
				.projectReviewStatus(project.getProjectReviewStatus())
				.completeCount(project.getCompleteCount())
				.inCompleteCount(project.getInCompleteCount())
				.projectType(project.getProjectType())
				.projectTypeCode(project.getProjectTypeCode())
				.projectBadgeColour(project.getProjectBadgeColour())
				.projectIcon(project.getProjectIcon())
				.updateTimestamp(project.getUpdateTimestamp())
				.piName(project.getPiName())
				.documentNumber(project.getDocumentNumber())
				.accountNumber(project.getAccountNumber())
				.commentCount(project.getCommentCount())
				.keyPersonCount(entryValue.size())
				.resubmissionFlag(project.getResubmissionFlag())
				.mandatorySelf(project.getMandatorySelf())
				.info(project.getInfo())
				.personNonEmployeeFlag(project.getPersonNonEmployeeFlag())
				.build();
	}

	@Override
	public ResponseEntity<Object> getProjectStatusLookup(String projectType) {
		if (projectType.equals(PROJECT_TYPE_PROPOSAL)) {
			return new ResponseEntity<>(projectDao.getProposalStatusLookup(), HttpStatus.OK);
		} else if (Constants.PROJECT_TYPE_AWARD.equals(projectType)) {
			return new ResponseEntity<>(projectDao.getAwardStatusLookup(), HttpStatus.OK);
		}
		return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> fetchMyAwards(MyAwardDashboardVO vo) {
		Map<String, Object> responseData = new HashMap<>();
		responseData.put("projects", projectDao.fetchMyAwards(vo, Boolean.FALSE));
		responseData.put("count", projectDao.fetchMyAwardCount(vo, Boolean.TRUE));
		return new ResponseEntity<>(responseData, HttpStatus.OK);
	}

	@Override
	public void updateAwardDisclosureValidationFlag(AwardDTO dto) {
		fibiCoiConnectClient
				.updateAwardDisclosureValidationFlag(AwardDTO.builder().projectNumber(dto.getProjectNumber())
						.disclosureValidationFlag(dto.getDisclosureValidationFlag()).build());
		saveCoiProjectAwardHistory(dto.getProjectNumber(), dto.getComment());
		notifyUser(dto);
	}

	private void notifyUser(AwardDTO dto) {
		try {
			if (dto.getProjectNumber() != null) {
				List<String> personIds = projectDao.getProjectPersonsForReDisclose(dto.getProjectNumber());
				StringBuilder userMessage = new StringBuilder();
				userMessage.append("Disclosure creation is required for the project ").append("#").append(dto.getProjectNumber()).append(" : ").append(dto.getProjectTitle());
				personIds.forEach(personId -> {
					Person person = personDao.getPersonDetailById(personId);
					if (person == null) {
						log.warn("Person not found for personId: {}", personId);
						return;
					}
					CoiDisclosure disclosure = disclosureDao.getLatestDisclosure(personId, Arrays.asList(Constants.DISCLOSURE_TYPE_CODE_FCOI, Constants.DISCLOSURE_TYPE_CODE_REVISION), dto.getProjectNumber());
			         if (disclosure == null) {
			        	 disclosure = disclosureDao.getLatestDisclosure(personId, Arrays.asList(Constants.FCOI_TYPE_CODE_PROJECT), dto.getProjectNumber());
			         }
			         if (disclosure != null && !Constants.COI_DISCLOSURE_REVIEW_STATUS_PENDING.equals(disclosure.getReviewStatusCode())) {
			        	 if (!conflictOfInterestDao.isDisclosureActionlistSent(Arrays.asList(Constants.INBOX_CREATE_DISCLOSURE), Constants.COI_MODULE_CODE, String.valueOf(disclosure.getDisclosureId()), personId)) {
			        		 fcoiDisclosureService.addToInbox(String.valueOf(disclosure.getDisclosureId()), personId, Constants.INBOX_CREATE_DISCLOSURE, userMessage.toString(), AuthenticatedUser.getLoginUserName());
			        	 }
						 Map<String, String> additionalDetails = new HashMap<>();
						 additionalDetails.put("NOTIFICATION_RECIPIENTS", personId);
						 additionalDetails.put(StaticPlaceholders.PROJECT_PERSON_NAME, person.getFullName() != null ? person.getFullName() : "");
				         additionalDetails.put(StaticPlaceholders.PROJECT_TITLE, dto.getProjectTitle() != null ? dto.getProjectTitle() : "");
				         additionalDetails.put(StaticPlaceholders.PROJECT_MODULE_ITEM_KEY, dto.getProjectNumber());
				         additionalDetails.put(StaticPlaceholders.PROJECT_TYPE, Constants.PROJECT_TYPE_AWARD);
				         additionalDetails.put(StaticPlaceholders.DEPARTMENT_NUMBER, dto.getProjectUnitNumber() != null ? dto.getProjectUnitNumber() : "");
				         additionalDetails.put(StaticPlaceholders.DEPARTMENT_NAME, dto.getProjectUnitName() != null ? dto.getProjectUnitName() : "");
				         coiService.processCoiMessageToQ(ActionTypes.DISCLOSURE_RESUBMISSION, disclosure.getDisclosureId(), null, additionalDetails, null, null);
			         } else {
						IntegrationNotificationRequestDto notifyVO = new IntegrationNotificationRequestDto();
						notifyVO.setModuleItemKey(dto.getProjectNumber());
						notifyVO.setTitle(dto.getProjectTitle());
						notifyVO.setModuleItemId(dto.getProjectId());
						notifyVO.setUnitNumber(dto.getProjectUnitNumber());
						notifyVO.setUnitName(dto.getProjectUnitNumber());
						notifyVO.setProjectType(Constants.PROJECT_TYPE_AWARD);
						notifyVO.setProjectStatus(dto.getProjectStatus());
						fcoiDisclosureService.prepareAndSendUserNotification(Constants.COI_MODULE_CODE, Constants.COI_SUBMODULE_CODE, notifyVO, personId, person);
			         }
				});
			}
		} catch (Exception e) {
			log.error("Exception occurred in notifyUser :{}", e.getMessage());
		}
	}

	private void saveCoiProjectAwardHistory(String projectNumber, String comment) {
		projectDao.saveCoiProjectAwardHistory(CoiProjectAwardHistory.builder().awardNumber(projectNumber)
				.message(new StringBuilder().append("<b>Disclosure is Required</b> marked by <b>")
						.append(AuthenticatedUser.getLoginUserFullName()).append("</b>").toString())
				.comment(comment).updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build());
	}

	@Override
	public List<CoiProjectAwardHistoryDTO> fetchCoiProjectAwardHistory(String awardNumber) {
		List<CoiProjectAwardHistoryDTO> coiProjectAwardHistoryDTO = projectDao.fetchCoiProjectAwardHistory(awardNumber)
				.stream()
				.map(history -> CoiProjectAwardHistoryDTO.builder().comment(history.getComment())
						.description(history.getMessage())
						.awardNumber(history.getAwardNumber())
						.updateTimestamp(history.getUpdateTimestamp()).build())
				.collect(Collectors.toList());
		return coiProjectAwardHistoryDTO;
	}

	@Override
	public void updateAwardKPDisclosureRequirements(AwardPersonDTO dto) {
		if (dto.getKeyPersonId() == null) {
			String projectNumber = dto.getProjectNumber();
			log.info("KeyPersonId is null. Updating all persons with newDisclosureRequired: {}", dto.getNewDisclosureRequired());
			fibiCoiConnectClient.updateAwardKPDisclosureRequirements(
					AwardPersonDTO.builder()
					.projectNumber(projectNumber)
					.newDisclosureRequired(dto.getNewDisclosureRequired())
					.build()
			);
		} else {
			log.info("Updating KeyPersonId: {} with newDisclosureRequired: {} for projects: {}", dto.getKeyPersonId(), NEW_DISCLOSURE_REQUIRED_NO, dto.getProjectNumbers());
			fibiCoiConnectClient.updateAwardKPDisclosureRequirements(
					AwardPersonDTO.builder()
					.projectNumbers(dto.getProjectNumbers())
					.keyPersonId(dto.getKeyPersonId())
					.newDisclosureRequired(NEW_DISCLOSURE_REQUIRED_NO)
					.build()
			);
		}
	}

	@Override
	public void recordCompletedDisclosuresInProjectHistory(Integer disclosureId) {
		String loginPersonId = AuthenticatedUser.getLoginPersonId();
		List<String> projectNumbers = disclosureDao.getProjectNumbersBasedOnParam(disclosureId, loginPersonId);

		log.info("Started disclosure completion validation for disclosureId: {} and loginPersonId: {}", disclosureId, loginPersonId);

		if (projectNumbers.isEmpty()) {
			log.warn("No projects found for disclosureId: {} and loginPersonId: {}", disclosureId, loginPersonId);
			return;
		}

		log.info("Associated projects for disclosureId {}: {}", disclosureId, projectNumbers);

		for (String projectNum : projectNumbers) {
			Boolean isComplete = projectDao.isDisclosureCompleteForProject(projectNum);
			log.info("Project {} - Disclosure complete: {}", projectNum, isComplete);

			if (Boolean.TRUE.equals(isComplete)) {
				Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
				String message = String.format("<b>Disclosures have been submitted for this award.</b>");

				log.info("Updating history for project {} - marking disclosure as completed.", projectNum);

				projectDao.saveCoiProjectAwardHistory(
						CoiProjectAwardHistory.builder()
						.awardNumber(projectNum)
						.message(message)
						.comment(null)
						.updatedBy(AuthenticatedUser.getLoginPersonId())
						.updateTimestamp(currentTimestamp)
						.build()
				);
			} else {
				log.info("Project {} - Disclosure is still pending. No update to history.", projectNum);
			}
		}
		log.info("Completed disclosure status validation for disclosureId: {}", disclosureId);
	}

	@Override
	public List<CoiNotificationLog> fetchProjectNotificationHistory(NotificationDto request) {
		try {
			List<CoiNotificationLog> notificationLogs = projectDao.fetchProjectNotificationHistory(request);

			if (notificationLogs != null && !notificationLogs.isEmpty()) {
				for (CoiNotificationLog notificationLog : notificationLogs) {

					if (notificationLog.getRequestedBy() != null) {
						Person person = personDao.getPersonPrimaryInformation(notificationLog.getRequestedBy());
						if (person != null) {
							notificationLog.setFromUserFullName(person.getFullName());
						}
					}

					List<CoiNotificationLogRecipient> logRecipients = notificationLog.getNotificationLogRecipients();
					if (logRecipients != null && !logRecipients.isEmpty()) {
						for (CoiNotificationLogRecipient logRecipient : logRecipients) {
							if (logRecipient.getRecipientPersonId() != null) {
								Person recipient = personDao.getPersonPrimaryInformation(logRecipient.getRecipientPersonId());
								if (recipient != null) {
									logRecipient.setRecipientFullName(recipient.getFullName());
								}
							}
						}
					}
				}
			}

			return notificationLogs;

		} catch (Exception ex) {
			log.error("Error retrieving notification logs for request: {}", request, ex);
			throw new RuntimeException("Unable to fetch notification logs. Please try again later.", ex);
		}
	}

	@Override
	public String fetchProjectTitle(Integer moduleCode, String moduleItemKey) {
		return projectDao.fetchProjectTitle(moduleCode, moduleItemKey);
	}

	@Override
	public Integer fetchCommentCount(ProjectCommentDto projectCommentDto) {
		return projectDao.fetchCommentCount(projectCommentDto);
	}

	@Override
	public ResponseEntity<Object> fetchMyProposals(CoiDashboardVO vo) {
		Map<String, Object> responseData = new HashMap<>();
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		responseData.put("projects", projectDao.fetchMyProposals(vo, Boolean.FALSE));
		responseData.put("count", projectDao.fetchMyProposalsCount(vo, Boolean.TRUE));
		return new ResponseEntity<>(responseData, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> fetchMyProjectsCount(CoiDashboardVO vo) {
		Map<Integer, Object> responseData = new HashMap<>();
		vo.setPersonIdentifier(AuthenticatedUser.getLoginPersonId());
		MyAwardDashboardVO awardDashboardVO = new MyAwardDashboardVO();
		awardDashboardVO.setCurrentPage(vo.getCurrentPage());
		awardDashboardVO.setPaginationLimit(vo.getPageNumber());
		awardDashboardVO.setSearchWord(vo.getSearchKeyword());
		responseData.put(CoreConstants.MODULE_CODE_AWARD, projectDao.fetchMyAwardCount(awardDashboardVO, Boolean.TRUE));
		responseData.put(CoreConstants.MODULE_CODE_DEVELOPMENT_PROPOSAL, projectDao.fetchMyProposalsCount(vo, Boolean.TRUE));
		return new ResponseEntity<>(responseData, HttpStatus.OK);
	}

	@Override
	public void resolveComment(Integer commentId) {
		boolean updated = projectDao.resolveComment(commentId);

		if (!updated) {
			log.warn("No comment updated for ID: {}", commentId);
			throw new EntityNotFoundException("Comment not found with ID: " + commentId);
		}
	}

	@Override
	public void updateAwardDisclosureStatus(String projectNumber) {
		log.info("updateAwardDisclosureStatus, Project number: {}", projectNumber);
		conflictOfInterestDao.updateAwardDisclosureStatus(projectNumber, Boolean.FALSE);
	}

}
