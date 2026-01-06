package com.polus.integration.entity.cleansematch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ENTITY_OWNERSHIP_TYPE")
public class EntityOwnershipType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "OWNERSHIP_TYPE_CODE")
	private String ownershipTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

}
