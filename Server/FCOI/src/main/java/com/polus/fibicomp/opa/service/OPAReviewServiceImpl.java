package com.polus.fibicomp.opa.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.dao.InboxDao;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.person.dao.PersonDao;
import com.polus.fibicomp.coi.repository.ActionLogDao;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.opa.dto.OPAActionLogDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dao.OPADao;
import com.polus.fibicomp.opa.dao.OPAReviewDao;
import com.polus.fibicomp.opa.dto.OPAReviewDto;
import com.polus.fibicomp.opa.pojo.OPAReview;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.reviewcomments.dao.ReviewCommentDao;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.service.ReviewCommentService;
import com.polus.core.security.AuthenticatedUser;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;

@Service
@Transactional
public class OPAReviewServiceImpl implements OPAReviewService {

    @Autowired
    private OPAReviewDao reviewDao;

    @Autowired
    private OPADao opaDao;

    @Autowired
    private PersonDao personDao;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private ActionLogDao actionLogRepository;

    @Autowired
    private ConflictOfInterestDao coiDao;

    @Autowired
    private ConflictOfInterestService coiService;

    @Autowired
    private ReviewCommentDao reviewCommentDao;

    @Autowired
    private ReviewCommentService reviewCommentService;

	@Autowired
	private OPAService opaService;

	@Autowired
	private InboxDao inboxDao;
	
	@Autowired
    private CommonService commonService;
	
    @Override
    public ResponseEntity<Object> saveOrUpdateOPAReview(OPAReview opaReview) {
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        String actionTypeCode = null;
        String reviewerName = null;
        String actionType = null;
        String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
		OPADisclosure OPADisclosure = opaDao.getOPADisclosure(opaReview.getOpaDisclosureId());
        if (opaReview.getOpaReviewId() == null) {
            if (reviewDao.isOPAReviewAdded(opaReview)) {
                return new ResponseEntity<>(commonDao.convertObjectToJSON("Review already added"), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            opaReview.setCreateUser(AuthenticatedUser.getLoginUserName());
            opaReview.setUpdateTimestamp(updateTimestamp);
            opaReview.setUpdateUser(AuthenticatedUser.getLoginUserName());
            reviewDao.saveOrUpdate(opaReview);
            opaReview.setOpaReviewId(opaReview.getOpaReviewId());
            opaReview.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
			if (opaReview.getAssigneePersonId() != null) {
				actionTypeCode = Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER;
				actionType = ActionTypes.OPA_REVIEWER_ASSIGN;
				reviewerName = personDao.getPersonFullNameByPersonId(opaReview.getAssigneePersonId());
				StringBuilder actionLogMessage = new StringBuilder("OPA disclosure of ");
				actionLogMessage.append(personDao.getPersonFullNameByPersonId(OPADisclosure.getPersonId()))
						.append(" Submitted on ")
						.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
				opaService.addToInbox(opaReview.getOpaDisclosureId().toString(), opaReview.getAssigneePersonId(),
						Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW, actionLogMessage.toString(),
						AuthenticatedUser.getLoginUserName());
			} else {
				actionTypeCode = Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER;
				actionType = ActionTypes.OPA_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER;
			}
        } else if (opaReview.getOpaReviewId()!= null) {
			OPAReview tmpOPAReview = reviewDao.getOPAReview(opaReview.getOpaReviewId());
			if (reviewDao.isReviewStatusChanged(opaReview)) {
				return new ResponseEntity<>(commonDao.convertObjectToJSON("Review status changed"), HttpStatus.METHOD_NOT_ALLOWED);
			}
			if (!opaReview.getReviewStatusTypeCode().equalsIgnoreCase("3") && reviewDao.isReviewPresent(opaReview)) {
				return new ResponseEntity<>(commonDao.convertObjectToJSON("Review already added"), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			Set<NotificationRecipient> dynamicEmailrecipients = new HashSet<>();
			Map<String, String> additionalDetails = new HashMap<>();
			commonService.setNotificationRecipients(tmpOPAReview.getAssigneePersonId(),
					CoreConstants.NOTIFICATION_RECIPIENT_TYPE_TO, dynamicEmailrecipients);
			additionalDetails.put(StaticPlaceholders.NOTIFICATION_RECIPIENT_OBJECTS,
					commonDao.convertObjectToJSON(dynamicEmailrecipients));
            updateTimestamp = reviewDao.updateOPAReview(opaReview);
            if (opaReview.getAssigneePersonId() != null) {
                actionTypeCode = Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER;
				reviewerName = personDao.getPersonFullNameByPersonId(opaReview.getAssigneePersonId());
				if (tmpOPAReview.getAssigneePersonId() != null) {
					inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, opaReview.getOpaDisclosureId().toString(),
							tmpOPAReview.getAssigneePersonId(), Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW,
							CoreConstants.SUBMODULE_ITEM_KEY.toString(), CoreConstants.SUBMODULE_CODE);
					if (!tmpOPAReview.getAssigneePersonId().equals(opaReview.getAssigneePersonId())) {
						// Sends notification to the previously assigned reviewer.
						sendNotification(additionalDetails, opaReview.getOpaDisclosureId(), opaReview.getOpaReviewId(),
								ActionTypes.OPA_REVIEWER_REMOVE);
					}
				}
				StringBuilder actionLogMessage = new StringBuilder("OPA disclosure of ");
				actionLogMessage.append(personDao.getPersonFullNameByPersonId(OPADisclosure.getPersonId()))
						.append(" Submitted on ")
						.append(commonDao.getDateFormat(new Date(), CoreConstants.DEFAULT_DATE_FORMAT));
				opaService.addToInbox(opaReview.getOpaDisclosureId().toString(), opaReview.getAssigneePersonId(),
						Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW, actionLogMessage.toString(),
						AuthenticatedUser.getLoginUserName());
				if ((tmpOPAReview.getAssigneePersonId() != null && opaReview.getAssigneePersonId() != null
						&& !tmpOPAReview.getAssigneePersonId().equals(opaReview.getAssigneePersonId()))
						|| (tmpOPAReview.getAssigneePersonId() == null && opaReview.getAssigneePersonId() != null)) {
					actionType = ActionTypes.OPA_REVIEWER_ASSIGN;
				}
            } else {
                actionTypeCode = Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER;
				if (tmpOPAReview.getAssigneePersonId() != null) {
					// Sends notification to the previously assigned reviewer.
					sendNotification(additionalDetails, opaReview.getOpaDisclosureId(), opaReview.getOpaReviewId(),
							ActionTypes.OPA_REVIEWER_REMOVE);
					actionType = ActionTypes.OPA_LOCATION_REVIEW_ASSIGNED_WITHOUT_REVIEWER;
				}
            }
        }
		if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
			if (reviewDao.numberOfReviewOfStatuesIn(opaReview.getOpaDisclosureId(),
					Arrays.asList(Constants.OPA_REVIEW_ASSIGNED, Constants.OPA_REVIEW_IN_PROGRESS)) == 1) {
				opaDao.updateOPADisclosureStatuses(opaReview.getOpaDisclosureId(), updateTimestamp,
						Constants.OPA_DISCLOSURE_STATUS_REVIEW_ASSIGNED, null);
			} else if (reviewDao.numberOfReviewOfStatuesIn(opaReview.getOpaDisclosureId(),
					Arrays.asList(Constants.OPA_REVIEW_ASSIGNED, Constants.OPA_REVIEW_IN_PROGRESS)) == 0) {
				opaDao.updateOPADisclosureStatuses(opaReview.getOpaDisclosureId(), updateTimestamp,
						Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED, null);
			} else {
				opaDao.updateOPADisclosureUpDetails(opaReview.getOpaDisclosureId(), updateTimestamp);
			}
		}
       
        OPAReview opaReviewObj = reviewDao.getOPAReview(opaReview.getOpaReviewId());
        opaReviewObj.setOpaDisclosure(opaDao.getOPADisclosure(opaReview.getOpaDisclosureId()));
        saveActionLog(opaReviewObj, actionTypeCode, reviewerName);
        opaReviewObj.setAssigneePersonName(reviewerName);
        opaReviewObj.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_STATUS,
				opaReview.getReviewStatusType().getDescription());
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION,
				opaReview.getReviewLocationType().getDescription());
		additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
		additionalDetails.put(StaticPlaceholders.REVIEW_ASSIGNED_DATE,
				new SimpleDateFormat(Constants.DATE_FORMAT).format(new Date()));
		sendNotification(additionalDetails, opaReview.getOpaDisclosureId(), opaReview.getOpaReviewId(), actionType);
		return new ResponseEntity<>(opaReviewObj, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> getOPAReview(Integer opaDisclosureId) {
        List<OPAReviewDto> reviews = new ArrayList<>();
        reviewDao.fetchAllOPAReviewByDisId(opaDisclosureId).forEach(review -> {
            OPAReviewDto reviewDto = new OPAReviewDto();
            BeanUtils.copyProperties(review, reviewDto);
            reviewDto.setAssigneePersonName(personDao.getPersonFullNameByPersonId(review.getAssigneePersonId()));
            reviews.add(reviewDto);
        });
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> startOPAReview(Integer opaReviewId, Integer opaDisclsoureId, String description) {
        if (reviewDao.isOPAReviewExistsOfStatus(opaReviewId, Arrays.asList(Constants.OPA_REVIEW_IN_PROGRESS,
                Constants.OPA_REVIEW_COMPLETED))) {
            return new ResponseEntity<>("Review already started/completed", HttpStatus.METHOD_NOT_ALLOWED);
        }
        List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_RETURN);
		if (opaDao.isOPAWithStatuses(opaDisclosureStatus, null, opaDisclsoureId)) {
			return new ResponseEntity<>("Already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
        Timestamp timestamp = reviewDao.updateReviewStatus(opaReviewId, Constants.OPA_REVIEW_IN_PROGRESS, null);
        OPAReview opaReview = reviewDao.getOPAReview(opaReviewId);
        opaDao.updateOPADisclosureUpDetails(opaReview.getOpaDisclosureId(), timestamp);
        OPAReview opaReviewObj = reviewDao.getOPAReview(opaReview.getOpaReviewId());
        String actionTypeCode;
        String reviewerName = "";
        if (opaReviewObj.getAssigneePersonId() != null &&
                opaReviewObj.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_BY_REVIEWER;
            reviewerName = personDao.getPersonFullNameByPersonId(opaReviewObj.getAssigneePersonId());
        } else if (opaReviewObj.getAssigneePersonId() != null) {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER;
            reviewerName = personDao.getPersonFullNameByPersonId(opaReviewObj.getAssigneePersonId());
        } else {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER;
        }
        opaReview.setDescription(description);
        saveActionLog(opaReview, actionTypeCode, reviewerName);
        opaReviewObj.setUpdateTimestamp(timestamp);
		opaReviewObj.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        return new ResponseEntity<>(opaReviewObj, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> completeOPAReview(Integer opaReviewId, Date opaReviewEndDate, Integer opaDisclosureId, String description) {
        if (reviewDao.isOPAReviewExistsOfStatus(opaReviewId, Arrays.asList(Constants.OPA_REVIEW_COMPLETED))) {
            return new ResponseEntity<>("Review already completed", HttpStatus.METHOD_NOT_ALLOWED);
        }
        List<String> opaDisclosureStatus = Arrays.asList(Constants.OPA_DISCLOSURE_STATUS_RETURN);
		if (opaDao.isOPAWithStatuses(opaDisclosureStatus, null, opaDisclosureId)) {
			return new ResponseEntity<>("Already returned", HttpStatus.METHOD_NOT_ALLOWED);
		}
		String actionType = null;
		String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
        Timestamp timestamp = reviewDao.updateReviewStatus(opaReviewId, Constants.OPA_REVIEW_COMPLETED, opaReviewEndDate);
        OPAReview opaReview = reviewDao.getOPAReview(opaReviewId);
		if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW)) {
			if (reviewDao.numberOfReviewOfStatuesIn(opaReview.getOpaDisclosureId(),
					Arrays.asList(Constants.OPA_REVIEW_ASSIGNED, Constants.OPA_REVIEW_IN_PROGRESS)) == 0) {
				opaDao.updateOPADisclosureStatuses(opaReview.getOpaDisclosureId(), timestamp,
						Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED, null);
				opaReview.getOpaDisclosure().setReviewStatusType(
						opaDao.getOPADisclosureStatusType(Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED));
			}
        }
        
        String actionTypeCode;
        String reviewerName = "";
        String reviewedAdminName = "";
        if (opaReview.getAssigneePersonId() != null && opaReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_BY_REVIEWER;
            reviewerName = personDao.getPersonFullNameByPersonId(opaReview.getAssigneePersonId());
			actionType = ActionTypes.OPA_REVIEWER_REVIEW_COMPLETE;
        } else if (opaReview.getAssigneePersonId() != null) {
        	actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER;
        	reviewedAdminName = AuthenticatedUser.getLoginUserFullName();
        	if (!opaReview.getAssigneePersonId().equalsIgnoreCase(AuthenticatedUser.getLoginPersonId())) {
				Map<String, String> reviewerMailDetails = new HashMap<>();
				reviewerMailDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION, opaReview.getReviewLocationType().getDescription());
				reviewerMailDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, reviewedAdminName);
				actionType = (ActionTypes.OPA_LOCATION_REVIEW_COMPLETED_ACK);
				coiService.processCoiMessageToQ(actionType, opaDisclosureId, opaReview.getOpaReviewId(), reviewerMailDetails, Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
			}
			actionType = ActionTypes.OPA_REVIEWER_REVIEW_COMPLETE_BY_ADMIN;
        } else {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER;
            actionType = ActionTypes.OPA_REVIEWER_REVIEW_COMPLETE_BY_ADMIN;
        }
        opaReview.setDescription(description);
        saveActionLog(opaReview, actionTypeCode, reviewerName);
        opaReview.setUpdateTimestamp(timestamp);
		opaReview.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
		inboxDao.markReadMessage(Constants.OPA_MODULE_CODE, opaReview.getOpaDisclosureId().toString(),
				opaReview.getAssigneePersonId(), Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW,
				CoreConstants.SUBMODULE_ITEM_KEY.toString(), CoreConstants.SUBMODULE_CODE);     
		Map<String, String> additionalDetails = new HashMap<>();
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_STATUS,
				opaReview.getReviewStatusType().getDescription());
		additionalDetails.put(StaticPlaceholders.REVIEWER_REVIEW_LOCATION,
				opaReview.getReviewLocationType().getDescription());
		additionalDetails.put(StaticPlaceholders.REVIEWER_NAME, AuthenticatedUser.getLoginUserFullName());
		additionalDetails.put(StaticPlaceholders.ADMINISTRATOR_NAME, AuthenticatedUser.getLoginUserFullName());
		coiService.processCoiMessageToQ(actionType, opaDisclosureId, opaReview.getOpaReviewId(), additionalDetails, Constants.OPA_MODULE_CODE,
				Constants.COI_SUBMODULE_CODE);
        return new ResponseEntity<>(opaReview, HttpStatus.OK);
    }

    private void saveActionLog(OPAReview opaReview, String actionTypeCode, String reviewerName) {
        OPACommonDto actionLogDto = OPACommonDto.builder()
                .opaDisclosureId(opaReview.getOpaDisclosureId())
                .opaDisclosureNumber(opaReview.getOpaDisclosure().getOpaDisclosureNumber())
                .description(opaReview.getDescription())
                .reviewerFullName(reviewerName)
                .updateUserFullName(AuthenticatedUser.getLoginUserFullName())
                .reviewLocationType(opaReview.getReviewLocationType().getDescription())
                .reviewStatus(opaReview.getReviewStatusType().getDescription())
                .comment(opaReview.getDescription())
                .build();
        actionLogService.saveOPAActionLog(actionTypeCode, actionLogDto);
    }

    @Override
    public ResponseEntity<Object> getAllReviewActionLogs(Integer opaDisclosureId) {
        List<String> actionTypeCodes = Arrays.asList(Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITH_REVIEWER, Constants.OPA_DIS_ACTION_LOG_MODIFIED_REVIEW_WITHOUT_REVIEWER,
                Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITHOUT_REVIEWER, Constants.OPA_DIS_ACTION_LOG_CREATED_REVIEW_WITH_REVIEWER,
                Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITH_REVIEWER, Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_WITHOUT_REVIEWER,
                Constants.OPA_DIS_ACTION_LOG_ADMIN_START_REVIEW_BY_REVIEWER, Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_BY_REVIEWER,
                Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITH_REVIEWER, Constants.OPA_DIS_ACTION_LOG_ADMIN_COMPLETE_REVIEW_WITHOUT_REVIEWER,
                Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITH_REVIEWER, Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITHOUT_REVIEWER);
        List<OPAActionLog> opaActionLogs = actionLogRepository.fetchOpaDisclosureActionLogsBasedOnId(opaDisclosureId, actionTypeCodes, true);
        List<OPAActionLogDto> actionLogDtos = new ArrayList<>();
        opaActionLogs.forEach(actionLog ->{
            OPAActionLogDto actionLogDto = OPAActionLogDto.builder().build();
            BeanUtils.copyProperties(actionLog, actionLogDto);
            actionLogDto.setUpdateUserFullName(personDao.getUserFullNameByUserName(actionLog.getUpdateUser()));
            actionLogDtos.add( actionLogDto);
        });
        return new ResponseEntity<>(actionLogDtos, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Object> deleteOPAReview(Integer opaReviewId) {
        if (!reviewDao.isOPAReviewExistsOfStatus(opaReviewId, null)) {
            return new ResponseEntity<>("Review already deleted", HttpStatus.METHOD_NOT_ALLOWED);
        }
        OPAReview opaReview = reviewDao.getOPAReview(opaReviewId);
        OPAReviewDto reviewDto = new OPAReviewDto();
        String opaApprovalFlowType = commonDao.getParameterValueAsString(Constants.OPA_APPROVAL_FLOW_TYPE);
        BeanUtils.copyProperties(opaReview, reviewDto, "reviewStatusType", "reviewLocationType");
        reviewCommentDao.fetchReviewComments(ReviewCommentsDto.builder()
                .componentTypeCode(Constants.COI_DISCL_REVIEW_COMPONENT_TYPE)
                .moduleCode(Constants.COI_MODULE_CODE)
                .subModuleItemKey(String.valueOf(opaReviewId))
                .moduleItemKey(opaReview.getOpaDisclosureId()).build()).forEach(reviewComment -> {
            reviewCommentService.deleteReviewComment(reviewComment.getCommentId(), null);
        });
        reviewDao.deleteOPAReview(opaReviewId);
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		if (opaApprovalFlowType != null && !opaApprovalFlowType.equals(Constants.ROUTING_REVIEW) && reviewDao
				.numberOfReviewNotOfStatus(opaReview.getOpaDisclosureId(), Constants.OPA_REVIEW_COMPLETED).equals(0)) {
			Integer reviewCount  = reviewDao
					.getReviewCountForDisclosure(opaReview.getOpaDisclosureId());
			if (reviewCount != null && reviewCount == 0) {
				opaDao.updateOPADisclosureStatuses(opaReview.getOpaDisclosureId(), updateTimestamp,
						Constants.OPA_DISCLOSURE_STATUS_REVIEW_IN_PROGRESS, null);
			} else {
				opaDao.updateOPADisclosureStatuses(opaReview.getOpaDisclosureId(), updateTimestamp,
						Constants.OPA_DISCLOSURE_STATUS_REVIEW_COMPLETED, null);
			}
		} else {
			opaDao.updateOPADisclosureUpDetails(opaReview.getOpaDisclosureId(), updateTimestamp);
		}
        String actionTypeCode;
        String reviewerName = "";
        if (opaReview.getAssigneePersonId() != null ) {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITH_REVIEWER;
            reviewerName = personDao.getPersonFullNameByPersonId(opaReview.getAssigneePersonId());
			inboxDao.deleteMessageFromInboxByParams(Constants.OPA_MODULE_SUB_ITEM_CODE, Constants.OPA_MODULE_CODE,
					opaReview.getOpaDisclosureId().toString(), Constants.COI_SUBMODULE_CODE,
					Constants.INBOX_OPA_WAITING_REVIEWER_REVIEW, opaReview.getAssigneePersonId());
        } else {
            actionTypeCode = Constants.OPA_DIS_ACTION_LOG_ADMIN_REMOVED_REVIEW_WITHOUT_REVIEWER;
        }
        saveActionLog(opaReview, actionTypeCode, reviewerName);
        OPADisclosure opaDisclosure = opaDao.getOPADisclosure(opaReview.getOpaDisclosureId());
        reviewDto.setOpaDisclosure(opaDisclosure);
        reviewDto.setUpdateTimestamp(updateTimestamp);
        reviewDto.setUpdateUserFullName(AuthenticatedUser.getLoginUserFullName());
        return new ResponseEntity<>(reviewDto, HttpStatus.OK);
    }
	
	private void sendNotification(Map<String, String> additionalDetails, Integer disclosureId, Integer moduleSubItemKey,
			String actionType) {
		coiService.processCoiMessageToQ(actionType, disclosureId, moduleSubItemKey, additionalDetails,
				Constants.OPA_MODULE_CODE, Constants.COI_SUBMODULE_CODE);
	}
}
