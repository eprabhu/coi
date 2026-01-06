package com.polus.integration.opaPersonFeed.pojo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;

@Entity
@Table(name = "OPA_PERSON", uniqueConstraints = @UniqueConstraint(columnNames = "PERSON_ID"))
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPAPerson implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "OPA_PERSON_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer opaPersonId;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "IS_DISCLOSURE_REQUIRED")
    private String isDisclosureRequired;

    @Column(name = "REQUIREMENT_REASON")
    private String requirementReason;

    @Column(name = "FORM_OF_ADDRESS_SHORT")
    private String formOfAddressShort;

    @Column(name = "KRB_NAME_UPPERCASE")
    private String krbNameUppercase;

    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Column(name = "JOB_ID")
    private String jobId;

    @Column(name = "JOB_TITLE")
    private String jobTitle;

    @Column(name = "ADMIN_EMPLOYEE_TYPE")
    private String adminEmployeeType;

    @Column(name = "HR_DEPARTMENT_CODE_OLD")
    private String hrDepartmentCodeOld;

    @Column(name = "HR_ORG_UNIT_ID")
    private String hrOrgUnitId;

    @Column(name = "HR_DEPARTMENT_NAME")
    private String hrDepartmentName;

    @Column(name = "ADMIN_ORG_UNIT_ID")
    private String adminOrgUnitId;

    @Column(name = "ADMIN_ORG_UNIT_TITLE")
    private String adminOrgUnitTitle;

    @Column(name = "ADMIN_POSITION_TITLE")
    private String adminPositionTitle;

    @Column(name = "PAYROLL_RANK")
    private String payrollRank;

    @Column(name = "IS_FACULTY")
    private String isFaculty;

    @Column(name = "EMPLOYMENT_PERCENT")
    private BigDecimal employmentPercent;

    @Column(name = "IS_CONSULT_PRIV")
    private String isConsultPriv;

    @Column(name = "IS_PAID_APPT")
    private String isPaidAppt;

    @Column(name = "IS_SUMMER_SESSION_APPT")
    private String isSummerSessionAppt;

    @Column(name = "SUMMER_SESSION_MONTHS")
    private Integer summerSessionMonths;

    @Column(name = "IS_SABBATICAL")
    private String isSabbatical;

    @Column(name = "SABBATICAL_BEGIN_DATE")
    private Date sabbaticalBeginDate;

    @Column(name = "SABBATICAL_END_DATE")
    private Date sabbaticalEndDate;

    @Column(name = "WAREHOUSE_LOAD_DATE")
    private Date warehouseLoadDate;

    @Column(name = "PERSONNEL_SUBAREA")
    private String personnelSubarea;

    @Column(name = "PERSONNEL_SUBAREA_CODE")
    private String personnelSubareaCode;

    @Column(name = "IS_6MO_APPT")
    private String is6MoAPPT;

    @CreatedDate
    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
