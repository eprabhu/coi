package com.polus.fibicomp.globalentity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;

import java.util.List;

@Repository
public interface EntityFamilyTreeRoleRepository extends JpaRepository<EntityFamilyTreeRole, Integer> {

    @Query("SELECT r FROM EntityFamilyTreeRole r WHERE r.entityNumber = :entityNumber")
    List<EntityFamilyTreeRole> findByEntityNumber(@Param("entityNumber") Integer entityNumber);

}
