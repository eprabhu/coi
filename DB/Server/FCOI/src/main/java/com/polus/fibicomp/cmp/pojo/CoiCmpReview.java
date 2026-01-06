package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.person.pojo.Person;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_CMP_REVIEW")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiCmpReview {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "CMP_REVIEW_ID")
	private Integer cmpReviewId;

	@Column(name = "CMP_ID")
	private Integer cmpId;

	@Column(name = "ASSIGNEE_PERSON_ID")
	private String assigneePersonId;

	@ManyToOne
	@JoinColumn(name = "ASSIGNEE_PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_CMP_REVIEW_FK_ASSIGNEE"))
	private Person assigneePerson;

	@Column(name = "REVIEW_STATUS_TYPE_CODE")
	private String reviewStatusTypeCode;

	@ManyToOne
	@JoinColumn(name = "REVIEW_STATUS_TYPE_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_CMP_REVIEW_FK_STATUS"))
	private CoiCmpReviewerStatusType reviewStatusType;

	@Column(name = "LOCATION_TYPE_CODE")
	private String locationTypeCode;

	@ManyToOne
	@JoinColumn(name = "LOCATION_TYPE_CODE", referencedColumnName = "LOCATION_TYPE_CODE", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "COI_CMP_REVIEW_FK_LOCATION"))
	private CoiCmpReviewLocationType locationType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "START_DATE")
	private Date startDate;

	@Column(name = "END_DATE")
	private Date endDate;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "CREATED_BY")
	private String createdBy;

}
