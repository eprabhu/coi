package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
//import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_PRIOR_NAME")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityPriorName implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID")
	private int id;

	@Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_PRIOR_NAME_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "PRIOR_NAME")
	private String priorName;

	@Column(name = "EFFECTIVE_YEAR")
	private Date effectiveYear;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
