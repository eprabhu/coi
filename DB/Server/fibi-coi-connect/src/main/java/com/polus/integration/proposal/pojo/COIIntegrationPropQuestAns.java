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
@Table(name = "COI_INT_STAGE_DEV_QNR_ANSWER")
public class COIIntegrationPropQuestAns implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "STAGE_PROPOSAL_QNR_ANSWER_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer stageProposalQnrAnsId;

	@Column(name = "PROPOSAL_NUMBER")
	private String proposalNumber;

	@Column(name = "KEY_PERSON_ID")
	private String keyPersonId;

	@Column(name = "QUESTIONNAIRE_ID")
	private Integer questionnaireId;

	@Column(name = "QUESTION_ID")
	private Integer questionId;

	@Column(name = "ANSWER")
	private String answer;

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
