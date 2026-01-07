package com.polus.fibicomp.cmp.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiCmpReviewDto {

	private Integer cmpReviewId;
	private Integer cmpId;
	private String assigneePersonId;
	private String assigneePersonName;
	private String reviewStatusTypeCode;
	private String locationTypeCode;
	private String description;
	private Date startDate;
	private Date endDate;
	private String updateUserFullName;

}
