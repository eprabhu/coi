package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiManagementPlanSectionCompDto {
	
	private Integer secCompId;
	private Integer cmpSectionRelId;
	private String description;
	private Integer sortOrder;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private String createdBy;
    private Timestamp createTimestamp;

}
