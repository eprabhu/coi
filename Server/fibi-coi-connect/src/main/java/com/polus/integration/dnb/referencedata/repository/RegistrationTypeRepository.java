package com.polus.integration.dnb.referencedata.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.dnb.referencedata.entity.RegistrationType;

@Repository
public interface RegistrationTypeRepository extends JpaRepository<RegistrationType, String> {
	
}
