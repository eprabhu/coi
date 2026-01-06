package com.polus.kcintegration.opaPerson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPAPersonDto {

    private Integer opaPersonId;
    private String personId;
    private String isDisclosureRequired;
    private String requirementReason;
    private String formOfAddressShort;
    private String krbNameUppercase;
    private String emailAddress;
    private String jobId;
    private String jobTitle;
    private String adminEmployeeType;
    private String hrDepartmentCodeOld;
    private String hrOrgUnitId;
    private String hrDepartmentName;
    private String adminOrgUnitId;
    private String adminOrgUnitTitle;
    private String adminPositionTitle;
    private String payrollRank;
    private String isFaculty;
    private BigDecimal employmentPercent;
    private String isConsultPriv;
    private String isPaidAppt;
    private String isSummerSessionAppt;
    private Integer summerSessionMonths;
    private String isSabbatical;
    private Date sabbaticalBeginDate;
    private Date sabbaticalEndDate;
    private Date warehouseLoadDate;
    private String is6MoAPPT;
    private String personnelSubareaCode;
    private String personnelSubarea;
    private Timestamp createTimestamp;
    private Timestamp updateTimestamp;

}
