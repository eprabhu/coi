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

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "VALID_PERSON_ENTITY_REL_TYPE")
@EntityListeners(AuditingEntityListener.class)
public class ValidPersonEntityRelType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "VALID_PERS_ENTITY_REL_TYP_CODE")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer validPersonEntityRelTypeCode;
	
	@Column(name = "DISCLOSURE_TYPE_CODE")
	private String disclosureTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "VALID_PERSON_ENTITY_REL_TYPE_FK1"), name = "DISCLOSURE_TYPE_CODE", referencedColumnName = "DISCLOSURE_TYPE_CODE", insertable = false, updatable = false)
	private CoiDisclosureType coiDisclosureType;

	@Column(name = "RELATIONSHIP_TYPE_CODE")
	private String relationshipTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "VALID_PERSON_ENTITY_REL_TYPE_FK2"), name = "RELATIONSHIP_TYPE_CODE", referencedColumnName = "RELATIONSHIP_TYPE_CODE", insertable = false, updatable = false)
	private PersonEntityRelType personEntityRelType;
	
	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "QUESTIONNAIRE_NUMBER")
	private Integer questionnaireNumber;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	public Integer getValidPersonEntityRelTypeCode() {
		return validPersonEntityRelTypeCode;
	}

	public void setValidPersonEntityRelTypeCode(Integer validPersonEntityRelTypeCode) {
		this.validPersonEntityRelTypeCode = validPersonEntityRelTypeCode;
	}

	public String getDisclosureTypeCode() {
		return disclosureTypeCode;
	}

	public void setDisclosureTypeCode(String disclosureTypeCode) {
		this.disclosureTypeCode = disclosureTypeCode;
	}

	public String getRelationshipTypeCode() {
		return relationshipTypeCode;
	}

	public void setRelationshipTypeCode(String relationshipTypeCode) {
		this.relationshipTypeCode = relationshipTypeCode;
	}

	public PersonEntityRelType getPersonEntityRelType() {
		return personEntityRelType;
	}

	public void setPersonEntityRelType(PersonEntityRelType personEntityRelType) {
		this.personEntityRelType = personEntityRelType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Integer getQuestionnaireNumber() {
		return questionnaireNumber;
	}

	public void setQuestionnaireNumber(Integer questionnaireNumber) {
		this.questionnaireNumber = questionnaireNumber;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public CoiDisclosureType getCoiDisclosureType() {
		return coiDisclosureType;
	}

	public void setCoiDisclosureType(CoiDisclosureType coiDisclosureType) {
		this.coiDisclosureType = coiDisclosureType;
	}
}
