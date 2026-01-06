package com.polus.fibicomp.coi.dto;

import java.util.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AwardSummaryDto {

	private String projectNumber;
    private String title;
    private String leadUnitNumber;
    private String leadUnitName;
    private String sponsorCode;
    private String sponsorName;
    private String primeSponsorCode;
    private String primeSponsorName;
    private String projectStatus;
    private Date projectStartDate;
    private Date projectEndDate;
    private String accountNumber;

}
