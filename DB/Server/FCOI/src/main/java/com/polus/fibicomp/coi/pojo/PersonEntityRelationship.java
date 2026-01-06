package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

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

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PERSON_ENTITY_RELATIONSHIP")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonEntityRelationship implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "PERSON_ENTITY_REL_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer personEntityRelId;
	
	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_RELATIONSHIP_FK1"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;
	
	@Column(name = "VALID_PERS_ENTITY_REL_TYP_CODE")
	private Integer validPersonEntityRelTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_RELATIONSHIP_FK2"), name = "VALID_PERS_ENTITY_REL_TYP_CODE", referencedColumnName = "VALID_PERS_ENTITY_REL_TYP_CODE", insertable = false, updatable = false)
	private ValidPersonEntityRelType validPersonEntityRelType;
	
	@Column(name = "QUESTIONNAIRE_ANS_HEADER_ID")
	private Integer questionnaireAnsHeaderId;
	
	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "START_DATE")
	private Date startDate;

	@Column(name = "END_DATE")
	private Date endDate;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "IS_SYSTEM_CREATED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isSystemCreated;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Transient
	private List<Integer> ValidPersonEntityRelTypeCodes;

	@Transient
	private List<Integer> perEntDisclTypeSelections;

	@Transient
	private List<String> disclTypeCodes;

}
