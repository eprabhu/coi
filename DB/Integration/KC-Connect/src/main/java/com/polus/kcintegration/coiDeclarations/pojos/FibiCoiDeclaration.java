package com.polus.kcintegration.coiDeclarations.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "FIBI_COI_DECLARATION")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FibiCoiDeclaration {

    @Id
    @Column(name = "DECLARATION_NUMBER")
    private String declarationNumber;

    @Column(name = "DECLARATION_ID")
    private Integer declarationId;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "DECLARATION_TYPE_CODE")
    private String declarationTypeCode;

    @Column(name = "DECLARATION_TYPE")
    private String declarationType;

    @Column(name = "DECLARATION_STATUS_CODE")
    private String declarationStatusCode;

    @Column(name = "DECLARATION_STATUS")
    private String declarationStatus;

    @Column(name = "REVIEW_STATUS_CODE")
    private String reviewStatusCode;

    @Column(name = "REVIEW_STATUS")
    private String reviewStatus;

    @Column(name = "SUBMISSION_DATE")
    private Timestamp submissionDate;

    @Column(name = "EXPIRATION_DATE")
    private Timestamp expirationDate;

    @Column(name = "VERSION_NUMBER")
    private Integer versionNumber;

    @Column(name = "VERSION_STATUS")
    private String versionStatus;

    @Column(name = "DECLARATION_QUE_ANS")
    private String declarationQuesAnswer;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;
}
