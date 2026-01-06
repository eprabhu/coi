package com.polus.integration.instituteProposal.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "COI_INT_STAGE_PROPOSAL")
public class COIIntInstituteProposal implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "STAGE_PROPOSAL_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stageProposalId;
   
    @Column(name = "PROJECT_ID")
    private String projectId;
   
    @Column(name = "PROJECT_NUMBER")
    private String projectNumber;

    @Column(name = "VERSION_NUMBER")
    private Integer versionNumber;

    @Column(name = "LINKED_AWARD_PROJECT_NUMBER")
    private String linkedAwardProjectNumber;

    @Column(name = "SPONSOR_GRANT_NUMBER")
    private String sponsorGrantNumber;

    @Column(name = "LEAD_UNIT_NUMBER")
    private String leadUnitNumber;

    @Column(name = "LEAD_UNIT_NAME")
    private String leadUnitName;

    @Column(name = "PROJECT_START_DATE")
    private Date projectStartDate;

    @Column(name = "PROJECT_END_DATE")
    private Date projectEndDate;

    @Column(name = "PROJECT_TYPE_CODE")
    private String projectTypeCode;

    @Column(name = "PROJECT_TYPE")
    private String projectType;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "PROJECT_STATUS_CODE")
    private String projectStatusCode;

    @Column(name = "PROJECT_STATUS")
    private String projectStatus;

    @Column(name = "SPONSOR_CODE")
    private String sponsorCode;

    @Column(name = "SPONSOR_NAME")
    private String sponsorName;

    @Column(name = "PRIME_SPONSOR_CODE")
    private String primeSponsorCode;

    @Column(name = "PRIME_SPONSOR_NAME")
    private String primeSponsorName;

    @Column(name = "DOCUMENT_URL")
    private String documentUrl;

    @Column(name = "FIRST_FED_TIMESTAMP")
    private Timestamp firstFedTimestamp;

    @Column(name = "LAST_FED_TIMESTAMP")
    private Timestamp lastFedTimestamp;

    @Column(name = "SRC_SYS_UPDATE_TIMESTAMP")
    private Timestamp srcSysUpdateTimestamp;

    @Column(name = "SRC_SYS_UPDATED_BY")
    private String srcSysUpdatedBy;

    @Column(name = "ATTRIBUTE_1_LABEL")
    private String attribute1Label;

    @Column(name = "ATTRIBUTE_1_VALUE")
    private String attribute1Value;

    @Column(name = "ATTRIBUTE_2_LABEL")
    private String attribute2Label;

    @Column(name = "ATTRIBUTE_2_VALUE")
    private String attribute2Value;

    @Column(name = "ATTRIBUTE_3_LABEL")
    private String attribute3Label;

    @Column(name = "ATTRIBUTE_3_VALUE")
    private String attribute3Value;

    @Column(name = "ATTRIBUTE_4_LABEL")
    private String attribute4Label;

    @Column(name = "ATTRIBUTE_4_VALUE")
    private String attribute4Value;

    @Column(name = "ATTRIBUTE_5_LABEL")
    private String attribute5Label;

    @Column(name = "ATTRIBUTE_5_VALUE")
    private String attribute5Value;
}
