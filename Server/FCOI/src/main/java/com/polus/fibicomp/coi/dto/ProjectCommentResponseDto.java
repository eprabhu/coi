package com.polus.fibicomp.coi.dto;

import java.util.List;

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
public class ProjectCommentResponseDto {

	private String projectNumber;
    private String projectTitle;
    private List<ProjectCommentDto> comments;

}
