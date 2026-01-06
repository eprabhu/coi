package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanEntityRel;

@Repository
public interface CoiManagementPlanEntityRelRepository extends JpaRepository<CoiManagementPlanEntityRel, Integer> {

	List<CoiManagementPlanEntityRel> findByCmpId(Integer cmpId);

    void deleteByCmpId(Integer cmpId);

}
