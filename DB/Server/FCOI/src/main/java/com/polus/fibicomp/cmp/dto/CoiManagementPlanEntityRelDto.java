package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;

import com.polus.fibicomp.globalentity.dto.EntityResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiManagementPlanEntityRelDto {

	private Integer cmpId;
	private Integer entityNumber;
	private Integer personEntityNumber;
    private EntityResponseDTO entity;
    private String createdBy;
    private Timestamp createTimestamp;

}
