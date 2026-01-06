package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityPriorName;

@Repository
public interface EntityPriorNameRepository extends JpaRepository<EntityPriorName, Integer> {

	@Query(value = "SELECT * FROM ENTITY_PRIOR_NAME WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<EntityPriorName> findByEntityId(@Param("entityId") Integer entityId);

	@Query(value = "SELECT * FROM ENTITY_PRIOR_NAME WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC LIMIT 1", nativeQuery = true)
	EntityPriorName findLatestByEntityId(@Param("entityId") Integer entityId);

	@Modifying
    @Query(value = "DELETE FROM ENTITY_PRIOR_NAME WHERE ID = :id", nativeQuery = true)
    void deleteByPriorNameId(@Param("id") Integer id);

}
