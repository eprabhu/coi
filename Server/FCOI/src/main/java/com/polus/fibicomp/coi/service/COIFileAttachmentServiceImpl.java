package com.polus.fibicomp.coi.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.service.CommonService;
import com.polus.core.filemanagement.FileManagementOutputDto;
import com.polus.core.filemanagement.FileManagementService;
import com.polus.core.filemanagement.FileManagmentConstant;
import com.polus.core.filemanagement.FileManagmentInputDto;
import com.polus.fibicomp.constants.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.dao.COIFileAttachmentDao;
import com.polus.fibicomp.coi.dto.COIFileRequestDto;
import com.polus.fibicomp.coi.exception.COIFileAttachmentException;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.PersonAttachmentDto;
import com.polus.fibicomp.coi.pojo.Attachments;

@Transactional
@Service
public class COIFileAttachmentServiceImpl implements COIFileAttachmentService {

	@Autowired
	FileManagementService fileManagementService;

	@Autowired
	COIFileAttachmentDao coiFileAttachmentDao;

	@Autowired
	private CommonService commonService;

	private static final String COI_MODULE_CODE = "8";
	private static final String PERSON_MODULE_CODE = "6";
	private static final String SUB_MODULE_CODE = "803";

    public COIFileAttachmentServiceImpl(FileManagementService fileManagementService) {
        this.fileManagementService = fileManagementService;
    }

	@Override
	@Transactional(rollbackFor = {COIFileAttachmentException.class, IOException.class})
	public String saveFileAttachment(COIFileRequestDto request) {
		FileManagementOutputDto fileOutput = null;
		try {
			FileManagmentInputDto input = FileManagmentInputDto.builder()
											.file(request.getFile())
											.moduleCode(FileManagmentConstant.COI_MODULE_CODE)
											.moduleNumber(request.getComponentReferenceNumber())
											.updateUser(AuthenticatedUser.getLoginUserName())
											.build();
			fileOutput = fileManagementService.saveFile(input);
			request.setFileDataId(fileOutput.getFileDataId());
			coiFileAttachmentDao.saveReviewAttachmentDetail(request);
		} catch (Exception e) {
			fileManagementService.removeFileOnException(fileOutput.getFilePath(), fileOutput.getFileName());
			throw new COIFileAttachmentException("Exception in saveFileAttachment in COIFileAttachmentService, " + e);
		}
		return "SUCCESS";
	}

	@Override
	@Transactional(rollbackFor = {COIFileAttachmentException.class, IOException.class})
	public Attachments saveAttachment(PersonAttachmentDto request, String personId) {
		FileManagementOutputDto fileOutput = null;
		try {
			FileManagmentInputDto input = FileManagmentInputDto.builder()
											.file(request.getFile())
											.moduleCode(PERSON_MODULE_CODE)
											.subModuleCode(SUB_MODULE_CODE)
											.moduleNumber(personId)
											.updateUser(AuthenticatedUser.getLoginUserName())
											.build();
			fileOutput = fileManagementService.saveFile(input);
			request.setFileDataId(fileOutput.getFileDataId());
			Attachments attachment= coiFileAttachmentDao.saveAttachmentDetails(request, request.getFileDataId());
			return attachment;
		} catch (Exception e) {
			fileManagementService.removeFileOnException(fileOutput.getFilePath(), fileOutput.getFileName());
			throw new COIFileAttachmentException("Exception in saveFileAttachment in COIFileAttachmentService, " + e);
		}
	}

	@Override
	public List<CoiReviewAttachment> getReviewAttachByRefId(Integer refId) {
		List<CoiReviewAttachment> reviewAttachments = coiFileAttachmentDao.getReviewAttachByRefId(refId);
		return reviewAttachments;
	}

	@Override
	public List<CoiReviewAttachment> getReviewAttachByRefIdAndTypeCode(Integer refId, Integer typeCode) {
		List<CoiReviewAttachment> reviewAttachments = coiFileAttachmentDao.getReviewAttachByRefIdAndTypeCode(refId, typeCode);
		return reviewAttachments;
	}

	@Override
	public String updateReviewAttachment(COIFileRequestDto request) {
		try {
			FileManagmentInputDto input = FileManagmentInputDto.builder()
											.file(request.getFile())
											.moduleCode(COI_MODULE_CODE)
											.moduleNumber(request.getComponentReferenceNumber())
											.updateUser(AuthenticatedUser.getLoginUserName())
											.build();
			FileManagementOutputDto fileOutput = fileManagementService.saveFile(input);
			request.setFileDataId(fileOutput.getFileDataId());
			CoiReviewAttachment reviewAttachments = CoiReviewAttachment.builder()
													.attachmentNumber(request.getAttachmentNumber())
													.versionNumber(request.getVersionNumber() + 1)
													.attaStatusCode(request.getAttaStatusCode())
													.attaTypeCode(request.getAttaTypeCode())
													.commentId(request.getCommentId())
													.componentReferenceId(request.getComponentReferenceId())
													.componentReferenceNumber(request.getComponentReferenceNumber())
													.componentTypeCode(request.getComponentTypeCode())
													.fileDataId(request.getFileDataId())
													.fileName(request.getFile().getName())
													.mimeType(request.getFile().getContentType())
													.description(request.getDescription())
													.documentOwnerPersonId(request.getDocumentOwnerPersonId())
													.updateUser(null)
													.updateTimestamp(null)
													.build();
			coiFileAttachmentDao.updateReviewAttachmentDetail(reviewAttachments);
			coiFileAttachmentDao.updateReviewAttachmentStatus("3", request.getAttachmentId());// Archive to be set
		} catch (Exception e) {
			throw new COIFileAttachmentException("Exception in saveFileAttachment in COIFileAttachmentService, " + e);
		}
		return "SUCCESS";
	}

	@Override
	public String deleteReviewAttachment(COIFileRequestDto request) {
		fileManagementService.deleteFile(COI_MODULE_CODE,request.getFileDataId());
		coiFileAttachmentDao.deleteReviewAttachment(request.getAttachmentId());
		return "SUCCESS";
	}

	@Override
	public ResponseEntity<byte[]> downloadReviewAttachment(Integer attachmentId) {
		CoiReviewAttachment reviewAttachments = coiFileAttachmentDao.getReviewAttachByAttachId(attachmentId);
		ResponseEntity<byte[]> attachmentData = null;
		try {
			FileManagementOutputDto fileData = fileManagementService.downloadFile(COI_MODULE_CODE, reviewAttachments.getFileDataId());
			attachmentData = setAttachmentContent(fileData.getOriginalFileName(), fileData.getData());
		} catch (Exception e) {
			throw new COIFileAttachmentException("Exception in downloadReviewAttachment in COIFileAttachmentService, " + e);
		}
		return attachmentData;
	}

	private ResponseEntity<byte[]> setAttachmentContent(String fileName, byte[] data) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.parseMediaType("application/octet-stream"));
		headers.setContentDispositionFormData(fileName, fileName);
		headers.setContentLength(data.length);
		headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
		headers.setPragma("public");
		return new ResponseEntity<>(data, headers, HttpStatus.OK);
	}

	@Override
	public void exportAllReviewAttachments(COIFileRequestDto request, HttpServletResponse response) throws IOException {
		List<Integer> attachmentIds = request.getAttachmentIds();
		Integer disclosureId = request.getComponentReferenceId();
		if (attachmentIds != null && !attachmentIds.isEmpty()) {
			StringBuilder stringBuilder = new StringBuilder();
			stringBuilder.append("Disclosure_#")
					        .append(disclosureId)
					        .append("_attachments");
			String fileName = stringBuilder.toString();
			response.setContentType("application/zip");
			response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName + ".zip" + "\"");
			List<CoiReviewAttachment> attachments = coiFileAttachmentDao.getReviewAttachByAttachIds(attachmentIds);
			ZipOutputStream zos = null;
			ByteArrayOutputStream baos = null;
			try {
				baos = new ByteArrayOutputStream();
				zos = new ZipOutputStream(baos);
				if (attachments != null && !attachments.isEmpty()) {
					Integer index = 0;
					for (CoiReviewAttachment attachment : attachments) {
						FileManagementOutputDto fileData = fileManagementService.downloadFile(COI_MODULE_CODE, attachment.getFileDataId());
						index = commonService.addFilesToZipFolder(index, fileData.getOriginalFileName(), zos);
						zos.write(fileData.getData());
					}
				}
			} catch (Exception e) {
				throw new COIFileAttachmentException("Exception in downloadReviewAttachment in COIFileAttachmentService, " + e);
			} finally {
				zos.closeEntry();
				zos.flush();
				baos.flush();
				zos.close();
				baos.close();
				ServletOutputStream op = response.getOutputStream();
				op.write(baos.toByteArray());
				op.flush();
				op.close();
			}
		}
	}

	@Override
	public String updateReviewAttachmentDetails(COIFileRequestDto request) {
		try {
			CoiReviewAttachment reviewAttachments = coiFileAttachmentDao.getReviewAttachByAttachId(request.getAttachmentId());
			reviewAttachments.setAttachmentNumber(request.getAttachmentNumber());
			reviewAttachments.setVersionNumber(request.getVersionNumber());
			reviewAttachments.setAttaStatusCode(request.getAttaStatusCode());
			reviewAttachments.setAttaTypeCode(request.getAttaTypeCode());
			reviewAttachments.setCommentId(request.getCommentId());
			reviewAttachments.setComponentReferenceId(request.getComponentReferenceId());
			reviewAttachments.setComponentReferenceNumber(request.getComponentReferenceNumber());
			reviewAttachments.setComponentTypeCode(request.getComponentTypeCode());
			reviewAttachments.setFileDataId(request.getFileDataId());
			reviewAttachments.setDescription(request.getDescription());
			reviewAttachments.setDocumentOwnerPersonId(request.getDocumentOwnerPersonId());
			coiFileAttachmentDao.updateReviewAttachmentDetail(reviewAttachments);
		} catch (Exception e) {
			throw new COIFileAttachmentException("Exception in saveFileAttachment in COIFileAttachmentService, " + e);
		}
		return "SUCCESS";
	}

	@Override
	public List<CoiReviewAttachment> getReviewAttachByCommentId(Integer commentId) {
		return coiFileAttachmentDao.getReviewAttachByCommentId(commentId);
	}

	@Override
	public Integer deleteReviewAttachmentById(Integer attachmentId) {
		CoiReviewAttachment attachment = coiFileAttachmentDao.getReviewAttachByAttachId(attachmentId);
		if (attachment == null) {
			throw new ApplicationException("Attachment not fount with id : " + attachmentId, Constants.JAVA_ERROR);
		}
		fileManagementService.deleteFile(COI_MODULE_CODE,attachment.getFileDataId());
		coiFileAttachmentDao.deleteReviewAttachment(attachmentId);
		return attachment.getCommentId();
	}
}
