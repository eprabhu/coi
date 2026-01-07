package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "PER_ENT_DISCL_TYPE_SELECTION")
public class PerEntDisclTypeSelection implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;
	
	@JsonIgnore
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PER_ENT_DISCL_TYPE_SELECTION_FK1"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;

	@Column(name = "DISCLOSURE_TYPE_CODE")
	private String disclosureTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PER_ENT_DISCL_TYPE_SELECTION_FK2"), name = "DISCLOSURE_TYPE_CODE", referencedColumnName = "DISCLOSURE_TYPE_CODE", insertable = false, updatable = false)
	private CoiDisclosureType coiDisclosureType;
	
	@Column(name = "DATA_CAPTURING_TYPE_CODE")
	private Integer dataCapturingTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PER_ENT_DISCL_TYPE_SELECTION_FK3"), name = "DATA_CAPTURING_TYPE_CODE", referencedColumnName = "DATA_CAPTURING_TYPE_CODE", insertable = false, updatable = false)
	private PerEntDataCapturingType perEntDataCapturingType;
	
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
