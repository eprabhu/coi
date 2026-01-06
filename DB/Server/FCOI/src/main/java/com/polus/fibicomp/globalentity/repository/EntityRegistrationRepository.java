package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityRegistration;

@Repository
public interface EntityRegistrationRepository extends JpaRepository<EntityRegistration, Integer> {

		@Query(value = "SELECT * FROM ENTITY_REGISTRATION WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
		List<EntityRegistration> findByEntityId(@Param("entityId") Integer entityId);

		@Modifying
	    @Query(value = "DELETE FROM ENTITY_REGISTRATION WHERE ENTITY_REGISTRATION_ID = :entityRegistrationId", nativeQuery = true)
	    void deleteByEntityRegistrationId(@Param("entityRegistrationId") Integer entityRegistrationId);

}
