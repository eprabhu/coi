package com.polus.fibicomp.cmp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanAvailableAction;

public interface CoiMgmtPlanAvailableActionRepository extends JpaRepository<CoiMgmtPlanAvailableAction, Integer> {

	List<CoiMgmtPlanAvailableAction> findByStatusCode(String statusCode);

}
