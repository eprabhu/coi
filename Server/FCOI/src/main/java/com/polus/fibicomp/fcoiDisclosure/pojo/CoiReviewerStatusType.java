package com.polus.fibicomp.fcoiDisclosure.pojo;

import com.polus.core.util.JpaCharBooleanConversion;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "COI_REVIEWER_STATUS_TYPE")
public class CoiReviewerStatusType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "SORT_ORDER")
	private String sortOrder;

	public String getReviewStatusCode() {
		return reviewStatusCode;
	}

	public void setReviewStatusCode(String reviewStatusCode) {
		this.reviewStatusCode = reviewStatusCode;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}


	public String getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(String sortOrder) {
		this.sortOrder = sortOrder;
	}
}
