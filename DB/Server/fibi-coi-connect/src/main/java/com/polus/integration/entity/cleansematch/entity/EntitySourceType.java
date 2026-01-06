package com.polus.integration.entity.cleansematch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Data
@Table(name = "ENTITY_SOURCE_TYPE")
public class EntitySourceType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ENTITY_SOURCE_TYPE_CODE")
	private String entitySourceTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "IS_ACTIVE")
	private Boolean isActive;

}
