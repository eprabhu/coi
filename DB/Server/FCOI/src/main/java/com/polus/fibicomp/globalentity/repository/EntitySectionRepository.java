package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntitySection;

@Repository
public interface EntitySectionRepository extends JpaRepository<EntitySection, String> {

	@Query(value = "SELECT * FROM ENTITY_SECTION", nativeQuery = true)
	List<EntitySection> fetchAllEntitySections();

}
