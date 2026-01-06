package com.polus.fibicomp.coi.service;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.coi.dto.COIFileRequestDto;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.coi.pojo.Attachments;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;

public interface COIFileAttachmentService {

	/**
	 * To save attachment
	 * @param request
	 * @return
	 */
	String saveFileAttachment(COIFileRequestDto request);

    /**
     * To get review attachments by reference id
     * @param refId
     * @return
     */
	List<CoiReviewAttachment> getReviewAttachByRefId(Integer refId);

	/**
	 * To get review attachments by reference id and type code
	 * @param refId
	 * @param typeCode
	 * @return
	 */
	List<CoiReviewAttachment> getReviewAttachByRefIdAndTypeCode(Integer refId, Integer typeCode);

	/**
	 * To get review attachments by comment id
	 * @param commentId
	 * @return
	 */
	List<CoiReviewAttachment> getReviewAttachByCommentId(Integer commentId);

	/**
	 * To update review attachment
	 * @param request
	 * @return
	 */
	String updateReviewAttachment(COIFileRequestDto request);

	/**
	 * To delete review attachment
	 * @param request
	 * @return
	 */
	String deleteReviewAttachment(COIFileRequestDto request);

	/**
	 * To download review attachment
	 * @param attachmentId
	 * @return
	 */
	ResponseEntity<byte[]> downloadReviewAttachment(Integer attachmentId);

	/**
	 * To export all review attachments
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	void exportAllReviewAttachments(COIFileRequestDto request, HttpServletResponse response) throws IOException;

	/**
	 * To update review attachment details
	 * @param request
	 * @return
	 */
	String updateReviewAttachmentDetails(COIFileRequestDto request);

	/**
	 * To save review attachment
	 * @param request
	 * @param personId
	 * @return
	 */
	Attachments saveAttachment(PersonAttachmentDto request, String personId);

	/**
	 * This method deletes an Attachment by attachment if
	 * if attachment not founds throws ApplicationException exception
	 * @param attachmentId
	 * @return
	 */
	Integer deleteReviewAttachmentById(Integer attachmentId);

}
