package com.polus.integration.award.pojo;

import java.io.Serializable;
import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "COI_INT_STAGE_AWARD_PERSON")
@IdClass(COIIntAwardPersonCompositeKey.class)
public class COIIntegrationAwardPerson implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
    @Column(name = "PROJECT_NUMBER")
    private String projectNumber;

    @Id
    @Column(name = "KEY_PERSON_ID")
    private String keyPersonId;

    @Column(name = "KEY_PERSON_ROLE_CODE")
    private int keyPersonRoleCode;

    @Column(name = "KEY_PERSON_ROLE_NAME")
    private String keyPersonRoleName;

    @Column(name = "KEY_PERSON_NAME")
    private String keyPersonName;
   
    @Column(name = "STATUS")
    private String status;

    @Column(name = "PERCENT_OF_EFFORT", precision = 5, scale = 2)
    private BigDecimal percentOfEffort;

    @Column(name = "DISCLOSURE_REQUIRED_FLAG")
    private String disclosureReqFlag;

    @Column(name = "NEW_DISCLOSURE_REQUIRED")
    private String newDisclosureRequired;

    @Column(name = "DISCLOSURE_STATUS")
    private String disclosureStatus;

    @Column(name = "DISCLOSURE_REVIEW_STATUS")
    private String disclosureReviewStatus;

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

}
