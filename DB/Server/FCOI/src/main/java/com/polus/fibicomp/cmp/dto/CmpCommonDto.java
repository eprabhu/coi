package com.polus.fibicomp.cmp.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CmpCommonDto {
    private Integer cmpId;
    private Integer cmpNumber;
    private String updateUserFullName;
    private String comment;
    private String sectionName;
}
