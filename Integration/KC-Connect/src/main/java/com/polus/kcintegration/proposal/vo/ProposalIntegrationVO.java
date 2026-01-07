package com.polus.kcintegration.proposal.vo;

import java.util.List;

import com.polus.kcintegration.proposal.dto.QuestionnaireVO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposalIntegrationVO {

	private List<QuestionnaireVO> questionnaireVOs;

}
