package com.polus.fibicomp.coi.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class COIFileRequestDto {

	private Integer attachmentId;

	private List<Integer> attachmentIds;

	private Integer commentId;

	private String componentTypeCode;

	private Integer componentReferenceId;

	private String componentReferenceNumber;

	private Integer attachmentNumber;	

	private Integer versionNumber;

	private String attaTypeCode;

	private String attaStatusCode;

	private String documentOwnerPersonId;	

	private MultipartFile file;

	private String description;

	private String fileDataId;

}
