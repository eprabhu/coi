package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityForeignName;

@Repository
public interface EntityForeignNameRepository extends JpaRepository<EntityForeignName, Integer> {

	@Query(value = "SELECT * FROM ENTITY_FOREIGN_NAME WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<EntityForeignName> findByEntityId(@Param("entityId") Integer entityId);

	@Query(value = "SELECT * FROM ENTITY_FOREIGN_NAME WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC LIMIT 1", nativeQuery = true)
	EntityForeignName findLatestByEntityId(@Param("entityId") Integer entityId);

	@Modifying
    @Query(value = "DELETE FROM ENTITY_FOREIGN_NAME WHERE ID = :id", nativeQuery = true)
    void deleteByForeignNameId(@Param("id") Integer id);

}
