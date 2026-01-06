package com.polus.fibicomp.cmp.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionComp;

@Repository
public interface CoiManagementPlanSectionCompRepository extends JpaRepository<CoiManagementPlanSectionComp, Integer> {

	void deleteByCmpSectionRelId(Integer cmpSectionRelId);

	List<CoiManagementPlanSectionComp> findByCmpSectionRelId(Integer cmpSectionRelId);

	List<CoiManagementPlanSectionComp> findByCmpSectionRelIdIn(Collection<Integer> cmpSectionRelIds);

}
