package com.polus.fibicomp.mig.eng.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "LEGACY_COI_ENGAGEMENTS")
public class LegacyCoiEngagements implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENGAGEMENT_ID", nullable = false)
    private Integer engagementId;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "ENTITY_NUMBER")
    private String entityNumber;

    @Column(name = "SEQUENCE_NUMBER")
    private Integer sequenceNumber;

    @Column(name = "STATUS_CODE")
    private Integer statusCode;

    @Column(name = "ENTITY_NAME")
    private String entityName;

    @Column(name = "ENTITY_TYPE_CODE")
    private Integer entityTypeCode;

    @Column(name = "ENTITY_OWNERSHIP_TYPE")
    private String entityOwnershipType;

    @Column(name = "RELATIONSHIP_DESCRIPTION")
    private String relationshipDescription;

    @Column(name = "STUDENT_INVOLVEMENT")
    private String studentInvolvement;

    @Column(name = "STAFF_INVOLVEMENT")
    private String staffInvolvement;

    @Column(name = "INST_RESOURCE_INVOLVEMENT")
    private String instResourceInvolvement;

    @Column(name = "IS_TRAVEL")
    private String isTravel;

    @Column(name = "IS_FOUNDER")
    private String isFounder;

    @Column(name = "MIGRATION_STATUS")
    private Integer migrationStatus;

    @Column(name = "FIBI_COI_ENGAGEMENT_ID")
    private Integer fibiCoiEngagementId;

    @Column(name = "FIBI_COI_ENTITY_ID")
    private Integer fibiCoiEntityId;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;
    
}
