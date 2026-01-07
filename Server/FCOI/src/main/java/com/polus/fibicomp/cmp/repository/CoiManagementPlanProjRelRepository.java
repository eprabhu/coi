package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanProjectRel;

@Repository
public interface CoiManagementPlanProjRelRepository extends JpaRepository<CoiManagementPlanProjectRel, Integer> {

	List<CoiManagementPlanProjectRel> findByCmpId(Integer cmpId);

	void deleteByCmpId(Integer cmpId);

}
