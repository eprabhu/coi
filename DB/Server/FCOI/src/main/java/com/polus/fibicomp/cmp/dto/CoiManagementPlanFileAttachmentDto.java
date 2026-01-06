package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanFileAttachmentDto {

	private Integer attachmentId;
	private Integer cmpId;
	private String attaTypeCode;
	private String fileName;
	private String mimeType;
	private String description;
	private String fileDataId;
	private String moduleNumber;
	private MultipartFile file;
	private List<CoiManagementPlanAttachment> attachments;
	private String createdBy;
	private Timestamp createTimestamp;
	private String updatedBy;
	private Timestamp updateTimestamp;
	private Integer attachmentNumber;
	private Integer versionNumber;
	private String updateUserFullame;
	private String attachmentType;
	private Boolean isCmpDocumentUpload;
	private Boolean isCmpDocumentReplace;

}