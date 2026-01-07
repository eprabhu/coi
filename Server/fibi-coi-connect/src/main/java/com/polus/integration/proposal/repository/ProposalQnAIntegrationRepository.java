package com.polus.integration.proposal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.integration.proposal.pojo.COIIntegrationPropQuestAns;

@Repository
public interface ProposalQnAIntegrationRepository extends JpaRepository<COIIntegrationPropQuestAns, Integer> {

	@Query("SELECT e FROM COIIntegrationPropQuestAns e WHERE e.proposalNumber = :proposalNumber")
	List<COIIntegrationPropQuestAns> findQuestionAnswersByProposalNumber(@Param("proposalNumber") String proposalNumber);

}
