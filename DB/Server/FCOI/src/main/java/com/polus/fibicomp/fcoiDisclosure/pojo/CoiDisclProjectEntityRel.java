package com.polus.fibicomp.fcoiDisclosure.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
//import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.polus.fibicomp.coi.dto.PersonEntityRelationshipDto;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.coi.pojo.CoiProjConflictStatusType;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@javax.persistence.Entity
@Table(name = "COI_DISCL_PROJECT_ENTITY_REL")
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiDisclProjectEntityRel implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_DISCL_PROJECT_ENTITY_REL_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiDisclProjectEntityRelId;
	
	@Column(name = "COI_DISCL_PROJECTS_ID")
	private Integer coiDisclProjectId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PROJECT_ENTITY_REL_FK1"), name = "COI_DISCL_PROJECTS_ID", referencedColumnName = "COI_DISCL_PROJECTS_ID", insertable = false, updatable = false)
	private CoiDisclProjects coiDisclProject;

	
	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PROJECT_ENTITY_REL_FK2"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;

	@Column(name = "PREVIOUS_PERSON_ENTITY_ID")
	private Integer prePersonEntityId;
	
	@Column(name = "ENTITY_ID")
	private Integer entityId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PROJECT_ENTITY_REL_FK3"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity coiEntity;
	
//	@Column(name = "ENTITY_NUMBER")
//	private Integer entityNumber;
	
	@Column(name = "PROJECT_CONFLICT_STATUS_CODE")
	private String projectConflictStatusCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PROJECT_ENTITY_REL_FK4"), name = "PROJECT_CONFLICT_STATUS_CODE", referencedColumnName = "PROJECT_CONFLICT_STATUS_CODE", insertable = false, updatable = false)
	private CoiProjConflictStatusType coiProjConflictStatusType;
	
	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "PROJECT_ENGAGEMENT_DETAILS")
	private String projectEngagementDetails;

	@Transient
	private Integer disclosureId;

	@Transient
	private Integer disclosureNumber;

	@Transient
	private PersonEntityRelationshipDto personEntityRelationshipDto;
	@Transient
	private String projectTypeCode;
	@Transient
	private String projectType;
	@Transient
	private String projectBadgeColour;
	@Transient
	private String projectId;
	@Transient
	private String projectNumber;
	@Transient
	private String projectTitle;
	@Transient
	private Integer moduleCode;

}
