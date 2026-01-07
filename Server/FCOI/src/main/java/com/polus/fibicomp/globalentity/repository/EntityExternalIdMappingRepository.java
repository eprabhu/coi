package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityExternalIdMapping;

@Repository
public interface EntityExternalIdMappingRepository extends JpaRepository<EntityExternalIdMapping, Integer> {

	@Query(value = "SELECT * FROM ENTITY_EXTERNAL_ID_MAPPING WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<EntityExternalIdMapping> findByEntityId(@Param("entityId") Integer entityId);

	@Modifying
    @Query(value = "DELETE FROM ENTITY_EXTERNAL_ID_MAPPING WHERE ENTITY_EXTERNAL_MAPPING_ID = :entityExternalMappingId", nativeQuery = true)
    void deleteByEntityExternalMappingId(@Param("entityExternalMappingId") Integer entityExternalMappingId);

}
