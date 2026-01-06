package com.polus.fibicomp.compliance.declaration.dto;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationReviewStatusType;
import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class DeclarationCommonDto {

	private Integer declarationId;
	private String declarationNumber;
	private String adminGroupName;
	private String adminPersonName;
	private String previousAdminPersonName;
	private Integer adminGroupId;
	private String adminPersonId;
	private CoiDeclarationReviewStatusType declarationReviewStatusType;
	private String updateUserFullName;
	private Timestamp updateTimestamp;
	private String comment;
	private String personId;
}
