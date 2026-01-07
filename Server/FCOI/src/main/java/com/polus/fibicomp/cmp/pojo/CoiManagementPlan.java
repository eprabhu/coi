package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Organization;
import com.polus.core.pojo.Rolodex;
import com.polus.core.pojo.Unit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MANAGEMENT_PLAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "CMP_ID")
	private Integer cmpId;

	@Column(name = "CMP_NUMBER", nullable = false)
	private Integer cmpNumber;

	@Column(name = "CMP_TYPE_CODE", nullable = false)
	private String cmpTypeCode;

	@ManyToOne
	@JoinColumn(name = "CMP_TYPE_CODE", referencedColumnName = "CMP_TYPE_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK1"))
	private CoiManagementPlanType cmpType;

	@Column(name = "VERSION_NUMBER", nullable = false)
	private Integer versionNumber;

	@Column(name = "VERSION_STATUS", nullable = false)
	private String versionStatus;

	@Column(name = "STATUS_CODE")
	private String cmpStatusCode;

	@ManyToOne
	@JoinColumn(name = "STATUS_CODE", referencedColumnName = "STATUS_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK7"))
	private CoiManagementPlanStatusType statusType;

	@Column(name = "PERSON_ID")
	private String personId;

	@ManyToOne
	@JoinColumn(name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK4"))
	private Person person;

	@Column(name = "ROLODEX_ID")
	private Integer rolodexId;

	@ManyToOne
	@JoinColumn(name = "ROLODEX_ID", referencedColumnName = "ROLODEX_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK5"))
	private Rolodex rolodex;

	@Column(name = "ACADEMIC_DEPARTMENT_NUMBER")
	private String academicDepartmentNumber;

	@ManyToOne
	@JoinColumn(name = "ACADEMIC_DEPARTMENT_NUMBER", referencedColumnName = "UNIT_NUMBER", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK2"))
	private Unit academicDepartment;

	@Column(name = "LAB_CENTER_NUMBER")
	private String labCenterNumber;

	@ManyToOne
	@JoinColumn(name = "LAB_CENTER_NUMBER", referencedColumnName = "UNIT_NUMBER", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK3"))
	private Unit labCenter;

	@Column(name = "SUB_AWARD_INSTITUTE_CODE")
	private String subAwardInstituteCode;

	@ManyToOne
	@JoinColumn(name = "SUB_AWARD_INSTITUTE_CODE", referencedColumnName = "ORGANIZATION_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MANAGEMENT_PLAN_FK6"))
	private Organization organization;

	@Column(name = "APPROVAL_DATE")
	private Date approvalDate;

	@Column(name = "EXPIRATION_DATE")
	private Date expirationDate;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATED_TIMESTAMP")
	private Timestamp createdTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
