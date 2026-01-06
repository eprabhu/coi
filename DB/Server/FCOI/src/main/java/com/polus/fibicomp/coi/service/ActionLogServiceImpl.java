package com.polus.fibicomp.coi.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dto.CmpCommonDto;
import com.polus.fibicomp.cmp.dto.CmpReviewActionLogDto;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanActionLog;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskActionLogDto;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.HistoryDto;
import com.polus.fibicomp.coi.dto.PersonEntityActionLogDto;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.DisclosureActionLog;
import com.polus.fibicomp.coi.pojo.DisclosureActionType;
import com.polus.fibicomp.coi.pojo.PersonEntityActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityActionType;
import com.polus.fibicomp.coi.pojo.TravelDisclosureActionLog;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationCommonDto;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLog;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLogType;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclCommonDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLog;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLogType;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.opa.pojo.OPAActionLogType;
import com.polus.fibicomp.travelDisclosure.dtos.TravelDisclosureActionLogDto;

import lombok.extern.log4j.Log4j2;;

@Service
@Transactional
@Log4j2
public class ActionLogServiceImpl implements ActionLogService {

	@Autowired
	private ActionLogDao actionLogDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	@Qualifier(value = "conflictOfInterestDao")
	private ConflictOfInterestDao conflictOfInterestDao;

	@Autowired
	private PersonDao personDao;

	private static final String DISCLOSURE_TYPE_TRAVEL = "Travel";
	private static final List<String> CMP_REVIEW_ACTION_TYPES = Arrays.asList(
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_MODIFIED_WITH_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_MODIFIED_WITHOUT_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_ADMIN_WITH_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_ADMIN_WITHOUT_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_ADMIN_WITHOUT_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_ADMIN_WITH_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_DELETED_WITHOUT_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_DELETED_WITH_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_ADDED_WITH_REVIEWER,
	        Constants.COI_MANAGEMENT_PLAN_REVIEW_ADDED_WITHOUT_REVIEWER
	);


	private String renderPlaceholders(String message, Map<String, String> replacementParameters) {
		if (replacementParameters != null) {
			for (String key : replacementParameters.keySet()) {
				message = StringUtils.replace(message, key, replacementParameters.get(key));
			}
		}
		return message;
	}

	@Override
	public void saveDisclosureActionLog(DisclosureActionLogDto actionLogDto) {
		DisclosureActionLog actionLog = DisclosureActionLog.builder().actionTypeCode(actionLogDto.getActionTypeCode())
				.disclosureId(actionLogDto.getDisclosureId()).disclosureNumber(actionLogDto.getDisclosureNumber())
				.description(getFormattedMessageByActionType(actionLogDto)).comment(actionLogDto.getRevisionComment())
				.updateTimestamp(commonDao.getCurrentTimestamp()).updateUser(AuthenticatedUser.getLoginUserName())
				.build();
		conflictOfInterestDao.saveOrUpdateDisclosureActionLog(actionLog);
	}

	@Override
	public String getFormattedMessageByActionType(DisclosureActionLogDto actionLogDto) {
		DisclosureActionType disclosureActionType = conflictOfInterestDao
				.fetchDisclosureActionTypeById(actionLogDto.getActionTypeCode());
		return buildDisclosureLogMessage(actionLogDto, disclosureActionType.getMessage());
	}

	private String buildDisclosureLogMessage(DisclosureActionLogDto actionLogDto, String message) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		if (actionLogDto.getFcoiTypeDescription() != null) {
			message = message.replace("{FCOI /Project /Travel}", actionLogDto.getFcoiTypeDescription());
		}
		if (actionLogDto.getOldAdmin() != null) {
			placeholdersAndValues.put("{ADMIN_ONE}", actionLogDto.getOldAdmin());
			placeholdersAndValues.put("{ADMIN_TWO}", actionLogDto.getNewAdmin());
		} else if (actionLogDto.getNewAdmin() != null) {
			placeholdersAndValues.put("{ADMIN_ONE}", actionLogDto.getNewAdmin());
		}
		if (actionLogDto.getReviewername() != null) {
			placeholdersAndValues.put("{REVIEWER_NAME}", actionLogDto.getReviewername());
		}
		if (actionLogDto.getConflictStatus() != null || actionLogDto.getNewConflictStatus() != null) {
			placeholdersAndValues.put("{OLD}", actionLogDto.getConflictStatus());
			placeholdersAndValues.put("{NEW}", actionLogDto.getNewConflictStatus());
		}
		if (actionLogDto.getRiskCategory() != null) {
			placeholdersAndValues.put("{LOW}", actionLogDto.getRiskCategory());
			placeholdersAndValues.put("{HIGH}", actionLogDto.getNewRiskCategory());
		}
		if (actionLogDto.getAdministratorName() != null) {
			placeholdersAndValues.put("{ADMIN_NAME}", actionLogDto.getAdministratorName());
		}
		if (actionLogDto.getOldReviewer() != null) {
			placeholdersAndValues.put("{REVIEWER_ONE}", actionLogDto.getOldReviewer());
			placeholdersAndValues.put("{REVIEWER_TWO}", actionLogDto.getNewReviewer());
		}
		if (actionLogDto.getReporter() != null) {
			placeholdersAndValues.put("{REPORTER}", actionLogDto.getReporter());
		}
		if (actionLogDto.getCoiAdmin() != null) {
			placeholdersAndValues.put("{COI_ADMIN}", actionLogDto.getCoiAdmin());
		}
		if (actionLogDto.getReviewLocationType() != null) {
			placeholdersAndValues.put("{LOCATION}", actionLogDto.getReviewLocationType().getDescription());
		}
		if (actionLogDto.getReviewerStatusType() != null) {
			placeholdersAndValues.put("{REVIEW_STATUS}", actionLogDto.getReviewerStatusType().getDescription());
		}
		if (actionLogDto.getOldDate() != null) {
			placeholdersAndValues.put("{OLD_DATE}",
					commonDao.getDateFormat(actionLogDto.getOldDate(), CoreConstants.DEFAULT_DATE_FORMAT));
			placeholdersAndValues.put("{NEW_DATE}",
					commonDao.getDateFormat(actionLogDto.getNewDate(), CoreConstants.DEFAULT_DATE_FORMAT));
		}
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public ResponseEntity<Object> getDisclosureHistoryById(Integer disclosureId) {
		List<String> reviewActionTypeCodes = Arrays.asList(Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER,
				Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_START_REVIEW,
				Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_COMPLETE_REVIEW,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITHOUT_REVIEWER,
				Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER,
				Constants.COI_DIS_ACTION_LOG_DISCLOSURE_SYNCED);
		List<DisclosureActionLog> disclsouretActionLogs = actionLogDao
				.fetchDisclosureActionLogsBasedOnDisclosureId(disclosureId, reviewActionTypeCodes);
		List<HistoryDto> disclosureHistories = new ArrayList<>();
		disclsouretActionLogs.forEach(disclsouretActionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(disclsouretActionLog.getUpdateTimestamp());
			if (disclsouretActionLog.getUpdateUser() != null) {
				historyDto.setUpdateUserFullName(
						personDao.getUserFullNameByUserName(disclsouretActionLog.getUpdateUser()));
			}
			historyDto.setActionTypeCode(disclsouretActionLog.getActionTypeCode());
			historyDto.setMessage(disclsouretActionLog.getDescription());
			historyDto.setComment(disclsouretActionLog.getComment());
			disclosureHistories.add(historyDto);
		});
		return new ResponseEntity<>(disclosureHistories, HttpStatus.OK);
	}

	@Override
	public void saveTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto) {
		DisclosureActionType disclosureActionType = conflictOfInterestDao
				.fetchDisclosureActionTypeById(actionLogDto.getActionTypeCode());
		String message = buildTravelDisclosureLogMessage(actionLogDto, disclosureActionType.getMessage());
		TravelDisclosureActionLog actionLog = TravelDisclosureActionLog.builder()
				.actionTypeCode(actionLogDto.getActionTypeCode())
				.travelDisclosureId(actionLogDto.getTravelDisclosureId()).travelNumber(actionLogDto.getTravelNumber())
				.description(message).updateTimestamp(commonDao.getCurrentTimestamp())
				.updateUser(AuthenticatedUser.getLoginUserName()).comment(actionLogDto.getComment()).build();
		conflictOfInterestDao.saveOrUpdateTravelDisclosureActionLog(actionLog);
	}

	private String buildTravelDisclosureLogMessage(TravelDisclosureActionLogDto actionLogDto, String message) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		message = message.replace("{FCOI /Project /Travel}", DISCLOSURE_TYPE_TRAVEL);
		if (actionLogDto.getOldAdmin() != null) {
			placeholdersAndValues.put("{ADMIN_ONE}", actionLogDto.getOldAdmin());
			placeholdersAndValues.put("{ADMIN_TWO}", actionLogDto.getNewAdmin());
		} else if (actionLogDto.getNewAdmin() != null) {
			placeholdersAndValues.put("{ADMIN_ONE}", actionLogDto.getNewAdmin());
		}
		if (actionLogDto.getNewRiskCategory() != null) {
			placeholdersAndValues.put("{LOW}", actionLogDto.getRiskCategory());
			placeholdersAndValues.put("{HIGH}", actionLogDto.getNewRiskCategory());
		}
		if (actionLogDto.getActionTypeCode().equals(Constants.COI_DISCLOSURE_ACTION_LOG_ADD_RISK)) {
			placeholdersAndValues.put("{LOW}", actionLogDto.getRiskCategory());
		}
		if (actionLogDto.getOldDisclosureStatus() != null) {
			placeholdersAndValues.put("{STATUS_ONE}", actionLogDto.getOldDisclosureStatus());
			placeholdersAndValues.put("{STATUS_TWO}", actionLogDto.getNewDisclosureStatus());
		} else if (actionLogDto.getNewAdmin() != null) {
			placeholdersAndValues.put("{STATUS_ONE}", actionLogDto.getNewDisclosureStatus());
		}
		if (actionLogDto.getReporter() != null) {
			placeholdersAndValues.put("{REPORTER}", actionLogDto.getReporter());
		}
		if (actionLogDto.getAdministratorName() != null) {
			placeholdersAndValues.put("{ADMIN_NAME}", actionLogDto.getAdministratorName());
		}
		if (actionLogDto.getCoiAdmin() != null) {
			placeholdersAndValues.put("{COI_ADMIN}", actionLogDto.getCoiAdmin());
		}
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public List<DisclosureActionLog> fetchDisclosureActionLog(DisclosureActionLogDto actionLogDto) {
		List<DisclosureActionLog> actionLogList = new ArrayList<>();
		actionLogDao.fetchDisclosureActionLog(actionLogDto).forEach(actionLog -> {
			DisclosureActionLog disclosureActionLog = new DisclosureActionLog();
			BeanUtils.copyProperties(actionLog, disclosureActionLog, "disclosure", "disclosureActionType");
			disclosureActionLog.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			actionLogList.add(disclosureActionLog);
		});
		return actionLogList;
	}

	@Override
	public ResponseEntity<Object> getTravelDisclosureHistoryById(Integer travelDisclosureId) {
		List<TravelDisclosureActionLog> travelDisclosureActionLogs = actionLogDao
				.fetchTravelDisclosureActionLogsBasedOnId(travelDisclosureId);
		List<HistoryDto> travelDisclosureHistories = new ArrayList<>();
		travelDisclosureActionLogs.forEach(actionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(actionLog.getUpdateTimestamp());
			if (actionLog.getUpdateUser() != null) {
				historyDto.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			}
			historyDto.setActionTypeCode(actionLog.getActionTypeCode());
			historyDto.setMessage(actionLog.getDescription());
			historyDto.setComment(actionLog.getComment());
			travelDisclosureHistories.add(historyDto);
		});
		return new ResponseEntity<>(travelDisclosureHistories, HttpStatus.OK);
	}

	@Override
	public List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto) {
		List<TravelDisclosureActionLog> actionLogList = new ArrayList<>();
		actionLogDao.fetchTravelDisclosureActionLog(actionLogDto).forEach(actionLog -> {
			TravelDisclosureActionLog travelDisclosureActionLog = new TravelDisclosureActionLog();
			BeanUtils.copyProperties(actionLog, travelDisclosureActionLog, "coiTravelDisclosure",
					"disclosureActionType");
			travelDisclosureActionLog
					.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			actionLogList.add(travelDisclosureActionLog);
		});
		actionLogDto.setActionTypeCode(Constants.COI_DISCLOSURE_ACTION_LOG_ADD_RISK);
		actionLogDao.fetchTravelDisclosureActionLog(actionLogDto).forEach(actionLog -> {
			TravelDisclosureActionLog travelDisclosureActionLog = new TravelDisclosureActionLog();
			BeanUtils.copyProperties(actionLog, travelDisclosureActionLog, "coiTravelDisclosure",
					"disclosureActionType");
			actionLogList.add(travelDisclosureActionLog);
		});
		return actionLogList;
	}

	@Override
	public ResponseEntity<Object> getReviewHistoryById(Integer disclosureId) {
		List<String> actionTypeCodes = Arrays.asList(Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER,
				Constants.COI_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_START_REVIEW,
				Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEWER_COMPLETE_REVIEW,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITH_REVIEWER,
				Constants.COI_DISCLOSURE_ACTION_LOG_REVIEW_REMOVED_WITHOUT_REVIEWER,
				Constants.COI_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER);
		List<DisclosureActionLog> disclsouretActionLogs = actionLogDao.fetchReviewActionLogs(disclosureId,
				actionTypeCodes);
		List<HistoryDto> disclosureHistories = new ArrayList<>();
		disclsouretActionLogs.forEach(disclsouretActionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(disclsouretActionLog.getUpdateTimestamp());
			if (disclsouretActionLog.getUpdateUser() != null) {
				historyDto.setUpdateUserFullName(
						personDao.getUserFullNameByUserName(disclsouretActionLog.getUpdateUser()));
			}
			historyDto.setActionTypeCode(disclsouretActionLog.getActionTypeCode());
			historyDto.setMessage(disclsouretActionLog.getDescription());
			historyDto.setComment(disclsouretActionLog.getComment());
			disclosureHistories.add(historyDto);
		});
		return new ResponseEntity<>(disclosureHistories, HttpStatus.OK);
	}

	@Override
	public void saveOPAActionLog(String actionLogTypeCode, OPACommonDto opaCommonDto) {
		OPAActionLogType opaActionLogType = actionLogDao.getOPAActionType(actionLogTypeCode);
		if (opaActionLogType != null) {
			String message = buildOPALogMessage(opaActionLogType.getMessage(), opaCommonDto);
			OPAActionLog opaActionLog = OPAActionLog.builder().actionTypeCode(actionLogTypeCode)
					.comment(opaCommonDto.getComment()).description(message)
					.opaDisclosureId(opaCommonDto.getOpaDisclosureId())
					.opaDisclosureNumber(opaCommonDto.getOpaDisclosureNumber())
					.updateTimestamp(commonDao.getCurrentTimestamp()).updateUser(AuthenticatedUser.getLoginUserName())
					.build();
			actionLogDao.saveObject(opaActionLog);
		}
	}

	private String buildOPALogMessage(String message, OPACommonDto commonDto) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		placeholdersAndValues.put("{REPORTER}", commonDto.getUpdateUserFullName());
		placeholdersAndValues.put("{ADMIN_NAME}", commonDto.getUpdateUserFullName());
		placeholdersAndValues.put("{ASSIGNED_ADMIN}", commonDto.getAdminPersonName());
		placeholdersAndValues.put("{REASSIGNED_ADMIN}", commonDto.getReassignedAdminPersonName());
		if (commonDto.getReviewerFullName() != null) {
			placeholdersAndValues.put("{REVIEWER_NAME}", commonDto.getReviewerFullName());
		}
		if (commonDto.getReviewLocationType() != null) {
			placeholdersAndValues.put("{LOCATION}", commonDto.getReviewLocationType());
		}
		if (commonDto.getReviewStatus() != null) {
			placeholdersAndValues.put("{REVIEW_STATUS}", commonDto.getReviewStatus());
		}
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public ResponseEntity<Object> getOpaDisclosureHistoryById(Integer opaDisclosureId) {
		List<String> actionTypeCodes = Arrays.asList(Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_BY_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_BY_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITH_REVIEWER,
				Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITHOUT_REVIEWER);
		List<OPAActionLog> opaActionLogs = actionLogDao.fetchOpaDisclosureActionLogsBasedOnId(opaDisclosureId,
				actionTypeCodes, false);
		List<HistoryDto> opaDisclosureHistories = new ArrayList<>();
		opaActionLogs.forEach(actionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(actionLog.getUpdateTimestamp());
			if (actionLog.getUpdateUser() != null) {
				historyDto.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			}
			historyDto.setActionTypeCode(actionLog.getActionTypeCode());
			historyDto.setMessage(actionLog.getDescription());
			historyDto.setComment(actionLog.getComment());
			opaDisclosureHistories.add(historyDto);
		});
		return new ResponseEntity<>(opaDisclosureHistories, HttpStatus.OK);
	}

	@Override
	public void savePersonEntityActionLog(PersonEntityDto personEntityDto) {
		PersonEntityActionType personEntityActionType = actionLogDao
				.getPersonEntityActionType(personEntityDto.getActionTypeCode());
		if (personEntityActionType != null) {
			String message = buildPersonEntityLogMessage(personEntityActionType.getMessage(), personEntityDto);
			// UpdateUserFullName is expecting as custom name eg : system
			PersonEntityActionLog actionLog = PersonEntityActionLog.builder()
					.actionTypeCode(personEntityDto.getActionTypeCode())
					.personEntityId(personEntityDto.getPersonEntityId())
					.personEntityNumber(personEntityDto.getPersonEntityNumber()).description(message)
					.comment(personEntityDto.getRevisionReason()).updateTimestamp(commonDao.getCurrentTimestamp())
					.updateUser(
							personEntityDto.getUpdateUserFullName() != null ? personEntityDto.getUpdateUserFullName()
									: AuthenticatedUser.getLoginUserName())
					.build();
			actionLogDao.saveObject(actionLog);
		}
	}

	private String buildPersonEntityLogMessage(String message, PersonEntityDto personEntityDto) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		placeholdersAndValues.put("{ENTITY_NAME}", personEntityDto.getEntityName());
		placeholdersAndValues.put("{RELATIONSHIP_NAME}", personEntityDto.getRelationshipName());
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public ResponseEntity<Object> getAllPersonEntityActionLog(PersonEntityDto personEntityDto) {
		List<PersonEntityActionLogDto> actionLogs = new ArrayList<>();
		actionLogDao.fetchPersonEntityActionLog(personEntityDto).forEach(actionLog -> {
			PersonEntityActionLogDto entityActionLogDto = new PersonEntityActionLogDto();
			BeanUtils.copyProperties(actionLog, entityActionLogDto);
			entityActionLogDto.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			actionLogs.add(entityActionLogDto);
		});
		return new ResponseEntity<>(actionLogs, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> getConsultingDisclosureHistoryById(Integer disclosureId) {
		List<ConsultingDisclActionLog> consultingDisclActionLogs = actionLogDao
				.fetchConsultDisclActionLogsBasedOnId(disclosureId);
		List<HistoryDto> consultDisclHistories = new ArrayList<>();
		consultingDisclActionLogs.forEach(actionLog -> {
			HistoryDto historyDto = new HistoryDto();
			historyDto.setUpdateTimestamp(actionLog.getUpdateTimestamp());
			if (actionLog.getUpdateUser() != null) {
				historyDto.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
			}
			historyDto.setActionTypeCode(actionLog.getActionTypeCode());
			historyDto.setMessage(actionLog.getDescription());
			historyDto.setComment(actionLog.getComment());
			consultDisclHistories.add(historyDto);
		});
		return new ResponseEntity<>(consultDisclHistories, HttpStatus.OK);
	}

	@Override
	public void saveConsultingDisclActionLog(String actionLogTypeCode, ConsultDisclCommonDto consultDisclCommonDto) {
		ConsultingDisclActionLogType consultDisclActionLogType = actionLogDao
				.getConsultDisclActionType(actionLogTypeCode);
		if (consultDisclActionLogType != null) {
			String message = buildConsultDisclLogMessage(consultDisclActionLogType.getMessage(), consultDisclCommonDto);
			ConsultingDisclActionLog consultingDisclActionLog = ConsultingDisclActionLog.builder()
					.actionTypeCode(actionLogTypeCode).comment(consultDisclCommonDto.getComment()).description(message)
					.disclosureId(consultDisclCommonDto.getDisclosureId())
					.updateTimestamp(commonDao.getCurrentTimestamp()).updateUser(AuthenticatedUser.getLoginUserName())
					.build();
			actionLogDao.saveObject(consultingDisclActionLog);
		}
	}

	private String buildConsultDisclLogMessage(String message, ConsultDisclCommonDto consultDisclCommonDto) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		placeholdersAndValues.put("{REPORTER}", consultDisclCommonDto.getUpdateUserFullName());
		placeholdersAndValues.put("{ADMIN_NAME}", consultDisclCommonDto.getUpdateUserFullName());
		placeholdersAndValues.put("{ASSIGNED_ADMIN}", consultDisclCommonDto.getAdminPersonName());
		placeholdersAndValues.put("{REASSIGNED_ADMIN}", consultDisclCommonDto.getReassignedAdminPersonName());
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public void saveCoiDeclarationActionLog(String actionCode, DeclarationCommonDto declarationCommonDto) {
		try {
			CoiDeclActionLogType actionLogType = actionLogDao.getCoiDeclarationActionType(actionCode);
			if (actionLogType != null) {
				String message = buildDeclarationLogMessage(actionLogType.getActionMessage(), declarationCommonDto);
				CoiDeclActionLog logEntry = CoiDeclActionLog.builder()
						.declarationId(declarationCommonDto.getDeclarationId()).actionTypeCode(actionCode)
						.actionMessage(message)
						.createTimestamp(declarationCommonDto.getUpdateTimestamp() != null
								? declarationCommonDto.getUpdateTimestamp()
								: commonDao.getCurrentTimestamp())
						.createdBy(AuthenticatedUser.getLoginPersonId()).comment(declarationCommonDto.getComment())
						.build();

				actionLogDao.saveObject(logEntry);
				log.info("Declaration action log saved. Declaration ID: {}, Action Code: {}",
						declarationCommonDto.getDeclarationId(), actionCode);
			} else {
				log.info("No action log type found for actionCode: {}", actionCode);
			}
		} catch (Exception e) {
			log.error("Failed to log action for declarationId: {}. Error: {}", declarationCommonDto.getDeclarationId(),
					e.getMessage(), e);
		}
	}

	private String buildDeclarationLogMessage(String message, DeclarationCommonDto declarationCommonDto) {
		Map<String, String> placeholdersAndValues = new HashMap<>();
		String updateUserFullName = declarationCommonDto.getUpdateUserFullName() != null
				? declarationCommonDto.getUpdateUserFullName()
				: AuthenticatedUser.getLoginUserFullName();
		placeholdersAndValues.put("{REPORTER}", updateUserFullName);
		placeholdersAndValues.put("{CURRENT_ADMIN}", declarationCommonDto.getAdminPersonName());
		placeholdersAndValues.put("{PREVIOUS_ADMIN}", declarationCommonDto.getPreviousAdminPersonName());
		placeholdersAndValues.put("{ADMIN_NAME}", updateUserFullName);
		return renderPlaceholders(message, placeholdersAndValues);
	}

	@Override
	public void saveCMPActionLog(String actionTypeCode, CmpCommonDto dto) {
		CoiManagementPlanActionType actionType = actionLogDao.getCmpActionType(actionTypeCode);
		if (actionType == null) {
			log.warn("CMP ActionType not found: {}", actionTypeCode);
			return;
		}
		String message = buildCmpLogMessage(actionType.getMessage(), dto);
		CoiMgmtPlanActionLog logEntry = CoiMgmtPlanActionLog.builder().cmpId(dto.getCmpId())
				.cmpNumber(dto.getCmpNumber()).actionTypeCode(actionTypeCode).description(message)
				.comments(dto.getComment()).updatedBy(AuthenticatedUser.getLoginUserName())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		actionLogDao.saveObject(logEntry);
	}

	private String buildCmpLogMessage(String message, CmpCommonDto dto) {
		Map<String, String> placeholders = new HashMap<>();
		placeholders.put("{USER}", dto.getUpdateUserFullName());
		placeholders.put("{SECTION_NAME}", dto.getSectionName());
		placeholders.put("{ADMIN_NAME}", dto.getUpdateUserFullName());
		return renderPlaceholders(message, placeholders);
	}

	@Override
	public ResponseEntity<Object> getCmpHistoryById(Integer cmpId) {
		List<CoiMgmtPlanActionLog> logs = actionLogDao.fetchCmpActionLogsByCmpId(cmpId, CMP_REVIEW_ACTION_TYPES, false);
		List<HistoryDto> histories = buildHistoryDtos(logs);
		return new ResponseEntity<>(histories, HttpStatus.OK);
	}

	@Override
	public void saveCmpReviewActionLog(String actionTypeCode, CmpReviewActionLogDto dto) {
		CoiManagementPlanActionType actionType = actionLogDao.getCmpActionType(actionTypeCode);
		if (actionType == null) {
			log.warn("CMP review action type not found: {}", actionTypeCode);
			return;
		}
		Map<String, String> placeholders = new HashMap<>();
		placeholders.put("{REVIEWER_NAME}", dto.getReviewerName());
		placeholders.put("{LOCATION}", dto.getReviewLocation());
		placeholders.put("{REVIEW_STATUS}", dto.getReviewStatus());
		placeholders.put("{ADMIN_NAME}", dto.getAdminName());
		String message = renderPlaceholders(actionType.getMessage(), placeholders);
		CoiMgmtPlanActionLog logEntry = CoiMgmtPlanActionLog.builder().cmpId(dto.getCmpId())
				.cmpNumber(dto.getCmpNumber()).actionTypeCode(actionTypeCode).description(message)
				.comments(dto.getComment()).updatedBy(AuthenticatedUser.getLoginPersonId())
				.updateTimestamp(commonDao.getCurrentTimestamp()).build();
		actionLogDao.saveObject(logEntry);
	}

	@Override
	public ResponseEntity<Object> getCmpReviewHistoryById(Integer cmpId) {
		List<CoiMgmtPlanActionLog> logs = actionLogDao.fetchCmpActionLogsByCmpId(cmpId, CMP_REVIEW_ACTION_TYPES, true);
		List<HistoryDto> histories = buildHistoryDtos(logs);
		return new ResponseEntity<>(histories, HttpStatus.OK);
	}

	private List<HistoryDto> buildHistoryDtos(List<CoiMgmtPlanActionLog> logs) {
		List<HistoryDto> histories = new ArrayList<>();
		logs.forEach(log -> {
			HistoryDto dto = new HistoryDto();
			dto.setUpdateTimestamp(log.getUpdateTimestamp());
			if (log.getUpdatedBy() != null) {
				dto.setUpdateUserFullName(personDao.getUserFullNameByUserName(log.getUpdatedBy()));
			}
			dto.setActionTypeCode(log.getActionTypeCode());
			dto.setMessage(log.getDescription());
			dto.setComment(log.getComments());
			histories.add(dto);
		});
		return histories;
	}

	@Override
	public void saveCmpTaskActionLog(String actionTypeCode, CmpTaskActionLogDto dto) {
		CoiManagementPlanActionType actionType = actionLogDao.getCmpActionType(actionTypeCode);
		if (actionType == null) {
			log.warn("CMP Task action type not found: {}", actionTypeCode);
			return;
		}
		Map<String, String> placeholders = new HashMap<>();
		if (dto.getAssigneeName() != null) {
			placeholders.put("{ASSIGNEE_NAME}", dto.getAssigneeName());
		}
		if (dto.getAdminName() != null) {
			placeholders.put("{ADMIN_NAME}", dto.getAdminName());
		}
		if (dto.getTaskStatus() != null) {
			placeholders.put("{TASK_STATUS}", dto.getTaskStatus());
		}
		if (dto.getTaskType() != null) {
			placeholders.put("{TASK_TYPE}", dto.getTaskType());
		}
		String message = renderPlaceholders(actionType.getMessage(), placeholders);
		CoiMgmtPlanActionLog logEntry = CoiMgmtPlanActionLog.builder().cmpId(dto.getCmpId())
				.actionTypeCode(actionTypeCode).description(message).comments(dto.getComment())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
		actionLogDao.saveObject(logEntry);
	}

}
