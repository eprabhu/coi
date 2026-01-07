package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.coi.pojo.CoiReviewLocationType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiReviewerStatusType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisclosureActionLogDto {

	private String actionTypeCode;
	private Integer disclosureId;
	private Integer disclosureNumber;
	private String revisionComment;
	private String oldAdmin;
	private String newAdmin;
	private String reviewername;
	private String comment;
	private String fcoiTypeCode;
	private String message;
	private String riskCategoryCode;
	private String riskCategory;
	private String newRiskCategoryCode;
	private String newRiskCategory;
	private String conflictStatus;
	private String newConflictStatus;
	private List<String> actionTypeCodes;
	private String administratorName;
	private String oldReviewer;
	private String newReviewer;
	private String reporter;
	private String coiAdmin;
	private CoiReviewLocationType reviewLocationType;
	private CoiReviewerStatusType reviewerStatusType;
	private String fcoiTypeDescription;
	private Timestamp oldDate;
	private Timestamp newDate;

}
