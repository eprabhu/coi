package com.polus.fibicomp.globalentity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;

public interface EntityComplianceInfoRepository extends JpaRepository<EntityComplianceInfo, Integer> {

	Optional<EntityComplianceInfo> findByEntityId(Integer entityId);

}
