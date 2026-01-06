package com.polus.fibicomp.cmp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;

@Repository
public interface CoiMgmtPlanSecCompHistRepository extends JpaRepository<CoiMgmtPlanSecCompHist, Integer> {

}
