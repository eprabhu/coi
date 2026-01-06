package com.polus.fibicomp.reviewcomments.dto;

import java.util.List;

import com.polus.fibicomp.coi.dto.ProjectCommentResponseDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCommentsResponseDto {

	private List<DisclComment> comments;
	List<ProjectCommentResponseDto> projectComments;

}
