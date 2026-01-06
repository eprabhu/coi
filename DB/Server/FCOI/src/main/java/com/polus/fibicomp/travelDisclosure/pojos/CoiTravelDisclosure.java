package com.polus.fibicomp.travelDisclosure.pojos;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.polus.fibicomp.coi.pojo.PersonEntity;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Unit;
import com.polus.core.util.JpaCharBooleanConversion;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiRiskCategory;
import com.polus.fibicomp.globalentity.pojo.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Table(name = "COI_TRAVEL_DISCLOSURE")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiTravelDisclosure implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "TRAVEL_DISCLOSURE_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer travelDisclosureId;
	
	@Column(name = "TRAVEL_NUMBER")
	private Integer travelNumber;
	
	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;
	
	@Column(name = "VERSION_STATUS")
	private String versionStatus;
	
	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK1"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;
	
	@Column(name = "ENTITY_ID")
	private Integer entityId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK2"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity Entity;
	
	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;
	
	@Column(name = "PERSON_ID")
	private String personId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK3"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;

	@Column(name = "HOME_UNIT")
	private String travellerHomeUnit;

	@Column(name = "TRAVEL_TITLE")
	private String travelTitle;

	@Column(name = "PURPOSE_OF_THE_TRIP")
	private String purposeOfTheTrip;

	@Column(name = "RELATIONSHIP_TO_PHS_DOE")
	private String relationshipToPhsDoe;

	@Column(name = "FUNDING_TYPE_CODE")
	private String travelerFundingTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK5"), name = "FUNDING_TYPE_CODE",
			referencedColumnName = "FUNDING_TYPE_CODE", insertable = false, updatable = false)
	private CoiTravelFundingType travelFundingType;

//	@OneToMany(mappedBy = "coiTravelDisclosure", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
//	private List<CoiTravelDisclosureTraveler> travelers;
//
//	@OneToMany(mappedBy = "coiTravelDisclosure", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
//	private List<CoiTravelDestinations> travelDestinations;
//
//	@OneToMany(mappedBy = "coiTravelDisclosure", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
//	private List<CoiTravelFundingAgencies> travelFundingAgencies;

	@Column(name = "TRAVEL_STATUS_CODE")
	private String travelStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK4"), name = "TRAVEL_STATUS_CODE", referencedColumnName = "TRAVEL_STATUS_CODE", insertable = false, updatable = false)
	private CoiTravelerStatusType coiTravelerStatusType;

	@Column(name = "REIMBURSED_COST")
	private BigDecimal reimbursedCost;

	@Column(name = "TRAVEL_START_DATE")
	private Date travelStartDate;

	@Column(name = "TRAVEL_END_DATE")
	private Date travelEndDate;

	@Column(name = "SUBMISSION_DATE")
	private Timestamp travelSubmissionDate;

	@Column(name = "ADMIN_GROUP_ID")
	private Integer adminGroupId;

	@Column(name = "ADMIN_PERSON_ID")
	private String adminPersonId;

	@Column(name = "CERTIFIED_BY")
	private String certifiedBy;

	@Column(name = "CERTIFIED_AT")
	private Timestamp certifiedAt;

	@Column(name = "CERTIFICATION_TEXT")
	private String certificationText;

	@Column(name = "EXPIRATION_DATE")
	private Timestamp expirationDate;

	@Column(name = "DOCUMENT_STATUS_CODE")
	private String documentStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK6"), name = "DOCUMENT_STATUS_CODE",
			referencedColumnName = "DOCUMENT_STATUS_CODE", insertable = false, updatable = false)
	private CoiTravelDocumentStatusType travelDocumentStatusType;

	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_FK7"), name = "REVIEW_STATUS_CODE",
			referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
	private CoiTravelReviewStatusType travelReviewStatusType;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@CreatedBy
	@Column(name = "CREATED_BY")
	private String createdBy;

	@CreatedDate
	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

}
