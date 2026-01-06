package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;


import com.polus.core.pojo.Unit;
import lombok.Data;

@Data
public class ConsultDisclDashboardDto {

	private Integer disclosureId;
	private String unitNumber;
	private String unitName;
	private Unit unitDetails;
	private String reviewStatusCode;
	private String reviewStatusDescription;
	private String dispositionStatusCode;
	private String dispositionStatusDescription;
	private String entityName;
	private String fullName;
	private Timestamp certifiedAt;
	private String certifiedBy;
	private Timestamp updateTimeStamp;
	private String updateUserFullName;
	private String adminGroupName;
	private String administrator;
	private String personId;
	private Integer entityId;

}
