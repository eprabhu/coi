package com.polus.fibicomp.globalentity.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.globalentity.dto.EntityAttachmentResponseDTO;
import com.polus.fibicomp.globalentity.dto.EntityFileRequestDto;
import com.polus.fibicomp.globalentity.pojo.EntityAttachment;
import com.polus.fibicomp.globalentity.pojo.EntityAttachmentType;

public interface EntityFileAttachmentService {

	EntityFileRequestDto saveFileAttachment(MultipartFile[] files, String formDataJSON);

	ResponseEntity<String> deleteEntityAttachment(EntityFileRequestDto request);

	ResponseEntity<byte[]> downloadEntityAttachment(Integer attachmentId);

	void exportAllEntityAttachments(EntityFileRequestDto request, HttpServletResponse response) throws IOException;

	ResponseEntity<String> updateEntityAttachmentDetails(EntityFileRequestDto request);

	List<EntityAttachmentResponseDTO> getAttachmentsBySectionCode(String sectionCode, Integer entityId);

	Map<String, List<EntityAttachmentResponseDTO>> getAttachmentsByEntityId(Integer entityId);

	ResponseEntity<List<EntityAttachmentType>> fetchAttachmentTypes(String sectionCode);

	List<EntityAttachment> getAttachByAttachNumber(Integer attachNumber);

}
