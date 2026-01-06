package com.polus.fibicomp.compliance.declaration.pojo;

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
@Table(name = "COI_DECLARATION_TYPE")
@Getter
@Setter
public class CoiDeclarationType {

	@Id
	@Column(name = "DECLARATION_TYPE_CODE")
	private String declarationTypeCode;

	@Column(name = "DESCRIPTION")
	private String declarationType;

	@Column(name = "BADGE_COLOR")
	private String badgeColor;

	@Column(name = "PROJECT_ICON")
	private String projectIcon;

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
