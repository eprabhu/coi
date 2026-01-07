package com.polus.fibicomp.cmp.service;

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
import com.polus.fibicomp.cmp.dao.CoiManagementPlanDao;
import com.polus.fibicomp.cmp.dao.CoiManagementPlanFileAttachmentDao;
import com.polus.fibicomp.cmp.dto.CmpCommonDto;
import com.polus.fibicomp.cmp.dto.CoiManagementPlanFileAttachmentDto;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttachment;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.exception.FileAttachmentException;

@Service
public class CoiManagementPlanFileAttachmentServiceImpl implements CoiManagementPlanFileAttachmentService {

	@Autowired
	FileManagementService fileManagementService;

	@Autowired
	CoiManagementPlanFileAttachmentDao fileAttachmentDao;

	@Autowired
	PersonDao personDao;

	@Autowired
	CommonDao commonDao;

	@Autowired
	CommonService commonService;

	@Autowired
	ActionLogService actionLogService;

	@Autowired
	CoiManagementPlanDao cmpDao;

	@Override
	@Transactional
	public ResponseEntity<Object> saveOrReplaceCmpAttachments(MultipartFile[] files, String formDataJson) {
		final FileManagementOutputDto[] fileOutputHolder = new FileManagementOutputDto[1];
		List<CoiManagementPlanFileAttachmentDto> attachments = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		try {
			CoiManagementPlanFileAttachmentDto request = mapper.readValue(formDataJson,
					CoiManagementPlanFileAttachmentDto.class);
			Boolean isUpload = Boolean.TRUE.equals(request.getIsCmpDocumentUpload());
			Boolean isReplace = Boolean.TRUE.equals(request.getIsCmpDocumentReplace());
			AtomicInteger index = new AtomicInteger(0);
			request.getAttachments().forEach(attach -> {
				int count = index.getAndIncrement();
				FileManagmentInputDto input = FileManagmentInputDto.builder().file(files[count])
						.moduleCode(String.valueOf(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE))
						.subModuleCode(String.valueOf(Constants.COI_SUBMODULE_CODE))
						.moduleNumber(String.valueOf(request.getCmpId()))
						.updateUser(AuthenticatedUser.getLoginUserName()).build();
				try {
					fileOutputHolder[0] = fileManagementService.saveFile(input);
				} catch (FileStorageException | IOException e) {
					throw new FileAttachmentException("Exception in saveFileAttachment , " + e);
				}
				attach.setFileDataId(fileOutputHolder[0].getFileDataId());
				attach.setCmpId(request.getCmpId());
				CoiManagementPlanAttachment attachment = fileAttachmentDao.saveCmpAttachmentDetail(attach);
				attachment.setCmpAttaType(fileAttachmentDao.getCmpAttachmentTypeForTypeCode(attach.getAttaTypeCode()));
				CoiManagementPlanFileAttachmentDto dto = new CoiManagementPlanFileAttachmentDto();
				attachments.add(mapEntityToDTO(dto, attachment));
			});
			String actionCode = resolveUploadActionCode(isUpload, isReplace);
			if (actionCode != null) {
				logCmpDocumentUploadAction(request.getCmpId(), actionCode);
			}

			return new ResponseEntity<>(attachments, HttpStatus.OK);
		} catch (Exception e) {
			fileManagementService.removeFileOnException(fileOutputHolder[0].getFilePath(),
					fileOutputHolder[0].getFileName());
			throw new FileAttachmentException("Exception in saveOrReplaceCmpAttachments , " + e);
		}
	}

	private String resolveUploadActionCode(Boolean isUpload, Boolean isReplace) {
		if (Boolean.TRUE.equals(isReplace)) {
			return Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_DOCUMET_REPLACE;
		}
		if (Boolean.TRUE.equals(isUpload)) {
			return Constants.COI_MANAGEMENT_PLAN_ACTION_LOG_DOCUMET_UPLOAD;
		}
		return null;
	}

	private void logCmpDocumentUploadAction(Integer cmpId, String actionCode) {
		CoiManagementPlan cmp = cmpDao.getCmpById(cmpId);
		if (cmp == null)
			return;
		CmpCommonDto logDto = CmpCommonDto.builder().cmpId(cmpId).cmpNumber(cmp.getCmpNumber())
				.updateUserFullName(AuthenticatedUser.getLoginUserFullName()).build();
		actionLogService.saveCMPActionLog(actionCode, logDto);
	}

	@Override
	public ResponseEntity<String> updateCmpAttachmentDetails(CoiManagementPlanFileAttachmentDto fileAttachmentDto) {
		try {
			fileAttachmentDao.updateCmpAttachmentDetail(fileAttachmentDto.getAttachmentId(),
					fileAttachmentDto.getDescription());
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in updateCmpAttachmentDetails, " + e);
		}
		return new ResponseEntity<>("Attachment updated successfully", HttpStatus.OK);
	}

	@Override
	public ResponseEntity<byte[]> downloadCmpAttachment(Integer attachmentId) {
		CoiManagementPlanAttachment attachment = fileAttachmentDao.fetchCmpAttachmentByAttachmentId(attachmentId);
		ResponseEntity<byte[]> attachmentData = null;
		try {
			FileManagementOutputDto fileData = fileManagementService.downloadFile(
					String.valueOf(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE), attachment.getFileDataId(),
					String.valueOf(Constants.COI_SUBMODULE_CODE));
			attachmentData = commonService.setAttachmentContent(fileData.getOriginalFileName(), fileData.getData());
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in downloadCmpAttachment: ", e);
		}
		return attachmentData;
	}

	@Override
	public ResponseEntity<String> deleteCmpAttachment(Integer attachmentNumber) {
		try {
			List<CoiManagementPlanAttachment> attachments = fileAttachmentDao
					.fetchCmpAttachmentByAttachmentNumber(attachmentNumber);
			attachments.stream().forEach(attach -> {
				fileManagementService.deleteFile(String.valueOf(Constants.COI_MODULE_CODE), attach.getFileDataId(),
						String.valueOf(Constants.COI_SUBMODULE_CODE));
				fileAttachmentDao.deleteCmpAttachment(attach.getAttachmentId());
			});
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in deleteCmpAttachment, " + e);
		}
		return new ResponseEntity<>("Attachment deleted successfully", HttpStatus.OK);
	}

	@Override
	public List<CoiManagementPlanFileAttachmentDto> getCmpAttachmentsByCmpId(Integer cmpId) {
		try {
			List<CoiManagementPlanAttachment> attachments = fileAttachmentDao.fetchCmpAttachmnetBycmpId(cmpId);
			List<CoiManagementPlanFileAttachmentDto> attachmentDto = new ArrayList<>();
			attachments.forEach(attachment -> {
				CoiManagementPlanFileAttachmentDto dto = new CoiManagementPlanFileAttachmentDto();
				attachmentDto.add(mapEntityToDTO(dto, attachment));
			});
			return attachmentDto;
		} catch (Exception e) {
			throw new FileAttachmentException("Exception in getCmpAttachmentsByCmpId, " + e);
		}
	}

	private CoiManagementPlanFileAttachmentDto mapEntityToDTO(CoiManagementPlanFileAttachmentDto dto,
			CoiManagementPlanAttachment attachment) {
		return CoiManagementPlanFileAttachmentDto.builder().attachmentId(attachment.getAttachmentId())
				.fileName(attachment.getFileName()).mimeType(attachment.getMimeType())
				.description(attachment.getDescription()).attachmentNumber(attachment.getAttachmentNumber())
				.versionNumber(attachment.getVersionNumber()).createTimestamp(attachment.getCreateTimestamp())
				.createdBy(attachment.getCreatedBy()).updateTimestamp(attachment.getUpdateTimestamp())
				.updatedBy(attachment.getUpdatedBy()).attaTypeCode(attachment.getAttaTypeCode())
				.attachmentType(attachment.getCmpAttaType().getDescription()).cmpId(attachment.getCmpId())
				.updateUserFullame(personDao.getPersonFullNameByPersonId(attachment.getUpdatedBy())).build();
	}

}
