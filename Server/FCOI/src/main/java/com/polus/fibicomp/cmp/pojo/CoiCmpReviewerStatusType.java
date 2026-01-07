package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Table(name = "COI_CMP_REVIEWER_STATUS_TYPE")
@Data
public class CoiCmpReviewerStatusType {

	@Id
	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "IS_ACTIVE")
	private String isActive;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
