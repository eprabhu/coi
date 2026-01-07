package com.polus.integration.proposal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisclosureResponse {

	private String disclosureStatus;
	private Integer disclosureId;
	private Boolean disclosureSubmitted;
	private String expirationDate;
	private String message;
	private String error;

}
