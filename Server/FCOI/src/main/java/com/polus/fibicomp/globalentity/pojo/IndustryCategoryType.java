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
@Table(name = "INDUSTRY_CATEGORY_TYPE")
public class IndustryCategoryType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "INDUSTRY_CATEGORY_TYPE_CODE")
	private String industryCategoryTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "IS_PRIMARY")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrimary;

	@Column(name = "SOURCE")
	private String source;

}
