package com.polus.fibicomp.cmp.service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dao.CoiCmpReviewDao;
import com.polus.fibicomp.cmp.dto.CmpReviewActionLogDto;
import com.polus.fibicomp.cmp.dto.CoiCmpReviewDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpReview;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.opa.pojo.OPAReview;

@Service
@Transactional
public class CoiCmpReviewServiceImpl implements CoiCmpReviewService {

	@Autowired
	private CoiCmpReviewDao reviewDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private ActionLogService actionLogService;

	@Override
	public ResponseEntity<Object> saveOrUpdateReview(CoiCmpReviewDto dto) {
		boolean isCreate = dto.getCmpReviewId() == null;
		CoiCmpReview review;
		if (isCreate) {
			review = new CoiCmpReview();
			review.setCreateTimestamp(commonDao.getCurrentTimestamp());
			review.setCreatedBy(AuthenticatedUser.getLoginPersonId());
			if (reviewDao.isCmpReviewAdded(dto)) {
				return new ResponseEntity<>("Review already added", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			review = reviewDao.getReview(dto.getCmpReviewId());
			if (review == null) {
				return new ResponseEntity<>("Invalid Review ID", HttpStatus.BAD_REQUEST);
			}
			if (restrictedFieldsChanged(dto, review)) {
				if (reviewDao.isReviewStatusChanged(dto)) {
					return new ResponseEntity<>("Review status changed", HttpStatus.METHOD_NOT_ALLOWED);
				}
				boolean isCompleted = Constants.COI_MANAGEMENT_PLAN_REVIEWER_REVIEW_STATUS_COMPLETED
						.equals(dto.getReviewStatusTypeCode());
				if (!isCompleted && reviewDao.isReviewPresent(dto)) {
					return new ResponseEntity<>("Review already added", HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
		}
		updateAllowedFields(review, dto);
		review.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
		review.setUpdateTimestamp(commonDao.getCurrentTimestamp());
		reviewDao.saveOrUpdate(review);
		String actionTypeCode;
		if (isCreate) {
			if (review.getAssigneePersonId() != null) {
				actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_ADDED_WITH_REVIEWER;
			} else {
				actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_ADDED_WITHOUT_REVIEWER;
			}
		} else {
			if (review.getAssigneePersonId() != null) {
				actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_MODIFIED_WITH_REVIEWER;
			} else {
				actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_MODIFIED_WITHOUT_REVIEWER;
			}
		}
		CoiCmpReview cmpReviewObj = reviewDao.getReview(review.getCmpReviewId());
		CmpReviewActionLogDto logDto = CmpReviewActionLogDto.builder().cmpId(review.getCmpId())
				.cmpReviewId(review.getCmpReviewId())
				.reviewerName(review.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(review.getAssigneePersonId())
						: null)
				.reviewLocation(cmpReviewObj.getLocationType().getDescription())
				.reviewStatus(cmpReviewObj.getReviewStatusType().getDescription())
				.adminName(AuthenticatedUser.getLoginUserFullName()).comment(review.getDescription()).build();
		actionLogService.saveCmpReviewActionLog(actionTypeCode, logDto);
		return new ResponseEntity<>(review, HttpStatus.OK);
	}

	private boolean restrictedFieldsChanged(CoiCmpReviewDto dto, CoiCmpReview existing) {
		if (!Objects.equals(dto.getAssigneePersonId(), existing.getAssigneePersonId())) {
			return true;
		}
		if (!Objects.equals(dto.getReviewStatusTypeCode(), existing.getReviewStatusTypeCode())) {
			return true;
		}
		if (!Objects.equals(dto.getCmpId(), existing.getCmpId())) {
			return true;
		}
		return false;
	}

	private void updateAllowedFields(CoiCmpReview review, CoiCmpReviewDto dto) {
		review.setDescription(dto.getDescription());
		review.setLocationTypeCode(dto.getLocationTypeCode());
		review.setStartDate(dto.getStartDate());
		review.setEndDate(dto.getEndDate());
		review.setAssigneePersonId(dto.getAssigneePersonId());
		review.setReviewStatusTypeCode(dto.getReviewStatusTypeCode());
		review.setCmpId(dto.getCmpId());
	}

	@Override
	public ResponseEntity<List<CoiCmpReview>> getReviews(Integer cmpId) {
		List<CoiCmpReview> reviews = reviewDao.getReviewsByCmpId(cmpId);
		return new ResponseEntity<>(reviews, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> startReview(Integer reviewId, Date startDate, String description) {
		if (reviewDao.isReviewInStatuses(reviewId, Arrays.asList("2", "3"))) {
			return new ResponseEntity<>("Review already started / completed", HttpStatus.METHOD_NOT_ALLOWED);
		}
		reviewDao.updateReviewStatus(reviewId, "2", startDate, null);
		CoiCmpReview review = reviewDao.getReview(reviewId);
		review.setDescription(description);
		String actionTypeCode;
		if (review.getAssigneePersonId() != null
				&& review.getAssigneePersonId().equals(AuthenticatedUser.getLoginPersonId())) {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_REVIEWER;
		} else if (review.getAssigneePersonId() != null) {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_ADMIN_WITH_REVIEWER;
		} else {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_STARTED_BY_ADMIN_WITHOUT_REVIEWER;
		}
		CoiCmpReview cmpReviewObj = reviewDao.getReview(review.getCmpReviewId());
		CmpReviewActionLogDto logDto = CmpReviewActionLogDto.builder().cmpId(review.getCmpId()).cmpReviewId(reviewId)
				.reviewerName(review.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(review.getAssigneePersonId())
						: null)
				.reviewLocation(cmpReviewObj.getLocationType().getDescription())
				.reviewStatus(cmpReviewObj.getReviewStatusType().getDescription())
				.adminName(AuthenticatedUser.getLoginUserFullName()).comment(description).build();
		actionLogService.saveCmpReviewActionLog(actionTypeCode, logDto);
		return new ResponseEntity<>(review, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> completeReview(Integer reviewId, Date startDate, Date endDate, String description) {
		if (reviewDao.isReviewInStatuses(reviewId, Arrays.asList("3"))) {
			return new ResponseEntity<>("Review already completed", HttpStatus.METHOD_NOT_ALLOWED);
		}
		reviewDao.updateReviewStatus(reviewId, "3", startDate, endDate);
		CoiCmpReview review = reviewDao.getReview(reviewId);
		review.setDescription(description);
		String actionTypeCode;
		if (review.getAssigneePersonId() != null
				&& review.getAssigneePersonId().equals(AuthenticatedUser.getLoginPersonId())) {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_REVIEWER;
		} else if (review.getAssigneePersonId() != null) {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_ADMIN_WITH_REVIEWER;
		} else {
			actionTypeCode = Constants.COI_MANAGEMENT_PLAN_REVIEW_COMPLETED_BY_ADMIN_WITHOUT_REVIEWER;
		}
		CoiCmpReview cmpReviewObj = reviewDao.getReview(review.getCmpReviewId());
		CmpReviewActionLogDto logDto = CmpReviewActionLogDto.builder().cmpId(review.getCmpId()).cmpReviewId(reviewId)
				.reviewerName(review.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(review.getAssigneePersonId())
						: null)
				.reviewLocation(cmpReviewObj.getLocationType().getDescription())
				.reviewStatus(cmpReviewObj.getReviewStatusType().getDescription())
				.adminName(AuthenticatedUser.getLoginUserFullName()).comment(description).build();
		actionLogService.saveCmpReviewActionLog(actionTypeCode, logDto);
		return new ResponseEntity<>(review, HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Object> deleteReview(Integer reviewId) {
		if (!reviewDao.exists(reviewId)) {
			return new ResponseEntity<>("Review does not exist", HttpStatus.BAD_REQUEST);
		}
		reviewDao.deleteReview(reviewId);
		CoiCmpReview review = reviewDao.getReview(reviewId);
		String actionTypeCode = review.getAssigneePersonId() != null
				? Constants.COI_MANAGEMENT_PLAN_REVIEW_DELETED_WITH_REVIEWER
				: Constants.COI_MANAGEMENT_PLAN_REVIEW_DELETED_WITHOUT_REVIEWER;
		CmpReviewActionLogDto logDto = CmpReviewActionLogDto.builder().cmpId(review.getCmpId()).cmpReviewId(reviewId)
				.reviewerName(review.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(review.getAssigneePersonId())
						: null)
				.reviewLocation(review.getLocationType().getDescription())
				.adminName(AuthenticatedUser.getLoginUserFullName()).build();
		actionLogService.saveCmpReviewActionLog(actionTypeCode, logDto);
		return new ResponseEntity<>(HttpStatus.OK);
	}

}
