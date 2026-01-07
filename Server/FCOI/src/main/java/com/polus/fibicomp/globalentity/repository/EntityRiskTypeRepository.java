package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityRiskType;

@Repository
public interface EntityRiskTypeRepository extends JpaRepository<EntityRiskType, String> {

	@Query(value = "SELECT * FROM ENTITY_RISK_TYPE WHERE RISK_CATEGORY_CODE = :riskCategoryCode ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<EntityRiskType> fetchRiskTypesByRiskCategoryCode(@Param("riskCategoryCode") String riskCategoryCode);

}
