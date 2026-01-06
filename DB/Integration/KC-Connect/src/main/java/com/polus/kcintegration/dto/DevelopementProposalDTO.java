package com.polus.kcintegration.dto;

import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevelopementProposalDTO {

	private Integer proposalNumber;

	private String title;

	private String leadUnitNumber;

	private String leadUnitName;

	private String sponsorCode;

	private String sponsorName;

	private String primeSponsorCode;

	private String primeSponsorName;

	private Timestamp startDate;

	private Timestamp endDate;

	private Integer statusCode;

	private String status;

}
