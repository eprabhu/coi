package com.polus.integration.award.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.integration.award.pojo.COIIntAwardPersonCompositeKey;
import com.polus.integration.award.pojo.COIIntegrationAwardPerson;

@Repository
public interface AwardPersonRepository extends JpaRepository<COIIntegrationAwardPerson, COIIntAwardPersonCompositeKey> {

	@Query("SELECT e FROM COIIntegrationAwardPerson e WHERE e.projectNumber = :projectNumber")
	List<COIIntegrationAwardPerson> findProjectPersonsByProjectNumber(@Param("projectNumber") String projectNumber);

}
