package com.polus.fibicomp.cmp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;

@Repository
public interface CoiMgmtPlanSecRelHistRepository extends JpaRepository<CoiMgmtPlanSecRelHist, Integer> {

}
