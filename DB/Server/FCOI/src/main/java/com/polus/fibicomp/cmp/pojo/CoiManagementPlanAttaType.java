package com.polus.fibicomp.cmp.pojo;

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
@Table(name = "COI_MANAGEMENT_PLAN_ATTA_TYPE")
@Data
public class CoiManagementPlanAttaType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ATTA_TYPE_CODE")
	private String attaTypeCode;

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