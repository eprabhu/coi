package com.polus.fibicomp.coi.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.polus.core.pojo.Unit;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoiTravelDashboardDto {

	private Integer travelDisclosureId;
	private String travellerName;
	private String travellerTypeDescription;
	private String travelDisclosureStatusCode;
	private String travelDisclosureStatusDescription;
	private String travelEntityName;
	private String travelCity;
	private String travelCountry;
	private String travelState;
	private BigDecimal travelAmount;
	private String documentStatusCode;
	private String documentStatusDescription;
	private Unit unitDetails;
	private Timestamp certifiedAt;
	private Timestamp expirationDate;
	private String reviewStatusCode;
	private String reviewDescription;
	private String travelPurpose;
	private Date travelStartDate;
	private Date travelEndDate;
	private Date travelSubmissionDate;
	private Timestamp acknowledgeAt;
	private String adminPersonId;
	private Integer adminGroupId;
	private String versionStatus;
	private String createUser;
	private String updateUser;
	private Timestamp createTimestamp;
	private Timestamp updateTimestamp;
	private String fundingType;
	private Boolean isLateSubmission;
	private String personId;
	private Integer entityId;
	private String tripTitle;
	private String adminPersonName;
	private String adminGroupName;
	private List<String> travelDestinations;
	private Integer commentCount;
	private Integer travelNumber;
	private Boolean isHomeUnitSubmission;
    private List<CoiDisclosureType> coiDisclosureTypes;
    private List<Map<Object, Object>> existingDisclosures;

}
