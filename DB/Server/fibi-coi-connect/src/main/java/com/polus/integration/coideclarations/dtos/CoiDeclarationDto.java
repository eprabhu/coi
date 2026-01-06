package com.polus.integration.coideclarations.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiDeclarationDto {

	private Integer declarationId;
	private String declarationNumber;
	private String personId;
	private String declarationTypeCode;
	private String declarationType;
	private String declarationStatusCode;
	private String declarationStatus;
	private String reviewStatusCode;
	private String reviewStatus;
	private Timestamp submissionDate;
	private Timestamp expirationDate;
	private Integer versionNumber;
	private String versionStatus;
	private String createdBy;
	private Timestamp createTimestamp;
	private String updatedBy;
	private Timestamp updateTimestamp;
	private String declarationQuesAnswer;
}
