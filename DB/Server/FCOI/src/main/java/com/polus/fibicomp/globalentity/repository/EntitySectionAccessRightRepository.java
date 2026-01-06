package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntitySectionAccessRight;

@Repository
public interface EntitySectionAccessRightRepository extends JpaRepository<EntitySectionAccessRight, Integer> {

	@Query(value = "SELECT RIGHT_NAME FROM ENTITY_SECTION_ACCESS_RIGHT WHERE SECTION_CODE = :sectionCode", nativeQuery = true)
	List<String> getRightsByCode(@Param("sectionCode") String sectionCode);

}
