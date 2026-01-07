package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class CoiTravelDisclosureCertifyDto {

	private String certifiedBy;
	private Timestamp certifiedAt;
	private Timestamp updateTimestamp;
	private Timestamp expirationDate;

}
