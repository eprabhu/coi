package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Convert;
//import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Unit;
import com.polus.core.util.JpaCharBooleanConversion;
import com.polus.fibicomp.coi.dto.PersonEntityRelationshipDto;
import com.polus.fibicomp.globalentity.pojo.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Table(name = "PERSON_ENTITY")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonEntity implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	@Id
	@Column(name = "PERSON_ENTITY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer personEntityId;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;
	
	@Column(name = "PERSON_ID")
	private String personId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_FK1"), name = "PERSON_ID", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;
	
	@Column(name = "ENTITY_ID")
	private Integer entityId;
	
	@ManyToOne(optional = true, cascade = CascadeType.REFRESH)
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_FK2"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity coiEntity;
	
	@Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;
	
	@Column(name = "IS_FORM_COMPLETED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isFormCompleted;
	
	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;
	
	@Column(name = "VERSION_STATUS")
	private String versionStatus;
	
	@Column(name = "SPONSORS_RESEARCH")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean sponsorsResearch;
	
	@Column(name = "INVOLVEMENT_START_DATE")
	private Date involvementStartDate;

	@Column(name = "INVOLVEMENT_END_DATE")
	private Date involvementEndDate;
	
	@Column(name = "STUDENT_INVOLVEMENT")
	private String studentInvolvement;

	@Column(name = "STAFF_INVOLVEMENT")
	private String staffInvolvement;
	
	@Column(name = "INSTITUTE_RESOURCE_INVOLVEMENT")
	private String instituteResourceInvolvement;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;
	
	@CreatedBy
	@Column(name = "CREATE_USER")
	private String createUser;

	@CreatedDate
	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

	@Column(name = "REVISION_REASON")
	private String revisionReason;

	@Column(name = "IS_COMPENSATED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isCompensated;

	@Column(name = "IS_COMMITMENT")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isCommitment;

	@Column(name = "COMPENSATION_AMOUNT")
	private BigDecimal compensationAmount;

	@Column(name = "IS_SIGNIFICANT_FIN_INTEREST")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isSignificantFinInterest;

	@Column(name = "TRAVEL_REIMBURSEMENT_AMOUNT")
	private BigDecimal travelReimbursementAmount;

	@Column(name = "SFI_REASON")
	private String sfiReason;

	@Transient
	private List<PersonEntityRelationship> personEntityRelationships;
	
	@Transient
	private List<ValidPersonEntityRelType> validPersonEntityRelTypes;

	@Transient
	private List<Integer> validPersonEntityRelTypeCodes;

	@Transient
	private List<String> perEntDisclTypeSelection;

	@Transient
	private  String personFullName;
	
	@Transient
	private Unit unit;
	
	@Transient
	private  String relationshipTypes;
	
	@Transient
	private  String designation;

	@Transient
	private String updateUserFullName;

	@Transient
	private PersonEntityRelationshipDto personEntityRelationshipDto;
	@Transient
	private Integer disclosureId;

	@Transient
	private Boolean canDelete;

	@Transient
	private Boolean sfiCompleted;

	@Transient
	private List<Map<Object, Object>> disclosureStatusCount;

	@Transient
	private List<PerEntDisclTypeSelection> perEntDisclTypeSelections;

}
