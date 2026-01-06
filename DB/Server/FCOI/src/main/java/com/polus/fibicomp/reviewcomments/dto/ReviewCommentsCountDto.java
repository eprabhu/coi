package com.polus.fibicomp.reviewcomments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCommentsCountDto {

	String componentTypeCode;
	String subModuleItemNumber;
	String subModuleItemKey;
	long count;
}
