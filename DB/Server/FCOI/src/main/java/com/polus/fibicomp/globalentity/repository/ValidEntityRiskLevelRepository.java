package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.ValidEntityRiskLevel;

@Repository
public interface ValidEntityRiskLevelRepository extends JpaRepository<ValidEntityRiskLevel, String> {

	@Query(value = "SELECT * FROM VALID_ENTITY_RISK_LEVEL WHERE RISK_TYPE_CODE = :riskTypeCode ORDER BY VALID_ENTITY_RISK_LVL_ID", nativeQuery = true)
	List<ValidEntityRiskLevel> fetchByRiskTypeCode(@Param("riskTypeCode") String riskTypeCode);

}
