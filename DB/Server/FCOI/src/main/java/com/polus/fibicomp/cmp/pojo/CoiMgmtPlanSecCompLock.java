package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name = "COI_MGMT_PLAN_SEC_COMP_LOCK")
public class CoiMgmtPlanSecCompLock {

	@Id
	@Column(name = "SEC_COMP_ID")
	private Integer secCompId;

	@Column(name = "LOCKED_BY", nullable = false)
	private String lockedBy;

	@Column(name = "LOCKED_AT", nullable = false)
	private Timestamp lockedAt;

}
