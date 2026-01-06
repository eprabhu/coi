package com.polus.fibicomp.reviewcomments.service;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;

public interface ReviewCommentService {

    /**
     * This method is used to save review comment
     *
     * @param files
     * @param disclComment
     * @return
     */
    ResponseEntity<Object> saveOrUpdateReviewComment(MultipartFile[] files, DisclComment disclComment);

    /**
     * @param reviewCommentsDto
     * @return
     */
    ResponseEntity<Object> fetchReviewComments(ReviewCommentsDto reviewCommentsDto);

    /**
     *This method is used for deleting a review comment
     * @param reviewCommentId
     * @param moduleCode 
     * @return
     */
    ResponseEntity<Object> deleteReviewComment(Integer reviewCommentId, Integer moduleCode);

    /**
     * @param attachmentId
     * @return
     */
    ResponseEntity<Object> deleteReviewAttachment(Integer attachmentId);

    /**
     * @param attachmentId
     * @return
     */
    ResponseEntity<byte[]> downloadReviewAttachment(Integer attachmentId);

    /**
     * for getting count of review comments
     * @param reviewCommentsDto
     * @return
     */
	ResponseEntity<Map<String, Object>> getReviewCommentsCount(ReviewCommentsDto reviewCommentsDto);

	/**
     * @param commentId
     * @return
     */
    void resolveDisclCommentById(Integer commentId);

}
