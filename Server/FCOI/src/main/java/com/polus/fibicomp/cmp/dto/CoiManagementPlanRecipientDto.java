package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiManagementPlanRecipientDto {

    private Integer cmpRecipientId;
    private Integer cmpId;
    private Integer signOrder;
    private String signatureBlock;
    private String personId; 
    private String fullName;
    private String designation;
    private String attestationStatement;
    private String updatedBy;
    private Timestamp updateTimestamp;
}
