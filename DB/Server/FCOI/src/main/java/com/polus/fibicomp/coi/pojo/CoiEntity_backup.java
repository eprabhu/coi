package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

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

import com.polus.core.pojo.Country;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "ENTITY_BACKUP")
@EntityListeners(AuditingEntityListener.class)
public class CoiEntity_backup implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ENTITY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer entityId;
	
	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;
	
	@Column(name = "ENTITY_NAME")
	private String entityName;
	
	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;
	
	@Column(name = "VERSION_STATUS")
	private String versionStatus;
	
	@Column(name = "ENTITY_STATUS_CODE")
	private String entityStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY1_FK1"), name = "ENTITY_STATUS_CODE", referencedColumnName = "ENTITY_STATUS_CODE", insertable = false, updatable = false)
	private EntityStatus entityStatus;
	
	@Column(name = "ENTITY_TYPE_CODE")
	private String entityTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY1_FK2"), name = "ENTITY_TYPE_CODE", referencedColumnName = "ENTITY_TYPE_CODE", insertable = false, updatable = false)
	private EntityType entityType;
	
	@Column(name = "RISK_CATEGORY_CODE")
	private String riskCategoryCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY1_FK5"), name = "RISK_CATEGORY_CODE", referencedColumnName = "RISK_CATEGORY_CODE", insertable = false, updatable = false)
	private EntityRiskCategory entityRiskCategory;
	
	@Column(name = "PHONE")
	private String phone;

	@Column(name = "COUNTRY_CODE")
	private String countryCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY1_FK3"), name = "COUNTRY_CODE", referencedColumnName = "COUNTRY_CODE", insertable = false, updatable = false)
	private Country country;
	
	@Column(name = "CITY")
	private String city;
	
	@Column(name = "ADDRESS")
	private String address;
	
	@Column(name = "ZIP_CODE")
	private String zipCode;
	
	@Column(name = "EMAIL_ADDRESS")
	private String emailAddress;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;
	
	@Column(name = "WEB_URL")
	private String webURL;
	
	@CreatedBy
	@Column(name = "CREATE_USER")
	private String createUser;
	
	@CreatedDate
	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;
	
	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;
	
	@Column(name = "APPROVED_USER")
	private String approvedUser;
	
	@Column(name = "APPROVED_TIMESTAMP")
	private Timestamp approvedTimestamp;

	@Column(name = "REVISION_REASON")
	private String revisionReason;
	
	@Transient
	private String countryDescription;
	
	@Transient
	private String entityTypeDescription;
	
	@Transient
	private String riskLevelDescription;
	
	@Transient
	private String statusDescription;

	@Transient
	private String updatedUserFullName;
	
	@Transient
	private String createUserFullName;

	@Transient
	private boolean majorVersion; // status of modification, is major change or minor change

	@Transient
	private EntityRiskCategory newRiskCategory;

	public String getCreateUserFullName() {
		return createUserFullName;
	}

	public void setCreateUserFullName(String createUserFullName) {
		this.createUserFullName = createUserFullName;
	}

	public Integer getEntityId() {
		return entityId;
	}

	public void setEntityId(Integer entityId) {
		this.entityId = entityId;
	}

	public Integer getEntityNumber() {
		return entityNumber;
	}

	public void setEntityNumber(Integer entityNumber) {
		this.entityNumber = entityNumber;
	}

	public String getEntityName() {
		return entityName;
	}

	public void setEntityName(String entityName) {
		this.entityName = entityName;
	}

	public Integer getVersionNumber() {
		return versionNumber;
	}

	public void setVersionNumber(Integer versionNumber) {
		this.versionNumber = versionNumber;
	}

	public String getVersionStatus() {
		return versionStatus;
	}

	public void setVersionStatus(String versionStatus) {
		this.versionStatus = versionStatus;
	}

	public String getEntityStatusCode() {
		return entityStatusCode;
	}

	public void setEntityStatusCode(String entityStatusCode) {
		this.entityStatusCode = entityStatusCode;
	}

	public EntityStatus getEntityStatus() {
		return entityStatus;
	}

	public void setEntityStatus(EntityStatus entityStatus) {
		this.entityStatus = entityStatus;
	}

	public String getEntityTypeCode() {
		return entityTypeCode;
	}

	public void setEntityTypeCode(String entityTypeCode) {
		this.entityTypeCode = entityTypeCode;
	}

	public EntityType getEntityType() {
		return entityType;
	}

	public void setEntityType(EntityType entityType) {
		this.entityType = entityType;
	}

	public String getRiskCategoryCode() {
		return riskCategoryCode;
	}

	public void setRiskCategoryCode(String riskCategoryCode) {
		this.riskCategoryCode = riskCategoryCode;
	}

	public EntityRiskCategory getEntityRiskCategory() {
		return entityRiskCategory;
	}

	public void setEntityRiskCategory(EntityRiskCategory entityRiskCategory) {
		this.entityRiskCategory = entityRiskCategory;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public Country getCountry() {
		return country;
	}

	public void setCountry(Country country) {
		this.country = country;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getZipCode() {
		return zipCode;
	}

	public void setZipCode(String zipCode) {
		this.zipCode = zipCode;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public String getWebURL() {
		return webURL;
	}

	public void setWebURL(String webURL) {
		this.webURL = webURL;
	}

	public String getCreateUser() {
		return createUser;
	}

	public void setCreateUser(String createUser) {
		this.createUser = createUser;
	}

	public Timestamp getCreateTimestamp() {
		return createTimestamp;
	}

	public void setCreateTimestamp(Timestamp createTimestamp) {
		this.createTimestamp = createTimestamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public String getApprovedUser() {
		return approvedUser;
	}

	public void setApprovedUser(String approvedUser) {
		this.approvedUser = approvedUser;
	}

	public Timestamp getApprovedTimestamp() {
		return approvedTimestamp;
	}

	public void setApprovedTimestamp(Timestamp approvedTimestamp) {
		this.approvedTimestamp = approvedTimestamp;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getEntityTypeDescription() {
		return entityTypeDescription;
	}

	public void setEntityTypeDescription(String entityTypeDescription) {
		this.entityTypeDescription = entityTypeDescription;
	}

	public String getRiskLevelDescription() {
		return riskLevelDescription;
	}

	public void setRiskLevelDescription(String riskLevelDescription) {
		this.riskLevelDescription = riskLevelDescription;
	}

	public String getStatusDescription() {
		return statusDescription;
	}

	public void setStatusDescription(String statusDescription) {
		this.statusDescription = statusDescription;
	}

	public String getCountryDescription() {
		return countryDescription;
	}

	public void setCountryDescription(String countryDescription) {
		this.countryDescription = countryDescription;
	}

	public boolean isMajorVersion() {
		return majorVersion;
	}

	public void setMajorVersion(boolean majorVersion) {
		this.majorVersion = majorVersion;
	}

	public String getUpdatedUserFullName() {
		return updatedUserFullName;
	}

	public void setUpdatedUserFullName(String updatedUserFullName) {
		this.updatedUserFullName = updatedUserFullName;
	}

	public String getRevisionReason() {
		return revisionReason;
	}

	public void setRevisionReason(String revisionReason) {
		this.revisionReason = revisionReason;
	}

	public EntityRiskCategory getNewRiskCategory() {
		return newRiskCategory;
	}

	public void setNewRiskCategory(EntityRiskCategory newRiskCategory) {
		this.newRiskCategory = newRiskCategory;
	}
}
