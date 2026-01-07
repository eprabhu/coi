package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;

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
import javax.persistence.Transient;

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.core.roles.pojo.AdminGroup;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiReviewerStatusType;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "COI_REVIEW")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class CoiReview implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_REVIEW_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiReviewId;

	@Column(name = "ASSIGNEE_PERSON_ID")
	private String assigneePersonId;

	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_FK2"), name = "DISCLOSURE_ID", referencedColumnName = "DISCLOSURE_ID", insertable = false, updatable = false)
	private CoiDisclosure coiDisclosure;
	
	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_FK3"), name = "ADMIN_GROUP_ID", referencedColumnName = "ADMIN_GROUP_ID", insertable = false, updatable = false)
	private AdminGroup adminGroup;

	@Column(name = "REVIEW_STATUS_TYPE_CODE")
	private String reviewStatusTypeCode ;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_FK4"), name = "REVIEW_STATUS_TYPE_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private CoiReviewerStatusType reviewerStatusType;

	@Column(name = "LOCATION_TYPE_CODE")
	private String locationTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_FK5"), name = "LOCATION_TYPE_CODE", referencedColumnName = "LOCATION_TYPE_CODE", insertable = false, updatable = false)
	private CoiReviewLocationType reviewLocationType;
	
	@Column(name = "DESCRIPTION")
	private String description ;

	@Column(name = "START_DATE")
	private Date startDate;

	@Column(name = "END_DATE")
	private Date endDate;
	
	@CreatedDate
	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@CreatedBy
	@Column(name = "CREATE_USER")
	private String createUser;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;
	
	@Transient
	private String assigneePersonName;

	@Transient
	private String currentReviewStatusTypeCode;

	@Transient
	private String currentLocationTypeCode;

	@Transient
	private String updateUserFullName;

}
