package com.polus.fibicomp.cmp.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name = "COI_MGMT_PLAN_ACTION_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiMgmtPlanActionLog implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "CMP_ACTION_LOG_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer cmpActionLogId;

	@Column(name = "CMP_ID", nullable = false)
	private Integer cmpId;

	@Column(name = "CMP_NUMBER")
	private Integer cmpNumber;

	@ManyToOne(optional = false)
	@JoinColumn(name = "CMP_ID", referencedColumnName = "CMP_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_ACTION_LOG_FK2"))
	private CoiManagementPlan cmp;

	@Column(name = "ACTION_TYPE_CODE", nullable = false)
	private String actionTypeCode;

	@ManyToOne
	@JoinColumn(name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_ACTION_LOG_FK1"))
	private CoiManagementPlanActionType actionType;

	@Column(name = "DESCRIPTION", nullable = false, length = 500)
	private String description;

	@Column(name = "COMMENTS", length = 4000)
	private String comments;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;
}
