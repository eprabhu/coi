package com.polus.integration.proposal.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.proposal.pojo.COIIntegrationProposal;

@Transactional
@Repository
public interface ProposalIntegrationRepository extends JpaRepository<COIIntegrationProposal, Integer> {

	@Query("SELECT e FROM COIIntegrationProposal e WHERE e.proposalNumber = :proposalNumber")
	COIIntegrationProposal findProposalByProposalNumber(@Param("proposalNumber") String proposalNumber);

	@Query("SELECT p.proposalNumber FROM COIIntegrationProposal p WHERE p.ipNumber = :ipNumber")
    List<String> findProposalIdByIpNumber(String ipNumber);

	@Modifying
    @Query("UPDATE COIIntegrationProposal p SET p.ipNumber = null WHERE p.ipNumber = :projectNumber and p.proposalNumber = :proposalId")
	Integer unlinkIpFromProposal(String projectNumber, String proposalId);

	@Modifying
	@Query("UPDATE COIIntegrationProposal p SET p.ipNumber = :ipNumber WHERE p.proposalNumber = :proposalId")
    Integer linkIpNumberInProposal(@Param("ipNumber") String ipNumber, @Param("proposalId") String proposalId);

	@Modifying
    @Query("UPDATE COIIntegrationProposal p SET p.ipNumber = null WHERE p.proposalNumber in :proposalNumber")
	Integer unlinkIpFromAllProposals(List<String> proposalNumber);

}
