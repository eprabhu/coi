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
@Table(name = "COI_REVIEW_STATUS_HISTORY")
@EntityListeners(AuditingEntityListener.class)
public class CoiReviewStatusHistory implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_REVIEW_STATUS_HISTORY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiReviewStatusHistoryId;

	@Column(name = "COI_REVIEW_STATUS_CODE")
	private String coiReviewStatusCode;

	@Column(name = "COI_REVIEW_ID")
	private Integer coiReviewId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_STATUS_HISTORY_FK1"), name = "COI_REVIEW_ID", referencedColumnName = "COI_REVIEW_ID", insertable = false, updatable = false)
	private CoiReview coiReview;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	public Integer getCoiReviewStatusHistoryId() {
		return coiReviewStatusHistoryId;
	}

	public void setCoiReviewStatusHistoryId(Integer coiReviewStatusHistoryId) {
		this.coiReviewStatusHistoryId = coiReviewStatusHistoryId;
	}

	public String getCoiReviewStatusCode() {
		return coiReviewStatusCode;
	}

	public void setCoiReviewStatusCode(String coiReviewStatusCode) {
		this.coiReviewStatusCode = coiReviewStatusCode;
	}

	public Integer getCoiReviewId() {
		return coiReviewId;
	}

	public void setCoiReviewId(Integer coiReviewId) {
		this.coiReviewId = coiReviewId;
	}

	public CoiReview getCoiReview() {
		return coiReview;
	}

	public void setCoiReview(CoiReview coiReview) {
		this.coiReview = coiReview;
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

}
