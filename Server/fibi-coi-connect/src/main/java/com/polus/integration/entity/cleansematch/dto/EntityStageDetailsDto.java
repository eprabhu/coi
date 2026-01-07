package com.polus.integration.entity.cleansematch.dto;


import com.polus.integration.entity.cleansematch.entity.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Builder
@Data
public class EntityStageDetailsDto {

    private Integer entityStageDetailId;
    private String srcTypeCode;
    private Integer batchId;
    private String srcDataCode;
    private String srcDataName;
    private String srcDunsNumber;
    private String srcCageNumber;
    private String srcUei;
    private String srcEmailAddress;
    private String srcPhoneNumber;
    private String srcAddressLine1;
    private String srcAddressLine2;
    private String srcPostalCode;
    private String srcState;
    private String srcStateCode;
    private String srcCity;
    private String srcCountryCode;
    private CountryDto srcCountry;
    private String srcApiName;
    private String integrationStatusCode;
    private EntityStageIntStatusType integrationStatusType;
    private Integer matchStatusCode;
    private EntityStageMatchStatusType matchStatusType;
    private Integer adminReviewStatusCode;
    private EntityStageAdminReviewStatusType adminReviewStatusType;
    private Integer adminActionCode;
    private EntityStageAdminActionType adminActionType;
    private Integer groupNumber;
    private Boolean isDuplicateInSrc;
    private Integer entityId;
    private String selectedDunsNumbers;
    private Integer candidateMatchedQuantity;
    private Integer highestConfidenceCode;
    private LocalDateTime createTimestamp;
    private String createdBy;
    private LocalDateTime updateTimestamp;
    private String updatedBy;
    private Boolean isExactDunsMatch;
    private Boolean isMultipleDunsMatch;
    private Boolean isNoDunsMatch;
    private Boolean isDuplicateInBatch;
    private Boolean isDuplicateInEntitySys;
    private Boolean createWithDuns;
    private String srcHumanSubAssurance;
    private String srcAnimalWelfareAssurance;
    private String srcAnimalAccreditation;
    private Integer entityOwnershipTypeCode;
    private Integer originatingId;
    private Boolean canReReview;

}
