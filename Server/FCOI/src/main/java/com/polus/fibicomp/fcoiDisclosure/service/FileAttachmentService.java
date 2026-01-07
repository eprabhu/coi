package com.polus.fibicomp.fcoiDisclosure.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.fcoiDisclosure.dto.FileAttachmentDto;

public interface FileAttachmentService {

	/**
	 * Save or replace disclosure attachment
	 * @param files
	 * @param formDataJson
	 * @return
	 */
	public ResponseEntity<Object> saveOrReplaceDisclAttachments(MultipartFile[] files, String formDataJson);

	/**
	 * To update the description of the disclosure attachment
	 * @param request
	 * @return
	 */
	public ResponseEntity<String> updateDisclAttachmentDetails(FileAttachmentDto fileAttachmentDto);

	/**
	 * To download disclosure attachment
	 * @param attachmentId
	 * @return
	 */
	public ResponseEntity<byte[]> downloadDisclAttachment(Integer attachmentId);

	/**
	 * To delete disclosure attachments
	 * @param attachmentNumber
	 * @return
	 */
	public ResponseEntity<String> deleteDisclAttachment(Integer attachmentNumber);

	/**
	 * To fetch all disclosure attachments
	 * @param entityId
	 * @return
	 */
	public List<FileAttachmentDto> getDisclAttachmentsByDisclId(Integer entityId);

}
