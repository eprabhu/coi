package com.polus.integration.entity.cleansematch.repositories;

import com.polus.integration.entity.cleansematch.entity.EntityOwnershipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntityOwnershipTypeRepository extends JpaRepository<EntityOwnershipType, String> {

    List<EntityOwnershipType> findAll();

}
