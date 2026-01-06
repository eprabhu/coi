package com.polus.fibicomp.opa.pojo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.person.pojo.Person;
import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

@Entity
@Table(name = "OPA_PERSON")
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

//	@ManyToOne(optional = true, fetch = FetchType.LAZY)
//	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_PERSON_FK_1"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
//	private Person person;

	@Column(name = "IS_DISCLOSURE_REQUIRED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isDisclosureRequired;

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
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isFaculty;

	@Column(name = "EMPLOYMENT_PERCENT")
	private BigDecimal employmentPercent;

	@Column(name = "IS_CONSULT_PRIV")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isConsultPriv;

	@Column(name = "IS_PAID_APPT")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPaidAppt;

	@Column(name = "IS_SUMMER_SESSION_APPT")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isSummerSessionAppt;

	@Column(name = "SUMMER_SESSION_MONTHS")
	private Integer summerSessionMonths;

	@Column(name = "IS_SABBATICAL")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isSabbatical;

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
