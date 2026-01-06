package com.polus.fibicomp.reviewcomments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ModuleSectionDetailsDto {

    private String sectionId;
    private String sectionName;
    private String subsectionId;
    private String subsectionName;
    private Map<String, String> otherDetails;
}
