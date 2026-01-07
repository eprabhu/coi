package com.polus.fibicomp.coi.controller;

import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.service.COIAttachmentService;
import com.polus.fibicomp.coi.service.COIAttachmentServiceImpl;

@RestController
public class COIAttachmentController {

	protected static Logger logger = LogManager.getLogger(COIAttachmentServiceImpl.class.getName());

	@Autowired 
	COIAttachmentService coiAttachmentService;

	@PostMapping(value = "/saveOrReplaceAttachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> saveOrReplaceAttachments(@RequestParam(value = "files", required = false) MultipartFile[] files,
			@RequestParam("formDataJson") String formDataJson) {
		logger.info("Request for saveOrRepalceAttachments");
		return coiAttachmentService.saveOrReplaceAttachments(files, formDataJson);
	}

	@PatchMapping(value = "/updateAttachmentDetails", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> updateAttachmentDetails(@RequestBody PersonAttachmentDto request) {
		logger.info("Request for updateAttachmentDetails");
		return coiAttachmentService.updateAttachmentDetails(request);
	}

	@GetMapping(value = "/downloadAttachment", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<byte[]> downloadAttachment(HttpServletResponse response, @RequestHeader("attachmentId") Integer attachmentId) {
		logger.info("Request for downloadAttachment");
		return coiAttachmentService.downloadAttachment(attachmentId);
	}

	@DeleteMapping(value = "/deleteAttachment", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> deleteAttachment(@RequestParam("attachmentNumber") Integer attachmentNumber) {
		logger.info("Request for deleteAttachment");
		return coiAttachmentService.deleteAttachment(attachmentNumber);
	}

}

