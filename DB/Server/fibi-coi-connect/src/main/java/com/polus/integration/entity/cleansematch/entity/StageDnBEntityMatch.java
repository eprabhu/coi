package com.polus.integration.entity.cleansematch.entity;



import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "GE_STAGE_ENTITY_DNB_MATCH")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageDnBEntityMatch {

	   @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "ID")
	    private Integer id;

	    @Column(name = "SOURCE_DATA_CODE", nullable = false)
	    private String sourceDataCode;

	    @Column(name = "SOURCE_DATA_NAME")
	    private String sourceDataName;

	    @Column(name = "SOURCE_DUNS_NUMBER")
	    private String sourceDunsNumber;

	    @Column(name = "SOURCE_TYPE_CODE")
	    private String sourceTypeCode;

	    @Column(name = "CAGE_NUMBER")
	    private String cageNumber;

	    @Column(name = "UEI")
	    private String uei;

	    @Column(name = "EMAIL_ADDRESS")
	    private String emailAddress;

	    @Column(name = "ADDRESS_LINE_1")
	    private String addressLine1;

	    @Column(name = "ADDRESS_LINE_2")
	    private String addressLine2;

	    @Column(name = "POSTAL_CODE")
	    private String postalCode;

	    @Column(name = "STATE")
	    private String state;

	    @Column(name = "COUNTRY_CODE")
	    private String countryCode;

	    @Column(name = "API_NAME")
	    private String apiName;

	    @Column(name = "INTEGRATION_STATUS_CODE")
	    private String integrationStatusCode;

	    @Column(name = "REQUEST", columnDefinition = "TEXT")
	    private String request;

	    @Column(name = "RESPONSE", columnDefinition = "TEXT")
	    private String response;

	    @Column(name = "SELECTED_DUNS_NUMBERS")
	    private String selectedDunsNumbers;

	    @Column(name = "CANDIDATE_MATCHED_QUANTITY")
	    private Integer candidateMatchedQuantity;

	    @Column(name = "MATCHED_RESULTS", columnDefinition = "JSON")
	    private String matchedResults;

	    @Column(name = "BEST_MATCH_RESULT", columnDefinition = "JSON")
	    private String bestMatchResult;

	    @Column(name = "BEST_MATCH_CONFIDENCE_CODE")
	    private Integer bestMatchConfidenceCode;

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

	    @Column(name = "CREATE_TIMESTAMP", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
	    private LocalDateTime createTimestamp;

	    @Column(name = "CREATED_BY")
	    private String createdBy;

	    @Column(name = "UPDATE_TIMESTAMP", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
	    private LocalDateTime updateTimestamp;

	    @Column(name = "UPDATED_BY")
	    private String updatedBy;

	   
}
