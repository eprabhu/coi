package com.polus.fibicomp.cmp.controller;

import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.cmp.dto.CoiManagementPlanFileAttachmentDto;
import com.polus.fibicomp.cmp.service.CoiManagementPlanFileAttachmentService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/cmp/attachment")
public class CoiManagementPlanFileAttachmentController {

	@Autowired
	CoiManagementPlanFileAttachmentService fileAttachmentService;

	@PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> saveOrReplaceCmpAttachments(
			@RequestParam(required = false) MultipartFile[] files,
			@RequestParam String formDataJson) {
		log.info("Request for saveOrReplaceCmpAttachments");
		return fileAttachmentService.saveOrReplaceCmpAttachments(files, formDataJson);
	}

	@PatchMapping(value = "/updateDetails", produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<String> updateCmpAttachmentDetails(
			@RequestBody CoiManagementPlanFileAttachmentDto fileAttachmentDto) {
		log.info("Request for updateCmpAttachmentDetails");
		return fileAttachmentService.updateCmpAttachmentDetails(fileAttachmentDto);
	}

	@GetMapping(value = "/download", produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<byte[]> downloadCmpAttachment(HttpServletResponse response,
			@RequestHeader Integer attachmentId) {
		log.info("Request for downloadCmpAttachment");
		return fileAttachmentService.downloadCmpAttachment(attachmentId);
	}

	@DeleteMapping(value = "/delete", produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<String> deleteCmpAttachment(@RequestParam Integer attachmentNumber) {
		log.info("Request for deleteCmpAttachment");
		return fileAttachmentService.deleteCmpAttachment(attachmentNumber);
	}

	@GetMapping(value = "/getAttachmentsByCmpId/{cmpId}", produces = { MediaType.APPLICATION_JSON_VALUE })
	public List<CoiManagementPlanFileAttachmentDto> getCmpAttachmentsByCmpId(@PathVariable Integer cmpId) {
		log.info("Request for getAttachmentsByCmpId");
		return fileAttachmentService.getCmpAttachmentsByCmpId(cmpId);
	}

}
