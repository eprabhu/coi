package com.polus.fibicomp.fcoiDisclosure.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.globalentity.pojo.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Table(name = "COI_DISCL_PERSON_ENTITY_REL")
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiDisclPersonEntityRel implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_DISCL_PERSON_ENTITY_REL_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiDisclPersonEntityRelId;

	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PERSON_ENTITY_REL_FK3"), name = "DISCLOSURE_ID", referencedColumnName = "DISCLOSURE_ID", insertable = false, updatable = false)
	private CoiDisclosure coiDisclosure;

	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PERSON_ENTITY_REL_FK1"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;

	@Column(name = "PREVIOUS_PERSON_ENTITY_ID")
	private Integer prePersonEntityId;

	@Column(name = "ENTITY_ID")
	private Integer entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PERSON_ENTITY_REL_FK2"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity coiEntity;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
