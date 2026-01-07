package com.polus.integration.award.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.integration.award.pojo.COIIntegrationAward;
import com.polus.integration.award.pojo.COIIntegrationAwardPerson;

@Repository
public interface AwardRepository extends JpaRepository<COIIntegrationAward, Integer> {

	@Query("SELECT e FROM COIIntegrationAward e WHERE e.projectNumber = :projectNumber")
	COIIntegrationAward findProjectByProjectNumber(@Param("projectNumber") String projectNumber);

	@Query("SELECT e FROM COIIntegrationAward e WHERE e.projectId = :projectId")
	COIIntegrationAward findProjectByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT e FROM COIIntegrationAwardPerson e WHERE e.projectNumber = :projectNumber")
	List<COIIntegrationAwardPerson> findProjectPersonsByProjectNumber(@Param("projectNumber") String projectNumber);

	@Procedure(name = "COI_SYNC_REMOVE_DEACTIVATED_PROJECTS")
	void COI_SYNC_REMOVE_DEACTIVATED_PROJECTS(@Param("AV_MODULE_CODE") Integer moduleCode, @Param("AV_MODULE_ITEM_KEY") String projectNumber);

	@Procedure(name = "UPD_COI_AWD_DISCLOSURE_STS")
	void UPD_COI_AWD_DISCLOSURE_STS(@Param("AV_AWARD_NUMBER") String awardNumber,
			@Param("UPD_PERSON_STS") String updatePersonStatus, @Param("AV_PERSON_ID") String keyPersonIds);

}
