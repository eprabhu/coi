package com.polus.fibicomp.compliance.declaration.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
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

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_DECLARATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiDeclaration {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "DECLARATION_ID")
	private Integer declarationId;

	@Column(name = "DECLARATION_NUMBER")
	private String declarationNumber;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "DECLARATION_TYPE_CODE")
	private String declarationTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DECLARATION_FK1"), name = "DECLARATION_TYPE_CODE", referencedColumnName = "DECLARATION_TYPE_CODE", insertable = false, updatable = false)
	private CoiDeclarationType declarationType;

	@Column(name = "DECLARATION_STATUS_CODE")
	private String declarationStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DECLARATION_FK2"), name = "DECLARATION_STATUS_CODE", referencedColumnName = "DECLARATION_STATUS_CODE", insertable = false, updatable = false)
	private CoiDeclarationStatus declarationStatus;

	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DECLARATION_FK3"), name = "REVIEW_STATUS_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private CoiDeclarationReviewStatusType declarationReviewStatusType;

	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@Column(name = "ADMIN_PERSON_ID")
	private String adminPersonId;

	@Column(name = "SUBMISSION_DATE")
	private Timestamp submissionDate;

	@Column(name = "EXPIRATION_DATE")
	private Timestamp expirationDate;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

	@Column(name = "VERSION_STATUS")
	private String versionStatus;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Transient
	private String updateUserFullName;

	@Transient
	private String createUserFullName;

	@Transient
	private Person person;

	@Transient
	private String adminGroupName;

	@Transient
	private String adminPersonName;

	@Transient
	private Boolean isHomeUnitSubmission;

}
