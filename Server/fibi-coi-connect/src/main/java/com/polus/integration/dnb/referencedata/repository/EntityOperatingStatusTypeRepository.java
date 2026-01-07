package com.polus.integration.dnb.referencedata.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.dnb.referencedata.entity.EntityOperatingStatusType;

@Repository
public interface EntityOperatingStatusTypeRepository extends JpaRepository<EntityOperatingStatusType, String> {
	
}
