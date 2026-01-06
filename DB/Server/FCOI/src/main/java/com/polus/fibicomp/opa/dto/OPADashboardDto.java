package com.polus.fibicomp.opa.dto;

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class OPADashboardDto {

    private Integer opaDisclosureId;
    private String opaDisclosureNumber;
    private Integer opaCycleNumber;
    private Date periodStartDate;
    private Date periodEndDate;
    private Date openDate;
    private Date closeDate;
    private Boolean opaCycleStatus;
    private String personName;
    private String homeUnit;
    private String homeUnitName;
    private Boolean isFaculty;
    private Boolean isFallSabatical;
    private Boolean isSpringSabatical;
    private Boolean isFullTime;
    private BigDecimal summerCompMonths;
    private Boolean receivedSummerComp;
    private String dispositionStatusCode;
    private String reviewStatusCode;
    private Timestamp submissionTimestamp;
    private String certifiedBy;
    private String certificationText;
    private Boolean hasPotentialConflict;
    private String conflictDescription;
    private String createUser;
    private Timestamp createTimestamp;
    private String adminPersonId;
    private String adminPersonName;
    private Integer adminGroupId;
    private String adminGroupName;
    private String updatedBy;
    private Timestamp updateTimeStamp;
    private String updateUserFullName;
    private String dispositionStatus;
    private String reviewStatus;
    private List<List<String>> reviewers;
    private String personId;
    private Integer entityId;
	private Integer commentCount;
	private Integer versionNumber;
	private String versionStatus;
	private Timestamp expirationDate;
	private String unitDisplayName;
	private Integer noOfSfi;
	private Boolean isHomeUnitSubmission;
    private Boolean isViewAllowed;
    private List<CoiDisclosureType> coiDisclosureTypes;
    private List<Map<Object, Object>> existingDisclosures;

}
