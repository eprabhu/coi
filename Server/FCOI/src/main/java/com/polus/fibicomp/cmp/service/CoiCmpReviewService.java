package com.polus.fibicomp.cmp.service;

import java.util.Date;
import java.util.List;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.cmp.dto.CoiCmpReviewDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpReview;

public interface CoiCmpReviewService {

	/**
	 * Creates or updates a CMP review based on the data in the DTO.
	 *
	 * @param dto review payload
	 * @return HTTP response containing the created/updated review or an error
	 *         payload
	 */
	ResponseEntity<Object> saveOrUpdateReview(CoiCmpReviewDto dto);

	/**
	 * Marks a review as started and optionally records a start date and
	 * description.
	 *
	 * @param reviewId    identifier of the review
	 * @param date        start date (may be null)
	 * @param description optional notes for the start action
	 * @return HTTP response indicating success or validation failure
	 */
	ResponseEntity<Object> startReview(Integer reviewId, Date date, String description);

	/**
	 * Marks a review as completed, recording end date and optional metadata.
	 *
	 * @param reviewId    identifier of the review
	 * @param endDate     completion date
	 * @param date        optional additional date field (depending on service
	 *                    logic)
	 * @param description optional notes for the completion action
	 * @return HTTP response indicating success or failure
	 */
	ResponseEntity<Object> completeReview(Integer reviewId, Date endDate, Date date, String description);

	/**
	 * Retrieves all reviews linked to a CMP.
	 *
	 * @param cmpId CMP identifier
	 * @return HTTP response containing the list of reviews
	 */
	ResponseEntity<List<CoiCmpReview>> getReviews(Integer cmpId);

	/**
	 * Deletes a review by ID.
	 *
	 * @param reviewId identifier of the review to delete
	 * @return HTTP response indicating the outcome
	 */
	ResponseEntity<Object> deleteReview(Integer reviewId);
}
