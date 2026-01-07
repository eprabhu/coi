package com.polus.fibicomp.compliance.declaration.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "COI_DECLARATION_STATUS")
@Getter
@Setter
public class CoiDeclarationStatus implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "DECLARATION_STATUS_CODE")
	private String declarationStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
