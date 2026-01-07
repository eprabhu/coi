package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MGMT_PLAN_PROJ_REL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanProjectRel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "COI_MGMT_PLAN_PROJ_REL_ID")
	private Integer coiMgmtPlanProjRelId;

	@Column(name = "CMP_ID")
	private Integer cmpId;

	@ManyToOne
	@JoinColumn(name = "CMP_ID", referencedColumnName = "CMP_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_PROJ_REL_FK1"))
	private CoiManagementPlan coiManagementPlan;

	@Column(name = "MODULE_CODE")
	private Integer moduleCode;

	@Column(name = "MODULE_ITEM_KEY")
	private String moduleItemKey;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
