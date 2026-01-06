package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.polus.fibicomp.coi.pojo.Attachments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonAttachmentDto {

	private Integer attachmentId;

	private String personId;

	private String attaTypeCode;

	private String fileName;

	private String mimeType;

	private String description;

	private String fileDataId;
	
	private String moduleNumber;

	private MultipartFile file;

	private List<Attachments> attachments;

	private String createdBy;

	private Timestamp createTimestamp;

	private String updatedBy;

	private Timestamp updateTimestamp;

	private Integer attachmentNumber;

	private Integer versionNumber;
	
	private String updateUserFullame;

	private String attachmentType;

}
