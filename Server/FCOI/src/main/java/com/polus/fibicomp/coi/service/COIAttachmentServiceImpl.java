package com.polus.fibicomp.coi.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.filemanagement.FileManagementOutputDto;
import com.polus.core.filemanagement.FileManagementService;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.COIAttachmentDao;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.exception.COIFileAttachmentException;
import com.polus.fibicomp.coi.pojo.Attachments;
import com.polus.fibicomp.coi.pojo.DisclAttaType;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dao.EntityFileAttachmentDao;
import com.polus.fibicomp.globalentity.exception.EntityFileAttachmentException;

@Service
@Transactional
public class COIAttachmentServiceImpl implements COIAttachmentService {

	@Autowired
	CommonDao commonDao;
	
	@Autowired
	PersonDao personDao;

	@Autowired
	COIAttachmentDao coiAttachmentDao;

	@Autowired
	COIFileAttachmentService coiFileAttachmentService;

	@Autowired
	FileManagementService fileManagementService;

	@Autowired
	CommonService commonService;

	@Autowired
	EntityFileAttachmentDao entityFileAttachmentDao;

	public static final String COI_MODULE_CODE = "8";
	public static final String COI_COMMON_ATTACHMENT_COUNTER = "COI_COMMON_ATTACHMENT_COUNTER";
	private static final String PERSON_MODULE_CODE = "6";
	private static final String SUB_MODULE_CODE = "803";

	@Override
	public ResponseEntity<Object> saveOrReplaceAttachments(MultipartFile[] files, String formDataJSON) {
		List<PersonAttachmentDto> attachments = new ArrayList<>();
		PersonAttachmentDto personAttachmentdto = new PersonAttachmentDto();
		ObjectMapper mapper = new ObjectMapper();
		try {
			personAttachmentdto = mapper.readValue(formDataJSON, PersonAttachmentDto.class);
			personAttachmentdto.getAttachments().forEach(ele -> {
				int count = 0;
				PersonAttachmentDto request = PersonAttachmentDto.builder().personId(AuthenticatedUser.getLoginPersonId())
						.attaTypeCode(ele.getAttaTypeCode()).fileName(ele.getFileName()).mimeType(ele.getMimeType())
						.description(ele.getDescription()).createdBy(AuthenticatedUser.getLoginPersonId())
						.createTimestamp(commonDao.getCurrentTimestamp())
						.updatedBy(AuthenticatedUser.getLoginPersonId())
						.updateTimestamp(commonDao.getCurrentTimestamp())
						.attachmentNumber(ele.getAttachmentNumber() != null ? ele.getAttachmentNumber()
								: entityFileAttachmentDao.getNextAttachmentNumber(COI_COMMON_ATTACHMENT_COUNTER))
						.versionNumber(ele.getVersionNumber() != null ? ele.getVersionNumber() + 1 : 1).build();
				DisclAttaType disclosureAttachmentType = coiAttachmentDao
						.getDisclosureAttachmentForTypeCode(ele.getAttaTypeCode());
				Attachments attachment = addAttachments(files[count], request, AuthenticatedUser.getLoginPersonId());
				attachment.setDisclAttaTypeDetails(disclosureAttachmentType);
				PersonAttachmentDto attachmentDto = PersonAttachmentDto.builder()
				        .attachmentId(attachment.getAttachmentId())
				        .personId(attachment.getPersonId())
				        .fileName(attachment.getFileName())
				        .mimeType(attachment.getMimeType())
				        .description(attachment.getDescription())
				        .attachmentNumber(attachment.getAttachmentNumber())
				        .versionNumber(attachment.getVersionNumber())
				        .createTimestamp(attachment.getCreateTimestamp())
				        .createdBy(attachment.getCreatedBy())
				        .updateTimestamp(attachment.getUpdateTimestamp())
				        .updatedBy(attachment.getUpdatedBy())
				        .attaTypeCode(attachment.getAttaTypeCode())
				        .attachmentType(attachment.getDisclAttaTypeDetails().getDescription())
				        .updateUserFullame(personDao.getPersonFullNameByPersonId(attachment.getPersonId()))
				        .build();
				attachments.add(attachmentDto);
				count++;
			});
		} catch (JsonProcessingException e) {
			throw new ApplicationException("error in adding attachment", e, Constants.JAVA_ERROR);
		}
		return new ResponseEntity<>(attachments, HttpStatus.OK);
	}

	private Attachments addAttachments(MultipartFile file, PersonAttachmentDto request, String personId) {
		try {
			Attachments attachment = null;
			if (file != null) {
				request.setFile(file);
				attachment = coiFileAttachmentService.saveAttachment(request, personId);
			}
			return attachment;
		} catch (Exception e) {
			throw new ApplicationException("error in addAttachments", e, Constants.JAVA_ERROR);
		}
	}

	@Override
	public ResponseEntity<String> updateAttachmentDetails(PersonAttachmentDto request) {
		try {
			coiAttachmentDao.updateAttachmentDetail(request.getAttachmentId(), request.getDescription());
		} catch (Exception e) {
			throw new COIFileAttachmentException(
					"Exception in updateAttachmentDetails:" ,e);
		}
		return new ResponseEntity<>("Attachment updated successfully", HttpStatus.OK);
	}

	@Override
	public ResponseEntity<byte[]> downloadAttachment(Integer attachmentId) {
		Attachments attachments = coiAttachmentDao.fetchAttachmentByAttachmentId(attachmentId);
		ResponseEntity<byte[]> attachmentData = null;
		try {
			FileManagementOutputDto fileData = fileManagementService.downloadFile(PERSON_MODULE_CODE,
					attachments.getFileDataId(), SUB_MODULE_CODE);
			attachmentData = commonService.setAttachmentContent(fileData.getOriginalFileName(), fileData.getData());
		} catch (Exception e) {
			throw new EntityFileAttachmentException(
					"Exception in downloadAttachment: ", e);
		}
		return attachmentData;
	}

	@Override
	public ResponseEntity<String> deleteAttachment(Integer attachmentNumber) {
		List<Attachments> attachments = coiAttachmentDao.fetchAttachmentByAttachmentNumber(attachmentNumber);
		attachments.stream().forEach(attach -> {
			fileManagementService.deleteFile(PERSON_MODULE_CODE, attach.getFileDataId(), SUB_MODULE_CODE);
			coiAttachmentDao.deleteAttachment(attach.getAttachmentId());
		});
		return new ResponseEntity<>("Attachment deleted successfully", HttpStatus.OK);
	}

}

