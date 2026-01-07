package com.polus.fibicomp.coi.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.coi.dto.PersonAttachmentDto;

@Service
public interface COIAttachmentService {

	/**
	 * This method is used to save or replace an attachment.
	 * @param files
	 * @param formDataJSON
	 * @return
	 */
	public ResponseEntity<Object> saveOrReplaceAttachments(MultipartFile[] files, String formDataJSON);

	/**
	 * This method is used to update an attachment
	 * @param request
	 * @return
	 */
	public ResponseEntity<String> updateAttachmentDetails(PersonAttachmentDto request);

	/**
	 * This method is used to download an attachment
	 * @param attachmentId
	 * @return
	 */
	public ResponseEntity<byte[]> downloadAttachment(Integer attachmentId);

	/**
	 * This method is used to delete attachments
	 * @param attachmentNumber
	 * @return
	 */
	public ResponseEntity<String> deleteAttachment(Integer attachmentNumber);

}

