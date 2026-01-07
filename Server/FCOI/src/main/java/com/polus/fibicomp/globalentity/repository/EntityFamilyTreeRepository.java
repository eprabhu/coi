package com.polus.fibicomp.globalentity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityFamilyTree;

@Repository
public interface EntityFamilyTreeRepository extends JpaRepository<EntityFamilyTree, Integer> {

	@Modifying
    @Query(value = "UPDATE ENTITY_FAMILY_TREE SET PARENT_ENTITY_NUMBER = :parentEntityNumber WHERE ENTITY_NUMBER = :entityNumber", nativeQuery = true)
    void updateParent(@Param("entityNumber") Integer entityNumber, @Param("parentEntityNumber") Integer parentEntityNumber);

	@Query(value = "SELECT COUNT(*) FROM ENTITY_FAMILY_TREE WHERE PARENT_ENTITY_NUMBER = :entityNumber", nativeQuery = true)
	long hasChildEntities(Integer entityNumber);

}
