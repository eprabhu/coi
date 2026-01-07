package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.polus.core.pojo.Country;
import com.polus.core.pojo.State;
import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Entity implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ENTITY_ID")
	private Integer entityId;

	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;

	@Column(name = "PRIMARY_NAME")
	private String entityName;

	@Column(name = "FOREIGN_NAME")
	private String foreignName;

	@Column(name = "PRIOR_NAME")
	private String priorName;

	@Column(name = "SHORT_NAME")
	private String shortName;

	@Column(name = "DUNS_NUMBER")
	private String dunsNumber;

	@Column(name = "UEI_NUMBER")
	private String ueiNumber;

	@Column(name = "CAGE_NUMBER")
	private String cageNumber;

	@Column(name = "WEBSITE_ADDRESS")
	private String websiteAddress;

	@Column(name = "START_DATE")
	private String startDate;

	@Column(name = "INCORPORATION_DATE")
	private String incorporationDate;

	@Column(name = "CERTIFIED_EMAIL")
	private String certifiedEmail;

	@Column(name = "ACTIVITY_TEXT")
	private String activityText;

	@Column(name = "PHONE_NUMBER")
	private String phoneNumber;

	@Column(name = "PRIMARY_ADDRESS_LINE_1")
	private String primaryAddressLine1;

	@Column(name = "PRIMARY_ADDRESS_LINE_2")
	private String primaryAddressLine2;

	@Column(name = "CITY")
	private String city;

	@Column(name = "STATE")
	private String state;

	@Column(name = "POST_CODE")
	private String postCode;

	@Column(name = "HUMAN_SUB_ASSURANCE")
	private String humanSubAssurance;

	@Column(name = "ANIMAL_WELFARE_ASSURANCE")
	private String anumalWelfareAssurance;

	@Column(name = "ANIMAL_ACCREDITATION")
	private String animalAccreditation;

	@Column(name = "APPROVED_BY")
	private String approvedBy;

	@Column(name = "APPROVED_TIMESTAMP")
	private Timestamp approvedTimestamp;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "ENTITY_STATUS_TYPE_CODE")
	private String entityStatusTypeCode;

	@Column(name = "OPERATING_STATUS_TYPE_CODE")
	private String operatingStatusTypeCode;

	@Column(name = "DOCUMENT_STATUS_TYPE_CODE")
	private String documentStatusTypeCode;

	@Column(name = "BUSINESS_TYPE_CODE")
	private String businessTypeCode;

	@Column(name = "CURRENCY_CODE")
	private String currencyCode;

	@Column(name = "ENTITY_SOURCE_TYPE_CODE")
	private String entitySourceTypeCode;

	@Column(name = "COUNTRY_CODE")
	private String countryCode;

	@Column(name = "ENTITY_OWNERSHIP_TYPE_CODE")
	private String entityOwnershipTypeCode;

	@Column(name = "INCORPORATED_IN")
	private String incorporatedIn;

	@Column(name = "CONGRESSIONAL_DISTRICT")
	private String congressionalDistrict;

	@Column(name = "FEDERAL_EMPLOYER_ID")
	private String federalEmployerId;

	@Column(name = "NUMBER_OF_EMPLOYEES")
	private Integer numberOfEmployees;
	
	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;
	
	@Column(name = "VERSION_STATUS")
	private String versionStatus;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "IS_DUNS_MATCHED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isDunsMatched;

	@Column(name = "ORIGINAL_ENTITY_ID")
	private Integer originalEntityId;

	@Column(name = "IS_FOREIGN")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isForeign;

	@Column(name = "IS_DUNS_MONITORING_ENABLE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isDunsMonitoringEnabled;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK1"), name = "ENTITY_STATUS_TYPE_CODE", referencedColumnName = "ENTITY_STATUS_TYPE_CODE", insertable = false, updatable = false)
	private EntityStatusType entityStatusType;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK2"), name = "OPERATING_STATUS_TYPE_CODE", referencedColumnName = "OPERATING_STATUS_TYPE_CODE", insertable = false, updatable = false)
	private EntityOperatingStatusType entityOperatingStatusType;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK3"), name = "ENTITY_SOURCE_TYPE_CODE", referencedColumnName = "ENTITY_SOURCE_TYPE_CODE", insertable = false, updatable = false)
	private EntitySourceType entitySourceType;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK4"), name = "COUNTRY_CODE", referencedColumnName = "COUNTRY_CODE", insertable = false, updatable = false)
	private Country country;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK5"), name = "ENTITY_OWNERSHIP_TYPE_CODE", referencedColumnName = "OWNERSHIP_TYPE_CODE", insertable = false, updatable = false)
	private EntityOwnershipType entityOwnershipType;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK6"), name = "BUSINESS_TYPE_CODE", referencedColumnName = "BUSINESS_TYPE_CODE", insertable = false, updatable = false)
	private EntityBusinessType entityBusinessType;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FK7"), name = "DOCUMENT_STATUS_TYPE_CODE", referencedColumnName = "DOCUMENT_STATUS_TYPE_CODE", insertable = false, updatable = false)
	private EntityDocumentStatusType entityDocumentStatusType;

	@ManyToOne(optional = true)
	@JoinColumn(name = "STATE", referencedColumnName = "STATE_CODE", insertable = false, updatable = false)
	@org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
	private State stateDetails;

	@Transient
	private List<EntityFamilyTreeRole> entityFamilyTreeRoles;

	@Transient
	private String entityRiskLevelCode;

	@Transient
	private String entityRiskLevel;

	@Transient
	private String entityRiskCategoryCode;

	@Transient
	private String entityRiskCategory;

	@Transient
	private Integer entityRiskId;

	@Transient
	private String comments;

	@Transient
	private Integer rolodexId;
}
