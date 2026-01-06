package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiEntityRequestDTO {

	private Integer entityId;
	private Integer entityNumber;
	private String entityName;
	private String phoneNumber;
	private String entityOwnershipTypeCode;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String city;
	private String state;
	private String postCode;
	private String countryCode;
	private String certifiedEmail;
	private String websiteAddress;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private String humanSubAssurance;
	private String anumalWelfareAssurance;
	private String animalAccreditation;
	private String approvedBy;
	private String entityStatusTypeCode;
	private String documentStatusTypeCode;
	private Timestamp approvedTimestamp;
	private Boolean isDunsMatched;
	private Integer originalEntityId;
	private String updatedBy;
	private Map<CoiEntityRequestField, Object> entityRequestFields;
	private Boolean isCreatingFromFeed;
	private Boolean createWithDuns;
	private String comments;
	private Integer rolodexId;
}
