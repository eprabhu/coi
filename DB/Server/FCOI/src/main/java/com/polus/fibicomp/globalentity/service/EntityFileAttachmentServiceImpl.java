package com.polus.fibicomp.globalentity.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

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
import com.polus.fibicomp.globalentity.dao.EntityFileAttachmentDao;
import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityFileRequestDto;
import com.polus.fibicomp.globalentity.exception.EntityFileAttachmentException;
import com.polus.fibicomp.globalentity.pojo.EntityAttachment;
import com.polus.fibicomp.globalentity.pojo.EntityAttachmentType;
import com.polus.fibicomp.globalentity.pojo.EntitySection;
import com.polus.fibicomp.globalentity.pojo.EntitySectionAttachRef;
import com.polus.fibicomp.globalentity.pojo.ValidEntityAttachType;
import com.polus.fibicomp.globalentity.repository.EntitySectionRepository;
import com.polus.fibicomp.globalentity.repository.ValidEntityAttachTypesRepository;

@Transactional
@Service
public class EntityFileAttachmentServiceImpl implements EntityFileAttachmentService {

	private static final String ATTACHMENT = "Attachment";

	@Autowired
	FileManagementService fileManagementService;

	@Autowired
	EntityFileAttachmentDao entityFileAttachmentDao;

	@Autowired
	private CommonService commonService;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private ValidEntityAttachTypesRepository validEntityAttachTypesRepository;

	@Autowired
	private PersonDao personDao;

	@Autowired
	private EntitySectionRepository entitySectionRepository;

	private static final String ENTITY_MODULE_CODE = "26";

    public EntityFileAttachmentServiceImpl(FileManagementService fileManagementService) {
        this.fileManagementService = fileManagementService;
    }

	@Override
	@Transactional(rollbackFor = {EntityFileAttachmentException.class, IOException.class})
	public EntityFileRequestDto saveFileAttachment(MultipartFile[] files, String formDataJSON) {
		final FileManagementOutputDto[] fileOutputHolder = new FileManagementOutputDto[1];
		ObjectMapper mapper = new ObjectMapper();
		try {
			EntityFileRequestDto request = mapper.readValue(formDataJSON, EntityFileRequestDto.class);
			AtomicInteger index = new AtomicInteger(0);
			request.getNewAttachments().forEach(attach -> {
				int count = index.getAndIncrement();
				FileManagmentInputDto input = FileManagmentInputDto.builder().file(files[count])
						.moduleCode(ENTITY_MODULE_CODE).moduleNumber(String.valueOf(request.getEntityId()))
						.updateUser(AuthenticatedUser.getLoginPersonId())
						.build();
				try {
					fileOutputHolder[0] = fileManagementService.saveFile(input);
				} catch (FileStorageException | IOException e) {
					throw new EntityFileAttachmentException(
							"Exception in saveFileAttachment in EntityFileAttachmentService, " + e);
				}
				attach.setFileDataId(fileOutputHolder[0].getFileDataId());
				attach.setEntityId(request.getEntityId());
				Integer attachId = entityFileAttachmentDao.saveEntityAttachmentDetail(attach);
				entityFileAttachmentDao.saveEntitySecAttachRef(
						EntitySectionAttachRef.builder().entityId(request.getEntityId())
								.sectionCode(request.getSectionCode()).entityAttachmentId(attachId).build());
			});
			return request;
		} catch (Exception e) {
			fileManagementService.removeFileOnException(fileOutputHolder[0].getFilePath(),
					fileOutputHolder[0].getFileName());
			throw new EntityFileAttachmentException(
					"Exception in saveFileAttachment in EntityFileAttachmentService, " + e);
		}
	}

	@Override
	public ResponseEntity<String> deleteEntityAttachment(EntityFileRequestDto request) {
		List<EntityAttachment> attachments = getAttachByAttachNumber(request.getAttachmentNumber());
		attachments.stream().forEach(attach -> {
			fileManagementService.deleteFile(ENTITY_MODULE_CODE,attach.getFileDataId());
			entityFileAttachmentDao.deleteEntitySecAttachRef(attach.getEntityAttachmentId());
			entityFileAttachmentDao.deleteEntityAttachment(attach.getEntityAttachmentId());
		});
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Attachment deleted successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<byte[]> downloadEntityAttachment(Integer attachmentId) {
		EntityAttachment attachment = entityFileAttachmentDao.getEntityAttachByAttachId(attachmentId);
		ResponseEntity<byte[]> attachmentData = null;
		try {
			FileManagementOutputDto fileData = fileManagementService.downloadFile(ENTITY_MODULE_CODE, attachment.getFileDataId());
			attachmentData = commonService.setAttachmentContent(fileData.getOriginalFileName(), fileData.getData());
		} catch (Exception e) {
			throw new EntityFileAttachmentException("Exception in downloadEntityAttachment in EntityFileAttachmentService, " + e);
		}
		return attachmentData;
	}

	@Override
	public void exportAllEntityAttachments(EntityFileRequestDto request, HttpServletResponse response) throws IOException {
		List<Integer> attachmentIds = request.getAttachmentIds();
		Integer entityId = request.getEntityId();
		if (attachmentIds != null && !attachmentIds.isEmpty()) {
			StringBuilder stringBuilder = new StringBuilder();
			stringBuilder.append("Entity_#")
					        .append(entityId)
					        .append("_attachments");
			String fileName = stringBuilder.toString();
			response.setContentType("application/zip");
			response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName + ".zip" + "\"");
			List<EntityAttachment> attachments = entityFileAttachmentDao.getEntityAttachByAttachIds(attachmentIds);
			ZipOutputStream zos = null;
			ByteArrayOutputStream baos = null;
			try {
				baos = new ByteArrayOutputStream();
				zos = new ZipOutputStream(baos);
				if (attachments != null && !attachments.isEmpty()) {
					Integer index = 0;
					for (EntityAttachment attachment : attachments) {
						FileManagementOutputDto fileData = fileManagementService.downloadFile(ENTITY_MODULE_CODE, attachment.getFileDataId());
						index = commonService.addFilesToZipFolder(index, fileData.getOriginalFileName(), zos);
						zos.write(fileData.getData());
					}
				}
			} catch (Exception e) {
				throw new EntityFileAttachmentException("Exception in exportAllEntityAttachments in EntityFileAttachmentService, " + e);
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
	public ResponseEntity<String> updateEntityAttachmentDetails(EntityFileRequestDto request) {
		try {
			entityFileAttachmentDao.updateEntityAttachmentDetail(request.getAttachmentId(), request.getDescription());
		} catch (Exception e) {
			throw new EntityFileAttachmentException("Exception in updateEntityAttachmentDetails in EntityFileAttachmentService, " + e);
		}
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Attachment updated successfully"), HttpStatus.OK);
	}

	@Override
	public Map<String, List<EntityAttachmentResponseDTO>> getAttachmentsByEntityId(Integer entityId) {
		List<EntitySection> sections = entitySectionRepository.fetchAllEntitySections();
		Map<String, List<EntityAttachmentResponseDTO>> sectionAttachmentsDTO = sections.stream()
				.filter(section -> section.getDescription().contains(ATTACHMENT))
				.collect(Collectors.toMap(
						section -> section.getDescription().split(" - ")[0], 
						section -> {
					List<EntityAttachment> attachments = entityFileAttachmentDao.getAttachmentsBySectionCode(section.getEntitySectionCode(), entityId);
					List<EntityAttachmentResponseDTO> attachmentDTOs = new ArrayList<>();
					attachments.forEach(attachment -> {
						EntityAttachmentResponseDTO dto = new EntityAttachmentResponseDTO();
						attachmentDTOs.add(mapEntityToDTO(dto, attachment));
					});
					return attachmentDTOs;
				}));
		return sectionAttachmentsDTO;
	}

	private EntityAttachmentResponseDTO mapEntityToDTO(EntityAttachmentResponseDTO dto, EntityAttachment attachment) {
		return EntityAttachmentResponseDTO.builder().entityAttachmentId(attachment.getEntityAttachmentId())
				.attachmentNumber(attachment.getAttachmentNumber()).versionNumber(attachment.getVersionNumber())
				.entityId(attachment.getEntityId()).comment(attachment.getComment())
				.attachmentTypeCode(attachment.getAttachmentTypeCode())
				.attachmentType(attachment.getAttachmentType().getDescription()).fileName(attachment.getFileName())
				.updateTimestamp(attachment.getUpdateTimestamp())
				.updateUserFullname(personDao.getPersonFullNameByPersonId(attachment.getUpdatedBy())).build();
	}

	@Override
	public List<EntityAttachmentResponseDTO> getAttachmentsBySectionCode(String sectionCode, Integer entityId) {
		List<EntityAttachment> attachments = entityFileAttachmentDao.getAttachmentsBySectionCode(sectionCode, entityId);
		List<EntityAttachmentResponseDTO> attachmentDTOs = new ArrayList<>();
		attachments.forEach(attachment -> {
			EntityAttachmentResponseDTO dto = new EntityAttachmentResponseDTO();
			attachmentDTOs.add(mapEntityToDTO(dto, attachment));
        });
		return attachmentDTOs;
	}

	@Override
	public ResponseEntity<List<EntityAttachmentType>> fetchAttachmentTypes(String sectionCode) {
		List<EntityAttachmentType> validEntityAttachTypes = validEntityAttachTypesRepository.fetchBySectionCode(sectionCode).stream()
	            .map(ValidEntityAttachType::getEntityAttachmentType)
	            .collect(Collectors.toList());
		return new ResponseEntity<>(validEntityAttachTypes, HttpStatus.OK);
	}

	@Override
	public List<EntityAttachment> getAttachByAttachNumber(Integer attachNumber) {
		List<EntityAttachment> attachmentsList = entityFileAttachmentDao.getAttachByAttachNumber(attachNumber);
		return attachmentsList;
	}

}
