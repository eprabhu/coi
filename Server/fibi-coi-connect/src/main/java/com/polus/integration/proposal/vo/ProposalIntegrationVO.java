package com.polus.integration.proposal.vo;

import java.util.List;

import com.polus.integration.proposal.dto.ProposalDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposalIntegrationVO {

	private List<QuestionnaireVO> questionnaireVOs;
	
	private ProposalDTO proposalDTO;

}
