package com.polus.fibicomp.compliance.declaration.dto;

import lombok.Data;

@Data
public class DeclarationRequestDto {

	private String personId;
	private String declarationTypeCode;
	private Integer declarationId;
	private String declarationNumber;
	private String adminPersonId;
	private Integer adminGroupId;
	private String actionType;
	private Boolean isApproval;
	private String comment;
}
