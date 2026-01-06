package com.polus.integration.entity.cleansematch.entity;

import com.polus.integration.config.JpaCharBooleanConversion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Timestamp;
import java.util.Date;

@Entity
@Table(name = "ENTITY_STAGE_DETAILS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityStageDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_STAGE_DETAIL_ID")
    private Integer entityStageDetailId;

    @Column(name = "SRC_DATA_TYPE_CODE")
    private String srcTypeCode;

    @Column(name = "BATCH_ID")
    private Integer batchId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_DETAILS_FK1"), name = "BATCH_ID", referencedColumnName = "BATCH_ID", insertable = false, updatable = false)
    private EntityStageBatch batch;

    @Column(name = "SRC_DATA_CODE", nullable = false)
    private String srcDataCode;

    @Column(name = "SRC_DATA_NAME")
    private String srcDataName;

    @Column(name = "SRC_ACRONYM")
    private String srcAcronym;

    @Column(name = "SRC_DUNS_NUMBER")
    private String srcDunsNumber;

    @Column(name = "SRC_CAGE_NUMBER")
    private String srcCageNumber;

    @Column(name = "SRC_UEI")
    private String srcUei;

    @Column(name = "SRC_PHONE_NUMBER")
    private String srcPhoneNumber;

    @Column(name = "SRC_EMAIL_ADDRESS")
    private String srcEmailAddress;

    @Column(name = "SRC_ADDRESS_LINE_1")
    private String srcAddressLine1;

    @Column(name = "SRC_ADDRESS_LINE_2")
    private String srcAddressLine2;

    @Column(name = "SRC_POSTAL_CODE")
    private String srcPostalCode;

    @Column(name = "SRC_CITY")
    private String srcCity;

    @Column(name = "SRC_STATE")
    private String srcState;

    @Column(name = "SRC_COUNTRY_CODE")
    private String srcCountryCode;

    @Column(name = "SRC_WEBSITE")
    private String srcWebsite;

    @Column(name = "SRC_API_NAME")
    private String srcApiName;

    @Column(name = "SRC_SAM_EXPIRATION_DATE")
    private Date srcSamExpirationDate;

    @Column(name = "SRC_RISK_ASSMT_DATE")
    private Date srcRiskAssmtDate;

    @Column(name = "SRC_HUMAN_SUB_ASSURANCE")
    private String srcHumanSubAssurance;

    @Column(name = "SRC_ANIMAL_WELFARE_ASSURANCE")
    private String srcAnimalWelfareAssurance;

    @Column(name = "SRC_ANIMAL_ACCREDITATION")
    private String srcAnimalAccreditation;

    @Column(name = "SRC_RISK_LEVEL_CODE")
    private String srcRiskLevelCode;

    @Column(name = "INTEGRATION_STATUS_CODE")
    private String integrationStatusCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_DETAILS_FK2"), name = "INTEGRATION_STATUS_CODE", referencedColumnName = "INTEGRATION_STATUS_CODE", insertable = false, updatable = false)
    private EntityStageIntStatusType integrationStatusType;

    @Column(name = "MATCH_STATUS_CODE")
    private Integer matchStatusCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_DETAILS_FK3"), name = "MATCH_STATUS_CODE", referencedColumnName = "MATCH_STATUS_CODE", insertable = false, updatable = false)
    private EntityStageMatchStatusType matchStatusType;

    @Column(name = "ADMIN_REVIEW_STATUS_CODE")
    private Integer adminReviewStatusCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_DETAILS_FK4"), name = "ADMIN_REVIEW_STATUS_CODE", referencedColumnName = "ADMIN_REVIEW_STATUS_CODE", insertable = false, updatable = false)
    private EntityStageAdminReviewStatusType adminReviewStatusType;

    @Column(name = "ADMIN_ACTION_CODE")
    private Integer adminActionCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_DETAILS_FK5"), name = "ADMIN_ACTION_CODE", referencedColumnName = "ADMIN_ACTION_CODE", insertable = false, updatable = false)
    private EntityStageAdminActionType adminActionType;

    @Column(name = "GROUP_NUMBER")
    private Integer groupNumber;

    @Column(name = "IS_DUPLICATE_IN_SRC")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isDuplicateInSrc;

    @Column(name = "IS_SYSTEM_DUPLICATE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isSystemDuplicate;

    @Column(name = "ORIGINATING_ID")
    private Integer originatingId;

    @Column(name = "ENTITY_ID")
    private Integer entityId;

    @Column(name = "API_REQUEST", columnDefinition = "TEXT")
    private String apiRequest;

    @Column(name = "API_RESPONSE", columnDefinition = "TEXT")
    private String apiResponse;

    @Column(name = "SELECTED_DUNS_NUMBERS")
    private String selectedDunsNumbers;

    @Column(name = "CANDIDATE_MATCHED_QUANTITY")
    private Integer candidateMatchedQuantity;

    @Column(name = "DUNS_MATCHED_RESULTS", columnDefinition = "JSON")
    private String dunsMatchedResults;

    @Column(name = "HIGHEST_CONFIDENCE_CODE")
    private Integer highestConfidenceCode;

    @Column(name = "HTTP_STATUS_CODE")
    private String httpStatusCode;

    @Column(name = "EXTERNAL_SYS_TRANSACTION_ID")
    private String externalSysTransactionId;

    @Column(name = "ERROR_CODE")
    private String errorCode;

    @Column(name = "ERROR_MESSAGE")
    private String errorMessage;

    @Column(name = "ERROR_DETAILS", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "SRC_COMMENTS")
    private String srcComments;

    @Column(name = "CREATE_TIMESTAMP")
    @CreatedDate
    private Timestamp createTimestamp;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "UPDATE_TIMESTAMP")
    @LastModifiedDate
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "SRC_ROLODEX_ID")
    private Integer srcRolodexId;

    @Transient
    private Boolean canReReview;

}
