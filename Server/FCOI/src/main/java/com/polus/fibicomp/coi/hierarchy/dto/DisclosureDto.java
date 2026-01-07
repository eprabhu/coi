package com.polus.fibicomp.coi.hierarchy.dto;

import java.sql.Timestamp;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DisclosureDto {

	private Integer disclosureId;
    
	private String disclosureType;
    
	private String disclosureStatus;

	private String dispositionStatus;
    
	private String reviewStatus;
    
	private Timestamp certificationDate;

	private Boolean canOpenDisclosure = Boolean.FALSE;
	
	private Timestamp createTimestamp;
	
	private String personId;
	
	private Integer daysToDueDate;
	
	private Integer disclosureNumber;

	private String isLegacyDisclosure;

	private Integer moduleCode;

	private String messageTypeCode;

	private String userMessage;
	
	private String versionStatus;
	
	private Timestamp expirationDate;
	
	private String reporterName;
	
	private String departmentNumber;
	
	private String departmentName;

}
