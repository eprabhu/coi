package com.polus.fibicomp.globalentity.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class EntityDashboardResponse {

	private Integer entityId;
	private Integer entityNumber;
	private String entityName;
	private String ownershipType;
	private String primaryAddress;
	private String country;
	private String city;
	private String state;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private String websiteAddress;
	private String certifiedEmail;
	private String entityStatus;
	private String entityVerificationStatus;
	private String entityStatusTypeCode;
	private String documentStatusTypeCode;
	private String ownershipTypeCode;
	private String organizationId;
	private String sponsorCode;
	private String priorName;
	private String foreignName;
	private Boolean modificationIsInProgress;
	private String entitySourceTypeCode;
	private String entitySourceType;
	private String familyTreeRoleTypes;
	private String entityBusinessType;
	private Boolean isDunsMatched;
	private String postCode;
	private Boolean isForeign;
	private Boolean dunsRefVersionIsInProgress;
    private Boolean hasPersonEntityLinked;
    private Timestamp createTimestamp;
    private String createUserFullName;

}
