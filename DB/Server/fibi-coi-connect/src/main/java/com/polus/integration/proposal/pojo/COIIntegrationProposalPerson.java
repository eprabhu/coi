package com.polus.integration.proposal.pojo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;



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
@Table(name = "COI_INT_STAGE_DEV_PROPOSAL_PERSON")
@IdClass(COIIntPropPersonCompositeKey.class)
public class COIIntegrationProposalPerson implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "PROPOSAL_NUMBER")
	private String proposalNumber;

	@Column(name = "KEY_PERSON_ROLE")
	private String keyPersonRole;

	@Column(name = "KEY_PERSON_ROLE_CODE")
	private Integer keyPersonRoleCode;

	@Id
	@Column(name = "KEY_PERSON_ID")
	private String keyPersonId;

	@Column(name = "KEY_PERSON_NAME")
	private String keyPersonName;

	@Column(name = "PERCENTAGE_OF_EFFORT")
	private BigDecimal percentageOfEffort;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "CERTIFICATION_FLAG")
    private String certificationFlag;

    @Column(name = "DISCLOSURE_REQUIRED_FLAG")
    private String disclosureReqFlag;

    @Column(name = "DISCLOSURE_STATUS")
    private String disclosureStatus;

    @Column(name = "DISCLOSURE_REVIEW_STATUS")
    private String disclosureReviewStatus;
  
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

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
