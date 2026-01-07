package com.polus.fibicomp.coi.dto;

import java.util.List;

import com.polus.fibicomp.cmp.dto.CoiCmpDashboardDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardResponse;
import com.polus.fibicomp.opa.dto.OPADashboardDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisclosureHistoryResponse {

    private List<DisclosureHistoryDto> disclosureHistoryDtos;
    private List<OPADashboardDto> opaDashboardDtos;
    private List<DeclDashboardResponse> declDashboardResponses;
    private List<CoiCmpDashboardDto> cmpHistoryDashboardResponse;

}