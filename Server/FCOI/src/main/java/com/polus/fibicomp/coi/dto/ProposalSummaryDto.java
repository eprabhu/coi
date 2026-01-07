package com.polus.fibicomp.coi.dto;

import java.util.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProposalSummaryDto {

	private String proposalNumber;
    private String title;
    private String leadUnit;
    private String leadUnitName;
    private String sponsorCode;
    private String sponsor;
    private String primeSponsorCode;
    private String primeSponsor;
    private String proposalStatus;
    private Date proposalStartDate;
    private Date proposalEndDate;

}
