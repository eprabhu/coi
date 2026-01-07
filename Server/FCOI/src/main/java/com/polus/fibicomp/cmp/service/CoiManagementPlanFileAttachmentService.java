package com.polus.fibicomp.cmp.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.cmp.dto.CoiManagementPlanFileAttachmentDto;

public interface CoiManagementPlanFileAttachmentService {

	/**
	 * Saves or replaces CMP attachments.
	 *
	 * @param files        the uploaded files
	 * @param formDataJson the attachment metadata in JSON format
	 * @return the service response
	 */
	public ResponseEntity<Object> saveOrReplaceCmpAttachments(MultipartFile[] files, String formDataJson);

	/**
	 * Updates the description of a CMP attachment.
	 *
	 * @param fileAttachmentDto the attachment DTO containing update details
	 * @return the service response
	 */
	public ResponseEntity<String> updateCmpAttachmentDetails(CoiManagementPlanFileAttachmentDto fileAttachmentDto);

	/**
	 * Downloads a CMP attachment by ID.
	 *
	 * @param attachmentId the attachment ID
	 * @return the file content as a byte array
	 */
	public ResponseEntity<byte[]> downloadCmpAttachment(Integer attachmentId);

	/**
	 * Deletes a CMP attachment using its attachment number.
	 *
	 * @param attachmentNumber the attachment number
	 * @return the service response
	 */
	public ResponseEntity<String> deleteCmpAttachment(Integer attachmentNumber);

	/**
	 * Retrieves all CMP attachments for a specific CMP ID.
	 *
	 * @param cmpId the CMP ID
	 * @return the list of CMP attachment DTOs
	 */
	public List<CoiManagementPlanFileAttachmentDto> getCmpAttachmentsByCmpId(Integer cmpId);

}
