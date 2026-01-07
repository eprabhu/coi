package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSection;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanTemplate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoiManagementPlanSecTmplMappingDto {

	private Integer tmplSecMappingId;
	private Integer sectionId;
	private CoiManagementPlanSection coiManagementPlanSection;
	private Integer templateId;
	private CoiManagementPlanTemplate coiManagementPlanTemplate;
	private Integer sortOrder;
	private String updatedBy;
	private Timestamp updateTimestamp;

}
