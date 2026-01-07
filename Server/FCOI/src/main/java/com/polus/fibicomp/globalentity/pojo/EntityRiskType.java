package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.Data;

@Entity
@Data
@Table(name = "ENTITY_RISK_TYPE")
public class EntityRiskType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "RISK_TYPE_CODE")
	private String riskTypeCode;

	@Column(name = "RISK_CATEGORY_CODE")
	private String riskCategoryCode;

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
