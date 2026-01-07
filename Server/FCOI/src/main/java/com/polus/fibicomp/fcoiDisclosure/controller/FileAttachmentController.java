package com.polus.fibicomp.fcoiDisclosure.controller;

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

import com.polus.fibicomp.fcoiDisclosure.dto.FileAttachmentDto;
import com.polus.fibicomp.fcoiDisclosure.service.FileAttachmentService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/disclosure/attachment")
public class FileAttachmentController {

	@Autowired 
	FileAttachmentService fileAttachmentService;

	@PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> saveOrReplaceDisclAttachments(@RequestParam(value = "files", required = false) MultipartFile[] files,
			@RequestParam("formDataJson") String formDataJson) {
		log.info("Request for saveOrReplaceDisclAttachments");
		return fileAttachmentService.saveOrReplaceDisclAttachments(files, formDataJson);
	}

	@PatchMapping(value = "/updateDetails", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> updateDisclAttachmentDetails(@RequestBody FileAttachmentDto fileAttachmentDto) {
		log.info("Request for updateDisclAttachmentDetails");
		return fileAttachmentService.updateDisclAttachmentDetails(fileAttachmentDto);
	}

	@GetMapping(value = "/download", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<byte[]> downloadDisclAttachment(HttpServletResponse response, @RequestHeader("attachmentId") Integer attachmentId) {
		log.info("Request for downloadDisclAttachment");
		return fileAttachmentService.downloadDisclAttachment(attachmentId);
	}

	@DeleteMapping(value = "/delete", produces = {MediaType.APPLICATION_JSON_VALUE})
	public ResponseEntity<String> deleteDisclAttachment(@RequestParam("attachmentNumber") Integer attachmentNumber) {
		log.info("Request for deleteDisclAttachment");
		return fileAttachmentService.deleteDisclAttachment(attachmentNumber);
	}

	@GetMapping(value = "/getAttachmentsByDisclId/{disclosureId}", produces = {MediaType.APPLICATION_JSON_VALUE})
	public List<FileAttachmentDto> getDisclAttachmentsByDisclId(@PathVariable("disclosureId") Integer disclosureId) {
		log.info("Request for getDisclAttachmentsByDisclId");
   		return fileAttachmentService.getDisclAttachmentsByDisclId(disclosureId);
   	}
}
