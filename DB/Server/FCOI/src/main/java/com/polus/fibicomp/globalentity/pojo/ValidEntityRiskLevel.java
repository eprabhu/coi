package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "VALID_ENTITY_RISK_LEVEL")
public class ValidEntityRiskLevel implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "VALID_ENTITY_RISK_LVL_ID")
	private String validEntityRiskLvlId;

	@Column(name = "RISK_TYPE_CODE")
	private String riskTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "VALID_ENTITY_RISK_LVL_FK1"), name = "RISK_TYPE_CODE", referencedColumnName = "RISK_TYPE_CODE", insertable = false, updatable = false)
	private EntityRiskType entityRiskType;

	@Column(name = "RISK_LEVEL_CODE")
	private String riskLevelCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "VALID_ENTITY_RISK_LVL_FK2"), name = "RISK_LEVEL_CODE", referencedColumnName = "RISK_LEVEL_CODE", insertable = false, updatable = false)
	private EntityRiskLevel entityRiskLevel;

}
