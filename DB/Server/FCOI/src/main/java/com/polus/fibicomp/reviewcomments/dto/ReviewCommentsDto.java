package com.polus.fibicomp.reviewcomments.dto;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.reviewcomments.pojos.CoiReviewCommentTag;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import com.polus.fibicomp.reviewcomments.pojos.DisclCommentType;
import com.polus.fibicomp.reviewcomments.pojos.DisclComponentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCommentsDto {

	private Integer commentId;
	private String documentOwnerPersonId;
	private String commentPersonId;
	private String commentTypeCode;
	private DisclCommentType commentType;
	private String componentTypeCode;
	private DisclComponentType componentType;
	private Integer parentCommentId;
	private List<DisclComment> childComments;
	private List<CoiReviewCommentTag> commentTags;
	private Boolean isPrivate;
	private String comment;
	private Integer moduleItemKey;
	private String moduleItemNumber;
	private String subModuleItemKey;
	private String subModuleItemNumber;
	private Integer moduleCode;
	private Integer subModuleCode;
	private Integer formBuilderId;
	private Integer formBuilderSectionId;
	private Integer formBuilderComponentId;
	private String updateUser;
	private Timestamp updateTimestamp;
	private String updateUserFullName;
	private List<CoiReviewAttachment> attachments;
	private Boolean isSectionDetailsNeeded;
	private Boolean replyCommentsCountRequired;
	private Boolean requirePersonPrivateComments;
	private List<Map<String, Object>> projects;

}
