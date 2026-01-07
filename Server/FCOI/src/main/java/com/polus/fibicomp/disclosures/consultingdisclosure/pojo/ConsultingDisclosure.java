package com.polus.fibicomp.disclosures.consultingdisclosure.pojo;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
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
import com.polus.fibicomp.globalentity.pojo.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Table(name = "CONSULTING_DISCLOSURE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultingDisclosure {

	@Id
	@Column(name = "DISCLOSURE_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer disclosureId;

	@Column(name = "PERSON_ID")
	private String personId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_DISCL_FK1"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;

	@Column(name = "ENTITY_ID")
	private Integer entityId;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_DISCL_ FK5"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;

	@Column(name = "HOME_UNIT")
	private String homeUnit;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_DISCL_ FK4"), name = "HOME_UNIT", referencedColumnName = "UNIT_NUMBER", insertable = false, updatable = false)
	private Unit unit;

	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_DISCL_ FK3"), name = "REVIEW_STATUS_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private ConsultingDisclReviewStatusType reviewStatusType;

	@Column(name = "DISPOSITION_STATUS_CODE")
	private String dispositionStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_DISCL_FK2"), name = "DISPOSITION_STATUS_CODE", referencedColumnName = "DISPOSITION_STATUS_CODE", insertable = false, updatable = false)
	private ConsultingDisclDispositionStatusType dispositionStatusType;

	@Column(name = "CERTIFICATION_TEXT")
	private String certificationText;

	@Column(name = "CERTIFIED_BY")
	private String certifiedBy;

	@Column(name = "CERTIFIED_AT")
	private Timestamp certifiedAt;

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
	private Timestamp updateTimeStamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Transient
	private String updateUserFullName;

	@Transient
	private String createUserFullName;

	@Transient
	private String adminGroupName;

	@Transient
	private String adminPersonName;

	@Transient
	private String homeUnitName;

	@Transient
	private List<ConsultingDisclFormBuilderDetails> consultingDisclFormBuilderDetails;

	@Transient
	private Long personNotesCount;

	@Transient
	private Long personAttachmentsCount;

	@Transient
	private Integer personEntitiesCount;

}
