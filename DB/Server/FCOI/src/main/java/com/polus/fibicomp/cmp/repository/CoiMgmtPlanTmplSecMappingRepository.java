package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanTmplSecMapping;

@Repository
public interface CoiMgmtPlanTmplSecMappingRepository extends JpaRepository<CoiMgmtPlanTmplSecMapping, Integer> {

	 List<CoiMgmtPlanTmplSecMapping> findBySectionId(Integer sectionId);

}
