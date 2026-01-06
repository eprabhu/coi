package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityRisk;

@Repository
public interface EntityRiskRepository extends JpaRepository<EntityRisk, Integer> {

	@Query(value = "SELECT * FROM ENTITY_RISK WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<EntityRisk> findByEntityId(@Param("entityId") Integer entityId);

//	@Query(value = "SELECT * FROM ENTITY_RISK WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
//	List<EntityRisk> findSubAwdOrgRiskByEntityId(@Param("entityId") Integer entityId);

	@Modifying
    @Query(value = "DELETE FROM ENTITY_RISK WHERE ENTITY_RSIK_ID = :entityRiskId", nativeQuery = true)
    void deleteByEntityRiskId(@Param("entityRiskId") Integer entityRiskId);

}
