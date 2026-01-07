package com.polus.fibicomp.cmp.dao;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.polus.fibicomp.cmp.dto.CoiCmpReviewDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpReview;

public interface CoiCmpReviewDao {

	/**
	 * Inserts a new review or updates an existing one based on its identifier.
	 *
	 * @param review The review entity to persist.
	 */
	void saveOrUpdate(CoiCmpReview review);

	/**
	 * Retrieves a review by its primary key.
	 *
	 * @param cmpReviewId The review ID.
	 * @return The matching review, or null if not found.
	 */
	CoiCmpReview getReview(Integer cmpReviewId);

	/**
	 * Fetches all reviews associated with a CMP.
	 *
	 * @param cmpId The CMP ID.
	 * @return List of reviews linked to the CMP; never null.
	 */
	List<CoiCmpReview> getReviewsByCmpId(Integer cmpId);

	/**
	 * Deletes a review by ID.
	 *
	 * @param reviewId The review ID to delete.
	 */
	void deleteReview(Integer reviewId);

	/**
	 * Checks whether a review exists with the given ID.
	 *
	 * @param reviewId The review ID.
	 * @return true if the review exists; false otherwise.
	 */
	boolean exists(Integer reviewId);

	/**
	 * Determines whether the review is currently in any of the given statuses.
	 *
	 * @param reviewId The review ID.
	 * @param statuses List of status codes to compare.
	 * @return true if the review's status matches any provided status.
	 */
	boolean isReviewInStatuses(Integer reviewId, List<String> statuses);

	/**
	 * Checks if a review already exists for a CMP with the given reviewer and
	 * status. Typically used to prevent duplicates.
	 *
	 * @param cmpId      The CMP ID.
	 * @param reviewerId The reviewer’s person ID.
	 * @param statusCode The status code to match.
	 * @return true if such a review exists.
	 */
	boolean existsReviewForCmp(Integer cmpId, String reviewerId, String statusCode);

	/**
	 * Updates the status of a review and optionally start/end timestamps.
	 *
	 * @param reviewId   The review ID.
	 * @param statusCode New status code.
	 * @param startDate  Optional start date (nullable).
	 * @param endDate    Optional end date (nullable).
	 * @return Timestamp representing when the update occurred (usually DB
	 *         timestamp).
	 */
	Timestamp updateReviewStatus(Integer reviewId, String statusCode, Date startDate, Date endDate);

	/**
	 * Checks whether a given review instance is considered "new" for persistence.
	 * Generally used before insert operations.
	 *
	 * @param review The review entity.
	 * @return true if the review is new.
	 */
	boolean isCmpReviewAdded(CoiCmpReviewDto review);

	/**
	 * Verifies whether a structurally equivalent review already exists in the DB.
	 * Useful to prevent duplicates based on fields other than ID.
	 *
	 * @param review The review to check.
	 * @return true if an equivalent review is already present.
	 */
	boolean isReviewPresent(CoiCmpReviewDto review);

	/**
	 * Detects whether the status of the provided review differs from the persisted
	 * value.
	 *
	 * @param review Review containing potential new status.
	 * @return true if the status has changed.
	 */
	boolean isReviewStatusChanged(CoiCmpReviewDto review);
}
