package com.polus.fibicomp.opa.pojo;

import com.polus.core.roles.pojo.AdminGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;


@Entity
@Table(name = "OPA_REVIEW")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class OPAReview implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "OPA_REVIEW_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaReviewId;

	@Column(name = "ASSIGNEE_PERSON_ID")
	private String assigneePersonId;

	@Column(name = "OPA_DISCLOSURE_ID")
	private Integer opaDisclosureId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_REVIEW_FK1"), name = "OPA_DISCLOSURE_ID",
			referencedColumnName = "OPA_DISCLOSURE_ID", insertable = false, updatable = false)
	private OPADisclosure opaDisclosure;
	
	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_REVIEW_FK2"), name = "ADMIN_GROUP_ID", referencedColumnName = "ADMIN_GROUP_ID", insertable = false, updatable = false)
	private AdminGroup adminGroup;

	@Column(name = "REVIEW_STATUS_TYPE_CODE")
	private String reviewStatusTypeCode ;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_REVIEW_FK3"), name = "REVIEW_STATUS_TYPE_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private OPAReviewReviewerStatusType reviewStatusType;

	@Column(name = "LOCATION_TYPE_CODE")
	private String locationTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_REVIEW_FK4"), name = "LOCATION_TYPE_CODE", referencedColumnName = "LOCATION_TYPE_CODE", insertable = false, updatable = false)
	private OPAReviewLocationType reviewLocationType;
	
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
	private String updateUserFullName;

	@Transient
	private String assigneePersonName;

	@Transient
	private String currentReviewStatusTypeCode;

	@Transient
	private String currentLocationTypeCode;

}
