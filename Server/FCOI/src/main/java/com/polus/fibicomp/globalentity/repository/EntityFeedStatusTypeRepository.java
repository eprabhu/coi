package com.polus.fibicomp.globalentity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityFeedStatusType;

@Repository
public interface EntityFeedStatusTypeRepository extends JpaRepository<EntityFeedStatusType, String> {

		@Query(value = "SELECT DESCRIPTION FROM ENTITY_FEED_STATUS_TYPE WHERE FEED_STATUS_CODE = :feedStatusCode", nativeQuery = true)
		String getDescriptionByCode(@Param("feedStatusCode") String feedStatusCode);

}
