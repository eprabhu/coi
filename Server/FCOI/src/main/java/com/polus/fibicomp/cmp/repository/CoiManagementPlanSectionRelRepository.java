package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionRel;

@Repository
public interface CoiManagementPlanSectionRelRepository extends JpaRepository<CoiManagementPlanSectionRel, Integer> {

	List<CoiManagementPlanSectionRel> findByCmpId(Integer cmpId);

	void deleteByCmpId(Integer cmpId);

}
