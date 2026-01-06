package com.polus.fibicomp.coi.controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import com.polus.core.common.dao.CommonDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.coi.dto.COIFileRequestDto;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.coi.service.COIFileAttachmentService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/attachment")
public class COIFileAttachmentController {

	@Autowired
	COIFileAttachmentService coiFileAttachmentService;

	@Autowired
	private CommonDao commonDao;

	@Value("${app.filemanagement.storage.type}")
	private String storageType;

	@Operation(description = "Consumes: description,attaStatusCode, attaTypeCode, commentId, componentReferenceId, componentReferenceNumber, componentTypeCode,documentOwnerPersonId, file")
	@PostMapping(value = "saveFile", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}, produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> saveFile(COIFileRequestDto request){
		String response = coiFileAttachmentService.saveFileAttachment(request);		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(description = "Consumes: refId")
	@GetMapping(value = "/getReviewAttachByRefId/{refId}", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<Object> getReviewAttachByRefId(@PathVariable(value = "refId", required = true) final Integer refId) {
		List<CoiReviewAttachment> response = coiFileAttachmentService.getReviewAttachByRefId(refId);
		return new ResponseEntity<>(response , HttpStatus.OK);
	}

	@Operation(description = "Consumes: refId, typeCode")
	@GetMapping(value = "/getReviewAttachByRefIdAndTypeCode/{refId}/{typeCode}", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<Object> getReviewAttachByRefIdAndTypeCode(@PathVariable(value = "refId", required = true) final Integer refId, 
			@PathVariable(value = "typeCode", required = true) final Integer typeCode) {
		List<CoiReviewAttachment> response = coiFileAttachmentService.getReviewAttachByRefIdAndTypeCode(refId,typeCode);
		return new ResponseEntity<>(response , HttpStatus.OK);
	}

	@Operation(summary = "Update review attachment details with file", description = "Consumes: file, description, attaStatusCode, attaTypeCode, commentId, componentReferenceId, componentReferenceNumber, componentTypeCode, documentOwnerPersonId, attachmentNumber")
	@PostMapping(value = "/updateReviewAttachment", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}, produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> updateReviewAttachment(COIFileRequestDto request) {
		String response = coiFileAttachmentService.updateReviewAttachment(request);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update review attachment details without file", description = "Consumes: attachmentId, fileDataId, description, attaStatusCode, attaTypeCode, commentId, componentReferenceId, componentReferenceNumber, componentTypeCode, documentOwnerPersonId, attachmentNumber")
	@PostMapping(value = "/updateReviewAttachmentDetails", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> updateReviewAttachmentDetails(@RequestBody COIFileRequestDto request) {
		String response = coiFileAttachmentService.updateReviewAttachmentDetails(request);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(description ="Consumes: fileDataId, attachmentId") 
	@PostMapping(value = "/deleteReviewAttachment", produces = {MediaType.APPLICATION_JSON_VALUE})
	public String deleteReviewAttachment(@RequestBody COIFileRequestDto request) {
		String response = coiFileAttachmentService.deleteReviewAttachment(request);
		return commonDao.convertObjectToJSON(response);
	}

	@Operation(description ="Consumes: attachmentId")
	@GetMapping(value = "/downloadReviewAttachment", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<byte[]> downloadReviewAttachment(HttpServletResponse response, @RequestHeader("attachmentId") Integer attachmentId) {
		return coiFileAttachmentService.downloadReviewAttachment(attachmentId);
	}

	@Operation(description ="Consumes: attachmentIds, componentReferenceId")
	@PostMapping(value = "/exportAllReviewAttachments", produces = {MediaType.APPLICATION_JSON_VALUE})
	public void exportSelectedAttachments(@RequestBody COIFileRequestDto request, HttpServletResponse response) throws IOException {
		coiFileAttachmentService.exportAllReviewAttachments(request, response);
	}

}
