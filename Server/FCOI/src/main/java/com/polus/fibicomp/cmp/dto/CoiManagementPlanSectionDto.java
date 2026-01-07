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
public class CoiManagementPlanSectionDto {

    private Integer sectionId;
    private String sectionName;
    private String description;
    private String updatedBy;
    private Timestamp updatedTimestamp;

}
