package com.polus.fibicomp.coi.vo;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.polus.core.pojo.Unit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisclosureView {

	private Integer coiDisclosureId;
	private String documentNumber;
	private String coiDisclosureNumber;
	private Integer sequenceNumber;
	private String personId;
	private String fullName;
	private String dispositionStatusCode;
	private String dispositionStatus;
	private String conflictStatusCode;
	private String conflictStatus;
	private String moduleItemKey;
	private Integer discActiveStatus;
	private Timestamp expirationDate;
	private Timestamp updateTimeStamp;
	private String updateUser;
	private String updateUserFullName;
	private String createUser;
	private String versionStatus;
	private String reviewStatus;
	private Timestamp submittedDate;
	private Integer lastApprovedVersion;
	private Timestamp createTimestamp;
	private Integer disclosureVersionNumber;
	private String disclosurePersonFullName;
	private String fcoiTypeCode;
	private String fcoiType;
	private Timestamp lastApprovedVersionDate;
	private String reviseComment;
	private String reviewStatusCode;
	private Integer reviewId;
	private String reviewDescription;
	private String reviewerStatusCode;
	private String reviewerStatus;
	private String reviewerFullName;
	private Integer noOfSfi;
	private Timestamp certifiedAt;
	private Unit unit;
	private Integer travelDisclosureId;
	private Date travelStartDate;
	private Date travelEndDate;
	private String acknowledgeBy;
	private String destination;
	private String purpose;
	private Date acknowledgeDate;
	private String travelDisclosureNumber;
	private String description;
	private String disclosurestatus;
	private String homeUnitName;
	private String homeUnit;
	private String adminGroupName;
	private String administrator;
	private String department;
	private String travelDisclosureStatus;
	private String travelEntityName;
	private String travellerName;
	private BigDecimal travelAmount;
	private String travelReviewStatus;
	private Timestamp travelSubmissionDate;
	private Timestamp travelExpirationDate;
	private String travelPurpose;
	private Date certificationDate;
	private Unit unitDetails;
	private String travelCity;
	private String travelCountry;
	private String travelState;
	private String travellerTypeCode;
	private String travellerTypeDescription;
	private String travelDisclosureStatusCode;
	private String travelDisclosureStatusDescription;
	private String documentStatusCode;
	private String documentStatusDescription;
	private String adminPersonId;
	private Integer adminGroupId;
	private String unitName;
	private List<List<String>> reviewerList;
	private List<Map<Object, Object>> projectCount;
	private String projectNumber;
	private String projectTitle;
	private String projectBadgeColor;
	private String projectIcon;
	private String projectType;
	private String coiProjectTypeCode;
	private Boolean isExtended;
	private Integer commentCount;
	private Integer disclosureAttachmentCount;
	private Boolean isHomeUnitSubmission;

}
