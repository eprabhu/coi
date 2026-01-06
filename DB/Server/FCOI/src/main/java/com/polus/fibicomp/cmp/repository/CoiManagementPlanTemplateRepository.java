package com.polus.fibicomp.cmp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanTemplate;

@Repository
public interface CoiManagementPlanTemplateRepository extends JpaRepository<CoiManagementPlanTemplate, Integer> {

}
