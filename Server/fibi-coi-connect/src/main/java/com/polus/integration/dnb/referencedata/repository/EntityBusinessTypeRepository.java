package com.polus.integration.dnb.referencedata.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.dnb.referencedata.entity.EntityBusinessType;

@Repository
public interface EntityBusinessTypeRepository extends JpaRepository<EntityBusinessType, String> {
	
}
