package com.polus.integration.instituteProposal.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposal;

import jakarta.transaction.Transactional;

@Transactional
@Repository
public interface InstituteProposalRepository extends JpaRepository<COIIntInstituteProposal, Integer> {

	@Query("SELECT e FROM COIIntInstituteProposal e WHERE e.projectNumber = :projectNumber")
	COIIntInstituteProposal findProposalByProposalNumber(@Param("projectNumber") String projectNumber);
	
	
	@Query("SELECT p.projectNumber FROM COIIntInstituteProposal p WHERE p.linkedAwardProjectNumber = :linkedAwardProjectNumber")
    List<String> findIPNumbersByAwardNumber(String linkedAwardProjectNumber);

	@Modifying
    @Query("UPDATE COIIntInstituteProposal p SET p.linkedAwardProjectNumber = null WHERE p.linkedAwardProjectNumber = :projectNumber and p.projectNumber = :ipNumber")
	Integer unlinkAwardNumberFromIP(String projectNumber, String ipNumber);

	@Modifying
	@Query("UPDATE COIIntInstituteProposal p SET p.linkedAwardProjectNumber = :projectNumber WHERE p.projectNumber = :ipNumber")
    Integer linkAwardNumberInIP(String projectNumber, String ipNumber);

	@Modifying
    @Query("UPDATE COIIntInstituteProposal p SET p.linkedAwardProjectNumber = null WHERE p.projectNumber in :projectNumber")
	Integer unlinkAwardFromAllIPs(List<String> projectNumber);

	@Procedure(name = "COI_SYNC_REMOVE_DEACTIVATED_PROJECTS")
	void COI_SYNC_REMOVE_DEACTIVATED_PROJECTS(@Param("AV_MODULE_CODE") Integer moduleCode, @Param("AV_MODULE_ITEM_KEY") String projectNumber);

}
