package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.coi.pojo.CoiProjectCommentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCommentDto {

	private Integer commentId;
	private String commentBy;
	private Integer parentCommentId;
	private String comment;
	private String commentTypeCode;
	private CoiProjectCommentType commentType;
	private Integer moduleCode;
	private Boolean isPrivate;
	private String moduleItemKey;
	private Timestamp updateTimestamp;
	private String updatedBy;
	private String updateUserFullName;
	private List<ProjectCommentDto> childComments;
	private String projectTitle;
	private Boolean replyCommentsCountRequired;
	private Boolean isResolved;
	private String resolvedBy;
	private Timestamp resolvedTimestamp;
	private String resolvedUserFullName;
	private Boolean isParentCommentResolved;

}
