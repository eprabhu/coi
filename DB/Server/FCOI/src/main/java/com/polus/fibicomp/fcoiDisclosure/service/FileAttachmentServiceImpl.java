package com.polus.fibicomp.fcoiDisclosure.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.filemanagement.FileManagementOutputDto;
import com.polus.core.filemanagement.FileManagementService;
import com.polus.core.filemanagement.FileManagmentInputDto;
import com.polus.core.filemanagement.FileStorageException;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dao.COIAttachmentDao;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dao.FileAttachmentDao;
import com.polus.fibicomp.fcoiDisclosure.dto.FileAttachmentDto;
import com.polus.fibicomp.fcoiDisclosure.exception.FileAttachmentException;
import com.polus.fibicomp.fcoiDisclosure.pojo.DisclAttachment;

@Service
@Transactional
public class FileAttachmentServiceImpl implements FileAttachmentService {

	@Autowired
	FileManagementService fileManagementService;

	@Autowired
	FileAttachmentDao fileAttachmentDao;

	@Autowired
	PersonDao personDao;

	@Autowired
	CommonDao commonDao;

	@Autowired
	COIAttachmentDao coiAttachmentDao;

	@Autowired
	CommonService commonService;

	private static final String SUB_MODULE_CODE = "0";

	@Override
	@Transactional
	public ResponseEntity<Object> saveOrReplaceDisclAttachments(MultipartFile[] files, String formDataJson) {
		final FileManagementOutputDto[] fileOutputHolder = new FileManagementOutputDto[1];
		List<FileAttachmentDto> attachments = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		try {
			FileAttachmentDto request = mapper.readValue(formDataJson, FileAttachmentDto.class);
			AtomicInteger index = new AtomicInteger(0);
			request.getAttachments().forEach(attach -> {
				int count = index.getAndIncrement();
				FileManagmentInputDto input = FileManagmentInputDto.builder().file(files[count])
						.moduleCode(String.valueOf(Constants.COI_MODULE_CODE)).subModuleCode(SUB_MODULE_CODE)
						.moduleNumber(String.valueOf(request.getDisclosureId()))
						.updateUser(AuthenticatedUser.getLoginUserName()).build();
				try {
					fileOutputHolder[0] = fileManagementService.saveFile(input);
				} catch (FileStorageException | IOException e) {
					throw new FileAttachmentException("Exception in saveFileAttachment , " + e);
				}
				attach.setFileDataId(fileOutputHolder[0].getFileDataId());
				attach.setDisclosureId(request.getDisclosureId());
				DisclAttachment attachment = fileAttachmentDao.saveDisclAttachmentDetail(attach);
				attachment.setDisclAttaType(
						coiAttachmentDao.getDisclosureAttachmentForTypeCode(attach.getAttaTypeCode()));
				FileAttachmentDto dto = new FileAttachmentDto();
				attachments.add(mapEntityToDTO(dto, attachment));
			});
			return new ResponseEntity<>(attachments, HttpStatus.OK);
		} catch (Exception e) {
			fileManagementService.removeFileOnException(fileOutputHolder[0].getFilePath(),
					fileOutputHolder[0].getFileName());
			throw new FileAttachmentException("Exception in saveOrReplaceDisclAttachments , " + e);
		}
	}

	@Override
	public ResponseEntity<String> updateDisclAttachmentDetails(FileAttachmentDto fileAttachmentDto) {
		try {
			fileAttachmentDao.updateDisclAttachmentDetail(fileAttachmentDto.getAttachmentId(),
					fileAttachmentDto.getDescription());
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in updateDisclAttachmentDetails, " + e);
		}
		return new ResponseEntity<>("Attachment updated successfully", HttpStatus.OK);
	}

	@Override
	public ResponseEntity<byte[]> downloadDisclAttachment(Integer attachmentId) {
		DisclAttachment attachment = fileAttachmentDao.fetchDisclAttachmentByAttachmentId(attachmentId);
		ResponseEntity<byte[]> attachmentData = null;
		try {
			FileManagementOutputDto fileData = fileManagementService.downloadFile(
					String.valueOf(Constants.COI_MODULE_CODE), attachment.getFileDataId(), SUB_MODULE_CODE);
			attachmentData = commonService.setAttachmentContent(fileData.getOriginalFileName(), fileData.getData());
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in downloadDisclAttachment: ", e);
		}
		return attachmentData;
	}

	@Override
	public ResponseEntity<String> deleteDisclAttachment(Integer attachmentNumber) {
		try {
			List<DisclAttachment> attachments = fileAttachmentDao.fetchDisclAttachmentByAttachmentNumber(attachmentNumber);
			attachments.stream().forEach(attach -> {
				fileManagementService.deleteFile(String.valueOf(Constants.COI_MODULE_CODE), attach.getFileDataId(),
						SUB_MODULE_CODE);
				fileAttachmentDao.deleteDisclAttachment(attach.getAttachmentId());
			});
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in deleteDisclAttachment, " + e);
		}
		return new ResponseEntity<>("Attachment deleted successfully", HttpStatus.OK);
	}

	@Override
	public List<FileAttachmentDto> getDisclAttachmentsByDisclId(Integer disclosureId) {
		try {
			List<DisclAttachment> attachments = fileAttachmentDao.fetchDisclAttachmnetByDisclosureId(disclosureId);
			List<FileAttachmentDto> attachmentDto = new ArrayList<>();
			attachments.forEach(attachment -> {
				FileAttachmentDto dto = new FileAttachmentDto();
				attachmentDto.add(mapEntityToDTO(dto, attachment));
			});
			return attachmentDto;
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in getDisclAttachmentsByDisclId, " + e);
		}
	}

	private FileAttachmentDto mapEntityToDTO(FileAttachmentDto dto, DisclAttachment attachment) {
		return FileAttachmentDto.builder().attachmentId(attachment.getAttachmentId()).fileName(attachment.getFileName())
				.mimeType(attachment.getMimeType()).description(attachment.getDescription())
				.attachmentNumber(attachment.getAttachmentNumber()).versionNumber(attachment.getVersionNumber())
				.createTimestamp(attachment.getCreateTimestamp()).createdBy(attachment.getCreatedBy())
				.updateTimestamp(attachment.getUpdateTimestamp()).updatedBy(attachment.getUpdatedBy())
				.attaTypeCode(attachment.getAttaTypeCode())
				.attachmentType(attachment.getDisclAttaType().getDescription())
				.disclosureId(attachment.getDisclosureId())
				.updateUserFullame(personDao.getPersonFullNameByPersonId(attachment.getUpdatedBy())).build();
	}
}
