package com.polus.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposalRequest {

    private String homeUnit;

    private String coiProjectTypeCode;

    private Integer moduleItemKey;

    private String personId;
}
