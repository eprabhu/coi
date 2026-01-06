package com.polus.fibicomp.opa.dto;

import com.polus.fibicomp.reviewcomments.pojos.CoiReviewCommentTag;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.reviewcomments.pojos.DisclCommentType;
import com.polus.fibicomp.reviewcomments.pojos.DisclComponentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OPADisclCommentDto {
	

	private Integer commentId;
	private String componentTypeCode;
	private DisclComponentType disclComponentType;
	private Integer componentReferenceId;
	private String componentReferenceNumber;
	private Integer componentSubReferenceId;
	private String commentType;
	private DisclCommentType disclCommentType;
	private String commentPersonId;
	private String documentOwnerPersonId;
	private Boolean isPrivate;
	private String comment;
	private Integer parentCommentId;
	private String updateUser;
	private Timestamp updateTimestamp;
	private String updateUserFullName;
	private List<CoiReviewCommentTag> opaReviewCommentTag;
	private List<CoiReviewAttachment> coiReviewAttachments;
	private List<OPADisclCommentDto> reply;

}
