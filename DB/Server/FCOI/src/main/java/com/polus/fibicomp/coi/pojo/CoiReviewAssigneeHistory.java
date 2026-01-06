package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "COI_REVIEW_ASSIGNEE_HISTORY")
@EntityListeners(AuditingEntityListener.class)
public class CoiReviewAssigneeHistory implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_REVIEW_ASSIGNEE_HISTORY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiReviewAssigneeHistoryId;

	@Column(name = "ASSIGNEE_PERSON_ID")
	private String assigneePersonId;

	@Column(name = "COI_REVIEW_ID")
	private Integer coiReviewId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_ASSIGNEE_HST_FK1"), name = "COI_REVIEW_ID", referencedColumnName = "COI_REVIEW_ID", insertable = false, updatable = false)
	private CoiReview coiReview;
	
	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@Column(name = "ASSIGNEE_TYPE")
	private String assigneeType;
	
	@Column(name = "COI_REVIEW_ACTIVITY_ID")
	private String coiReviewActivityId;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	public Integer getCoiReviewAssigneeHistoryId() {
		return coiReviewAssigneeHistoryId;
	}

	public void setCoiReviewAssigneeHistoryId(Integer coiReviewAssigneeHistoryId) {
		this.coiReviewAssigneeHistoryId = coiReviewAssigneeHistoryId;
	}

	public String getAssigneePersonId() {
		return assigneePersonId;
	}

	public void setAssigneePersonId(String assigneePersonId) {
		this.assigneePersonId = assigneePersonId;
	}

	public Integer getCoiReviewId() {
		return coiReviewId;
	}

	public void setCoiReviewId(Integer coiReviewId) {
		this.coiReviewId = coiReviewId;
	}

	public Integer getAdminGroupId() {
		return adminGroupId;
	}

	public void setAdminGroupId(Integer adminGroupId) {
		this.adminGroupId = adminGroupId;
	}

	public String getAssigneeType() {
		return assigneeType;
	}

	public void setAssigneeType(String assigneeType) {
		this.assigneeType = assigneeType;
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

	public CoiReview getCoiReview() {
		return coiReview;
	}

	public void setCoiReview(CoiReview coiReview) {
		this.coiReview = coiReview;
	}

	public String getCoiReviewActivityId() {
		return coiReviewActivityId;
	}

	public void setCoiReviewActivityId(String coiReviewActivityId) {
		this.coiReviewActivityId = coiReviewActivityId;
	}

}
