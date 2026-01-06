package com.polus.fibicomp.globalentity.repository;

import com.polus.fibicomp.globalentity.pojo.EntityFeedStatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;

import javax.transaction.Transactional;

@Repository
public interface EntitySponsorInfoRepository extends JpaRepository<EntitySponsorInfo, Integer> {

	@Query(value = "SELECT * FROM ENTITY_SPONSOR_INFO WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	EntitySponsorInfo findByEntityId(@Param("entityId") Integer entityId);

	@Query(value = "SELECT SPONSOR_CODE FROM ENTITY_SPONSOR_INFO WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	String findSponsorCodeByEntityId(@Param("entityId") Integer entityId);

	@Modifying
    @Query(value = "DELETE FROM ENTITY_SPONSOR_INFO WHERE ID = :id", nativeQuery = true)
    void deleteByEntitySponsorInfoId(@Param("id") Integer id);

	@Query(value = "SELECT s.entityFeedStatusType FROM EntitySponsorInfo s WHERE s.entityId = :entityId")
	EntityFeedStatusType findEntityFeedStatusTypeByEntityId(@Param("entityId") Integer entityId);

}
