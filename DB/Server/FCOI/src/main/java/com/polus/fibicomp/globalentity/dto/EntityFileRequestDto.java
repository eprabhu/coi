package com.polus.fibicomp.globalentity.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.globalentity.pojo.EntityAttachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityFileRequestDto {

	private Integer attachmentId;

	private List<Integer> attachmentIds;

	private Integer attachmentNumber;	

	private Integer versionNumber;

	private Integer versionStatus;

	private String attachmentTypeCode;

	private String attachmentStatusCode;

	private MultipartFile file;

	private String fileName;

	private String description;

	private String fileDataId;

	private List<String> fileDataIds;

	private String mimeType;

	private Integer entityId;

	private String subModuleCode;

	private String sectionCode;

	private List<EntityAttachment> newAttachments;

}
