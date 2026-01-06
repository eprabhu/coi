package com.polus.fibicomp.coi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class COIFileResponseDto {

	private Integer attachmentId;

	private Integer commentId;

	private String componentTypeCode;

	private Integer componentReferenceId;

	private String componentReferenceNumber;

	private Integer attachmentNumber;

	private Integer versionNumber;

	private String attaTypeCode;

	private String attaStatusCode;

	private String documentOwnerPersonId;

	private String description;

	private String fileDataId;

}
