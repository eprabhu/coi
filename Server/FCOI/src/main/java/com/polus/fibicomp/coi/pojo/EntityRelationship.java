package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.ForeignKey;
import javax.persistence.Transient;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@Table(name = "ENTITY_RELATIONSHIP")
public class EntityRelationship implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;

	@Column(name = "NODE_TYPE_CODE")
	private Integer nodeTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_RELATIONSHIP_FK1"), name = "NODE_TYPE_CODE", referencedColumnName = "REL_NODE_TYPE_CODE", insertable = false, updatable = false)
	private EntityRelNodeType entityRelNodeType;
	
	@Column(name = "NODE_ID")
	private Integer nodeId;
	
	@Column(name = "ENTITY_REL_TYPE_CODE")
	private Integer entityRelTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_RELATIONSHIP_FK2"), name = "ENTITY_REL_TYPE_CODE", referencedColumnName = "ENTITY_REL_TYPE_CODE", insertable = false, updatable = false)
	private EntityRelationshipType entityRelationshipType;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Transient
	private Integer entityId;

	@Transient
	private String updateUserFullName;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getEntityNumber() {
		return entityNumber;
	}

	public void setEntityNumber(Integer entityNumber) {
		this.entityNumber = entityNumber;
	}

	public Integer getNodeTypeCode() {
		return nodeTypeCode;
	}

	public void setNodeTypeCode(Integer nodeTypeCode) {
		this.nodeTypeCode = nodeTypeCode;
	}

	public EntityRelNodeType getEntityRelNodeType() {
		return entityRelNodeType;
	}

	public void setEntityRelNodeType(EntityRelNodeType entityRelNodeType) {
		this.entityRelNodeType = entityRelNodeType;
	}

	public Integer getNodeId() {
		return nodeId;
	}

	public void setNodeId(Integer nodeId) {
		this.nodeId = nodeId;
	}

	public Integer getEntityRelTypeCode() {
		return entityRelTypeCode;
	}

	public void setEntityRelTypeCode(Integer entityRelTypeCode) {
		this.entityRelTypeCode = entityRelTypeCode;
	}

	public EntityRelationshipType getEntityRelationshipType() {
		return entityRelationshipType;
	}

	public void setEntityRelationshipType(EntityRelationshipType entityRelationshipType) {
		this.entityRelationshipType = entityRelationshipType;
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

	public Integer getEntityId() {
		return entityId;
	}

	public void setEntityId(Integer entityId) {
		this.entityId = entityId;
	}

	public String getUpdateUserFullName() {
		return updateUserFullName;
	}

	public void setUpdateUserFullName(String updateUserFullName) {
		this.updateUserFullName = updateUserFullName;
	}
}
