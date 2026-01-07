package com.polus.integration.proposal.pojo;

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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "COI_INT_STAGE_DEV_PROPOSAL")
public class COIIntegrationProposal implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "STAGE_PROPOSAL_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer stageProposalId;

	@Column(name = "PROPOSAL_NUMBER")
	private String proposalNumber;

	@Column(name = "VERSION_NUMBER")
	private Integer versionNumber;

	@Column(name = "IP_NUMBER")
	private String ipNumber;

	@Column(name = "SPONSOR_GRANT_NUMBER")
	private String sponsorGrantNumber;

	@Column(name = "TITLE")
	private String title;

	@Column(name = "PROPOSAL_START_DATE")
	private Timestamp proposalStartDate;

	@Column(name = "PROPOSAL_END_DATE")
	private Timestamp proposalEndDate;

	@Column(name = "LEAD_UNIT")
	private String leadUnit;

	@Column(name = "LEAD_UNIT_NAME")
	private String leadUnitName;

	@Column(name = "SPONSOR_CODE")
	private String sponsorCode;

	@Column(name = "SPONSOR")
	private String sponsorName;

	@Column(name = "PRIME_SPONSOR_CODE")
	private String primeSponsorCode;

	@Column(name = "PRIME_SPONSOR")
	private String primeSponsorName;

	@Column(name = "PROPOSAL_STATUS_CODE")
	private String proposalStatusCode;

	@Column(name = "PROPOSAL_STATUS")
	private String proposalStatus;

	@Column(name = "PROPOSAL_TYPE_CODE")
	private String proposalTypeCode;

	@Column(name = "PROPOSAL_TYPE")
	private String proposalType;

	@Column(name = "DOCUMENT_URL")
	private String documentUrl;

	@Column(name = "FIRST_FED_TIMESTAMP")
	private Timestamp firstFedTimestamp;

	@Column(name = "LAST_FED_TIMESTAMP")
	private Timestamp lastFedTimestamp;

	@Column(name = "SRC_SYS_UPDATE_TIMESTAMP")
	private Timestamp srcSysUpdateTimestamp;

	@Column(name = "SRC_SYS_UPDATE_USER_NAME")
	private String srcSysUpdateUsername;

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
