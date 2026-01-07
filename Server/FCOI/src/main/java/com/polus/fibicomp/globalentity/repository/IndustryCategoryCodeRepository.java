package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;

@Repository
public interface IndustryCategoryCodeRepository extends JpaRepository<IndustryCategoryCode, Integer> {

	@Query(value = "SELECT * FROM INDUSTRY_CATEGORY_CODE WHERE INDUSTRY_CATEGORY_TYPE_CODE = :industryCategoryTypeCode ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
	List<IndustryCategoryCode> fetchIndustryCategoryDetailsByCode(@Param("industryCategoryTypeCode") String industryCategoryTypeCode);

}
