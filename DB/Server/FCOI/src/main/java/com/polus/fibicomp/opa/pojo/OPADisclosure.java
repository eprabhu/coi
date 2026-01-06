package com.polus.fibicomp.opa.pojo;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

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
import javax.persistence.Transient;

import com.polus.core.person.pojo.Person;
import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OPA_DISCLOSURE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPADisclosure {

	@Id
	@Column(name = "OPA_DISCLOSURE_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaDisclosureId;

	@Column(name = "OPA_DISCLOSURE_NUMBER")
	private String opaDisclosureNumber;

	@Column(name = "OPA_CYCLE_NUMBER")
	private Integer opaCycleNumber;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCLOSURE_FK1"), name = "OPA_CYCLE_NUMBER", referencedColumnName = "OPA_CYCLE_NUMBER", insertable = false, updatable = false)
	private OPACycles opaCycles;

	@Column(name = "PERSON_ID")
	private String personId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCLOSURE_FK_4"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;

	@Column(name = "OPA_PERSON_ID")
	private Integer opaPersonId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCLOSURE_FK_4"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private OPAPerson opaPerson;

	@Column(name = "HOME_UNIT")
	private String homeUnit;

	@Column(name = "STATUS_CODE")
	private String statusCode;

	@Column(name = "IS_FALL_SABATICAL")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isFallSabatical;

	@Column(name = "IS_SPRING_SABATICAL")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isSpringSabatical;

	@Column(name = "RECEIVED_SUMMER_COMP")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean receivedSummerComp;

	@Column(name = "SUMMER_COMP_MONTHS")
	private BigDecimal summerCompMonths;

	@Column(name = "IS_FULL_TIME")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isFullTime;

	@Column(name = "IS_PART_TIME")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPartTime;

	@Column(name = "APPOINTMENT_PERCENT")
	private BigDecimal appointmentPercent;

	@Column(name = "IS_COMPENSATED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isCompensated;

	@Column(name = "HAS_POTENTIAL_CONFLICT")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean hasPotentialConflict;

	@Column(name = "CONFLICT_DESCRIPTION")
	private String conflictDescription;

	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_DISCLOSURE_FK2"), name = "REVIEW_STATUS_CODE",
			referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private OPAReviewStatusType reviewStatusType;

	@Column(name = "DISPOSITION_STATUS_CODE")
	private String dispositionStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK3"), name = "DISPOSITION_STATUS_CODE",
			referencedColumnName = "DISPOSITION_STATUS_CODE", insertable = false, updatable = false)
	private OPADispositionStatusType dispositionStatusType;

	@Column(name = "CERTIFICATION_TEXT")
	private String certificationText;

	@Column(name = "CERTIFIED_BY")
	private String certifiedBy;

	@Column(name = "SUBMISSION_TIMESTAMP")
	private Timestamp submissionTimestamp;
	
	@Column(name = "EXPIRATION_DATE")
	private Timestamp expirationDate;

	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@Column(name = "ADMIN_PERSON_ID")
	private String adminPersonId;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "CREATE_USER")
	private String createUser;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

	@Column(name = "VERSION_STATUS")
	private String versionStatus;

	@Transient
	private String updateUserFullName;

	@Transient
	private String createUserFullName;

	@Transient
	private String adminGroupName;

	@Transient
	private String adminPersonName;

	@Transient
	private String personEmail;

	@Transient
	private String personPrimaryTitle;

	@Transient
	private String homeUnitName;

	@Transient
	private List<OPAFormBuilderDetails> opaFormBuilderDetails;

	@Transient
	private Long personNotesCount;

	@Transient
	private Long personAttachmentsCount;

	@Transient
	private Integer personEntitiesCount;
	
	@Transient
	private String unitDisplayName;

	@Transient
	private String personName;

	@Transient
	private Boolean isFaculty;

	@Transient
	private Boolean isHomeUnitSubmission;

}
