package com.polus.kcintegration.proposal.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposalDTO {

	private String proposalNumber;

	private String title;

	private Integer versionNumber;
	
	private String leadUnit;

	private String leadUnitName;

	private String sponsorCode;

	private String sponsorName;

	private String primeSponsorCode;

	private String primeSponsorName;

	private Timestamp startDate;

	private Timestamp endDate;

	private String proposalStatusCode;

	private String proposalStatus;

	private String proposalTypeCode;

	private String proposalType;

	private String ipNumber;

	private String sponsorGrantNumber;

	private Timestamp srcSysUpdateTimestamp;

	private String srcSysUpdateUsername;

	private String documentUrl;

	private String attribute1Label;

	private String attribute1Value;

	private String attribute2Label;

	private String attribute2Value;

	private String attribute3Label;

	private String attribute3Value;

	private String attribute4Label;

	private String attribute4Value;

	private String attribute5Label;

	private String attribute5Value;

	private List<ProposalPersonDTO> proposalPersons;

}
