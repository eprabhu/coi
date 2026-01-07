package com.polus.fibicomp.fcoiDisclosure.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Unit;
import com.polus.core.util.JpaCharBooleanConversion;
import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_DISCLOSURE")
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiDisclosure implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "DISCLOSURE_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer disclosureId;
	
	@Column(name = "PERSON_ID")
	private String personId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK1"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;

	@Column(name = "HOME_UNIT")
	private String homeUnit;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DIS_HOME_UNIT_FK7"), name = "HOME_UNIT", referencedColumnName = "UNIT_NUMBER", insertable = false, updatable = false)
	private Unit unit;

	@Column(name = "DISCLOSURE_NUMBER")
	private Integer disclosureNumber;
	
	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;
	
	@Column(name = "VERSION_STATUS")
	private String versionStatus;
	
	@Column(name = "FCOI_TYPE_CODE")
	private String fcoiTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK2"), name = "FCOI_TYPE_CODE", referencedColumnName = "FCOI_TYPE_CODE", insertable = false, updatable = false)
	private CoiDisclosureFcoiType coiDisclosureFcoiType;
	
	@Column(name = "CONFLICT_STATUS_CODE")
	private String conflictStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK3"), name = "CONFLICT_STATUS_CODE", referencedColumnName = "CONFLICT_STATUS_CODE", insertable = false, updatable = false)
	private CoiConflictStatusType coiConflictStatusType;
	
	@Column(name = "DISPOSITION_STATUS_CODE")
	private String dispositionStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK4"), name = "DISPOSITION_STATUS_CODE", referencedColumnName = "DISPOSITION_STATUS_CODE", insertable = false, updatable = false)
	private CoiDispositionStatusType coiDispositionStatusType;
	
	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK5"), name = "REVIEW_STATUS_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private CoiReviewStatusType coiReviewStatusType;
	
	@Column(name = "RISK_CATEGORY_CODE")
	private String riskCategoryCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE1_FK6"), name = "RISK_CATEGORY_CODE", referencedColumnName = "RISK_CATEGORY_CODE", insertable = false, updatable = false)
	private CoiRiskCategory coiRiskCategory;

	@Column(name = "COI_PROJECT_TYPE_CODE")
	private String coiProjectTypeCode;

	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE_FK7"), name = "COI_PROJECT_TYPE_CODE", referencedColumnName = "COI_PROJECT_TYPE_CODE", insertable = false, updatable = false)
	private CoiProjectType coiProjectType;
	
	@Column(name = "EXPIRATION_DATE")
	private Timestamp expirationDate;

	@Column(name = "IS_EXTENDED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isExtended;
	
	@Column(name = "CERTIFICATION_TEXT")
	private String certificationText;
	
	@Column(name = "CERTIFIED_BY")
	private String certifiedBy;

//	@ManyToOne
//	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCLOSURE_FK10"), name = "CERTIFIED_BY", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
//	private Person certifiedPerson;

	@Column(name = "CERTIFIED_AT")
	private Timestamp certifiedAt;
	
	@Column(name = "REVISION_COMMENT")
	private String revisionComment;

	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@Column(name = "ADMIN_PERSON_ID")
	private String adminPersonId;

	@Column(name = "SYNC_NEEDED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean syncNeeded;

	@Column(name = "WITHDRAWAL_REQUESTED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean withdrawalRequested;

	@Column(name = "WITHDRAWAL_REQUEST_REASON")
	private String withdrawalRequestReason;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@CreatedBy
	@Column(name = "CREATED_By")
	private String createdBy;

	@CreatedDate
	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "REMARK")
	private String remark;

	@Transient
	private String updateUserFullName;

	@Transient
	private String createUserFullName;

	@Transient
	private Long numberOfSFI;

	@Transient
	private String adminGroupName;

	@Transient
	private String adminPersonName;

	@Transient
	private String disclosurePersonFullName;

	@Transient
	private String personEmail;

	@Transient
	private String personPrimaryTitle;

	@Transient
	private Long personNotesCount;

	@Transient
	private Long personAttachmentsCount;

	@Transient
	private Integer personEntitiesCount;
	
	@Transient
	private Long disclosureAttachmentsCount;

}
