package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.ValidEntityAttachType;

@Repository
public interface ValidEntityAttachTypesRepository extends JpaRepository<ValidEntityAttachType, String> {

	@Query(value = "SELECT * FROM VALID_ENTITY_ATTACH_TYPE WHERE ENTITY_SECTION_CODE = :sectionCode ORDER BY VALID_ENTITY_ATTACH_TYPE_ID", nativeQuery = true)
	List<ValidEntityAttachType> fetchBySectionCode(@Param("sectionCode") String sectionCode);

}
