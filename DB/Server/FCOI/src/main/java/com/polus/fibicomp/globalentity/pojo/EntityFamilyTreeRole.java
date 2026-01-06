package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

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
@Table(name = "ENTITY_FAMILY_TREE_ROLE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityFamilyTreeRole implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ENTITY_FAMILY_TREE_ROLE_ID")
	private Integer entityFamilyTreeRoleId;

	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;

	@Column(name = "FAMILY_ROLE_TYPE_CODE")
	private String familyRoleTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_FAMILY_TREE_ROLE_FK2"), name = "FAMILY_ROLE_TYPE_CODE", referencedColumnName = "FAMILY_ROLE_TYPE_CODE", insertable = false, updatable = false)
	private EntityFamilyRoleType familyRoleType;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
