package com.polus.fibicomp.globalentity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.Entity;

import java.util.List;

@Repository
public interface GlobalEntityRepository extends JpaRepository<Entity, Integer> {

	@Query(value = "SELECT * FROM ENTITY WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	Entity findByEntityId(@Param("entityId") Integer entityId);

	@Query(value = "SELECT COUNT(*) FROM ENTITY WHERE VERSION_STATUS IN :versionStatuses AND ((DUNS_NUMBER = :dunsNumber AND :entityNumber IS NULL) OR (DUNS_NUMBER = :dunsNumber AND ENTITY_NUMBER != :entityNumber))", nativeQuery = true)
	int isDunsNumberExists(@Param("dunsNumber") String dunsNumber, @Param("entityNumber") Integer entityNumber, @Param("versionStatuses") List<String> versionStatuses);

	@Query(value = "SELECT COUNT(*) FROM ENTITY WHERE VERSION_STATUS IN :versionStatuses AND ((UEI_NUMBER = :ueiNumber AND :entityNumber IS NULL) OR (UEI_NUMBER = :ueiNumber AND ENTITY_NUMBER != :entityNumber))", nativeQuery = true)
	int isUeiNumberExists(@Param("ueiNumber") String ueiNumber, @Param("entityNumber") Integer entityNumber, @Param("versionStatuses") List<String> versionStatuses);

	@Query(value = "SELECT COUNT(*) FROM ENTITY WHERE VERSION_STATUS IN :versionStatuses AND ((CAGE_NUMBER = :cageNumber AND :entityNumber IS NULL) OR (CAGE_NUMBER = :cageNumber AND ENTITY_NUMBER != :entityNumber))", nativeQuery = true)
	int isCageNumberExists(@Param("cageNumber") String cageNumber, @Param("entityNumber") Integer entityNumber, @Param("versionStatuses") List<String> versionStatuses);

	@Query(value = "SELECT PRIMARY_NAME FROM ENTITY WHERE ENTITY_ID = :entityId", nativeQuery = true)
	String fetchEntityNameByEntityId(@Param("entityId") Integer entityId);

	@Query("SELECT CASE WHEN e1.entityNumber IS NOT NULL THEN TRUE ELSE FALSE END FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"AND e1.entityStatusTypeCode = 3  WHERE e.entityId = :entityId AND e1.versionStatus = :pendingVersionStatus")
	Boolean entityCopyVersionExists(@Param("entityId") Integer entityId, @Param("pendingVersionStatus") String pendingVersionStatus);

	@Query("SELECT e FROM Entity e WHERE e.entityNumber = :entityNumber AND ((e.entityStatusTypeCode IN (3,4) AND e.versionStatus = :pendingVersionStatus) OR " +
			"e.versionStatus = :activeVersionStatus)")
	List<Entity> fetchActiveModifyingVersionByEntityNumber(@Param("entityNumber") Integer entityNumber, @Param("pendingVersionStatus") String pendingVersionStatus,
														   @Param("activeVersionStatus") String activeVersionStatus);

	@Query("SELECT e.versionNumber, e.entityId, e.versionStatus FROM Entity e WHERE e.entityNumber = :entityNumber")
	List<Object[]> fetchEntityVersions(@Param("entityNumber") Integer entityNumber);

	@Query("SELECT CASE WHEN count(e.entityId) > 0 THEN TRUE ELSE FALSE END FROM Entity e " +
			"WHERE e.entityStatusTypeCode = 3  AND e.entityId = :entityId ")
	Boolean isEntityModifyingVersion(@Param("entityId") Integer entityId);

	@Query("SELECT e1.entityId FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"AND e1.versionStatus = :versionStatus  WHERE e.entityId = :entityId ")
	Integer getEntityIdByVersionStatus(@Param("entityId") Integer entityId, @Param("versionStatus") String versionStatus);

	@Query("SELECT e.isDunsMatched FROM Entity e " +
			"WHERE e.versionStatus = :versionStatus  AND e.entityNumber = :entityNumber ")
	Boolean isDunsMatchedOnActiveVersion(@Param("entityNumber") Integer entityNumber, @Param("versionStatus") String versionStatus);

	@Query("SELECT e1.entityId FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"WHERE e.entityId = :entityId ")
	List<Integer> getAllEntityIdByEntityId(@Param("entityId") Integer entityId);

	@Query("SELECT e1.entityId, e1.versionStatus, e1.entityName  FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"WHERE e.entityId = :entityId AND e1.versionStatus IN :versionStatuses")
	List<Object[]> getEntityIdByEntityIdAndVersionStatus(@Param("entityId") Integer entityId, @Param("versionStatuses") List<String> versionStatuses);

	@Query("SELECT MAX(e.entityNumber) FROM Entity e")
	Integer getMaxOfEntityNumber();

	@Query("SELECT CASE WHEN count(e.entityId) > 0 THEN TRUE ELSE FALSE END FROM Entity e " +
			"WHERE e.versionStatus = :versionStatus AND e.entityId = :entityId ")
	Boolean isEntityCancelledVersion(@Param("entityId") Integer entityId, @Param("versionStatus") String versionStatus);
  
	@Query("SELECT e1.entityId, e1.versionStatus, e1.entityName  FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"WHERE e.entityId = :entityId AND e1.versionStatus IN :versionStatuses AND e1.entityStatusTypeCode = :entityStatusTypeCode")
	List<Object[]> getEntityIdByEntityIdAndVersionStatus(@Param("entityId") Integer entityId, @Param("versionStatuses") List<String> versionStatuses,
														 @Param("entityStatusTypeCode") String entityStatusTypeCode);

	@Query("SELECT e.entityId FROM Entity e WHERE e.versionStatus = :versionStatus  AND e.entityNumber = :entityNumber ")
	Integer getEntityIdByEntityNumberAndVersionStatus(@Param("entityNumber") Integer entityNumber, @Param("versionStatus") String versionStatus);

	@Query(value = "SELECT ENTITY_NUMBER FROM ENTITY WHERE ENTITY_ID = :entityId", nativeQuery = true)
	Integer findEntityNumberByEntityId(@Param("entityId") Integer entityId);

	@Query("SELECT CASE WHEN count(e.entityId) > 0 THEN TRUE ELSE FALSE END FROM Entity e " +
			"WHERE e.entityStatusTypeCode = 4  AND e.entityId = :entityId ")
	Boolean isEntityDunsRefreshVersion(@Param("entityId") Integer entityId);

	@Query("SELECT CASE WHEN e1.entityNumber IS NOT NULL THEN TRUE ELSE FALSE END FROM Entity e LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber " +
			"AND e1.entityStatusTypeCode = 4  WHERE e.entityId = :entityId AND e1.versionStatus = :pendingVersionStatus")
	Boolean entityDunsRefreshVersionExists(@Param("entityId") Integer entityId, @Param("pendingVersionStatus") String pendingVersionStatus);

    @Query("SELECT CASE WHEN count(e.personEntityId) > 0 THEN TRUE ELSE FALSE END FROM PersonEntity e " +
            "WHERE e.entityNumber = :entityNumber AND e.versionStatus = 'ACTIVE'")
    Boolean hasActivePersonEntityLinkage(Integer entityNumber);
}
