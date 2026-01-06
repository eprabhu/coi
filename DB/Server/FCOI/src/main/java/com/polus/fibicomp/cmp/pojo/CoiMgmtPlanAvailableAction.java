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
@Table(name = "COI_MGMT_PLAN_AVAILABLE_ACTION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiMgmtPlanAvailableAction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "AVAILABLE_ACTION_ID")
	private Integer availableActionId;

	@Column(name = "STATUS_CODE")
	private String statusCode;

	@ManyToOne
	@JoinColumn(name = "STATUS_CODE", referencedColumnName = "STATUS_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_AVAILABLE_ACTION_FK1"))
	private CoiManagementPlanStatusType coiManagementPlanStatusType;

	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_MGMT_PLAN_AVAILABLE_ACTION_FK2"))
	private CoiManagementPlanActionType coiMgmtPlanActionType;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "SORT_ORDER")
	private Integer sortOrder;

}
