package com.polus.fibicomp.coi.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_ENTITY_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoiEntityType {

	@Id
	@Column(name = "ENTITY_TYPE_CODE", length = 3, nullable = false)
	private String entityTypeCode;

	@Column(name = "DESCRIPTION", length = 2000)
	private String description;

	@Column(name = "IS_ACTIVE", length = 1, nullable = false)
	private String isActive = "Y";

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER", length = 60)
	private String updateUser;
}
