package com.polus.fibicomp.cmp.dto;

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
public class CoiManagementPlanSectionRelDto {

	private Integer cmpId;
	private Integer cmpSectionRelId;
	private String sectionName;
    private String description;
    private Integer sortOrder;
    private Timestamp updateTimestamp;
    private String updatedBy;
    private List<CoiManagementPlanSectionCompDto> components;
    private String createdBy;
    private Timestamp createTimestamp;

}
