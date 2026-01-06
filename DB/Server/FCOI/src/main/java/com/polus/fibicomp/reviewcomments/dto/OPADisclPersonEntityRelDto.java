package com.polus.fibicomp.reviewcomments.dto;

import java.util.Date;

import lombok.Data;

@Data
public class OPADisclPersonEntityRelDto {

	private Integer opaPersonEntityRelId;
	private Integer disclosureId;
	private Integer personEntityId;
	private Integer personEntityNumber;
	private String personId;
	private Integer entityId;
	private Date involvementStartDate;
	private Date involvementEndDate;
	private String entityName;
	private String isCompensated;
	private String relationships;
	private String involvementOfStudents;
	private String involvementOfStaff;
	private String useOfMitResources;
	private String sabbaticalType;
	private String includeInOpaDisclosure;
	private String updateUser;
	private Date updateTimestamp;
	private String isFallSabatical;
	private String isSpringSabatical;

}
