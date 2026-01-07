package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

}
