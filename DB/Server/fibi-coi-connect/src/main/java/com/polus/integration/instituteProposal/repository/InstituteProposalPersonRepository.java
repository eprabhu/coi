package com.polus.integration.instituteProposal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.integration.instituteProposal.pojo.COIIntIPPersonCompositeKey;
import com.polus.integration.instituteProposal.pojo.COIIntInstituteProposalPerson;

@Repository
public interface InstituteProposalPersonRepository extends JpaRepository<COIIntInstituteProposalPerson, COIIntIPPersonCompositeKey> {


	@Query("SELECT e FROM COIIntInstituteProposalPerson e WHERE e.projectNumber = :projectNumber")
	List<COIIntInstituteProposalPerson> findProposalPersonsByProjectNumber(@Param("projectNumber") String projectNumber);

}
