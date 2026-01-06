package com.polus.fibicomp.coi.dto;


import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.polus.core.pojo.Country;
import com.polus.fibicomp.coi.pojo.PerEntDisclTypeSelection;
import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;
import com.polus.fibicomp.globalentity.pojo.EntityOwnershipType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PersonEntityDto {

	private Integer personEntityId;
	private Integer personEntityNumber;
	private String personId;
	private Integer entityId;
	private Integer entityNumber;
	private Boolean isFormCompleted;
	private Integer versionNumber;
	private String versionStatus;
	private Boolean sponsorsResearch;
	private Date involvementStartDate;
	private Date involvementEndDate;
	private String studentInvolvement;
	private String staffInvolvement;
	private String instituteResourceInvolvement;
	private Timestamp updateTimestamp;
	private String updateUser;
	private String createUser;
	private Timestamp createTimestamp;
	private String personFullName;
	private String revisionReason;
	private String updateUserFullName;
	private List<PersonEntityRelationship> personEntityRelationships;
	private Country country;
	private EntityOwnershipType entityOwnershipType;
	private String actionTypeCode;
	private String entityName;
	private String relationshipName;
	private List<PerEntDisclTypeSelection> perEntDisclTypeSelection;
	private Boolean isCompensated;
	private String message;
	private String engagementFlow;
	private BigDecimal compensationAmount;
	private Boolean isCommitment;

}
