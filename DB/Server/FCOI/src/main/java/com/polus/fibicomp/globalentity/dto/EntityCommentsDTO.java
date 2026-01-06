package com.polus.fibicomp.globalentity.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityCommentsDTO {

	private Integer parentCommentId;
	private String comment;
	private String isPrivate;
	private String commentTypeCode;
	private Integer entityId;
	private Integer entityNumber;
	private Integer entityCommentId;
	private String sectionCode;
	private String updatedBy;
	private String updatedByFullName;
	private Timestamp updateTimestamp;
	private List<EntityCommentsDTO> childComments;
	private Boolean isResolved;
	private String resolvedBy;
	private Timestamp resolvedTimestamp;
	private String resolvedUserFullName;
	private Boolean isParentCommentResolved;

}
